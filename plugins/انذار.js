// plugins/warn.js
// ✧ THE JOKER & ITACHI - نظام التحذير والعدم 🃏

import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, command, usedPrefix }) => {

    // 🛡️ منع تحذير البوت نفسه
    if (m.mentionedJid && m.mentionedJid.includes(conn.user.jid)) {
        const botErrorText = theme.build([
            { type: 'title', text: '🃏 تـنـبـيـه الـعـدم' },
            { type: 'divider' },
            { type: 'error', text: 'لا يمكنك تحذير كيان البوت نفسه.. كيف تحاكم الظل يا صديقي؟' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        return conn.reply(m.chat, botErrorText, m);
    }

    // منع تحذير المطور (إيتاشي والمطورين المصرح لهم)
    const developers = ['249916221538@s.whatsapp.net'];
    if (m.mentionedJid && developers.some(dev => m.mentionedJid.includes(dev))) {
        const devErrorText = theme.build([
            { type: 'title', text: '👑 صَلاحيّة الـمـاسـتـر' },
            { type: 'divider' },
            { type: 'error', text: 'لا يمكنك تحذير المطور الأسطوري (إيتاشي).. الأسياد لا يخضعون لقواعد البشر.' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        return conn.reply(m.chat, devErrorText, m);
    }

    let who = null;

    // الحصول على المستخدم المستهدف
    if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
    } else {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        const usageText = theme.build([
            { type: 'title', text: '🃏 نِظام الإنذارات' },
            { type: 'divider' },
            { type: 'info', label: 'الاستخدام', value: `قم بالرد على رسالة الشخص أو اكتب:\n${usedPrefix + command} @user` },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        return conn.reply(m.chat, usageText, m);
    }

    if (!who) return;

    who = who.split('@')[0] + '@s.whatsapp.net';

    // قاعدة البيانات
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[who]) global.db.data.users[who] = { warn: 0 };

    let user = global.db.data.users[who];
    let targetName = who.split('@')[0];

    try {
        let name = await conn.getName(who);
        if (name) targetName = name;
    } catch(e) {}

    // ========== تحذير / إنذار ==========
    if (command === 'تحذير' || command === 'انذار' || command === 'warn') {
        const reason = text ? text.replace(/@\d+-?\d*/g, '').trim() : 'بدون سبب معلن';
        user.warn = (user.warn || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });

        let warnMsg = theme.build([
            { type: 'title', text: '⚠️ إِنـذار جَـديـد' },
            { type: 'divider' },
            { type: 'info', label: '👤 العضو', value: targetName },
            { type: 'info', label: '📝 السبب', value: reason },
            { type: 'info', label: '📊 العداد', value: `${user.warn}/3 إنذارات` },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        await conn.sendMessage(m.chat, { text: warnMsg, mentions: [who] }, { quoted: m });

        // طرد العضو إذا بلغ 3 إنذارات
        if (user.warn >= 3) {
            user.warn = 0;
            let kickMsg = theme.build([
                { type: 'title', text: '🚫 طـرد مـن الـعـدم' },
                { type: 'divider' },
                { type: 'info', label: '👤 العضو', value: targetName },
                { type: 'error', text: 'تم طرده خارج الحدود لبلوغه الحد الأقصى (3 إنذارات).' },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            await conn.sendMessage(m.chat, { text: kickMsg, mentions: [who] }, { quoted: m });
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        }
    }

    // ========== إلغاء تحذير / إلغاء ==========
    if (command === 'الغاء_انذار' || command === 'الغاء') {
        if (!user.warn || user.warn === 0) {
            const noWarnText = theme.build([
                { type: 'title', text: '🃏 سِجِل نَظِيف' },
                { type: 'divider' },
                { type: 'line', text: `هذا العضو (${targetName}) ليس لديه أي إنذارات مسجلة.` },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            return conn.reply(m.chat, noWarnText, m);
        }

        user.warn -= 1;

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        let unWarnMsg = theme.build([
            { type: 'title', text: '✅ تَـم إيـغـاء الإنـذار' },
            { type: 'divider' },
            { type: 'info', label: '👤 العضو', value: targetName },
            { type: 'info', label: '📊 المتبقي', value: `${user.warn}/3 إنذارات` },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        await conn.sendMessage(m.chat, { text: unWarnMsg, mentions: [who] }, { quoted: m });
    }
};

handler.command = ['تحذير', 'انذار', 'warn', 'الغاء_انذار', 'الغاء'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
