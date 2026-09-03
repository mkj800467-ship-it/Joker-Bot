// plugins/last30.js
// ✧ THE JOKER & ITACHI - Last 30 Messages Viewer 📋

import PhoneNumber from 'awesome-phonenumber'
import { theme } from '../core/theme.js'

let handler = async (m, { conn, command, usedPrefix }) => {
    if (!global.lastMessages || global.lastMessages.length === 0) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '📋 سـجـل الـرسـائـل' },
                { type: 'divider' },
                { type: 'line', text: '🃏 لا توجد رسائل مسجلة بعد في الذاكرة' },
                { type: 'spacer' },
                { type: 'info', label: '⚡ حالة', value: 'سيبدأ التسجيل من الآن فصاعداً' }
            ])
        }, { quoted: m })
    }

    let logs = [...global.lastMessages].reverse()

    // 1️⃣ إرسال ملخص منسق بالستايل الجديد (مع روابط واتساب سليمة ومباشرة للدردشة)
    let headerText = `📋 *آخر ${Math.min(logs.length, 30)} رسالة تم رصدها:*\n\n`
    let messagesListText = ''

    for (let i = 0; i < Math.min(logs.length, 30); i++) {
        let log = logs[i]
        
        let senderJid = conn.decodeJid(log.sender || '')
        let senderNum = senderJid.split('@')[0]
        
        // تجهيز رقم قابل للضغط والدردشة المباشرة عبر واتساب (Mention/Wa.me Format)
        let jidForChat = senderJid || `${senderNum}@s.whatsapp.net`

        let senderName = log.senderName || conn.getName(senderJid) || 'مجهول'
        
        let chatJid = conn.decodeJid(log.chat || '')
        let chatName = ''
        try {
            chatName = await conn.getName(chatJid)
        } catch (e) {
            chatName = chatJid.split('@')[0]
        }

        let chatType = log.isGroup ? '👥 جروب' : '💌 خاص'
        let msgText = log.text || log.body || '[وسائط / رسالة غير نصية]'
        if (msgText.length > 35) msgText = msgText.substring(0, 35) + '...'

        let time = new Date(log.time).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })

        // تنسيق السطر بحيث رقم المرسل يتيح الدردشة مباشرة داخل واتساب
        messagesListText += `*${i + 1}.* ⏰ ${time} | ${chatType}\n`
        messagesListText += `👤 *الاسم:* ${senderName}\n`
        messagesListText += `💬 *الرسالة:* ${msgText}\n`
        messagesListText += `🔗 *الدردشة:* @${senderNum}\n`
        messagesListText += `──────────────────\n`
    }

    // استخراج أرقام الـ JIDs الفعلية للمنشارة عشان الواتساب يخليها قابلة للضغط والدردشة الفورية
    let mentionedJids = logs.slice(0, 30).map(log => conn.decodeJid(log.sender || '')).filter(Boolean)

    await conn.sendMessage(m.chat, {
        text: theme.build([
            { type: 'title', text: '📋 سـجـل آخـر الـرسـائـل' },
            { type: 'divider' },
            { type: 'line', text: headerText + messagesListText }
        ]),
        mentions: mentionedJids
    }, { quoted: m })

    // 2️⃣ إذا طلب المستخدم تفصيل JSON أو بيانات مفصلة
    if (m.text.includes('json') || m.text.includes('تفصيل')) {
        let jsonLogs = []
        for (let log of logs) {
            let senderJid = conn.decodeJid(log.sender || '')
            let chatJid = conn.decodeJid(log.chat || '')

            jsonLogs.push({
                sender_raw: log.sender,
                sender_decoded: senderJid,
                sender_name: log.senderName || conn.getName(senderJid),
                text: log.text || log.body,
                isGroup: log.isGroup,
                chat_raw: log.chat,
                chat_decoded: chatJid,
                chat_name: await conn.getName(chatJid).catch(() => ''),
                time: new Date(log.time).toISOString()
            })
        }

        let jsonText = '```json\n' + JSON.stringify(jsonLogs, null, 2).substring(0, 3500) + '\n```'
        await conn.sendMessage(m.chat, { text: jsonText }, { quoted: m })
    }
}

handler.help = ['اخر30']
handler.tags = ['owner']
handler.command = /^(اخر30|last30|logs)$/i
handler.owner = true
handler.rowner = true

export default handler
