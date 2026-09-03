// handler.js
// ✧ 2B - YoRHa Unit No.2 Type B - المعالج الرئيسي 🚀

import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { smsg } from './core/Prototype_core.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const baileys = await import('@whiskeysockets/baileys')
const { proto } = baileys

const isNumber = (x) => typeof x === 'number' && !isNaN(x)
const delay = (ms) => isNumber(ms) && new Promise((resolve) => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    if (!this.pushMessage) {
        this.pushMessage = async (messages) => {
            try {
                if (!Array.isArray(messages)) messages = [messages]
                for (const message of messages) {
                    if (this.ev && typeof this.ev.emit === 'function') {
                        await this.ev.emit('messages.upsert', { messages: [message], type: 'notify' })
                    }
                }
            } catch (e) {
                console.error('[2B-pushMessage] Error:', e)
            }
        }
    }

    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()

    if (!chatUpdate) return
    if (!chatUpdate?.messages) return

    try {
        await this.pushMessage(chatUpdate.messages).catch(console.error)
    } catch (e) {
        console.error('[2B-pushMessage] Failed:', e)
    }

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (global.db.data == null) await global.loadDatabase()

    try {
        m = await smsg(this, m) || m
        if (!m) return

        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object') global.db.data.users[m.sender] = {}
            if (user) {
                if (!('name' in user)) user.name = m.name
                if (!('premium' in user)) user.premium = false
                if (!isNumber(user.premiumTime)) user.premiumTime = 0
                if (!('banned' in user)) user.banned = false
                if (!('BannedReason' in user)) user.BannedReason = ''
            } else {
                global.db.data.users[m.sender] = {
                    name: m.name,
                    premium: false,
                    premiumTime: 0,
                    banned: false,
                    BannedReason: ''
                }
            }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}

            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('welcome' in chat)) chat.welcome = true
                if (!('detect' in chat)) chat.detect = false
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat)) chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('delete' in chat)) chat.delete = false
                if (!('stickers' in chat)) chat.stickers = false
                if (!('autosticker' in chat)) chat.autosticker = false
                if (!('audios' in chat)) chat.audios = true
                if (!('reaction' in chat)) chat.reaction = true
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!('modoadmin' in chat)) chat.modoadmin = false
                if (!('autorespond' in chat)) chat.autorespond = true
                if (!('game' in chat)) chat.game = true
                if (!('game2' in chat)) chat.game2 = true
                if (!('simi' in chat)) chat.simi = false
                if (!('primaryBot' in chat)) chat.primaryBot = null
                if (!('antilink' in chat)) chat.antilink = false
                if (!isNumber(chat.expired)) chat.expired = 0
            } else {
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: true,
                    detect: true,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    delete: false,
                    stickers: false,
                    autosticker: false,
                    audios: false,
                    reaction: true,
                    viewonce: false,
                    modoadmin: false,
                    autorespond: true,
                    game: true,
                    game2: true,
                    simi: false,
                    primaryBot: null,
                    antilink: false,
                    expired: 0
                }
            }

            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = false
                if (!('jadibotmd' in settings)) settings.jadibotmd = true
                if (!('prefix' in settings)) settings.prefix = opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@'
            } else {
                global.db.data.settings[this.user.jid] = {
                    self: false,
                    autoread: false,
                    restrict: false,
                    jadibotmd: true,
                    prefix: opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@'
                }
            }
        } catch (e) {
            console.error(e)
        }

        var settings = global.db.data.settings[this.user.jid]
        let prefix
        const defaultPrefix = '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@'
        if (settings.prefix) {
            if (settings.prefix.includes(',')) {
                const prefixes = settings.prefix.split(',').map(p => p.trim())
                prefix = new RegExp('^(' + prefixes.map(p => p.replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&')).join('|') + ')')
            } else if (settings.prefix === defaultPrefix) {
                prefix = new RegExp('^[' + settings.prefix.replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']')
            } else {
                prefix = new RegExp('^' + settings.prefix.replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&'))
            }
        } else {
            prefix = new RegExp('')
        }

        const isROwner = global.owner.some(n => n === m.sender || n + '@lid' === m.sender || n + '@s.whatsapp.net' === m.sender)
        const isOwner = isROwner
        const isPrems = isROwner || (global.db.data.users[m.sender]?.premiumTime > 0)

        if (m.id?.startsWith('EVO') || m.id?.startsWith('Lyru-') || m.id?.startsWith('EvoGlobalBot-') ||
            (m.id?.startsWith('BAE5') && m.id?.length === 16) || m.id?.startsWith('B24E') ||
            (m.id?.startsWith('8SCO') && m.id?.length === 20) || m.id?.startsWith('FizzxyTheGreat-')) {
            return
        }

        if (opts['nyimak']) return
        if (!isROwner && opts['self']) return
        if (opts['pconly'] && m.chat?.endsWith('g.us')) return
        if (opts['gconly'] && !m.chat?.endsWith('g.us')) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        if (m.isGroup && !isROwner) {
            let chat = global.db.data.chats[m.chat]
            let isAdmin = m.isAdmin || false
            if (chat?.antilink && !isAdmin) {
                const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g
                if (urlRegex.test(m.text || '')) {
                    try {
                        await this.sendMessage(m.chat, { delete: m.key })
                        let warn = await this.sendMessage(m.chat, { 
                            text: `⚠️ *${m.pushName || 'العضو'}* ممنوع إرسال الروابط!`,
                            mentions: [m.sender]
                        })
                        setTimeout(() => {
                            this.sendMessage(m.chat, { delete: warn.key }).catch(() => {})
                        }, 5000)
                    } catch (e) {}
                    return
                }
            }
        }

        try {
            let buttonId = null
            
            if (m.message?.buttonsResponseMessage) {
                buttonId = m.message.buttonsResponseMessage.selectedButtonId
            }
            else if (m.message?.templateButtonReplyMessage) {
                const templateMsg = m.message.templateButtonReplyMessage
                buttonId = templateMsg.selectedId || templateMsg.selectedDisplayText
            }
            else if (m.message?.interactiveResponseMessage) {
                const intMsg = m.message.interactiveResponseMessage
                
                if (intMsg.nativeFlowResponseMessage) {
                    const native = intMsg.nativeFlowResponseMessage
                    buttonId = native.id
                    if (!buttonId && native.paramsJson) {
                        try {
                            const params = JSON.parse(native.paramsJson)
                            buttonId = params.id || params.selected_id
                        } catch (e) {}
                    }
                }
                
                if (!buttonId && intMsg.listResponseMessage) {
                    const listMsg = intMsg.listResponseMessage
                    buttonId = listMsg.singleSelectReply?.selectedRowId
                    if (!buttonId) {
                        buttonId = listMsg.title || listMsg.description
                    }
                }
            }

            if (buttonId) {
                let finalId = buttonId.trim()
                if (!finalId.startsWith('.')) finalId = '.' + finalId
                finalId = finalId.replace(/^\.\./, '.')
                m.text = finalId
                m.isCommand = true
            }
        } catch (err) {
            console.error('[2B-BUTTON HANDLER ERROR]', err)
        }

        if (!global.lastMessages) global.lastMessages = []
        global.lastMessages.push({
            sender: m.sender,
            senderName: m.pushName || m.name || 'مجهول',
            text: m.text || m.body || m.message?.conversation || '',
            body: m.body || '',
            isGroup: m.isGroup,
            chat: m.chat,
            time: Date.now()
        })
        if (global.lastMessages.length > 30) global.lastMessages.shift()

        let usedPrefix

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue
            if (plugin.disabled) continue

            const __filename = join(___dirname, name)

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    console.error(e)
                }
            }

            if (!opts['restrict'] && plugin.tags?.includes('admin')) continue

            const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : prefix

            let matchCandidates = _prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => {
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                    return [re.exec(m.text), re]
                }) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                [[null, null]]

            let match = null
            for (let i = 0; i < matchCandidates.length; i++) {
                if (matchCandidates[i][0]) {
                    match = matchCandidates[i]
                    break
                }
            }

            if (typeof plugin.before === 'function') {
                const beforeResult = await plugin.before.call(this, m, {
                    match, conn: this, participants: [], groupMetadata: null,
                    user: {}, bot: {}, isROwner, isOwner,
                    isRAdmin: false, isAdmin: false, isPrems,
                    chatUpdate, __dirname: ___dirname, __filename
                })
                if (beforeResult) continue
            }

            if (typeof plugin !== 'function') continue
            if (!match) continue

            usedPrefix = (match[0] || [])[0] || ''
            let noPrefix = m.text.slice(usedPrefix.length)
            let parts = noPrefix.trim().split(/\s+/).filter(v => v)
            let command = parts[0] ? parts[0].toLowerCase() : ''
            let args = parts.slice(1)
            let _args = noPrefix.trim().split(/\s+/).slice(1)
            let text = _args.join(' ')

            let isAccept = false
            if (plugin.command instanceof RegExp) {
                isAccept = plugin.command.test(command)
            } else if (Array.isArray(plugin.command)) {
                for (let i = 0; i < plugin.command.length; i++) {
                    const cmd = plugin.command[i]
                    if (cmd instanceof RegExp) {
                        if (cmd.test(command)) { isAccept = true; break }
                    } else if (cmd.toLowerCase() === command) {
                        isAccept = true; break
                    }
                }
            } else if (typeof plugin.command === 'string') {
                isAccept = plugin.command.toLowerCase() === command
            }

            if (!isAccept) continue
            m.plugin = name

            const isAdmin = m.isAdmin || false;
            const isBotAdmin = m.isBotAdmin || false;

            if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                let chat = global.db.data.chats[m.chat]
                let user = global.db.data.users[m.sender]
                if (!['owner-unbanchat.js'].includes(name) && chat?.isBanned && !isROwner) return
                if (name !== 'owner-unbanchat.js' && name !== 'owner-exec.js' && name !== 'owner-exec2.js' && name !== 'tool-delete.js' && chat?.isBanned && !isROwner) return
                if (m.text && user?.banned && !isROwner) return
            }

            let adminMode = global.db.data.chats[m.chat]?.modoadmin
            if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin) continue

            if (plugin.rowner && !isROwner) {
                global.dfail('rowner', m, this); continue
            }
            if (plugin.owner && !isOwner) {
                global.dfail('owner', m, this); continue
            }
            if (plugin.premium && !isPrems) {
                global.dfail('premium', m, this); continue
            }
            if (plugin.group && !m.isGroup) {
                global.dfail('group', m, this); continue
            } else if (plugin.botAdmin && !isBotAdmin) {
                global.dfail('botAdmin', m, this); continue
            } else if (plugin.admin && !isAdmin) {
                global.dfail('admin', m, this); continue
            }
            if (plugin.private && m.isGroup) {
                global.dfail('private', m, this); continue
            }

            m.isCommand = true

            let extra = {
                match, usedPrefix, noPrefix, _args, args, command, text,
                conn: this, participants: [], groupMetadata: null,
                user: {}, bot: {},
                isROwner, isOwner, isRAdmin: false, isAdmin: isAdmin,
                isBotAdmin: isBotAdmin, isPrems,
                chatUpdate, __dirname: ___dirname, __filename
            }

            try {
                await plugin.call(this, m, extra)
            } catch (e) {
                m.error = e
                console.error(e)
                if (e) m.reply(format(e) || 'Error desconocido')
            } finally {
                if (typeof plugin.after === 'function') {
                    try { await plugin.after.call(this, m, extra) } catch(e) {}
                }
            }
            break
        }
    } catch (e) {
        console.error(e)
    }

    try {
        if (!opts['noprint']) await (await import('./core/print.js')).default(m, this)
    } catch(e) {}
    
    let settingsREAD = global.db.data.settings[this.user.jid] || {}
    if (opts['autoread']) await this.readMessages([m.key])
}

