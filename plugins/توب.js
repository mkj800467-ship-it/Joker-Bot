// plugins/top.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — نظام التوبات التفاعلي الأسطوري 🏆

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, '👑 *[ هذا الأمر يعمل داخل المجموعات فقط يا محارب! ]* 👑', m);
    }

    await conn.sendMessage(m.chat, { react: { text: '🏆', key: m.key } });

    let chatMetadata = await conn.groupMetadata(m.chat).catch(() => null);
    if (!chatMetadata || !chatMetadata.participants) {
        return conn.reply(m.chat, '⚠️ *حدث خطأ أثناء جلب أعضاء الجروب!*', m);
    }

    let participants = chatMetadata.participants.map(p => p.id);

    if (participants.length < 10) {
        return conn.reply(m.chat, '⚠️ *عذراً، يجب أن يكون في الجروب 10 أشخاص على الأقل لعمل قائمة التوب!*', m);
    }

    let shuffled = participants.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 10);

    // استخراج الكلمة أو اللقب الذي كتبه المستخدم بعد أمر .توب (مثل: الحمير، الأغنياء، العظماء...)
    let topic = text ? text.trim() : (command.replace(/^توب/i, '').trim() || 'المميزين');

    let title = `🏆 *[ قـائـمـة أكـثـر 10 (${topic}) فـي الـجـروب ]* 👑`;
    let description = '🎯 *القائمة المختارة بعناية فائقة عبر بصيرة الشارينگان وأسوار الوهم:*';
    let emoji = '🔥';

    let textResult = `${title}\n\n${description}\n\n`;
    
    selected.forEach((jid, index) => {
        textResult += `${index + 1}. ${emoji} @${jid.split('@')[0]}\n`;
    });

    textResult += `\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

    await conn.sendMessage(m.chat, {
        text: textResult,
        mentions: selected
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['توب [كلمة]'];
handler.tags = ['fun', 'group'];
handler.command = /^توب/i;

export default handler;
