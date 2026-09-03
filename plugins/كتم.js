// plugins/mute.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — وحدة كتم وفك كتم الأعضاء 🔇🔥

import fetch from 'node-fetch';

let handler = async (m, { conn, command, isAdmin, usedPrefix }) => {
    if (!m.isGroup) return;
    if (!isAdmin) {
        return conn.reply(
            m.chat,
            `👑 *[ وحدة الكتم السيبرانية ]* 👑\n\n` +
            `⚠️ *صلاحيات مرفوضة:* عذراً، هذا الأمر مخصص للمشرفين فقط!\n\n` +
            `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            m
        );
    }

    let targetJid = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!targetJid) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return conn.reply(
            m.chat,
            `👑 *[ وحدة الكتم السيبرانية ]* 👑\n\n` +
            `⚠️ *طريقة الاستخدام:* قم بالرد على رسالة العضو أو اعمل له منشن.\n` +
            `📌 *للكتم:* \`${usedPrefix}كتم\` (بالرد أو المنشن)\n` +
            `📌 *لفك الكتم:* \`${usedPrefix}فك_الكتم\` (بالرد أو المنشن)\n\n` +
            `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            m
        );
    }

    // حماية البوت
    if (targetJid === conn.user.jid || targetJid === conn.user.lid) {
        return conn.reply(
            m.chat,
            `👑 *[ وحدة الحماية السيبرانية ]* 👑\n\n` +
            `❌ لا يمكنك تنفيذ هذا الأمر على البوت!\n\n` +
            `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            m
        );
    }

    // حماية المطورين
    const ownerNumbers = global.owner.map(n => n.replace(/[^0-9]/g, ''));
    let targetNum = targetJid.replace(/[^0-9]/g, '');
    if (ownerNumbers.includes(targetNum)) {
        return conn.reply(
            m.chat,
            `👑 *[ وحدة الحماية السيبرانية ]* 👑\n\n` +
            `👑 لا يمكن تنفيذ الأمر على قائد النظام أو المطور!\n\n` +
            `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            m
        );
    }

    // حماية مالك المجموعة
    try {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const groupOwner = groupMetadata.owner || '';
        if (targetJid === groupOwner || targetNum === groupOwner.replace(/[^0-9]/g, '')) {
            return conn.reply(
                m.chat,
                `👑 *[ وحدة الحماية السيبرانية ]* 👑\n\n` +
                `❌ لا يمكنك تنفيذ الأمر على مالك المجموعة الأساسي!\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
        }
    } catch (e) {}

    // التأكد من وجود قاعدة البيانات
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[targetJid]) {
        global.db.data.users[targetJid] = { muto: false };
    }

    let userData = global.db.data.users[targetJid];

    // كتم
    if (command === "كتم") {
        if (userData.muto === true) {
            return conn.reply(
                m.chat,
                `👑 *[ وحدة الكتم السيبرانية ]* 👑\n\n` +
                `⚠️ هذا العضو مكتوم في النظام بالفعل!\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
        }
        userData.muto = true;
        await conn.sendMessage(m.chat, { react: { text: '🔇', key: m.key } });
        await conn.sendMessage(m.chat, {
            text: `👑 *[ تم كتم العضو بنجاح ]* 👑\n\n` +
                  `👤 *العضو:* @${targetJid.split('@')[0]}\n` +
                  `🔇 *الحالة:* تم فرض حظر رسائله بواسطة النظام السيبراني.\n\n` +
                  `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            mentions: [targetJid]
        }, { quoted: m });
    }
    // فك الكتم
    else if (command === "فك_الكتم") {
        if (userData.muto === false) {
            return conn.reply(
                m.chat,
                `👑 *[ وحدة الكتم السيبرانية ]* 👑\n\n` +
                `⚠️ هذا العضو غير مكتوم أصلاً!\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
        }
        userData.muto = false;
        await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } });
        await conn.sendMessage(m.chat, {
            text: `👑 *[ تم فك كتم العضو بنجاح ]* 👑\n\n` +
                  `👤 *العضو:* @${targetJid.split('@')[0]}\n` +
                  `🔊 *الحالة:* تم رفع الحظر وإعادة الصلاحيات.\n\n` +
                  `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            mentions: [targetJid]
        }, { quoted: m });
    }
};

// معالج حذف الرسائل للمكتومين
handler.all = async function (m) {
    if (!m.isGroup || !global.db.data.users) return;
    if (!global.db.data.users[m.sender]) return;

    let user = global.db.data.users[m.sender];
    if (!user.muto) return;

    // لا تحذف رسائل المشرفين
    try {
        const groupMetadata = await this.groupMetadata(m.chat);
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        if (admins.includes(m.sender)) return;
    } catch (e) {}

    // حذف الرسالة تلقائياً
    await this.sendMessage(m.chat, {
        delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.sender
        }
    }).catch(() => {});
};

handler.help = ['كتم', 'فك_الكتم'];
handler.command = /^(كتم|فك_الكتم)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
