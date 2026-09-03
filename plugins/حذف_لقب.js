// plugins/delete_lakab.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - حذف لقب عضو في المجموعة 👥

import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let mentionedJid;

        // تحديد العضو المستهدف
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            mentionedJid = m.mentionedJid[0];
        } else if (m.quoted && m.quoted.sender) {
            mentionedJid = m.quoted.sender;
        } else if (text) {
            const number = text.replace(/[^0-9]/g, '');
            if (number) {
                mentionedJid = number + '@s.whatsapp.net';
            }
        }

        if (!mentionedJid) {
            return m.reply(theme.build([
                { type: 'title', text: '🗑️ حـذف لـقـب عـضو' },
                { type: 'subtitle', text: 'يرجى الإشارة إلى العضو أو الرد على رسالته' },
                { type: 'divider' },
                { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} @العضو` },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]));
        }

        // تحويل LID لرقم حقيقي
        try {
            mentionedJid = await conn.convertLidToRealJid(mentionedJid, m.chat);
        } catch {}

        if (!mentionedJid || !mentionedJid.endsWith('@s.whatsapp.net')) {
            mentionedJid = String(mentionedJid || '').replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }

        if (!global.db?.data?.users) {
            return m.reply(theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'error', text: 'قاعدة البيانات غير جاهزة' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]));
        }

        const users = global.db.data.users;
        let user = users[mentionedJid];

        if (!user || !user.groups || !user.groups[m.chat] || !user.groups[m.chat].name) {
            return m.reply(theme.build([
                { type: 'title', text: '⚠️ تـنـبـيـه' },
                { type: 'line', text: 'هذا العضو لا يملك لقباً مسجلاً في هذه المجموعة' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]));
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const oldName = user.groups[m.chat].name;
        delete user.groups[m.chat].name;

        if (global.db.writeData) {
            await global.db.writeData('users', mentionedJid, user).catch(() => {});
        }

        let memberName = mentionedJid.split('@')[0];
        try {
            const nameFromConn = await conn.getName(mentionedJid);
            if (nameFromConn) memberName = nameFromConn;
        } catch (e) {}

        let successMsg = theme.build([
            { type: 'title', text: '🗑️ تـم حـذف الـلـقـب بـنـجـاح' },
            { type: 'divider' },
            { type: 'info', label: '👤 العضو', value: memberName },
            { type: 'info', label: '🏷️ اللقب المحذوف', value: oldName },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]);

        await conn.sendMessage(m.chat, { text: successMsg, mentions: [mentionedJid] }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('حذف_لقب error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(theme.build([
            { type: 'title', text: '❌ خـطـأ' },
            { type: 'error', text: err.message || 'خطأ غير معروف' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));
    }
};

handler.help = ['حذف_لقب'];
handler.tags = ['unions'];
handler.command = /^(حذف-لقب|حذف_لقب|delete_lakab)$/i;
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
