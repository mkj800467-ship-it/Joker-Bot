// plugins/delete.js
// ⛩️ Uchiha Itachi - YoRHa Unit No.2 Type B - أمر الحذف الصامت ✧
// مهمة: حذف أي رسالة يتم الرد عليها مع حذف أمر المستخدم (تنفيذ صامت تماماً)

import { theme } from '../core/theme.js'

let handler = async (m, { conn, isAdmin, isROwner }) => {
    // 1. التحقق من وجود رسالة مقتبسة (مردود عليها)
    if (!m.quoted) {
        return m.reply(theme.build([
            { type: 'title', text: '❄️ إتاتشي: "هدف مفقود"' },
            { type: 'warning', text: 'لم أحدد هدفاً للحذف. قم بالرد على الرسالة التي تريد مسحها بالشارينگان.' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));
    }

    // 2. التحقق من الصلاحيات في المجموعات
    if (m.isGroup && !isAdmin && !isROwner) {
        return m.reply(theme.build([
            { type: 'title', text: '❄️ إتاتشي: "صلاحيات مرفوضة"' },
            { type: 'warning', text: 'هذه المهمة تتطلب صلاحيات مشرف أو المطور لتفعيل التنفيذ الصامت.' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));
    }

    try {
        const q = m.quoted

        // ── بناء مفتاح الحذف للرسالة المستهدفة ─────────────────────────────────
        const deleteKey = {
            remoteJid: m.chat,
            fromMe: q.fromMe ?? q.isSelf ?? (q.sender === conn.user.jid),
            id: q.id ?? q.key?.id,
            ...(m.isGroup && { participant: q.sender ?? q.participant ?? q.key?.participant })
        }

        if (!deleteKey.id) {
            console.log('[ITACHI-DEL] مفتاح الهدف غير صالح')
            return
        }

        // أ. حذف الرسالة المستهدفة (المردود عليها)
        await conn.sendMessage(m.chat, { delete: deleteKey })

        // ب. حذف أمر المستخدم نفسه (رسالة الأمر التي كتبها المشرف/المطور) لضمان نظافة الشات
        await conn.sendMessage(m.chat, { delete: m.key })

        // ⛩️ إتاتشي والجوكر لا يثرثران بعد الحذف - التنفيذ صارم وصامت تماماً

    } catch (e) {
        console.error('[ITACHI-DEL] فشل الحذف:', e.message)
        // في حال فشل الحذف لأي سبب تقني، يتم إعلام المنفذ بصمت
        await m.reply(theme.build([
            { type: 'title', text: '❄️ إتاتشي: "فشل المسح"' },
            { type: 'warning', text: 'فشلت عملية المسح... الهدف غير موجود أو محمي بأبعاد أخرى.' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]))
    }
}

handler.command = /^(حذف|مسح|delete|del|امسح|امحو)$/i
handler.group = true

export default handler
