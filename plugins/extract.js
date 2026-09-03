// plugins/extract.js
// ✧ THE JOKER & ITACHI - Extract & Execute Message 🕷️

import { proto, generateWAMessageFromContent, getContentType } from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

let handler = async (m, { conn, isOwner, usedPrefix, command }) => {
    // فقط المطور
    if (!isOwner) return

    // التأكد من وجود رسالة مقتبسة
    const quoted = m.quoted
    if (!quoted) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🕷️ استخراج وتنفيذ الرسائل' },
                { type: 'divider' },
                { type: 'line', text: '📌 *الطريقة الصحيحة للاستخدام:*' },
                { type: 'spacer' },
                { type: 'info', label: '1', value: 'اضغط مطولاً على أي رسالة' },
                { type: 'info', label: '2', value: 'اختر "رد" (Reply)' },
                { type: 'info', label: '3', value: `اكتب ${usedPrefix + command}` }
            ])
        }, { quoted: m })
    }

    await m.react('🕷️')

    try {
        // استخراج محتوى الرسالة المقتبسة
        const targetMsg = quoted.message || quoted
        const typeMsg = getContentType(targetMsg)
        const contentMsg = JSON.stringify(targetMsg, null, 2)
        const filename = `${typeMsg || "Message"}.json`

        // الكود الجاهز لإعادة الإرسال
        const rawMsg = `
const { proto, generateWAMessageFromContent } = await import("@whiskeysockets/baileys");

const contentMsg = ${contentMsg};
const webMsg = proto.Message.fromObject(contentMsg);
const waMsg = generateWAMessageFromContent("${m.chat}", webMsg, { userJid: conn.user.jid, quoted: ${JSON.stringify(m, null, 2)} });

await conn.relayMessage("${m.chat}", waMsg.message, { messageId: waMsg.key.id });
`

        // 1️⃣ إرسال ملف JSON
        await conn.sendMessage(m.chat, {
            document: Buffer.from(contentMsg, 'utf-8'),
            mimetype: 'application/json',
            fileName: filename,
            caption: theme.build([
                { type: 'title', text: '📄 استخراج رسالة' },
                { type: 'divider' },
                { type: 'info', label: '📌 النوع', value: typeMsg },
                { type: 'info', label: '📅 الوقت', value: new Date().toLocaleString() }
            ])
        }, { quoted: m })

        // 2️⃣ إرسال الكود الجاهز
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '📋 كود إعادة الإرسال' },
                { type: 'divider' },
                { type: 'line', text: `\`\`\`javascript\n${rawMsg}\n\`\`\`` }
            ])
        }, { quoted: m })

        // 3️⃣ 🔥 تنفيذ الرسالة وإعادة إرسالها فوراً
        const webMsg = proto.Message.fromObject(targetMsg)
        const waMsg = generateWAMessageFromContent(m.chat, webMsg, {
            userJid: conn.user.jid,
            quoted: m
        })

        await conn.relayMessage(m.chat, waMsg.message, {
            messageId: waMsg.key.id
        })

        await m.react('✅')
        
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '✅ نجاح العملية' },
                { type: 'divider' },
                { type: 'line', text: 'تم استخراج وتنفيذ الرسالة بنجاح' },
                { type: 'info', label: '📌 النوع', value: typeMsg }
            ])
        }, { quoted: m })

    } catch (error) {
        console.error(error)
        await m.react('❌')
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خطأ' },
                { type: 'error', text: error.message || 'حدث خطأ غير معروف' }
            ])
        }, { quoted: m })
    }
}

handler.command = /^(extract|استخرج|-->)$/i
handler.owner = true

export default handler
