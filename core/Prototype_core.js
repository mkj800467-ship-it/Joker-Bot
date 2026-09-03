import path from 'path'
import { toAudio } from './prototype_converter.js'
import chalk from 'chalk'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import util from 'util'
import { fileTypeFromBuffer } from 'file-type'
import { format } from 'util'
import { fileURLToPath } from 'url'
import store from './blacklight_store.js'
import * as Jimp from 'jimp'

import { jidNormalizedUser, jidDecode, areJidsSameUser } from '@whiskeysockets/baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function nullish(args) {
    return !(args !== null && args !== undefined)
}

function isNumber(x) {
    return typeof x === 'number' && !isNaN(x)
}

function getRandom() {
    if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
    return Math.floor(Math.random() * this)
}

global.getUserName = async (jid, conn, m = null) => {
    try {
        if (!jid) return 'مجهول'
        
        let userNumber = jid.split('@')[0].replace('lid_', '')
        
        if (m && m.pushName && m.pushName !== userNumber && !m.pushName.match(/^\d+$/)) {
            return m.pushName
        }
        
        if (m && m.name && m.name !== userNumber && !m.name.match(/^\d+$/)) {
            return m.name
        }
        
        if (global.db?.data?.users && global.db.data.users[jid]?.name) {
            let name = global.db.data.users[jid].name
            if (name && name !== userNumber && !name.match(/^\d+$/)) {
                return name
            }
        }
        
        if (global.lastMessages && global.lastMessages.length > 0) {
            let lastMsg = global.lastMessages.find(msg => msg.sender === jid)
            if (lastMsg && lastMsg.senderName && lastMsg.senderName !== userNumber && !lastMsg.senderName.match(/^\d+$/)) {
                return lastMsg.senderName
            }
        }
        
        if (conn && typeof conn.getName === 'function') {
            try {
                let name = await conn.getName(jid)
                if (name && name !== userNumber && !name.match(/^\d+$/)) {
                    return name
                }
            } catch (e) {}
        }
        
        return userNumber
        
    } catch (e) {
        console.error('Error in getUserName:', e)
        return jid?.split('@')[0] || 'مجهول'
    }
}

global.getUserDisplay = async (jid, conn, m = null) => {
    let name = await global.getUserName(jid, conn, m)
    let number = jid?.split('@')[0]?.replace('lid_', '') || ''
    
    if (name === number) {
        return name
    }
    return `${name}`
}

global.updateUserName = async (jid, name, conn) => {
    try {
        if (!jid || !name) return
        
        if (!global.db.data.users[jid]) {
            global.db.data.users[jid] = {}
        }
        
        let oldName = global.db.data.users[jid].name
        if (!oldName || oldName.match(/^\d+$/) || oldName === jid.split('@')[0]) {
            global.db.data.users[jid].name = name
        }
    } catch (e) {
        console.error('Error in updateUserName:', e)
    }
}

import * as baileys from '@whiskeysockets/baileys'

const {
    default: _makeWaSocket,
    makeWALegacySocket,
    proto,
    downloadContentFromMessage,
    jidDecode: baileysJidDecode,
    areJidsSameUser: baileysAreJidsSameUser,
    generateWAMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    extractMessageContent,
    makeInMemoryStore,
    getAggregateVotesInPollMessage,
    prepareWAMessageMedia,
    WA_DEFAULT_EPHEMERAL,
    generateMessageIDV2
} = baileys

