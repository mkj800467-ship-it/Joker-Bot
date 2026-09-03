// plugins/leave.js
// ✧ THE JOKER & ITACHI - Epic Group Leave Command 🚪

import { theme } from '../core/theme.js'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let id = text ? text.trim() : m.chat

    // جلب اسم المطور أو استخدام اسم افتراضي أسطوري
    let ownerName = global.owner?[0]?.[1] || global.ownerName || 'المطور الإلهي'

    // رسالة الوداع الأسطورية قبل مغادرة المجموعة
    try {
        await conn.sendMessage(id, {
            text: theme.build([
                { type: 'title', text: '🚪 وداعـاً أيـهـا الـجـمـيـع' },
                { type: 'divider' },
                { type: 'line', text: '🃏 *أراكم لاحقاً... سوف أغادر الآن بطلب رسمي*' },
                { type: 'spacer' },
                { type: 'info', label: '👑 الأمر صادر من', value: ownerName },
                { type: 'divider' },
                { type: 'line', text: '⚡ استودعكم الله، كان وجودنا هنا ملحمة تُخلد!' }
            ])
        })
    } catch (e) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ في المعرف' },
                { type: 'divider' },
                { type: 'error', text: 'معرف المجموعة غير صالح أو لست عضواً هناك' }
            ])
        }, { quoted: m })
    }

    // مهلة بسيطة لضمان وصول الرسالة قبل المغادرة
    await new Promise(resolve => setTimeout(resolve, 1500))

    // تنفيذ المغادرة بشكل أسطوري
    await conn.groupLeave(id)
}

handler.help = ['اطلع'].map(v => v + ' *[معرف الجروب اختياري]*')
handler.tags = ['owner', 'group']
handler.command = /^(اخرج|اطلع|غادر|خروج|leave)$/i
handler.group = true
handler.owner = true
handler.rowner = true

export default handler
