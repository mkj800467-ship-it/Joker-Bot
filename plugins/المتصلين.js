// plugins/active.js
// ✧ THE JOKER & ITACHI - Active Members Command 🌐

import { theme } from '../core/theme.js'

let handler = async (m, { conn, args }) => {
    try {
        let id = args?.[0]?.match(/\d+\-\d+@g.us/) || m.chat;
        if (!id.endsWith('@g.us')) {
            return conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '❌ خـطـأ في الاستخدام' },
                    { type: 'divider' },
                    { type: 'error', text: 'هذا الأمر مخصص للاستخدام داخل المجموعات فقط' }
                ])
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '🌐', key: m.key } });

        // جلب الرسائل المخزنة لهذه المجموعة
        const messages = conn.chats[id]?.messages || {};

        // استخراج المشاركين الفريدين من الرسائل النشطة
        const participantsSet = new Set();
        for (let msg of Object.values(messages)) {
            if (msg.key?.participant) {
                participantsSet.add(msg.key.participant);
            }
        }

        // تحويل LID لرقم حقيقي وبأمان تام
        const participantsArray = [];
        for (const jid of participantsSet) {
            try {
                if (typeof conn.convertLidToRealJid === 'function') {
                    const cleanJid = await conn.convertLidToRealJid(jid, id);
                    participantsArray.push(cleanJid || jid);
                } else {
                    participantsArray.push(jid);
                }
            } catch {
                participantsArray.push(jid);
            }
        }

        // بناء قائمة الأعضاء المنشطين بشكل منسق مع ثيم الجوكر وإيتاشي
        const onlineListItems = participantsArray
            .sort((a, b) => a.split('@')[0].localeCompare(b.split('@')[0]))
            .map((k, i) => ({
                type: 'info',
                label: `${i + 1}`,
                value: `@${k.split('@')[0]}`
            }));

        let content = [
            { type: 'title', text: '🌐 قـائـمـة الأعـضـاء الـنـشـطـاء' },
            { type: 'divider' },
            { type: 'line', text: '🃏 *الأعضاء المتفاعلون بناءً على الرسائل المسجلة*' },
            { type: 'divider' }
        ];

        if (onlineListItems.length > 0) {
            content.push(...onlineListItems);
        } else {
            content.push({ type: 'warning', text: 'لا يوجد أعضاء نشطاء مسجلين في الذاكرة حالياً' });
        }

        content.push({ type: 'divider' });
        content.push({ type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' });

        const teks = theme.build(content);

        await conn.sendMessage(m.chat, { 
            text: teks, 
            mentions: participantsArray 
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('[Joker-Active] Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ في النظام' },
                { type: 'divider' },
                { type: 'error', text: 'حدث خطأ أثناء محاولة جلب الأعضاء النشطاء' }
            ])
        }, { quoted: m });
    }
}

handler.help = ['المتصلين'].map(v => v + ' *[النشطين]*');
handler.tags = ['group', 'tools'];
handler.command = /^(المتصلين|النشطين|active)$/i;
handler.group = true;

export default handler;