export function makeWASocket(connectionOptions, options = {}) {
    let conn = (global.opts['legacy'] ? makeWALegacySocket : _makeWaSocket)(connectionOptions)

    const originalRelayMessage = conn.relayMessage.bind(conn);
    const originalSendMessage = conn.sendMessage.bind(conn);

    const getNewsletterMetadata = async (jid) => {
        try {
            if (jid?.endsWith('@newsletter')) {
                return await conn.newsletterMetadata('jid', jid).catch(() => null);
            }
            return null;
        } catch {
            return null;
        }
    };

    Object.defineProperty(conn, 'relayMessage', {
        value: async function(jid, message, opts = {}) {
            const defaultAdditionalNodes = [{
                tag: 'biz',
                attrs: {},
                content: [{
                    tag: 'interactive',
                    attrs: {
                        type: 'native_flow',
                        v: '1'
                    },
                    content: [{
                        tag: 'native_flow',
                        attrs: {
                            v: '9',
                            name: 'mixed'
                        }
                    }]
                }]
            }];
            
            const hasBizNode = opts.additionalNodes?.some(node => node.tag === 'biz');
            
            const mergedOpts = {
                ...opts,
                additionalNodes: [
                    ...(opts.additionalNodes || []),
                    ...(!hasBizNode ? defaultAdditionalNodes : [])
                ]
            };
            
            return await originalRelayMessage(jid, message, mergedOpts);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(conn, 'sendMessage', {
        value: async function(jid, content, options = {}) {
            const userJid = conn.user?.jid || conn.user?.id;
            
            if (typeof content === 'object' &&
                'disappearingMessagesInChat' in content &&
                typeof content['disappearingMessagesInChat'] !== 'undefined' &&
                jid?.endsWith('@g.us')) {
                const {
                    disappearingMessagesInChat
                } = content;
                const value = typeof disappearingMessagesInChat === 'boolean' ?
                    disappearingMessagesInChat ?
                    WA_DEFAULT_EPHEMERAL :
                    0 :
                    disappearingMessagesInChat;
                await conn.groupSettingUpdate(jid, value ? 'ephemeral' : 'not_ephemeral');
                return {
                    status: 'success',
                    ephemeralDuration: value
                };
            }
            
            if (typeof content === 'string') {
                content = {
                    text: content
                };
            }
            
            if (content && content.stickers) {
                return await originalSendMessage(jid, content, options);
            }
            
            const { server } = baileysJidDecode(jid);
            const isChannel = server === 'newsletter';
            
            let newsletterMetadata = null;
            if (isChannel) {
                newsletterMetadata = await getNewsletterMetadata(jid);
            }
            
            const contextInfo = {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: newsletterMetadata ? {
                    newsletterJid: newsletterMetadata.id,
                    newsletterName: newsletterMetadata.name,
                    serverMessageId: newsletterMetadata.msgId || '-1'
                } : undefined
            };
            
            content.contextInfo = {
                ...(content.contextInfo || {}),
                ...contextInfo
            };
            
            let mediaHandle;
            
            const fullMsg = await generateWAMessage(jid, content, {
                userJid,
                getProfilePicUrl: conn.profilePictureUrl,
                getCallLink: conn.createCallLink,
                upload: async (readStream, opts) => {
                    const up = await conn.waUploadToServer(readStream, {
                        ...opts,
                        newsletter: isChannel
                    });
                    mediaHandle = up.handle;
                    return up;
                },
                mediaCache: connectionOptions.mediaCache,
                messageId: generateMessageIDV2(conn.user?.id),
                ...options
            });
            
            const isEventMsg = 'event' in content && !!content.event;
            const isDeleteMsg = 'delete' in content && !!content.delete;
            const isEditMsg = 'edit' in content && !!content.edit;
            const isPinMsg = 'pin' in content && !!content.pin;
            const isPollMsg = 'poll' in content && !!content.poll;
            
            const isAiMsg = 'ai' in content && !!content.ai;
            const isViewOnceMsg = 'viewOnce' in content && !!content.viewOnce;
            const isBtsMsg = content && (
                'buttons' in content || 'template' in content ||
                'templateButtons' in content ||
                'interactiveMessage' in content ||
                'interactiveButtons' in content ||
                'listMessage' in content ||
                'productMessage' in content ||
                'orderMessage' in content
            );
            
            const additionalAttributes = {};
            const additionalNodes = [...(options.additionalNodes || [])];
            
            if (isDeleteMsg) {
                if (content.delete?.remoteJid?.endsWith('@g.us') && !content.delete?.fromMe) {
                    additionalAttributes.edit = '8';
                } else {
                    additionalAttributes.edit = '7';
                }
            } else if (isEditMsg) {
                additionalAttributes.edit = jid?.endsWith('@newsletter') ? '3' : '1';
            } else if (isPinMsg) {
                additionalAttributes.edit = '2';
            } else if (isPollMsg) {
                additionalNodes.push({
                    tag: 'meta',
                    attrs: {
                        polltype: 'creation'
                    }
                });
            } else if (isEventMsg) {
                additionalNodes.push({
                    tag: 'meta',
                    attrs: {
                        event_type: 'creation'
                    }
                });
            }
            
            if (isViewOnceMsg && !isDeleteMsg && !isEditMsg && !isPinMsg) {
                additionalAttributes.view_once = 'true';
            } else if (isAiMsg) {
                additionalNodes.push({
                    attrs: {
                        biz_bot: '1'
                    },
                    tag: 'bot'
                });
            } else if (isBtsMsg && !isDeleteMsg && !isEditMsg && !isPinMsg && !isPollMsg && !isEventMsg) {
                const hasBizNode = additionalNodes.some(node => node.tag === 'biz');
                if (!hasBizNode) {
                    additionalNodes.push({
                        tag: 'biz',
                        attrs: {},
                        content: [{
                            tag: 'interactive',
                            attrs: {
                                type: 'native_flow',
                                v: '1'
                            },
                            content: [{
                                tag: 'native_flow',
                                attrs: {
                                    v: '9',
                                    name: 'mixed'
                                }
                            }]
                        }]
                    });
                }
            }
            
            if (mediaHandle) {
                additionalAttributes['media_id'] = mediaHandle;
            }
if (fullMsg?.message) {
    const msgTypes = ['imageMessage', 'videoMessage'];
    for (const type of msgTypes) {
        if (fullMsg.message[type] && !fullMsg.message[type].annotations) {
            fullMsg.message[type].annotations = [{
                polygonVertices: [
                    { x: 60.72, y: -36.40 },
                    { x: -16.71, y: 49.26 },
                    { x: -56.59, y: 37.86 },
                    { x: 20.84, y: -47.80 }
                ],
                newsletter: {
                    newsletterJid: '120363429074575231@newsletter',
                    newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                    contentType: 'UPDATE',
                    accessibilityText: '《 𝐈𝐭𝐚𝐜𝐡𝐢♞ 》'
                }
            }];
            break;
        }
    }
}
            await conn.relayMessage(jid, fullMsg.message, {
                ...options,
                messageId: fullMsg.key.id,
                useCachedGroupMetadata: options.useCachedGroupMetadata,
                additionalAttributes,
                statusJidList: options.statusJidList,
                additionalNodes
            });
            
            if (connectionOptions.emitOwnEvents !== false) {
                process.nextTick(async () => {
                    try {
                        if (typeof conn.ev?.emit === 'function') {
                            const eventMsg = {
                                ...fullMsg
                            };
                            conn.ev.emit('messages.upsert', {
                                messages: [eventMsg],
                                type: 'append'
                            });
                        }
                    } catch (err) {}
                });
            }
            
            return fullMsg;
        },
        enumerable: true,
        configurable: true
    });

    let sock = Object.defineProperties(conn, {
        chats: {
            value: { ...(options.chats || {}) },
            writable: true
        },
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null
                return jid.decodeJid()
            },
            enumerable: true
        },
        logger: {
            get() {
                return {
                    info(...args) {
                        console.log(
                            chalk.bold.bgRgb(51, 204, 51)('INFO '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.cyan(format(...args))
                        )
                    },
                    error(...args) {
                        console.log(
                            chalk.bold.bgRgb(247, 38, 33)('ERROR '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.rgb(255, 38, 0)(format(...args))
                        )
                    },
                    warn(...args) {
                        console.log(
                            chalk.bold.bgRgb(255, 153, 0)('WARNING '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.redBright(format(...args))
                        )
                    },
                    trace(...args) {
                        console.log(chalk.grey('TRACE '), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.white(format(...args)))
                    },
                    debug(...args) {
                        console.log(
                            chalk.bold.bgRgb(66, 167, 245)('DEBUG '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        )
                    }
                }
            },
            enumerable: true
        },
        sendProtoMessage: {
            async value(jid, text = '', buffer, title, body, url, quoted, options) {
                if (buffer)
                    try {
                        ; ((type = await conn.getFile(buffer)), (buffer = type.data))
                    } catch {
                        buffer = buffer
                    }
                let prep = generateWAMessageFromContent(
                    jid,
                    {
                        extendedTextMessage: {
                            text: text,
                            contextInfo: {
                                externalAdReply: {
                                    title: title,
                                    body: body,
                                    thumbnail: buffer,
                                    sourceUrl: url
                                },
                                mentionedJid: await conn.parseMention(text)
                            }
                        }
                    },
                    { quoted: quoted }
                )
                return conn.relayMessage(jid, prep.message, { messageId: prep.key.id })
            }
        },
        getFile: {
            async value(PATH, saveToFile = false) {
                let res, filename
                const data = Buffer.isBuffer(PATH)
                    ? PATH
                    : PATH instanceof ArrayBuffer
                        ? PATH.toBuffer()
                        : /^data:.*?\/.*?;base64,/i.test(PATH)
                            ? Buffer.from(PATH.split`,`[1], 'base64')
                            : /^https?:\/\//.test(PATH)
                                ? await (res = await fetch(PATH)).buffer()
                                : fs.existsSync(PATH)
                                    ? ((filename = PATH), fs.readFileSync(PATH))
                                    : typeof PATH === 'string'
                                        ? PATH
                                        : Buffer.alloc(0)
                if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
                const type = (await fileTypeFromBuffer(data)) || {
                    mime: 'application/octet-stream',
                    ext: '.bin'
                }
                if (data && saveToFile && !filename)
                    ((filename = path.join(__dirname, '../tmp/' + new Date() * 1 + '.' + type.ext)), await fs.promises.writeFile(filename, data))
                return {
                    res,
                    filename,
                    ...type,
                    data,
                    deleteFile() {
                        return filename && fs.promises.unlink(filename)
                    }
                }
            },
            enumerable: true
        },
        waitEvent: {
            value(eventName, is = () => true, maxTries = 25) {
                return new Promise((resolve, reject) => {
                    let tries = 0
                    let on = (...args) => {
                        if (++tries > maxTries) reject('Max tries reached')
                        else if (is()) {
                            conn.ev.off(eventName, on)
                            resolve(...args)
                        }
                    }
                    conn.ev.on(eventName, on)
                })
            }
        },
        sendContact: {
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                let contacts = []
                for (let [number, name] of data) {
                    number = number.replace(/[^0-9]/g, '')
                    let njid = number + '@s.whatsapp.net'
                    let biz = (await conn.getBusinessProfile(njid).catch((_) => null)) || {}
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${
                        biz.description
                            ? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim()
                            : ''
                    }
END:VCARD
                    `.trim()
                    contacts.push({ vcard, displayName: name })
                }
                return await conn.sendMessage(
                    jid,
                    {
                        ...options,
                        contacts: {
                            ...options,
                            displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
                            contacts
                        }
                    },
                    { quoted, ...options }
                )
            },
            enumerable: true
        },
        resize: {
            value(buffer, ukur1, ukur2) {
                return new Promise(async (resolve, reject) => {
                    var baper = await Jimp.read(buffer)
                    var ab = await baper.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG)
                    resolve(ab)
                })
            }
        },
        relayWAMessage: {
            async value(pesanfull) {
                if (pesanfull.message.audioMessage) {
                    await conn.sendPresenceUpdate('recording', pesanfull.key.remoteJid)
                } else {
                    await conn.sendPresenceUpdate('composing', pesanfull.key.remoteJid)
                }
                var mekirim = await conn.relayMessage(pesanfull.key.remoteJid, pesanfull.message, { messageId: pesanfull.key.id })
                conn.ev.emit('messages.upsert', {
                    messages: [pesanfull],
                    type: 'append'
                })
                return mekirim
            }
        },
        sendListM: {
            async value(jid, button, rows, quoted, options = {}) {
                let fsizedoc = '1'.repeat(10)
                const sections = [
                    {
                        title: button.title,
                        rows: [...rows]
                    }
                ]
                const listMessage = {
                    text: button.description,
                    footer: button.footerText,
                    mentions: await conn.parseMention(button.description),
                    ephemeralExpiration: '86400',
                    title: '',
                    buttonText: button.buttonText,
                    sections
                }
                conn.sendMessage(jid, listMessage, {
                    quoted,
                    ephemeralExpiration: fsizedoc,
                    contextInfo: {
                        forwardingScore: fsizedoc,
                        isForwarded: true,
                        mentions: await conn.parseMention(button.description + button.footerText),
                        ...options
                    }
                })
            }
        },
        sendList: {
            async value(jid, title, text, buttonText, listSections, quoted, options = {}) {
                const sections = [...listSections]

                const message = {
                    interactiveMessage: {
                        header: { title: title },
                        body: { text: text },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: buttonText,
                                        sections
                                    })
                                }
                            ],
                            messageParamsJson: ''
                        }
                    }
                }
                await conn.relayMessage(jid, { viewOnceMessage: { message } }, {})
            }
        },
        sendContactArray: {
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                let contacts = []
                let buttons = []
                for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5, ...extraLinks] of data) {
                    number = number.replace(/[^0-9]/g, '')
                    let njid = number + '@s.whatsapp.net'
                    let biz = (await conn.getBusinessProfile(njid).catch((_) => null)) || {}
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:${name.replace(/\n/g, '\\n')}
item.ORG:${isi}
item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:${isi1}
${isi2 ? `item2.EMAIL;type=INTERNET:${isi2}\nitem2.X-ABLabel:📧 Email` : ''}
${isi3 ? `item3.ADR:;;${isi3};;;;\nitem3.X-ABADR:ac \nitem3.X-ABLabel:📍 Region` : ''}
${isi4 ? `item4.URL;type=pref:${isi4}\nitem4.X-ABLabel:Website` : ''}
${extraLinks.map((link, index) => (link ? `item${index + 5}.URL;type=pref:${link}\nitem${index + 5}.X-ABLabel:Extra Link ${index + 1}` : '')).join('\n')}
${isi5 ? `${extraLinks.length > 0 ? `item${extraLinks.length + 5}` : 'item5'}.X-ABLabel:${isi5}` : ''}
END:VCARD`.trim()

                    let newButtons = extraLinks.map((link, index) => ({
                        buttonId: `extra-link-${index + 1}`,
                        buttonText: { displayText: `Extra Link ${index + 1}` },
                        type: 1,
                        url: `http://${link}`
                    }))
                    buttons.push(...newButtons)

                    contacts.push({ vcard, displayName: name })
                }

                let displayName = null
                if (contacts.length === 1) {
                    displayName = contacts[0].displayName
                } else if (contacts.length > 1) {
                    displayName = `${contacts.length} kontak`
                }

                let contactsWithButtons = []
                for (let i = 0; i < contacts.length; i++) {
                    let contact = contacts[i]
                    let contactButtons = buttons.filter((button) => button.buttonId.startsWith(`extra-link-${i + 1}`))
                    contactsWithButtons.push({
                        ...contact,
                        ...{ buttons: contactButtons }
                    })
                }

                return await conn.sendMessage(
                    jid,
                    {
                        contacts: {
                            displayName,
                            contacts: contactsWithButtons
                        }
                    },
                    {
                        quoted,
                        ...options
                    }
                )
            }
        },
        sendFile: {
            async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
                let type = await conn.getFile(path, true)
                let { res, data: file, filename: pathFile } = type
                if ((res && res.status !== 200) || file.length <= 65536) {
                    try {
                        throw { json: JSON.parse(file.toString()) }
                    } catch (e) {
                        if (e.json) throw e.json
                    }
                }
                let opt = {}
                if (quoted) opt.quoted = quoted
                if (!type) options.asDocument = true
                let mtype = '',
                    mimetype = options.mimetype || type.mime,
                    convert
                if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
                else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
                else if (/video/.test(type.mime)) mtype = 'video'
                else if (/audio/.test(type.mime))
                    ((convert = await toAudio(file, type.ext)),
                        (file = convert.data),
                        (pathFile = convert.filename),
                        (mtype = 'audio'),
                        (mimetype = options.mimetype || 'audio/ogg; codecs=opus'))
                else mtype = 'document'
                if (options.asDocument) mtype = 'document'

                delete options.asSticker
                delete options.asLocation
                delete options.asVideo
                delete options.asDocument
                delete options.asImage

                let message = {
                    ...options,
                    caption,
                    ptt,
                    [mtype]: { url: pathFile },
                    mimetype,
                    fileName: filename || pathFile.split('/').pop()
                }
                let m
                try {
                    m = await conn.sendMessage(jid, message, { ...opt, ...options })
                } catch (e) {
                    console.error(e)
                    m = null
                } finally {
                    if (!m) m = await conn.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
                    file = null
                    return m
                }
            },
            enumerable: true
        },
        reply: {
            async value(jid, text = '', quoted, options) {
                if (Buffer.isBuffer(text)) {
                    return conn.sendFile(jid, text, 'file', '', quoted, false, options)
                }
                
                let channelId = [
    '120363429074575231@newsletter',
    '120363429074575231@newsletter',
    '120363429074575231@newsletter',
    '120363429074575231@newsletter',
    '120363429074575231@newsletter'
];
let channelName = [
    '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
    '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
    '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
    '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
    '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'
];

                let randomIndex = Math.floor(Math.random() * channelId.length)
                let id = channelId[randomIndex]
                let nombre = channelName[randomIndex]
                
                let mentionedJid = await conn.parseMention(text);
                
                const contextInfo = {
                    mentionedJid: mentionedJid,
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: id,
                        newsletterName: nombre,
                        serverMessageId: '-1'
                    }
                }

                let msg = generateWAMessageFromContent(jid, {
                    extendedTextMessage: {
                        text: text,
                        contextInfo: contextInfo
                    }
                }, { 
                    userJid: conn.user.jid, 
                    quoted: quoted
                })

                return conn.relayMessage(jid, msg.message, { 
                    messageId: msg.key.id 
                })
            }
        },
        resize: {
            async value(image, width, height) {
                let oyy = await Jimp.read(image)
                let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
                return kiyomasa
            }
        },
        generateProfilePicture: {
            async value(buffer) {
                const jimp_1 = await Jimp.read(buffer)
                const resz = jimp_1.getWidth() > jimp_1.getHeight() ? jimp_1.resize(550, Jimp.AUTO) : jimp_1.resize(Jimp.AUTO, 650)
                const jimp_2 = await Jimp.read(await resz.getBufferAsync(Jimp.MIME_JPEG))
                return {
                    img: await resz.getBufferAsync(Jimp.MIME_JPEG)
                }
            }
        },
        sendButtonImg: {
            async value(jid, buffer, contentText, footerText, button1, id1, quoted, options) {
                let type = await conn.getFile(buffer)
                let { res, data: file } = type
                if ((res && res.status !== 200) || file.length <= 65536) {
                    try {
                        throw { json: JSON.parse(file.toString()) }
                    } catch (e) {
                        if (e.json) throw e.json
                    }
                }
                const buttons = [{ buttonId: id1, buttonText: { displayText: button1 }, type: 1 }]

                const buttonMessage = {
                    image: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: await conn.parseMention(contentText + footerText),
                    ...options,
                    buttons: buttons,
                    headerType: 4
                }

                return conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    ephemeralExpiration: 86400,
                    contextInfo: {
                        mentionedJid: conn.parseMention(contentText + footerText)
                    },
                    ...options
                })
            }
        },
        send1ButtonVid: {
            async value(jid, buffer, contentText, footerText, button1, id1, quoted, options) {
                let type = await conn.getFile(buffer)
                let { res, data: file } = type
                if ((res && res.status !== 200) || file.length <= 65536) {
                    try {
                        throw { json: JSON.parse(file.toString()) }
                    } catch (e) {
                        if (e.json) throw e.json
                    }
                }
                let buttons = [{ buttonId: id1, buttonText: { displayText: button1 }, type: 1 }]
                const buttonMessage = {
                    video: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: await conn.parseMention(contentText),
                    ...options,
                    buttons: buttons,
                    headerType: 4
                }
                return conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    ephemeralExpiration: 86400,
                    ...options
                })
            }
        },
        send2ButtonVid: {
            async value(jid, buffer, contentText, footerText, button1, id1, button2, id2, quoted, options) {
                let type = await conn.getFile(buffer)
                let { res, data: file } = type
                if ((res && res.status !== 200) || file.length <= 65536) {
                    try {
                        throw { json: JSON.parse(file.toString()) }
                    } catch (e) {
                        if (e.json) throw e.json
                    }
                }
                let buttons = [
                    { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
                    { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }
                ]
                const buttonMessage = {
                    video: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: await conn.parseMention(contentText + footerText),
                    ...options,
                    buttons: buttons,
                    headerType: 4
                }
                return conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    ephemeralExpiration: 86400,
                    ...options
                })
            }
        },
        sendButtonLoc: {
            async value(jid, buffer, content, footer, button1, row1, quoted, options = {}) {
                let type = await conn.getFile(buffer)
                let { res, data: file } = type
                if ((res && res.status !== 200) || file.length <= 65536) {
                    try {
                        throw { json: JSON.parse(file.toString()) }
                    } catch (e) {
                        if (e.json) throw e.json
                    }
                }
                let buttons = [{ buttonId: row1, buttonText: { displayText: button1 }, type: 1 }]

                let buttonMessage = {
                    location: { jpegThumbnail: file },
                    caption: content,
                    footer: footer,
                    mentions: await conn.parseMention(content + footer),
                    ...options,
                    buttons: buttons,
                    headerType: 6
                }
                return await conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ephemeralExpiration: global.ephemeral,
                    mentions: await conn.parseMention(content + footer),
                    ...options
                })
            }
        },
        sendButtonVid: {
            async value(jid, buffer, contentText, footerText, button1, id1, button2, id2, button3, id3, quoted, options) {
                let type = await conn.getFile(buffer)
                let { res, data: file } = type
                if ((res && res.status !== 200) || file.length <= 65536) {
                    try {
                        throw { json: JSON.parse(file.toString()) }
                    } catch (e) {
                        if (e.json) throw e.json
                    }
                }
                let buttons = [
                    { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
                    { buttonId: id2, buttonText: { displayText: button2 }, type: 1 },
                    { buttonId: id3, buttonText: { displayText: button3 }, type: 1 }
                ]
                const buttonMessage = {
                    video: file,
                    fileLength: 800000000000000,
                    caption: contentText,
                    footer: footerText,
                    mentions: await conn.parseMention(contentText + footerText),
                    ...options,
                    buttons: buttons,
                    headerType: 4
                }
                return conn.sendMessage(jid, buttonMessage, {
                    quoted,
                    ephemeralExpiration: 86400,
                    ...options
                })
            }
        },
        sendTemplateButtonLoc: {
            async value(jid, buffer, contentText, footer, buttons1, row1, quoted, options) {
                let file = await conn.resize(buffer, 300, 150)
                const template = generateWAMessageFromContent(
                    jid,
                    proto.Message.fromObject({
                        templateMessage: {
                            hydratedTemplate: {
                                locationMessage: { jpegThumbnail: file },
                                hydratedContentText: contentText,
                                hydratedFooterText: footer,
                                ...options,
                                hydratedButtons: [
                                    {
                                        urlButton: {
                                            displayText: global.author,
                                            url: global.md
                                        }
                                    },
                                    {
                                        quickReplyButton: {
                                            displayText: buttons1,
                                            id: row1
                                        }
                                    }
                                ]
                            }
                        }
                    }),
                    {
                        userJid: conn.user.jid,
                        quoted: quoted,
                        contextInfo: {
                            mentionedJid: conn.parseMention(contentText + footer)
                        },
                        ephemeralExpiration: '86400',
                        ...options
                    }
                )
                return conn.relayMessage(jid, template.message, {
                    messageId: template.key.id
                })
            }
        },
        sendGroupV4Invite: {
            async value(
                jid,
                participant,
                inviteCode,
                inviteExpiration,
                groupName = 'unknown subject',
                caption = 'Invitation to join my WhatsApp group',
                jpegThumbnail,
                options = {}
            ) {
                const msg = proto.Message.fromObject({
                    groupInviteMessage: proto.GroupInviteMessage.fromObject({
                        inviteCode,
                        inviteExpiration: parseInt(inviteExpiration) || +new Date(new Date() + 3 * 86400000),
                        groupJid: jid,
                        groupName: (groupName ? groupName : await conn.getName(jid)) || null,
                        jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
                        caption
                    })
                })
                const message = generateWAMessageFromContent(participant, msg, options)
                await conn.relayMessage(participant, message.message, {
                    messageId: message.key.id,
                    additionalAttributes: { ...options }
                })
                return message
            },
            enumerable: true
        },
        sendButton: {
            async value(jid, text = '', footer = '', buffer, buttons, copy, urls, list, quoted, options) {
                let img, video

                if (/^https?:\/\//i.test(buffer)) {
                    try {
                        const response = await fetch(buffer)
                        const contentType = response.headers.get('content-type')
                        if (/^image\//i.test(contentType)) {
                            img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                        } else if (/^video\//i.test(contentType)) {
                            video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                        }
                    } catch (error) {
                        console.error('Failed to get MIME type:', error)
                    }
                } else {
                    try {
                        const type = await conn.getFile(buffer)
                        if (/^image\//i.test(type.mime)) {
                            img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                        } else if (/^video\//i.test(type.mime)) {
                            video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                        }
                    } catch (error) {
                        console.error('Failed to get file type:', error)
                    }
                }

                const dynamicButtons = []

                if (buttons && Array.isArray(buttons)) {
                    dynamicButtons.push(
                        ...buttons.map((btn) => ({
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: btn[0],
                                id: btn[1]
                            })
                        }))
                    )
                }

                if (copy && Array.isArray(copy)) {
                    dynamicButtons.push(
                        ...copy.map((copyBtn) => ({
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: copyBtn[0] || 'Copy',
                                copy_code: copyBtn[1]
                            })
                        }))
                    )
                }

                if (urls && Array.isArray(urls)) {
                    urls.forEach((url) => {
                        dynamicButtons.push({
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: url[0],
                                url: url[1],
                                merchant_url: url[1]
                            })
                        })
                    })
                }

                if (list && Array.isArray(list)) {
                    list.forEach((lister) => {
                        dynamicButtons.push({
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: lister[0],
                                sections: lister[1]
                            })
                        })
                    })
                }
                const interactiveMessage = {
                    body: { text: text },
                    footer: { text: footer },
                    header: {
                        hasMediaAttachment: false,
                        imageMessage: img ? img.imageMessage : null,
                        videoMessage: video ? video.videoMessage : null
                    },
                    nativeFlowMessage: {
                        buttons: dynamicButtons,
                        messageParamsJson: ''
                    }
                }

                let msgL = generateWAMessageFromContent(
                    jid,
                    {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage
                            }
                        }
                    },
                    { userJid: conn.user.jid, quoted }
                )

                conn.relayMessage(jid, msgL.message, {
                    messageId: msgL.key.id,
                    ...options
                })
            }
        },
        sendNCarousel: {
            async value(jid, text = '', footer = '', buffer, buttons, copy, urls, list, quoted, options) {
                let img, video
                if (buffer) {
                    if (/^https?:\/\//i.test(buffer)) {
                        try {
                            const response = await fetch(buffer)
                            const contentType = response.headers.get('content-type')
                            if (/^image\//i.test(contentType)) {
                                img = await prepareWAMessageMedia(
                                    {
                                        image: {
                                            url: buffer
                                        }
                                    },
                                    {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    }
                                )
                            } else if (/^video\//i.test(contentType)) {
                                video = await prepareWAMessageMedia(
                                    {
                                        video: {
                                            url: buffer
                                        }
                                    },
                                    {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    }
                                )
                            } else {
                                console.error('Incompatible MIME type:', contentType)
                            }
                        } catch (error) {
                            console.error('Failed to get MIME type:', error)
                        }
                    } else {
                        try {
                            const type = await conn.getFile(buffer)
                            if (/^image\//i.test(type.mime)) {
                                img = await prepareWAMessageMedia(
                                    {
                                        image: /^https?:\/\//i.test(buffer)
                                            ? {
                                                url: buffer
                                            }
                                            : type && type?.data
                                    },
                                    {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    }
                                )
                            } else if (/^video\//i.test(type.mime)) {
                                video = await prepareWAMessageMedia(
                                    {
                                        video: /^https?:\/\//i.test(buffer)
                                            ? {
                                                url: buffer
                                            }
                                            : type && type?.data
                                    },
                                    {
                                        upload: conn.waUploadToServer,
                                        ...options
                                    }
                                )
                            }
                        } catch (error) {
                            console.error('Failed to get file type:', error)
                        }
                    }
                }
                const dynamicButtons = buttons.map((btn) => ({
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: btn[0],
                        id: btn[1]
                    })
                }))
                dynamicButtons.push(
                    copy && (typeof copy === 'string' || typeof copy === 'number')
                        ? {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'Copy',
                                copy_code: copy
                            })
                        }
                        : null
                )

                urls?.forEach((url) => {
                    dynamicButtons.push({
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: url[0],
                            url: url[1],
                            merchant_url: url[1]
                        })
                    })
                })
                list?.forEach((lister) => {
                    dynamicButtons.push({
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: lister[0],
                            sections: lister[1]
                        })
                    })
                })
                const interactiveMessage = {
                    body: {
                        text: text || ''
                    },
                    footer: {
                        text: footer || wm
                    },
                    header: {
                        hasMediaAttachment: img?.imageMessage || video?.videoMessage ? true : false,
                        imageMessage: img?.imageMessage || null,
                        videoMessage: video?.videoMessage || null
                    },
                    nativeFlowMessage: {
                        buttons: dynamicButtons.filter(Boolean),
                        messageParamsJson: ''
                    },
                    ...Object.assign(
                        {
                            mentions: typeof text === 'string' ? conn.parseMention(text || '@0') : [],
                            contextInfo: {
                                mentionedJid: typeof text === 'string' ? conn.parseMention(text || '@0') : []
                            }
                        },
                        {
                            ...(options || {}),
                            ...(conn.temareply?.contextInfo && {
                                contextInfo: {
                                    ...(options?.contextInfo || {}),
                                    ...conn.temareply?.contextInfo,
                                    externalAdReply: {
                                        ...(options?.contextInfo?.externalAdReply || {}),
                                        ...conn.temareply?.contextInfo?.externalAdReply
                                    }
                                }
                            })
                        }
                    )
                }
                const messageContent = proto.Message.fromObject({
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage
                        }
                    }
                })
                const msgs = await generateWAMessageFromContent(jid, messageContent, {
                    userJid: conn.user.jid,
                    quoted: quoted,
                    upload: conn.waUploadToServer,
                    ephemeralExpiration: WA_DEFAULT_EPHEMERAL
                })
                await conn.relayMessage(jid, msgs.message, {
                    messageId: msgs.key.id
                })
            }
        },
        sendCarousel: {
            async value(jid, text = '', footer = '', text2 = '', messages, quoted, options) {
                if (messages.length > 1) {
                    const cards = await Promise.all(
                        messages.map(async ([text = '', footer = '', buffer, buttons, copy, urls, list]) => {
                            let img, video
                            if (/^https?:\/\//i.test(buffer)) {
                                try {
                                    const response = await fetch(buffer)
                                    const contentType = response.headers.get('content-type')
                                    if (/^image\//i.test(contentType)) {
                                        img = await prepareWAMessageMedia(
                                            {
                                                image: {
                                                    url: buffer
                                                }
                                            },
                                            {
                                                upload: conn.waUploadToServer,
                                                ...options
                                            }
                                        )
                                    } else if (/^video\//i.test(contentType)) {
                                        video = await prepareWAMessageMedia(
                                            {
                                                video: {
                                                    url: buffer
                                                }
                                            },
                                            {
                                                upload: conn.waUploadToServer,
                                                ...options
                                            }
                                        )
                                    } else {
                                        console.error('Incompatible MIME types:', contentType)
                                    }
                                } catch (error) {
                                    console.error('Failed to get MIME type:', error)
                                }
                            } else {
                                try {
                                    const type = await conn.getFile(buffer)
                                    if (/^image\//i.test(type.mime)) {
                                        img = await prepareWAMessageMedia(
                                            {
                                                image: /^https?:\/\//i.test(buffer)
                                                    ? {
                                                        url: buffer
                                                    }
                                                    : type && type?.data
                                            },
                                            {
                                                upload: conn.waUploadToServer,
                                                ...options
                                            }
                                        )
                                    } else if (/^video\//i.test(type.mime)) {
                                        video = await prepareWAMessageMedia(
                                            {
                                                video: /^https?:\/\//i.test(buffer)
                                                    ? {
                                                        url: buffer
                                                    }
                                                    : type && type?.data
                                            },
                                            {
                                                upload: conn.waUploadToServer,
                                                ...options
                                            }
                                        )
                                    }
                                } catch (error) {
                                    console.error('Failed to get file type:', error)
                                }
                            }
                            const dynamicButtons = buttons.map((btn) => ({
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: btn[0],
                                    id: btn[1]
                                })
                            }))
                            copy = Array.isArray(copy) ? copy : [copy]
                            copy.map((copy) => {
                                dynamicButtons.push({
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Copy',
                                        copy_code: copy[0]
                                    })
                                })
                            })
                            urls?.forEach((url) => {
                                dynamicButtons.push({
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: url[0],
                                        url: url[1],
                                        merchant_url: url[1]
                                    })
                                })
                            })

                            list?.forEach((lister) => {
                                dynamicButtons.push({
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: lister[0],
                                        sections: lister[1]
                                    })
                                })
                            })

                            return {
                                body: proto.Message.InteractiveMessage.Body.fromObject({
                                    text: text || ''
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                                    text: footer || wm
                                }),
                                header: proto.Message.InteractiveMessage.Header.fromObject({
                                    title: text2,
                                    subtitle: text || '',
                                    hasMediaAttachment: img?.imageMessage || video?.videoMessage ? true : false,
                                    imageMessage: img?.imageMessage || null,
                                    videoMessage: video?.videoMessage || null
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                    buttons: dynamicButtons.filter(Boolean),
                                    messageParamsJson: ''
                                }),
                                ...Object.assign(
                                    {
                                        mentions: typeof text === 'string' ? conn.parseMention(text || '@0') : [],
                                        contextInfo: {
                                            mentionedJid: typeof text === 'string' ? conn.parseMention(text || '@0') : []
                                        }
                                    },
                                    {
                                        ...(options || {}),
                                        ...(conn.temareply?.contextInfo && {
                                            contextInfo: {
                                                ...(options?.contextInfo || {}),
                                                ...conn.temareply?.contextInfo,
                                                externalAdReply: {
                                                    ...(options?.contextInfo?.externalAdReply || {}),
                                                    ...conn.temareply?.contextInfo?.externalAdReply
                                                }
                                            }
                                        })
                                    }
                                )
                            }
                        })
                    )
                    const interactiveMessage = proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: text || ''
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({
                            text: footer || wm
                        }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            title: text || '',
                            subtitle: text || '',
                            hasMediaAttachment: false
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards
                        }),
                        ...Object.assign(
                            {
                                mentions: typeof text === 'string' ? conn.parseMention(text || '@0') : [],
                                contextInfo: {
                                    mentionedJid: typeof text === 'string' ? conn.parseMention(text || '@0') : []
                                }
                            },
                            {
                                ...(options || {}),
                                ...(conn.temareply?.contextInfo && {
                                    contextInfo: {
                                        ...(options?.contextInfo || {}),
                                        ...conn.temareply?.contextInfo,
                                        externalAdReply: {
                                            ...(options?.contextInfo?.externalAdReply || {}),
                                            ...conn.temareply?.contextInfo?.externalAdReply
                                        }
                                    }
                                })
                            }
                        )
                    })
                    const messageContent = proto.Message.fromObject({
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage
                            }
                        }
                    })
                    const msgs = await generateWAMessageFromContent(jid, messageContent, {
                        userJid: conn.user.jid,
                        quoted: quoted,
                        upload: conn.waUploadToServer,
                        ephemeralExpiration: WA_DEFAULT_EPHEMERAL
                    })
                    await conn.relayMessage(jid, msgs.message, {
                        messageId: msgs.key.id
                    })
                } else {
                    await conn.sendNCarousel(jid, ...messages[0], quoted, options)
                }
            }
        },
        ctaButton: {
            get() {
                class Button {
                    constructor() {
                        this._title = ''
                        this._subtitle = ''
                        this._body = ''
                        this._footer = ''
                        this._buttons = []
                        this._data = null
                        this._contextInfo = {}
                        this._currentSelectionIndex = -1
                        this._currentSectionIndex = -1
                    }
                    setType(type) {
                        this._type = type
                        return this
                    }
                    contextInfo(info) {
                        this._contextInfo = info
                        return this
                    }
                    setBody(body) {
                        this._body = body
                        return this
                    }
                    setFooter(footer) {
                        this._footer = footer
                        return this
                    }
                    makeRow(header = '', title = '', description = '', id = '') {
                        if (this._currentSelectionIndex === -1 || this._currentSectionIndex === -1) {
                            throw new Error('You need to create a selection and a section first')
                        }
                        const buttonParams = JSON.parse(this._buttons[this._currentSelectionIndex].buttonParamsJson)
                        buttonParams.sections[this._currentSectionIndex].rows.push({
                            header: header,
                            title: title,
                            description: description,
                            id: id
                        })
                        this._buttons[this._currentSelectionIndex].buttonParamsJson = JSON.stringify(buttonParams)
                        return this
                    }
                    makeSections(title = '') {
                        if (this._currentSelectionIndex === -1) {
                            throw new Error('You need to create a selection first')
                        }
                        const buttonParams = JSON.parse(this._buttons[this._currentSelectionIndex].buttonParamsJson)
                        buttonParams.sections.push({
                            title: title,
                            rows: []
                        })
                        this._currentSectionIndex = buttonParams.sections.length - 1
                        this._buttons[this._currentSelectionIndex].buttonParamsJson = JSON.stringify(buttonParams)
                        return this
                    }
                    addSelection(title) {
                        this._buttons.push({
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: title,
                                sections: []
                            })
                        })
                        this._currentSelectionIndex = this._buttons.length - 1
                        this._currentSectionIndex = -1
                        return this
                    }
                    addReply(display_text = '', id = '') {
                        this._buttons.push({
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: display_text,
                                id: id
                            })
                        })
                        return this
                    }
                    addCopy(display_text = '', id = '') {
                        this._buttons.push({
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: display_text,
                                copy_code: id
                            })
                        })
                        return this
                    }
                    addUrl(display_text = '', url = '') {
                        this._buttons.push({
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: display_text,
                                url: url,
                                merchant_url: url
                            })
                        })
                        return this
                    }
                    setVideo(path, options = {}) {
                        if (!path) throw new Error('URL or buffer needed')
                        this._data = Buffer.isBuffer(path)
                            ? {
                                video: path,
                                ...options
                            }
                            : {
                                video: {
                                    url: path
                                },
                                ...options
                            }
                        return this
                    }
                    setImage(path, options = {}) {
                        if (!path) throw new Error('URL or buffer needed')
                        this._data = Buffer.isBuffer(path)
                            ? {
                                image: path,
                                ...options
                            }
                            : {
                                image: {
                                    url: path
                                },
                                ...options
                            }
                        return this
                    }
                    setDocument(path, options = {}) {
                        if (!path) throw new Error('URL or buffer needed')
                        this._data = Buffer.isBuffer(path)
                            ? {
                                document: path,
                                ...options
                            }
                            : {
                                document: {
                                    url: path
                                },
                                ...options
                            }
                        return this
                    }
                    setTitle(title) {
                        this._title = title
                        return this
                    }
                    setSubtitle(subtitle) {
                        this._subtitle = subtitle
                        return this
                    }
                    async run(jid, conn, quoted = {}) {
                        const message = {
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: this._body
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: this._footer
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                title: this._title,
                                subtitle: this._subtitle,
                                hasMediaAttachment: !!this._data,
                                ...(this._data
                                    ? await prepareWAMessageMedia(this._data, {
                                        upload: conn.waUploadToServer
                                    })
                                    : {})
                            })
                        }
                        const msg = await generateWAMessageFromContent(
                            jid,
                            {
                                viewOnceMessage: {
                                    message: {
                                        interactiveMessage: proto.Message.InteractiveMessage.create({
                                            ...message,
                                            contextInfo: this._contextInfo,
                                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                                buttons: this._buttons,
                                                messageParamsJson: ''
                                            })
                                        })
                                    }
                                }
                            },
                            {
                                userJid: conn.user.jid,
                                quoted: quoted,
                                upload: conn.waUploadToServer,
                                ephemeralExpiration: WA_DEFAULT_EPHEMERAL
                            }
                        )
                        await conn.relayMessage(msg.key.remoteJid, msg.message, {
                            messageId: msg.key.id
                        })
                        return msg
                    }
                }
                const button = new Button()
                return button
            },
            enumerable: true
        },
        sendButtonGif: {
            async value(jid, text = '', footer = '', gif, but = [], buff, options = {}) {
                let file = await conn.resize(buff, 300, 150)
                let a = [1, 2]
                let b = a[Math.floor(Math.random() * a.length)]
                conn.sendMessage(jid, {
                    video: gif,
                    gifPlayback: true,
                    gifAttribution: b,
                    caption: text,
                    footer: footer,
                    jpegThumbnail: file,
                    templateButtons: but,
                    ...options
                })
            }
        },
        sendHydrated: {
            async value(jid, text = '', footer = '', buffer, url, urlText, call, callText, buttons, quoted, options) {
                let type
                if (buffer)
                    try {
                        ; ((type = await conn.getFile(buffer)), (buffer = type.data))
                    } catch {
                        buffer = buffer
                    }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer)))
                    ((options = quoted),
                        (quoted = buttons),
                        (buttons = callText),
                        (callText = call),
                        (call = urlText),
                        (urlText = url),
                        (url = buffer),
                        (buffer = null))
                if (!options) options = {}
                let templateButtons = []
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url]
                    if (!Array.isArray(urlText)) urlText = [urlText]
                    templateButtons.push(
                        ...(url
                            .map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: (!nullish(urlText) && urlText) || (!nullish(url) && url) || '',
                                    url: (!nullish(url) && url) || (!nullish(urlText) && urlText) || ''
                                }
                            })) || [])
                    )
                }
                if (call || callText) {
                    if (!Array.isArray(call)) call = [call]
                    if (!Array.isArray(callText)) callText = [callText]
                    templateButtons.push(
                        ...(call
                            .map((v, i) => [v, callText[i]])
                            .map(([call, callText], i) => ({
                                index: templateButtons.length + i + 1,
                                callButton: {
                                    displayText: (!nullish(callText) && callText) || (!nullish(call) && call) || '',
                                    phoneNumber: (!nullish(call) && call) || (!nullish(callText) && callText) || ''
                                }
                            })) || [])
                    )
                }
                if (buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons]
                    templateButtons.push(
                        ...(buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: (!nullish(text) && text) || (!nullish(id) && id) || '',
                                id: (!nullish(id) && id) || (!nullish(text) && text) || ''
                            }
                        })) || [])
                    )
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer
                        ? options.asLocation && /image/.test(type.mime)
                            ? {
                                location: {
                                    ...options,
                                    jpegThumbnail: buffer
                                }
                            }
                            : {
                                [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                            }
                        : {})
                }
                return await conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                })
            },
            enumerable: true
        },
        sendHydrated2: {
            async value(jid, text = '', footer = '', buffer, url, urlText, url2, urlText2, buttons, quoted, options) {
                let type
                if (buffer)
                    try {
                        ; ((type = await conn.getFile(buffer)), (buffer = type.data))
                    } catch {
                        buffer = buffer
                    }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer)))
                    ((options = quoted),
                        (quoted = buttons),
                        (buttons = callText),
                        (callText = call),
                        (call = urlText),
                        (urlText = url),
                        (url = buffer),
                        (buffer = null))
                if (!options) options = {}
                let templateButtons = []
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url]
                    if (!Array.isArray(urlText)) urlText = [urlText]
                    templateButtons.push(
                        ...(url
                            .map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: (!nullish(urlText) && urlText) || (!nullish(url) && url) || '',
                                    url: (!nullish(url) && url) || (!nullish(urlText) && urlText) || ''
                                }
                            })) || [])
                    )
                }
                if (url2 || urlText2) {
                    if (!Array.isArray(url2)) url2 = [url2]
                    if (!Array.isArray(urlText2)) urlText2 = [urlText2]
                    templateButtons.push(
                        ...(url2
                            .map((v, i) => [v, urlText2[i]])
                            .map(([url2, urlText2], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: (!nullish(urlText2) && urlText2) || (!nullish(url2) && url2) || '',
                                    url: (!nullish(url2) && url2) || (!nullish(urlText2) && urlText2) || ''
                                }
                            })) || [])
                    )
                }
                if (buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons]
                    templateButtons.push(
                        ...(buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: (!nullish(text) && text) || (!nullish(id) && id) || '',
                                id: (!nullish(id) && id) || (!nullish(text) && text) || ''
                            }
                        })) || [])
                    )
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer
                        ? options.asLocation && /image/.test(type.mime)
                            ? {
                                location: {
                                    ...options,
                                    jpegThumbnail: buffer
                                }
                            }
                            : {
                                [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                            }
                        : {})
                }
                return await conn.sendMessage(jid, message, {
                    quoted,
                    upload: conn.waUploadToServer,
                    ...options
                })
            },
            enumerable: true
        },
        cMod: {
            value(jid, message, text = '', sender = conn.user.jid, options = {}) {
                if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions]
                let copy = message.toJSON()
                delete copy.message.messageContextInfo
                delete copy.message.senderKeyDistributionMessage
                let mtype = Object.keys(copy.message)[0]
                let msg = copy.message
                let content = msg[mtype]
                if (typeof content === 'string') msg[mtype] = text || content
                else if (content.caption) content.caption = text || content.caption
                else if (content.text) content.text = text || content.text
                if (typeof content !== 'string') {
                    msg[mtype] = { ...content, ...options }
                    msg[mtype].contextInfo = {
                        ...(content.contextInfo || {}),
                        mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
                    }
                }
                if (copy.participant) sender = copy.participant = sender || copy.participant
                else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
                if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
                else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
                copy.key.remoteJid = jid
                copy.key.fromMe = baileysAreJidsSameUser(sender, conn.user.id) || false
                return proto.WebMessageInfo.fromObject(copy)
            },
            enumerable: true
        },
        copyNForward: {
            async value(jid, message, forwardingScore = true, options = {}) {
                let vtype
                if (options.readViewOnce && message.message.viewOnceMessage?.message) {
                    vtype = Object.keys(message.message.viewOnceMessage.message)[0]
                    delete message.message.viewOnceMessage.message[vtype].viewOnce
                    message.message = proto.Message.fromObject(JSON.parse(JSON.stringify(message.message.viewOnceMessage.message)))
                    message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo
                }
                let mtype = Object.keys(message.message)[0]
                let m = generateForwardMessageContent(message, !!forwardingScore)
                let ctype = Object.keys(m)[0]
                if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore
                m[ctype].contextInfo = {
                    ...(message.message[mtype].contextInfo || {}),
                    ...(m[ctype].contextInfo || {})
                }
                m = generateWAMessageFromContent(jid, m, {
                    ...options,
                    userJid: conn.user.jid
                })
                await conn.relayMessage(jid, m.message, {
                    messageId: m.key.id,
                    additionalAttributes: { ...options }
                })
                return m
            },
            enumerable: true
        },
        fakeReply: {
            value(jid, text = '', fakeJid = this.user.jid, fakeText = '', fakeGroupJid, options) {
                return conn.reply(jid, text, {
                    key: {
                        fromMe: baileysAreJidsSameUser(fakeJid, conn.user.id),
                        participant: fakeJid,
                        ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {})
                    },
                    message: { conversation: fakeText },
                    ...options
                })
            }
        },
        downloadM: {
            async value(m, type, saveToFile) {
                let filename
                if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
                const stream = await downloadContentFromMessage(m, type)
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                if (saveToFile) ({ filename } = await conn.getFile(buffer, true))
                return saveToFile && fs.existsSync(filename) ? filename : buffer
            },
            enumerable: true
        },
        parseMention: {
            value(text = '') {
                if (!text) return []
                const matches = text.match(/@([0-9]{5,16}|0)/g)
                if (!matches) return []
                return matches.map((v) => v.slice(1) + '@s.whatsapp.net')
            },
            enumerable: true
        },
        getName: {
            value(jid = '', withoutContact = false) {
                try {
                    if (!jid || typeof jid !== "string" || jid.includes("No SenderKeyRecord")) return "";
                    
                    jid = conn.decodeJid(jid);
                    const jidClean = jid.replace('@s.whatsapp.net', '').replace('@lid', '').replace('lid_', '');
                    
                    if (global.lastMessages && global.lastMessages.length > 0) {
                        const lastMsg = global.lastMessages.find(msg => msg.sender === jid);
                        if (lastMsg && lastMsg.senderName && lastMsg.senderName !== jidClean && !lastMsg.senderName.match(/^\d+$/)) {
                            return lastMsg.senderName;
                        }
                    }
                    
                    if (global.db && global.db.data && global.db.data.users) {
                        const userDb = global.db.data.users[jid] || global.db.data.users[jidClean];
                        if (userDb && userDb.name && userDb.name !== jidClean && !userDb.name.match(/^\d+$/)) {
                            return userDb.name;
                        }
                    }
                    
                    if (conn.chats && conn.chats[jid] && conn.chats[jid].name) {
                        const name = conn.chats[jid].name;
                        if (name && !name.match(/^\d+$/)) {
                            return name;
                        }
                    }
                    
                    if (jid.endsWith('@g.us')) {
                        let v = conn.chats[jid] || {};
                        if (v.name || v.subject) {
                            return v.name || v.subject;
                        }
                        return "المجموعة";
                    }

                    if (jid.endsWith('@newsletter')) {
                        let v = conn.chats[jid] || {};
                        if (v.name || v.subject) {
                            return v.name || v.subject;
                        }
                        return "القناة";
                    }

                    let v = jid === '0@s.whatsapp.net' ? { jid: jid, vname: 'WhatsApp' } : 
                           areJidsSameUser(jid, conn.user.id) ? conn.user : conn.chats[jid] || {};
                    
                    let name = v.name || v.subject || v.vname || v.notify || v.verifiedName;
                    
                    if (name && name !== jidClean && !name.match(/^\d+$/)) {
                        return name;
                    }
                    
                    return jidClean;
                    
                } catch (error) {
                    console.error('getName error:', error);
                    return jid?.split('@')[0] || '';
                }
            },
            enumerable: true
        },
        loadMessage: {
            value(messageID) {
                return Object.entries(conn.chats)
                    .filter(([_, { messages }]) => typeof messages === 'object')
                    .find(([_, { messages }]) => Object.entries(messages).find(([k, v]) => k === messageID || v.key?.id === messageID))?.[1].messages?.[messageID]
            },
            enumerable: true
        },
        processMessageStubType: {
            async value(m) {
                if (!m.messageStubType) return
                const chat = conn.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '')
                if (!chat || chat === 'status@broadcast') return

                const emitGroupUpdate = (update) => {
                    conn.ev.emit('groups.update', [{ id: chat, ...update }])
                }

                switch (m.messageStubType) {
                    case WAMessageStubType.REVOKE:
                    case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
                        if (Array.isArray(m.messageStubParameters) && m.messageStubParameters.length > 0) {
                            emitGroupUpdate({ revoke: m.messageStubParameters[0] })
                        }
                        break
                    case WAMessageStubType.GROUP_CHANGE_ICON:
                        if (Array.isArray(m.messageStubParameters) && m.messageStubParameters.length > 0) {
                            emitGroupUpdate({ icon: m.messageStubParameters[0] })
                        }
                        break
                    default: {
                        console.log({
                            messageStubType: m.messageStubType,
                            messageStubParameters: m.messageStubParameters || [],
                            type: WAMessageStubType[m.messageStubType]
                        })
                        break
                    }
                }

                const isGroup = chat.endsWith('@g.us')
                if (!isGroup) return

                let chats = conn.chats[chat]
                if (!chats) chats = conn.chats[chat] = { id: chat }
                chats.isChats = true

                const metadata = await conn.groupMetadata(chat).catch(() => null)
                if (!metadata) return

                chats.subject = metadata.subject
                chats.metadata = metadata
            }
        },
        insertAllGroup: {
            async value() {
                const groups = (await conn.groupFetchAllParticipating().catch((_) => null)) || {}
                for (const group in groups)
                    conn.chats[group] = {
                        ...(conn.chats[group] || {}),
                        id: group,
                        subject: groups[group].subject,
                        isChats: true,
                        metadata: groups[group]
                    }
                return conn.chats
            }
        },
        pushMessage: {
            async value(m) {
                if (!m) return
                if (!Array.isArray(m)) m = [m]
                for (const message of m) {
                    try {
                        if (!message) continue
                        if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT)
                            conn.processMessageStubType(message).catch(console.error)
                        const _mtype = Object.keys(message.message || {})
                        const mtype =
                            (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
                            (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
                            _mtype[_mtype.length - 1]
                        const chat = conn.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
                        if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
                            let context = message.message[mtype].contextInfo
                            let participant = conn.decodeJid(context.participant)
                            const remoteJid = conn.decodeJid(context.remoteJid || participant)
                            let quoted = message.message[mtype].contextInfo.quotedMessage
                            if (remoteJid && remoteJid !== 'status@broadcast' && quoted) {
                                let qMtype = Object.keys(quoted)[0]
                                if (qMtype == 'conversation') {
                                    quoted.extendedTextMessage = { text: quoted[qMtype] }
                                    delete quoted.conversation
                                    qMtype = 'extendedTextMessage'
                                }
                                if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {}
                                quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || []
                                const isGroup = remoteJid.endsWith('g.us')
                                if (isGroup && !participant) participant = remoteJid
                                const qM = {
                                    key: {
                                        remoteJid,
                                        fromMe: baileysAreJidsSameUser(conn.user.jid, remoteJid),
                                        id: context.stanzaId,
                                        participant
                                    },
                                    message: JSON.parse(JSON.stringify(quoted)),
                                    ...(isGroup ? { participant } : {})
                                }
                                let qChats = conn.chats[participant]
                                if (!qChats)
                                    qChats = conn.chats[participant] = {
                                        id: participant,
                                        isChats: !isGroup
                                    }
                                if (!qChats.messages) qChats.messages = {}
                                if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM
                                let qChatsMessages
                                if ((qChatsMessages = Object.entries(qChats.messages)).length > 40)
                                    qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length))
                            }
                        }
                        if (!chat || chat === 'status@broadcast') continue
                        const isGroup = chat.endsWith('@g.us')
                        let chats = conn.chats[chat]
                        if (!chats) {
                            if (isGroup) await conn.insertAllGroup().catch(console.error)
                            chats = conn.chats[chat] = {
                                id: chat,
                                isChats: true,
                                ...(conn.chats[chat] || {})
                            }
                        }
                        let metadata, sender
                        if (isGroup) {
                            if (!chats.subject || !chats.metadata) {
                                metadata = (await conn.groupMetadata(chat).catch((_) => ({}))) || {}
                                if (!chats.subject) chats.subject = metadata.subject || ''
                                if (!chats.metadata) chats.metadata = metadata
                            }
                            sender = conn.decodeJid((message.key?.fromMe && conn.user.id) || message.participant || message.key?.participant || chat || '')
                            if (sender !== chat) {
                                let chats = conn.chats[sender]
                                if (!chats) chats = conn.chats[sender] = { id: sender }
                                if (!chats.name) chats.name = message.pushName || chats.name || ''
                            }
                        } else if (!chats.name) chats.name = message.pushName || chats.name || ''
                        if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue
                        chats.isChats = true
                        if (!chats.messages) chats.messages = {}
                        const fromMe = message.key.fromMe || baileysAreJidsSameUser(sender || chat, conn.user.id)
                        if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
                            delete message.message.messageContextInfo
                            delete message.message.senderKeyDistributionMessage
                            chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2))
                            let chatsMessages
                            if ((chatsMessages = Object.entries(chats.messages)).length > 40)
                                chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length))
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        },
        serializeM: {
            async value(m) {
                return await smsg(conn, m)
            },
            enumerable: true
        },
        ...(typeof conn.chatRead !== 'function'
            ? {
                chatRead: {
                    value(jid, participant = conn.user.jid, messageID) {
                        return conn.sendReadReceipt(jid, participant, [messageID])
                    },
                    enumerable: true
                }
            }
            : {}),
        ...(typeof conn.setStatus !== 'function'
            ? {
                setStatus: {
                    value(status) {
                        return conn.query({
                            tag: 'iq',
                            attrs: {
                                to: S_WHATSAPP_NET,
                                type: 'set',
                                xmlns: 'status'
                            },
                            content: [
                                {
                                    tag: 'status',
                                    attrs: {},
                                    content: Buffer.from(status, 'utf-8')
                                }
                            ]
                        })
                    },
                    enumerable: true
                }
            }
            : {})
    })

    if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id)
    store.bind(sock)
    return sock
}

