// core/print.js
// ✧ 2B - YoRHa Unit No.2 Type B - نظام الطباعة 🖨️

import {WAMessageStubType} from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import {watchFile} from 'fs'
import '../settings.js'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({strict: false})

export default async function (m, conn = {user: {}}) {
    // ✅ التأكد من وجود m.sender قبل استخدامه
    if (!m || !m.sender) {
        console.log(chalk.cyan('[!] رسالة بدون مرسل، تم تخطي الطباعة'))
        return
    }

    let name_user
    let senderJid = m.sender || ''
    let senderNumber = senderJid.replace('@s.whatsapp.net', '')
    
    // ✅ الحصول على اسم المرسل بشكل آمن
    let _name = 'مجهول'
    try {
        if (conn.getName && senderJid) {
            _name = (await conn.getName(senderJid)) || 'مجهول'
        }
    } catch (e) {
        console.log(chalk.yellow('⚠️ خطأ في جلب اسم المرسل:'), e.message)
    }
    
    // ✅ معالجة رقم الهاتف بشكل آمن
    let senderPhone = ''
    try {
        senderPhone = PhoneNumber('+' + senderNumber).getNumber('international') || ''
    } catch (e) {
        senderPhone = senderNumber
    }
    
    let sender = senderPhone === undefined ? '' : senderPhone + (_name == senderPhone ? '' : ' ~' + _name)

    // ✅ الحصول على اسم المجموعة/الدردشة بشكل آمن
    let chat = ''
    try {
        if (conn.getName && m.chat) {
            chat = await conn.getName(m.chat)
        }
    } catch (e) {
        chat = m.chat || ''
    }

    // ✅ طباعة الصورة إذا وجدت
    let img
    try {
        if (global.opts['img'] && m.mtype && /sticker|image/gi.test(m.mtype) && m.download) {
            img = await terminalImage.buffer(await m.download())
        }
    } catch (e) {
        console.error(e)
    }

    // ✅ حساب حجم الملف
    let filesize = (m.msg
        ? m.msg.vcard
            ? m.msg.vcard.length
            : m.msg.fileLength
                ? m.msg.fileLength.low || m.msg.fileLength
                : m.msg.axolotlSenderKeyDistributionMessage
                    ? m.msg.axolotlSenderKeyDistributionMessage.length
                    : m.text
                        ? m.text.length
                        : 0
        : m.text
            ? m.text.length
            : 0) || 0

    // ✅ بيانات المستخدم من قاعدة البيانات
    let user = (global.db?.data?.users && m.sender) ? global.db.data.users[m.sender] : {}
    if (!user) user = {}

    // ✅ رقم البوت
    let me = ''
    try {
        let botJid = conn.user?.jid || ''
        me = PhoneNumber('+' + botJid.replace('@s.whatsapp.net', '')).getNumber('international') || ''
    } catch (e) {
        me = ''
    }

    // ✅ التعامل مع messageStubParameters
    name_user = (m.messageStubParameters && Array.isArray(m.messageStubParameters))
        ? m.messageStubParameters
            .map((jid) => {
                if (!jid) return ''
                try {
                    let usuario_info = conn.decodeJid ? conn.decodeJid(jid) : jid
                    let name_info = (conn.getName && jid) ? conn.getName(jid) : ''
                    return chalk.hex('#FF69B4')(`✨ ${name_info ? name_info : 'شخص'}`)
                } catch (e) {
                    return ''
                }
            })
            .filter(Boolean)
            .join(', ')
        : ''

    // ✅ الألوان
    const blue = chalk.hex('#00BFFF')
    const darkBlue = chalk.hex('#1E90FF')
    const cyan = chalk.hex('#00CED1')
    const pink = chalk.hex('#FF69B4')
    const purple = chalk.hex('#9B59B6')
    const gold = chalk.hex('#FFD700')
    const orange = chalk.hex('#FFA500')
    const green = chalk.hex('#00FF7F')
    const red = chalk.hex('#FF4444')
    const white = chalk.hex('#FFFFFF')
    const gray = chalk.hex('#808080')

    // ✅ الطباعة الأساسية - بدون معلومات RPG
    console.log(
        `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ ${blue.bold('✦ 2B - YoRHa Unit ✦')}
┃
┃ ${cyan.bold('🤖 Bot:')} ${pink.bold('%s')}
┃ ${cyan.bold('⏰ Time:')} ${gold('%s')}
┃ ${cyan.bold('⚡ Action:')} ${orange('%s')}
┃ ${cyan.bold('👤 User:')} ${purple('%s')}${user?.premiumTime > 0 ? green(' ✨ Premium') : ''}
┃
┃ ${cyan.bold('💬 Chat:')} ${green('%s')}
┃ ${cyan.bold('📦 Size:')} ${orange('%s (%s %sB)')}
┃ ${cyan.bold('📝 Type:')} ${pink.bold('[%s]')}
┃
┃ ${white('%s')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim(),
        (me || 'Unknown') + (conn.user.name == undefined ? '' : ' ~' + conn.user.name),
        (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date()).toLocaleTimeString('ar-EG'),
        await formatMessageStubType(m.messageStubType, name_user),
        sender || 'Unknown',
        m.chat && m.chat.includes('@s.whatsapp.net')
            ? `${purple('💬 خاص')} ${cyan(m.sender?.split('@')[0] || '?')} ~${green(_name)}`
            : m.chat && m.chat.includes('@g.us')
                ? `${pink('👥 مجموعة')} ${cyan(m.chat?.split('@')[0] || '?')} ~${green(chat || 'Unknown')}`
                : m.chat && m.chat.includes('@newsletter')
                    ? `${blue('📢 قناة')} ${cyan(m.chat?.split('@')[0] || '?')} ~${green(chat || 'Unknown')}`
                    : `${gray('❓ غير معروف')}`,
        filesize,
        filesize === 0 ? 0 : (filesize / 1009 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1),
        ['', ...'KMGTP'][Math.floor(Math.log(filesize) / Math.log(1000))] || '',
        await formatMessageTypes(m.mtype) || 'غير محدد',
        (m.message?.extendedTextMessage?.contextInfo?.quotedMessage && m.message?.extendedTextMessage?.contextInfo?.participant)
            ? (m.message?.extendedTextMessage?.contextInfo?.participant == m.sender
                ? `${cyan('┃ 💬')} ${pink(`${_name || 'هذا المستخدم'}`)} ${orange('رد على رسالته الخاصة')}`
                : `${cyan('┃ 💬')} ${pink(`${_name || 'هذا المستخدم'}`)} ${orange('رد على')} ${green(await conn.getName(m.message?.extendedTextMessage?.contextInfo?.participant) || m.message?.extendedTextMessage?.contextInfo?.participant || 'مستخدم آخر')}`)
            : cyan('┃ 💬 لا توجد رسالة مقتبسة')
    )

    if (img) console.log(img.trimEnd())
    
    if (typeof m.text === 'string' && m.text) {
        let log = m.text.replace(/\u200e+/g, '')
        let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g
        let mdFormat = (depth = 4) => (_, type, text, monospace) => {
            let types = {
                _: 'italic',
                '*': 'bold',
                '~': 'strikethrough',
                '`': 'bgGray'
            }
            text = text || monospace
            let formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(/`/g, '').replace(mdRegex, mdFormat(depth - 1)))
            return formatted
        }
        log = log.replace(mdRegex, mdFormat(4))
        log = log.split('\n').map((line) => {
            if (line.trim().startsWith('>')) {
                return cyan.bgBlack(line.replace(/^>/, '┃'))
            } else if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) {
                return line.replace(/^(\d+)\./, (match, number) => {
                    const padding = number.length === 1 ? '  ' : ' '
                    return padding + number + '.'
                })
            } else if (/^[-*]\s/.test(line.trim())) {
                return line.replace(/^[*-]/, '  •')
            }
            return line
        }).join('\n')
        if (log.length < 1024)
            log = log.replace(urlRegex, (url, i, text) => {
                let end = url.length + i
                return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? cyan(url) : url
            })
        log = log.replace(mdRegex, mdFormat(4))
        if (m.mentionedJid && Array.isArray(m.mentionedJid)) {
            for (let user of m.mentionedJid) {
                if (user) {
                    let userName = '?'
                    try { userName = await conn.getName(user) } catch {}
                    log = log.replace('@' + user.split`@`[0], pink('@' + userName))
                }
            }
        }
        
        // لون النص حسب نوعه
        if (m.error != null) {
            console.log(red(log))
        } else if (m.isCommand) {
            console.log(blue.bold(`⚡ CMD ⚡ ${log}`))
        } else {
            console.log(cyan(log))
        }
    }

    if (m.messageStubParameters && Array.isArray(m.messageStubParameters)) {
        let stubParams = []
        for (let jid of m.messageStubParameters) {
            if (jid) {
                try {
                    jid = conn.decodeJid ? conn.decodeJid(jid) : jid
                    let name = (conn.getName && jid) ? await conn.getName(jid) : ''
                    const phoneNumber = PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') || ''
                    stubParams.push(name ? purple(`${phoneNumber} ✨ ${name}`) : '')
                } catch (e) {
                    stubParams.push('')
                }
            }
        }
        console.log(gray(stubParams.filter(Boolean).join(', ')))
    }

    // طباعة معلومات الملفات بألوان
    if (/document/i.test(m.mtype)) console.log(blue(`📄 ${m.msg?.fileName || m.msg?.displayName || 'مستند'}`))
    else if (/ContactsArray/i.test(m.mtype)) console.log(pink(`👥 قائمة جهات اتصال`))
    else if (/contact/i.test(m.mtype)) console.log(green(`👤 ${m.msg?.displayName || 'جهة اتصال'}`))
    else if (/audio/i.test(m.mtype) && m.msg?.seconds) {
        const duration = m.msg.seconds
        console.log(purple(`${m.msg.ptt ? '🎤 (رسالة صوتية ' : '🎵 (موسيقى '}⏱️ ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`))
    }
    console.log(chalk.hex('#00CED1')('━'.repeat(50)))
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
    console.log(chalk.hex('#FF69B4')('✨ تم تحديث ملف core/print.js ✨'))
})

async function formatMessageStubType(messageStubType, name_user) {
    const pink = chalk.hex('#FF69B4')
    const cyan = chalk.hex('#00CED1')
    
    switch (messageStubType) {
        case 0: return cyan('غير معروف')
        case 1: return pink('تم حذف الرسالة 🔥')
        case 2: return cyan('رسالة مشفرة 🔒')
        case 20: return pink('تم إنشاء المجموعة ✨')
        case 21: return cyan('تم تغيير اسم المجموعة 📝')
        case 22: return pink('تم تغيير صورة المجموعة 🖼️')
        case 23: return cyan('رابط دعوة جديد 🔗')
        case 24: return pink('وصف جديد للمجموعة 📋')
        case 25: return cyan('تغيير إعدادات المجموعة ⚙️')
        case 26: return pink('تكوين صلاحيات الإرسال ✉️')
        case 27: return cyan(`${name_user || 'شخص'} انضم إلى المجموعة 🎉`)
        case 28: return pink(`${name_user || 'شخص'} تم طرده من المجموعة 🚫`)
        case 29: return cyan(`${name_user || 'شخص'} أصبح مشرفاً 👑`)
        case 30: return pink(`${name_user || 'شخص'} لم يعد مشرفاً 📉`)
        case 31: return cyan(`${name_user || 'شخص'} تمت دعوته للمجموعة 📨`)
        case 32: return pink(`${name_user || 'شخص'} غادر المجموعة 👋`)
        case 145: return cyan('تم تكوين "الموافقة على الأعضاء الجدد" ✅')
        case 171: return pink('تم تكوين "إضافة الأعضاء" ➕')
        default: return cyan(`نوع ${messageStubType}`)
    }
}

async function formatMessageTypes(messageType) {
    const blue = chalk.hex('#00BFFF')
    const pink = chalk.hex('#FF69B4')
    const purple = chalk.hex('#9B59B6')
    const green = chalk.hex('#00FF7F')
    const orange = chalk.hex('#FFA500')
    
    switch (messageType) {
        case 'conversation': return blue('💬 محادثة')
        case 'imageMessage': return pink('🖼️ صورة')
        case 'contactMessage': return green('👤 جهة اتصال')
        case 'locationMessage': return purple('📍 موقع')
        case 'extendedTextMessage': return blue('📝 نص')
        case 'documentMessage': return orange('📄 مستند')
        case 'audioMessage': return pink('🎵 صوت')
        case 'videoMessage': return green('🎬 فيديو')
        case 'call': return purple('📞 مكالمة')
        case 'chat': return blue('💬 دردشة')
        case 'protocolMessage': return orange('🔒 مشفر')
        case 'contactsArrayMessage': return pink('👥 قائمة جهات اتصال')
        case 'stickerMessage': return green('🎨 ملصق')
        case 'groupInviteMessage': return purple('🔗 دعوة مجموعة')
        case 'listMessage': return blue('📋 قائمة')
        case 'viewOnceMessage': return orange('👁️ مرة واحدة')
        case 'buttonsMessage': return pink('🔘 أزرار')
        case 'interactiveMessage': return green('🎮 تفاعلي')
        case 'reactionMessage': return purple('❤️ تفاعل')
        case 'pollCreationMessage': return blue('📊 استطلاع')
        default: return orange(messageType || 'غير محدد')
    }
}