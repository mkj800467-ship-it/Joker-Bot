// plugins/jadibot.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Advanced Sub-Bot Deployment 🤖              
import { useMultiFileAuthState, DisconnectReason, fetchLatestWaWebVersion, makeCacheableSignalKeyStore, prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'                                                
import chalk from 'chalk'
import * as ws from 'ws'
import { getDevice } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import { theme } from '../core/theme.js';
const { exec } = await import('child_process')
import { makeWASocket } from '../core/Prototype_core.js'
import { fileURLToPath } from 'url'                                    

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpz ib3QtanMucw=="                    
let drm1 = "CkphZGlib3QsIEhlY2hv"                                      
let drm2 = "IHBvciBAQWlkZW5fTm90TG9naWM"                               

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gataJBOptions = {}
const maxAttempts = 5

if (global.conns instanceof Array) console.log()                       
else global.conns = []

function extractNumber(input) {
    let cleaned = input.replace(/\s+/g, '')                                
    cleaned = cleaned.replace(/^\+/, '')
    let match = cleaned.match(/\d+/)
    return match ? match[0] : ''                                       
}

async function isValidPhoneNumber(number) {
    try {
        if (!number || number.length < 7) return false                         
        let pn = PhoneNumber('+' + number)
        return pn.isValid()
    } catch {                                                                  
        return false
    }
}

let handler = async (m, {conn, args, usedPrefix, command, isOwner, text}) => {
if (!global.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`*❌ نظام البوتات الفرعية معطل*`)
if (conn.user.jid === m.sender) return

let isGroup = m.isGroup
let mainBotJid = global.conn?.user?.jid
let currentBotJid = conn.user?.jid

if (currentBotJid === mainBotJid) {                                    
} else {
    if (isGroup && mainBotJid) {                                               
        try {
            let metadata = await conn.groupMetadata(m.chat)
            let participants = metadata.participants
            let mainBotInGroup = participants.some(p => p.id === mainBotJid)
            if (mainBotInGroup) {
                console.log(`⚠️ البوت الأساسي موجود في الجروب ${m.chat}. البوت الفرعي ${currentBotJid} تم تجاهل الأمر`)
                return
            }
        } catch (e) {
            console.error('❌ خطأ في فحص المشاركين:', e)
        }
    }
}

let fullText = args.join(' ')
let number = extractNumber(fullText)

if (!number) {                                                             
    return m.reply(`◆━═━═━═━═━═━═━═━═━◆\n🃏 *𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹* ➾ *𝐈𝐭𝐚𝐜𝐡𝐢♞*\n◆━═━═━═━═━═━═━═━═━◆\n│ 🤖 *تـنـصـيـب بـوت فـرعـي*\n│\n│ ⚠️ يرجى كتابة رقم الهاتف\n│ 📌 مثال: .تنصيب 201096359337\n◆━═━═━═━═━═━═━═━═━◆\n*👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ*`)
}

let isValid = await isValidPhoneNumber(number)
if (!isValid) {
    return m.reply(`◆━═━═━═━═━═━═━═━═━◆\n🃏 *𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹* ➾ *𝐈𝐭𝐚𝐜𝐡𝐢♞*\n◆━═━═━═━═━═━═━═━═━◆\n│ ❌ *رقم غير صالح*\n│ الرقم الذي أدخلته غير صحيح: ${number}\n◆━═━═━═━═━═━═━═━═━◆\n*👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ*`)
}
                                                                       
let id = number
let pathGataJadiBot = path.join('./2BSubBot/', id)                     
if (!fs.existsSync(pathGataJadiBot)) {
    fs.mkdirSync(pathGataJadiBot, {recursive: true})
}
gataJBOptions.pathGataJadiBot = pathGataJadiBot
gataJBOptions.m = m
gataJBOptions.conn = conn                                              
gataJBOptions.args = args
gataJBOptions.usedPrefix = usedPrefix
gataJBOptions.command = command
gataJBOptions.fromCommand = true                                       
gataJadiBot(gataJBOptions, number)                                     
}                                                                      
handler.command = /^(تنصيب|jadibot|serbot|rentbot)$/i
export default handler

export async function gataJadiBot(options, number) {                   
let {pathGataJadiBot, m, conn, args, usedPrefix, command} = options

const pathCreds = path.join(pathGataJadiBot, 'creds.json')
if (!fs.existsSync(pathGataJadiBot)) {
    fs.mkdirSync(pathGataJadiBot, {recursive: true})
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, 'base64')          
exec(comb.toString('utf-8'), async (err, stdout, stderr) => {          
    const { version } = await fetchLatestWaWebVersion()
    const msgRetry = (MessageRetryMap) => {}                               
    const msgRetryCache = new NodeCache()
    const {state, saveState, saveCreds} = await useMultiFileAuthState(pathGataJadiBot)

    const connectionOptions = {                                            
        logger: pino({level: 'fatal'}),
        printQRInTerminal: false,
        auth: {creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'}))},
        msgRetry,
        msgRetryCache,
        browser: ['Windows', 'Chrome', '110.0.5481.177'],                      
        version: version,
        generateHighQualityLinkPreview: true                                   
    }
                                                                           
    let sock = makeWASocket(connectionOptions)                             
    sock.isInit = false
    let isInit = true
    let reconnectAttempts = 0
    let secret = ''
    const botName = `Sub-bot (+${number})`
                                                                           
    async function joinChannels(sock) {
        for (const channelId of Object.values(global.ch)) {                        
            await sock.newsletterFollow(channelId).catch(() => {})             
        }
    }

    async function connectionUpdate(update) {                              
        const {connection, lastDisconnect, isNewLogin, qr} = update
        if (isNewLogin) sock.isInit = false                                    
        if (qr) {
            secret = await sock.requestPairingCode(number, 'JKITACHI')
            secret = secret.match(/.{1,4}/g)?.join('-')

            if (m?.chat) {                                                         
                const imageUrl = 'https://i.postimg.cc/K88rDHJH/1787932470215.png'

                let menuText = `◆━═━═━═━═━═━═━═━═━◆\n🃏 *𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹* ➾ *𝐈𝐭𝐚𝐜𝐡𝐢♞*\n◆━═━═━═━═━═━═━═━═━◆\n│ 🥷 *مـرحـبا بــك يــا : @${m.sender.split('@')[0]}*\n│ 🤖 *『 تـنـصـيـب بـوت فـرعـي 』*\n│\n├─ ♡⃟⃝ ♡ ☙ JK ☙ ♡\n├─ ⚔️ *الـكـود:* ${secret}\n│\n├─ ❄️ *الـخـطـوات:*\n├─ ❶ افتح الواتساب على رقم ${number}\n├─ ❷ اضغط على الثلاث نقاط\n├─ ❸ اضغط على الأجهزة المرتبطة\n├─ ❹ اختر ربط برقم الهاتف\n├─ ❺ أدخل الكود أعلاه\n◆━═━═━═━═━═━═━═━═━◆\n│ ⚡ *الحالة:* بانتظار إدخال الكود\n◆━═━═━═━═━═━═━═━═━◆\n*👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ*`
                                                                               
                const channel = "https://whatsapp.com/channel/0029Vb8We2VKrWR2Z9E5KQ1P"
                const developerNumber = "249916221538"                                 
                const developerContact = `https://wa.me/${developerNumber}`

                try {
                    const imageRes = await fetch(imageUrl);
                    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
                    const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });
                                                                               
                    const nativeFlowPayload = {
                      body: {
                        text: menuText,
                        contextInfo: {
                          mentionedJid: [m.sender]
                        }
                      },                                                                     
                      footer: { text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' },
                      header: {
                        hasMediaAttachment: true,                                              
                        subtitle: '🤖 تـنـصـيـب بـوت فـرعـي',
                        imageMessage: media.imageMessage                                     
                      },                                                                     
                      nativeFlowMessage: {
                        buttons: [
                          {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({                                       
                              display_text: "📋 نـسـخ كـود الـتـربـوط",
                              copy_code: secret
                            })
                          },
                          {
                            name: 'cta_url',                                                       
                            buttonParamsJson: JSON.stringify({                                       
                              display_text: "📢 الــقــنــاة الــرَّســمــيــة",                       
                              url: channel
                            })
                          },
                          {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({                                       
                              display_text: "👑 تــواصــل مــع الــمــطــور",                        
                              url: developerContact                                                
                            })
                          }
                        ],
                        messageParamsJson: JSON.stringify({
                          limited_time_offer: {
                            text: `⚡ الكود جاهز`,
                            url: developerContact,
                            copy_code: secret,
                            expiration_time: Date.now() + 86400000
                          },
                          bottom_sheet: {
                            in_thread_buttons_limit: 1,
                            divider_indices: [1, 2, 999],
                            list_title: "🃏 قــوائــم جــوكـر & إيــتـاتـشـي",
                            button_title: "▻ عــرض تفاصيل التنصيب ⚡"
                          },
                          tap_target_configuration: {
                            description: "Powered by 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ",
                            canonical_url: developerContact,
                            domain: "https://ryzobot.vercel.app",
                            button_index: 0
                          }
                        })                                                                   
                      }
                    };

                    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload);
                    const fkontak = await makeFkontak();
                    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, {
                      userJid: conn.user.jid,
                      quoted: fkontak
                    });

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });                                                                      
                } catch (err) {
                  console.error('[Joker-Jadibot Error]', err);
                }
            }
        }
        console.log(secret)

        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
        if (connection === 'close') {
            if (reason === 428 || reason === 408 || reason === 515) {
                if (reconnectAttempts < maxAttempts) {
                    reconnectAttempts++
                    await sleep(Math.pow(2, reconnectAttempts) * 1000)
                    await creloadHandler(true).catch(console.error)
                }                                                                      
            }
            if (reason === 440 || reason === 405 || reason === 401 || reason === 403) {
                try { sock.ws.close() } catch {}
                sock.ev.removeAllListeners()                                           
                let i = global.conns.indexOf(sock)
                if (i >= 0) global.conns.splice(i, 1)
                if (reason === 405 || reason === 401 || reason === 403) {
                    try { fs.rmdirSync(pathGataJadiBot, {recursive: true}) } catch {}
                }                                                                      
            }
        }
                                                                           
        if (connection == 'open') {                                            
            reconnectAttempts = 0

            const oldIndex = global.conns.findIndex(c => c.user?.jid === sock.user?.jid && c !== sock)
            if (oldIndex >= 0) {
                try { global.conns[oldIndex].ws.close() } catch {}
                global.conns.splice(oldIndex, 1)                                   
            }
                                                                           
            sock.isInit = true
            global.conns.push(sock)                                                
            console.log(chalk.bold.cyanBright(`\n🟢 ${botName} connected\n`))

            setTimeout(() => joinChannels(sock), 5000)

            if (m?.chat) {
                await conn.sendMessage(m.chat, {
                    text: `◆━═━═━═━═━═━═━═━═━◆\n🃏 *𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹* ➾ *𝐈𝐭𝐚𝐜𝐡𝐢♞*\n◆━═━═━═━═━═━═━═━═━◆\n│ ✅ *تــم الاتــصــال بــنــجــاح*\n│\n│ 📱 الــرقــم: ${number}\n│ 🤖 البوت الفرعي جاهز للعمل بكل قوة\n◆━═━═━═━═━═━═━═━═━◆\n*👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ*`,
                    contextInfo: {                                                         
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363429074575231@newsletter',
                            newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                            serverMessageId: 970
                        }
                    }
                }, {quoted: m})                                                        
            }
        }
    }

    sock.ev.on('connection.update', connectionUpdate)

    setInterval(async () => {
        if (!sock.user) {
            try { sock.ws.close() } catch {}
            sock.ev.removeAllListeners()                                           
            let i = global.conns.indexOf(sock)
            if (i >= 0) global.conns.splice(i, 1)                                  
        }
    }, 60000)

    let handlerObj = await import('../handler.js')
    let creloadHandler = async function (restatConn) {                     
        try {                                                                  
            const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
            if (Object.keys(Handler || {}).length) handlerObj = Handler               
        } catch (e) { console.error('Reload error: ', e) }

        if (restatConn) {
            const oldChats = sock.chats                                            
            try { sock.ws.close() } catch {}
            sock.ev.removeAllListeners()
            sock = makeWASocket(connectionOptions, {chats: oldChats})
            isInit = true

            setTimeout(() => joinChannels(sock), 8000)
        }

        if (!isInit) {
            sock.ev.off('messages.upsert', sock.handler)
            sock.ev.off('group-participants.update', sock.participantsUpdate)
            sock.ev.off('groups.update', sock.groupsUpdate)
            sock.ev.off('message.delete', sock.onDelete)
            sock.ev.off('call', sock.onCall)
            sock.ev.off('connection.update', sock.connectionUpdate)                
            sock.ev.off('creds.update', sock.credsUpdate)
        }

        sock.handler = handlerObj.handler.bind(sock)
        sock.participantsUpdate = handlerObj.participantsUpdate.bind(sock)        
        sock.groupsUpdate = handlerObj.groupsUpdate.bind(sock)
        sock.onDelete = handlerObj.deleteUpdate.bind(sock)                        
        sock.onCall = handlerObj.callUpdate.bind(sock)
        sock.connectionUpdate = connectionUpdate.bind(sock)
        sock.credsUpdate = saveCreds.bind(sock, true)

        sock.ev.on('messages.upsert', sock.handler)
        sock.ev.on('group-participants.update', sock.participantsUpdate)
        sock.ev.on('groups.update', sock.groupsUpdate)                         
        sock.ev.on('message.delete', sock.onDelete)                            
        sock.ev.on('call', sock.onCall)                                        
        sock.ev.on('connection.update', sock.connectionUpdate)                 
        sock.ev.on('creds.update', sock.credsUpdate)                                                                                                  
        isInit = false                                                         
        return true                                                            
    }                                                                      
    creloadHandler(false)
  })
}

async function makeFkontak() {
  try {
    const res = await fetch('https://file.garden/aauvg01sjleV_ic1/download%20(7).jpg');
    const thumb2 = Buffer.from(await res.arrayBuffer());
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'JOKER' },                                         
      message: { locationMessage: { name: '🃏 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    };
  } catch {
    return undefined;
  }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
