// plugins/unions.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام إدارة الألقاب في المجموعات 👥

import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const groupId = m.chat;
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.users) global.db.data.users = {};
    
    let users = global.db.data.users;
    if (!users[m.sender]) users[m.sender] = {};
    if (!users[m.sender].groups) users[m.sender].groups = {};

    const user = users[m.sender];

    try {
        // ━━━━━━━ حجز اللقب ✍️ ━━━━━━━
        if (command === 'حجز_لقب') {
            if (!text) {
                return m.reply(theme.build([
                    { type: 'title', text: '✍️ حـجـز لـقـب' },
                    { type: 'subtitle', text: 'يرجى كتابة اللقب المراد حجزه بجانب الأمر' },
                    { type: 'divider' },
                    { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} الأسطورة` },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ]));
            }

            if (user.groups[groupId]?.name) {
                return m.reply(theme.build([
                    { type: 'title', text: '⚠️ مـوجـود مـسـبـقـاً' },
                    { type: 'info', label: '🏷️ لقبك الحالي', value: user.groups[groupId].name },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ]));
            }

            for (let key in users) {
                if (users[key].groups?.[groupId]?.name?.toLowerCase() === text.toLowerCase()) {
                    return m.reply(theme.build([
                        { type: 'title', text: '❌ مـحـجـوز' },
                        { type: 'line', text: 'هذا اللقب محجوز مسبقاً بواسطة عضواً آخر' },
                        { type: 'divider' },
                        { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                    ]));
                }
            }

            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            user.groups[groupId] = {
                name: text,
                regTime: Date.now(),
                registered: true
            };

            if (global.db.writeData) {
                await global.db.writeData('users', m.sender, user).catch(() => {});
            }

            await conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '👥 تـم حـجـز الـلـقـب بـنـجـاح' },
                    { type: 'divider' },
                    { type: 'info', label: '🏷️ اللقب', value: text },
                    { type: 'info', label: '👤 بواسطة', value: m.pushName || m.sender.split('@')[0] },
                    { type: 'info', label: '📅 التاريخ', value: new Date().toLocaleDateString('ar-EG') },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ])
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }

        // ━━━━━━━ قائمة الألقاب المحجوزة 📋 ━━━━━━━
        else if (command === 'الالقاب_المحجوزه') {
            let reservedNames = [];
            let mentions = [];

            for (let key in users) {
                const u = users[key];
                if (u.groups?.[groupId]?.name) {
                    reservedNames.push(`│ 🏷️ *${u.groups[groupId].name}* ⇽ @${key.split('@')[0]}`);
                    mentions.push(key);
                }
            }

            if (reservedNames.length === 0) {
                return m.reply(theme.build([
                    { type: 'title', text: '📋 قـائـمـة فـارغـة' },
                    { type: 'line', text: 'لا توجد ألقاب محجوزة حتى الآن في هذه المجموعة' },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ]));
            }

            let listMsg = theme.build([
                { type: 'title', text: '👥 قـائـمـة الألـقـاب الـمـحـجـوزة' },
                { type: 'divider' },
                ...reservedNames.map(item => ({ type: 'line', text: item })),
                { type: 'divider' },
                { type: 'info', label: '📊 المجموع', value: `${reservedNames.length} لقب` },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]);

            await conn.sendMessage(m.chat, { text: listMsg, mentions: mentions }, { quoted: m });
        }

        // ━━━━━━━ إلغاء حجز اللقب 🗑️ ━━━━━━━
        else if (command === 'الغاء_حجز') {
            if (!user.groups?.[groupId]?.name) {
                return m.reply(theme.build([
                    { type: 'title', text: '⚠️ تـنـبـيـه' },
                    { type: 'line', text: 'أنت لا تملك لقباً مسجلاً في هذه المجموعة لإلغائه' },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ]));
            }

            const oldName = user.groups[groupId].name;
            delete user.groups[groupId];

            if (global.db.writeData) {
                await global.db.writeData('users', m.sender, user).catch(() => {});
            }

            await conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '🗑️ تـم إلـغـاء الـلـقـب بـنـجـاح' },
                    { type: 'divider' },
                    { type: 'info', label: '🏷️ اللقب السابق', value: oldName },
                    { type: 'info', label: '👤 بواسطة', value: m.pushName || m.sender.split('@')[0] },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ])
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }

    } catch (err) {
        console.error('Unions error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(theme.build([
            { type: 'title', text: '❌ خـطـأ' },
            { type: 'error', text: err.message || 'خطأ غير معروف' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));
    }
};

handler.help = ['حجز_لقب', 'الالقاب_المحجوزه', 'الغاء_حجز'];
handler.tags = ['unions'];
handler.command = /^(حجز_لقب|الالقاب_المحجوزه|الغاء_حجز)$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