export async function smsg(conn, m, hasParent) {
    if (!m) return m
    
    let newM = JSON.parse(JSON.stringify(m))
    
    let finalM = proto.WebMessageInfo.fromObject(newM)
    finalM.conn = conn
    finalM._chat = newM.chat || newM.key?.remoteJid || ''
    
    Object.defineProperty(finalM, 'chat', {
        get() {
            return this._chat || this.key?.remoteJid || ''
        },
        enumerable: true,
        configurable: true
    })
    
    return finalM
}

export function serialize() {
    const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']
    return Object.defineProperties(proto.WebMessageInfo.prototype, {
        conn: {
            value: undefined,
            enumerable: false,
            writable: true
        },
        id: {
            get() {
                return this.key?.id
            }
        },
        isBaileys: {
            get() {
                return (
                    (this.key.fromMe && this.id?.startsWith('3EB0') && this.id?.length === 12) ||
                    (this.key.fromMe && this.id?.startsWith('3EB0') && (this.id?.length === 20 || this.id?.length === 22)) ||
                    false
                )
            }
        },
        chat: {
            get() {
                const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId
                return this._chat || this.key?.remoteJid || (senderKeyDistributionMessage && senderKeyDistributionMessage !== 'status@broadcast') || ''
            },
            enumerable: true
        },
        isGroup: {
            get() {
                return this.chat?.endsWith('@g.us')
            },
            enumerable: true
        },
        sender: {
            get() {
                return this.conn?.decodeJid((this.key?.fromMe && this.conn?.user.id) || this.participant || this.key?.participant || this.chat || '')
            },
            enumerable: true
        },
        fromMe: {
            get() {
                return this.key?.fromMe || baileysAreJidsSameUser(this.conn?.user.id, this.sender) || false
            }
        },
        mtype: {
            get() {
                if (!this.message) return ''
                const type = Object.keys(this.message)
                return (
                    (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) ||
                    (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) ||
                    type[type.length - 1]
                )
            },
            enumerable: true
        },
        msg: {
            get() {
                if (!this.message) return null
                return this.message[this.mtype]
            }
        },
        mediaMessage: {
            get() {
                if (!this.message) return null
                const Message = (this.msg?.url || this.msg?.directPath ? { ...this.message } : extractMessageContent(this.message)) || null
                if (!Message) return null
                const mtype = Object.keys(Message)[0]
                return MediaType.includes(mtype) ? Message : null
            },
            enumerable: true
        },
        mediaType: {
            get() {
                let message
                if (!(message = this.mediaMessage)) return null
                return Object.keys(message)[0]
            },
            enumerable: true
        },
        quoted: {
            get() {
                const self = this
                const msg = self.msg
                const contextInfo = msg?.contextInfo
                const quoted = contextInfo?.quotedMessage
                if (!msg || !contextInfo || !quoted) return null
                const type = Object.keys(quoted)[0]
                let q = quoted[type]
                const text = typeof q === 'string' ? q : q.text
                return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? { text: q } : q)), {
                    mtype: {
                        get() {
                            return type
                        },
                        enumerable: true
                    },
                    mediaMessage: {
                        get() {
                            const Message = (q.url || q.directPath ? { ...quoted } : extractMessageContent(quoted)) || null
                            if (!Message) return null
                            const mtype = Object.keys(Message)[0]
                            return MediaType.includes(mtype) ? Message : null
                        },
                        enumerable: true
                    },
                    mediaType: {
                        get() {
                            let message
                            if (!(message = this.mediaMessage)) return null
                            return Object.keys(message)[0]
                        },
                        enumerable: true
                    },
                    id: {
                        get() {
                            return contextInfo.stanzaId
                        },
                        enumerable: true
                    },
                    chat: {
                        get() {
                            return contextInfo.remoteJid || self.chat
                        },
                        enumerable: true
                    },
                    isBaileys: {
                        get() {
                            return this.id?.length === 16 || (this.id?.startsWith('3EB0') && this.id.length === 12) || false
                        },
                        enumerable: true
                    },
                    sender: {
                        get() {
                            return (contextInfo.participant || this.chat || '').decodeJid()
                        },
                        enumerable: true
                    },
                    fromMe: {
                        get() {
                            return baileysAreJidsSameUser(this.sender, self.conn?.user.jid)
                        },
                        enumerable: true
                    },
                    text: {
                        get() {
                            return text || this.caption || this.contentText || this.selectedDisplayText || ''
                        },
                        enumerable: true
                    },
                    mentionedJid: {
                        get() {
                            return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || []
                        },
                        enumerable: true
                    },
                    name: {
                        get() {
                            const sender = this.sender
                            return sender ? self.conn?.getName(sender) : null
                        },
                        enumerable: true
                    },
                    vM: {
                        get() {
                            return proto.WebMessageInfo.fromObject({
                                key: {
                                    fromMe: this.fromMe,
                                    remoteJid: this.chat,
                                    id: this.id
                                },
                                message: quoted,
                                ...(self.isGroup ? { participant: this.sender } : {})
                            })
                        }
                    },
                    fakeObj: {
                        get() {
                            return this.vM
                        }
                    },
                    download: {
                        value(saveToFile = false) {
                            const mtype = this.mediaType
                            return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
                        },
                        enumerable: true,
                        configurable: true
                    },
                    reply: {
                        value(text, chatId, options) {
                            return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options)
                        },
                        enumerable: true
                    },
                    copy: {
                        value() {
                            const M = proto.WebMessageInfo
                            return smsg(conn, M.fromObject(M.toObject(this.vM)))
                        },
                        enumerable: true
                    },
                    forward: {
                        value(jid, force = false, options) {
                            return self.conn?.sendMessage(
                                jid,
                                {
                                    forward: this.vM,
                                    force,
                                    ...options
                                },
                                { ...options }
                            )
                        },
                        enumerable: true
                    },
                    copyNForward: {
                        value(jid, forceForward = false, options) {
                            return self.conn?.copyNForward(jid, this.vM, forceForward, options)
                        },
                        enumerable: true
                    },
                    cMod: {
                        value(jid, text = '', sender = this.sender, options = {}) {
                            return self.conn?.cMod(jid, this.vM, text, sender, options)
                        },
                        enumerable: true
                    },
                    delete: {
                        value() {
                            return self.conn?.sendMessage(this.chat, {
                                delete: this.vM.key
                            })
                        },
                        enumerable: true
                    },
                    react: {
                        value(text) {
                            return self.conn?.sendMessage(this.chat, {
                                react: {
                                    text,
                                    key: this.vM.key
                                }
                            })
                        },
                        enumerable: true
                    }
                })
            },
            enumerable: true
        },
        _text: {
            value: null,
            writable: true
        },
        text: {
            get() {
                const msg = this.msg
                const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || ''
                return typeof this._text === 'string'
                    ? this._text
                    : '' || (typeof text === 'string' ? text : text?.selectedDisplayText || text?.hydratedTemplate?.hydratedContentText || text) || ''
            },
            set(str) {
                return (this._text = str)
            },
            enumerable: true
        },
        mentionedJid: {
            get() {
                return (this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid) || []
            },
            enumerable: true
        },
        name: {
            get() {
                return (!nullish(this.pushName) && this.pushName) || this.conn?.getName(this.sender)
            },
            enumerable: true
        },
        download: {
            value(saveToFile = false) {
                const mtype = this.mediaType
                return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
            },
            enumerable: true,
            configurable: true
        },
        reply: {
            value(text, chatId, options) {
                return this.conn?.reply(chatId ? chatId : this.chat, text, this, options)
            }
        },
        copy: {
            value() {
                const M = proto.WebMessageInfo
                return smsg(this.conn, M.fromObject(M.toObject(this)))
            },
            enumerable: true
        },
        forward: {
            value(jid, force = false, options = {}) {
                return this.conn?.sendMessage(
                    jid,
                    {
                        forward: this,
                        force,
                        ...options
                    },
                    { ...options }
                )
            },
            enumerable: true
        },
        copyNForward: {
            value(jid, forceForward = false, options = {}) {
                return this.conn?.copyNForward(jid, this, forceForward, options)
            },
            enumerable: true
        },
        cMod: {
            value(jid, text = '', sender = this.sender, options = {}) {
                return this.conn?.cMod(jid, this, text, sender, options)
            },
            enumerable: true
        },
        getQuotedObj: {
            value() {
                if (!this.quoted.id) return null
                const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM)
                return smsg(this.conn, q)
            },
            enumerable: true
        },
        getQuotedMessage: {
            get() {
                return this.getQuotedObj
            }
        },
        delete: {
            value() {
                return this.conn?.sendMessage(this.chat, { delete: this.key })
            },
            enumerable: true
        },
        react: {
            value(text) {
                return this.conn?.sendMessage(this.chat, {
                    react: {
                        text,
                        key: this.key
                    }
                })
            },
            enumerable: true
        },
        isAdmin: {
    get() {
        if (!this.isGroup || !this.conn?.chats) return false;
        const chat = this.chat;
        const groupData = this.conn.chats[chat];
        if (!groupData?.metadata?.participants) return false;
        
        const participants = groupData.metadata.participants;
        const sender = this.sender || '';
        const senderNum = sender.replace(/[^0-9]/g, '');

        return participants.some(p => {
            const pId = p.id || '';
            const pPhone = (p.phoneNumber || '').replace(/[^0-9]/g, '');
            
            return (p.admin === 'admin' || p.admin === 'superadmin') && 
                   (p.id === sender || pPhone === senderNum);
        });
    },
    enumerable: true
},

