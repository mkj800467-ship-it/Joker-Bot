// plugins/personality.js
// ✧ UCHIHA - Uchiha Itachi - تحليل الشخصية الأسطوري 🎭

import { theme } from '../core/theme.js';

let handler = async (m, { conn, command, text, usedPrefix }) => {
    const allowedOwners = [
        '249916221538@s.whatsapp.net'
    ];

    let targetName = '';
    let targetJid = '';

    const getCleanJid = (jid) => {
        if (!jid) return '';
        return jid;
    };

    if (m.mentionedJid && m.mentionedJid[0]) {
        targetJid = getCleanJid(m.mentionedJid[0]);
    } else if (m.quoted && m.quoted.sender) {
        targetJid = getCleanJid(m.quoted.sender);
    } else if (text && text.trim()) {
        const input = text.trim();
        if (input.startsWith('@') && /^\d+$/.test(input.slice(1))) {
            targetJid = input.slice(1) + '@s.whatsapp.net';
        } else if (/^\d+$/.test(input)) {
            targetJid = input + '@s.whatsapp.net';
        } else if (/^\+\d+$/.test(input)) {
            const num = input.replace(/[^0-9]/g, '');
            targetJid = num + '@s.whatsapp.net';
        } else {
            targetName = input;
        }
    } else {
        targetJid = m.sender;
    }

    if (targetJid) {
        targetJid = getCleanJid(targetJid);
        try {
            targetName = await conn.getName(targetJid);
        } catch {
            targetName = targetJid.split('@')[0].replace(/[^0-9]/g, '');
        }
    } else if (!targetName) {
        targetName = 'مستخدم مجهول';
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const isDeveloper = targetJid ? allowedOwners.some(dev => {
        let devClean = dev.replace(/[^0-9]/g, '');
        let targetClean = targetJid.replace(/[^0-9]/g, '');
        return targetClean === devClean;
    }) : false;

    let personalidad = '';
    const mentionsList = targetJid && targetJid.endsWith('@s.whatsapp.net') ? [targetJid] : [];
    const displayName = targetJid ? `@${targetJid.split('@')[0]}` : targetName;

    if (isDeveloper) {
        personalidad = theme.build([
            { type: 'title', text: `⛩️ إتاتشي: تحليل الكيان الأسطوري` },
            { type: 'spacer' },
            { type: 'line', text: `👁️ *الهدف:* ${displayName}` },
            { type: 'line', text: '⚡ هذا الكيان يتجاوز قوانين الشارينگان!' },
            { type: 'divider' },
            { type: 'info', label: '🧠 الذكاء', value: '1000% (مطلق)' },
            { type: 'info', label: '👑 الهيبة', value: 'تزلزل العوالم' },
            { type: 'info', label: '🧩 التصنيف', value: 'إله البرمجة والشارينگان' }
        ]);
    } else {
        let stats = ['12%','28%','45%','60%','75%','88%','95%','15%','5%'];
        personalidad = theme.build([
            { type: 'title', text: `🎭 إتاتشي: بصيرة الشارينگان` },
            { type: 'spacer' },
            { type: 'line', text: `👤 *المستهدف:* ${displayName}` },
            { type: 'divider' },
            { type: 'info', label: '📊 العقلانية', value: pickRandom(stats) },
            { type: 'info', label: '📉 الكسل', value: pickRandom(stats) },
            { type: 'info', label: '🧠 الذكاء الوهمي', value: pickRandom(stats) },
            { type: 'info', label: '🎭 الكاريزما', value: pickRandom(stats) },
            { type: 'divider' },
            { type: 'info', label: '🧩 الطابع', value: pickRandom(['فيلسوف غريب', 'ملك التماطل', 'عبقري مظلوم', 'هادئ ظاهرياً بركان داخلياً', 'مستشار عالم الأحلام']) },
            { type: 'info', label: '⏳ الهواية', value: pickRandom(['التفكير في العدم', 'التهام الطعام ليلاً', 'اختلاق مشاكل وهمية', 'البحث عن الشاحن']) }
        ]);
    }

    // جلب صورة البروفایل الخاصة بالشخص المستهدف مع صورة افتراضية احتياطية
    let profilePic;
    try {
        profilePic = await conn.profilePictureUrl(targetJid, 'image');
    } catch {
        profilePic = 'https://i.postimg.cc/Dz49XDBJ/32882135c22085dfaabfd5bed46f3197.jpg';
    }

    // إرسال الصورة مع النص المنظم والمنشن الحقيقي للهدف
    await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: personalidad,
        mentions: mentionsList
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['شخصية'];
handler.tags = ['fun'];
handler.command = /^(شخصية|شخصيه|تحليل)$/i;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}
