// plugins/admin.js
// ✧ THE JOKER & ITACHI - ترقية أو إعفاء عضو 👑

import { theme } from '../core/theme.js';
import { sticker } from '../Z/sticker.js';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, isAdmin, isOwner }) => {

    if (!isAdmin && !isOwner) {
        return m.reply(theme.build([
            { type: 'title', text: 'خـطـأ في الصلاحيات' },
            { type: 'divider' },
            { type: 'error', text: 'هذا الأمر مخصص للمشرفين فقط.' }
        ]));
    }

    let user = null;

    // الطريقة 1: المنشن (@user)
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        user = m.mentionedJid[0];
    }

    // الطريقة 2: الرد على رسالة
    if (!user && m.quoted && m.quoted.sender) {
        user = m.quoted.sender;
    }

    // الطريقة 3: رقم مباشر
    if (!user && m.text) {
        const numMatch = m.text.match(/(\d{10,15})/);
        if (numMatch) {
            user = numMatch[1] + '@s.whatsapp.net';
        }
    }

    if (!user) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply(theme.build([
            { type: 'title', text: 'إدارة المشرفين' },
            { type: 'divider' },
            { type: 'line', text: 'استخدم إحدى الطرق التالية لتحديد العضو:' },
            { type: 'info', label: 'منشن', value: `.${command} @user` },
            { type: 'info', label: 'رد', value: `الرد على رسالة العضو` },
            { type: 'info', label: 'رقم', value: `.${command} 201096359337` }
        ]), {
            quoted: m,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363410276242111@newsletter',
                    newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                    serverMessageId: 970
                }
            }
        });
    }

    try {
        // ترقية عضو
        if (command.match(/^(ترقيه|رفع|ارفع|promote)$/i)) {
            await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
            
            const imageUrl = 'https://file.garden/aauvg01sjleV_ic1/IMG-20260529-WA0354.jpg';
            const imgRes = await fetch(imageUrl);
            const imgBuffer = await imgRes.buffer();
            let stiker = await sticker(imgBuffer, null, '❄️ مبروك اصبحت مشرف', '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚫 ✧');

            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });

            const successMsg = theme.build([
                { type: 'title', text: 'تـم الـتـرقـيـة بنجاح' },
                { type: 'divider' },
                { type: 'info', label: 'العضو', value: '@' + user.split('@')[0] },
                { type: 'line', text: 'تمت ترقية العضو ليصبح مشرفاً في المجموعة.' }
            ]);

            await conn.sendMessage(m.chat, { 
                text: successMsg, 
                mentions: [user],
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363410276242111@newsletter',
                        newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                        serverMessageId: 970
                    }
                }
            }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }

        // إعفاء عضو
        else if (command.match(/^(اعفاء|تنزيل|demote)$/i)) {
            await conn.groupParticipantsUpdate(m.chat, [user], 'demote');

            const successMsg = theme.build([
                { type: 'title', text: 'تـم الإعـفـاء من الإدارة' },
                { type: 'divider' },
                { type: 'info', label: 'العضو', value: '@' + user.split('@')[0] },
                { type: 'line', text: 'تم إعفاء العضو من إدارة المجموعة.' }
            ]);

            await conn.sendMessage(m.chat, { 
                text: successMsg, 
                mentions: [user],
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363410276242111@newsletter',
                        newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                        serverMessageId: 970
                    }
                }
            }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(theme.build([
            { type: 'title', text: 'فـشـل الـعـمـلـيـة' },
            { type: 'divider' },
            { type: 'error', text: e.message?.slice(0, 100) || 'حدث خطأ غير معروف.' }
        ]));
    }
};

handler.help = ['ترقيه', 'اعفاء'];
handler.tags = ['group'];
handler.command = /^(ترقيه|رفع|ارفع|promote|اعفاء|تنزيل|demote)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