isBotAdmin: {
    get() {
        if (!this.isGroup || !this.conn?.chats || !this.conn?.user) return false;
        const chat = this.chat;
        const groupData = this.conn.chats[chat];
        if (!groupData?.metadata?.participants) return false;
        
        const participants = groupData.metadata.participants;
        const lid = this.conn.user.lid || '';
        const botNum = (this.conn.user.jid || '').replace(/[^0-9]/g, '');

        return participants.some(p => {
            const pPhone = (p.phoneNumber || '').replace(/[^0-9]/g, '');
            
            return (p.admin === 'admin' || p.admin === 'superadmin') && 
                   (p.id === lid || p.id === lid.replace(/:\d+@/, '@') || pPhone === botNum);
        });
    },
    enumerable: true
}
    })
}

export function logic(check, inp, out) {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}

export function protoType() {
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length)
        const view = new Uint8Array(ab)
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i]
        }
        return ab
    }
    Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
        return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
    }
    ArrayBuffer.prototype.toBuffer = function toBuffer() {
        return Buffer.from(new Uint8Array(this))
    }
    Uint8Array.prototype.getFileType =
        ArrayBuffer.prototype.getFileType =
        Buffer.prototype.getFileType =
        async function getFileType() {
            return await fileTypeFromBuffer(this)
        }
    String.prototype.isNumber = Number.prototype.isNumber = isNumber
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1, this.length)
    }
    String.prototype.capitalizeV2 = function capitalizeV2() {
        const str = this.split(' ')
        return str.map((v) => v.capitalize()).join(' ')
    }
    String.prototype.decodeJid = function decodeJid() {
        if (/:\d+@/gi.test(this)) {
            const decode = baileysJidDecode(this) || {}
            return ((decode.user && decode.server && decode.user + '@' + decode.server) || this).trim()
        } else return this.trim()
    }
    Number.prototype.toTimeString = function toTimeString() {
        const seconds = Math.floor((this / 1000) % 60)
        const minutes = Math.floor((this / (60 * 1000)) % 60)
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
        const days = Math.floor(this / (24 * 60 * 60 * 1000))
        return (
            (days ? `${days} day(s) ` : '') +
            (hours ? `${hours} hour(s) ` : '') +
            (minutes ? `${minutes} minute(s) ` : '') +
            (seconds ? `${seconds} second(s)` : '')
        ).trim()
    }
    Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom
}