export async function participantsUpdate({ id, participants, action }) {
    if (opts['self']) return
    if (this.isInit) return
    if (global.db.data == null) await global.loadDatabase()

    let chat = global.db.data.chats[id] || {}
    let text = ''

    try {
        let participantJid = ''
        if (Array.isArray(participants) && participants.length > 0) {
            const first = participants[0]
            if (typeof first === 'string') participantJid = first
            else if (first && typeof first === 'object') participantJid = first.id || first.jid || ''
        } else if (participants && typeof participants === 'string') {
            participantJid = participants
        } else if (participants && typeof participants === 'object') {
            participantJid = participants.id || participants.jid || ''
        }

        switch (action) {
            case 'promote':
                text = chat.sPromote || this.spromote || '@user is now Admin'
                break
            case 'demote':
                text = chat.sDemote || this.sdemote || '@user is no longer Admin'
                break
            default: return
        }

        if (text && participantJid) {
            await this.sendMessage(id, { text: text.replace('@user', '@' + participantJid.split('@')[0]), mentions: [participantJid] })
        }
    } catch (err) {
        console.error('[participantsUpdate]', err.message)
    }
}

export async function groupsUpdate(groupsUpdate) {
    if (opts['self']) return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let text = ''
        if (!text) continue
        await this.sendMessage(id, { text, mentions: this.parseMention(text) })
    }
}

