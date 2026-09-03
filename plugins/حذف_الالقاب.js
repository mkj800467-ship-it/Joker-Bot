// plugins/delete_all_lakab.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - حذف جميع ألقاب المجموعة 👥

import { theme } from '../core/theme.js';

let handler = async function (m, { conn }) {
    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const groupId = m.chat;

        let groupInfo;
        try {
            groupInfo = await conn.groupMetadata(groupId);
        } catch (e) {
            return m.reply(theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'error', text: 'فشل في الوصول لبيانات المجموعة. تأكد من أن البوت أدمن.' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]));
        }

        const groupMembers = groupInfo.participants;

        if (!global.db?.data?.users) {
            return m.reply(theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'error', text: 'قاعدة البيانات غير جاهزة' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]));
        }

        const users = global.db.data.users;
        const usersWithNicknames = [];

        for (let [jid, user] of Object.entries(users)) {
            if (user.groups?.[groupId]?.name) {
                usersWithNicknames.push({ jid, name: user.groups[groupId].name, user });
            }
        }

        if (usersWithNicknames.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: 'ℹ️', key: m.key } });
            return m.reply(theme.build([
                { type: 'title', text: '⚠️ تـنـبـيـه' },
                { type: 'line', text: 'لا توجد ألقاب مسجلة في هذه المجموعة حالياً.' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]));
        }

        let deletedNames = [];
        for (let item of usersWithNicknames) {
            deletedNames.push(item.name);
            delete item.user.groups[groupId].name;
            if (global.db.writeData) {
                await global.db.writeData('users', item.jid, item.user).catch(() => {});
            }
        }

        let resultMessage = theme.build([
            { type: 'title', text: '👥 تـطـهـيـر الألـقـاب' },
            { type: 'subtitle', text: 'تم حذف جميع الألقاب في المجموعة' },
            { type: 'divider' },
            { type: 'info', label: '📊 الألقاب المحذوفة', value: usersWithNicknames.length.toString() },
            { type: 'info', label: '👥 أعضاء المجموعة', value: groupMembers.length.toString() },
            { type: 'divider' },
            { type: 'line', text: '🏷️ قائمة الألقاب التي تمت إزالتها بنجاح' },
            ...deletedNames.map((name, i) => ({ type: 'info', label: `${i + 1}`, value: name })),
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]);

        await conn.sendMessage(m.chat, { text: resultMessage }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('حذف_الألقاب error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(theme.build([
            { type: 'title', text: '❌ خـطـأ' },
            { type: 'error', text: err.message || 'خطأ غير معروف' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));
    }
};

handler.help = ['حذف_الألقاب'];
handler.tags = ['unions'];
handler.command = /^(حذف_الألقاب|حذف_الالقاب|delete_all)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