export async function callUpdate(callUpdate) {
    for (let nk of callUpdate) {
        if (!nk.isGroup && nk.status === 'offer') {
            await this.updateBlockStatus(nk.from, 'block')
        }
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant, remoteJid } = message
        if (fromMe) return
        let msg = await this.serializeM(this.loadMessage(id))
        let chat = global.db.data.chats[msg?.chat] || {}
        if (!chat?.delete) return
        if (!msg) return
        let isGroup = remoteJid.endsWith('@g.us')
        let isPrivate = !isGroup && remoteJid.endsWith('@s.whatsapp.net')
        if (!isGroup && !isPrivate) return
        const antideleteMessage = `*╭━━⬣ ANTI-DELETE ⬣━━ 🐱*\n*┃📑 Mensaje eliminado por:* @${participant.split('@')[0]}\n*┃💬 Mensaje:* ${msg.text}\n*╰━━━⬣ ANTI-DELETE ⬣━━╯*`
        await this.sendMessage(msg.chat, { text: antideleteMessage, mentions: [participant] }, { quoted: msg })
        this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
    } catch (e) {
        console.error(e)
    }
}

global.dfail = async (type, m, conn) => {
    const msg = global.dfailMessages[type]
    if (!msg) return

    const randomImage = global.dfailPool[Math.floor(Math.random() * global.dfailPool.length)]

    try {
        const imgRes = await fetch(randomImage)
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
        const base64 = imgBuffer.toString('base64')

        const waMsg = generateWAMessageFromContent(m.chat, {
            extendedTextMessage: {
                text: `${global.dfailUrl}\n\n${msg}`,
                matchedText: global.dfailUrl,
                title: global.dfailTitle,
                description: global.dfailDesc,
                previewType: 0,
                jpegThumbnail: base64,
                inviteLinkGroupTypeV2: 0,
                contextInfo: {}
            }
        }, { userJid: conn.user.jid, quoted: m })

        await conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id })

    } catch (err) {
        console.error(err)
        return conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    }
}