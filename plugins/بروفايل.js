// plugins/بروفايل.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام عرض الملف الشخصي الملكي 🃏✨

import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '👤', key: m.key } });

        // إعدادات القناة الرسمية
        const channelContext = {
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429074575231@newsletter',
                    newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                    serverMessageId: 970
                }
            }
        };

        let target = m.sender;

        // إذا كان الأمر .بروفايل وتم تحديد شخص (منشن أو رد)
        if (command === 'بروفايل' || command === 'profile') {
            // التحقق من صلاحيات المشرف أو المطور لاستخدام المنشن على الآخرين
            if (!isOwner && !isAdmin) {
                return await conn.sendMessage(m.chat, { 
                    text: `❌ *عذراً، أمر \`${usedPrefix}بروفايل\` للآخرين مخصص للمشرفين والمطورين فقط!*\nيمكنك استخدام \`${usedPrefix}بروفايلي\` لعرض ملفك الشخصي.\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, 
                    ...channelContext 
                }, { quoted: m });
            }

            // تحديد الهدف (بالرد على رسالة أو بالمنشن)
            if (m.quoted) {
                target = m.quoted.sender;
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                target = m.mentionedJid[0];
            } else {
                return await conn.sendMessage(m.chat, { 
                    text: `⚠️ *يرجى الإشارة إلى شخص أو الرد على رسالته لعرض بروفايله.*\n📝 مثال: \`${usedPrefix}بروفايل @منشن\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, 
                    ...channelContext 
                }, { quoted: m });
            }
        }

        // جلب بيانات المستخدم
        let pp = 'https://files.catbox.moe/g2w389.jpg';
        try {
            pp = await conn.profilePictureUrl(target, 'image');
        } catch (e) {}

        let name = 'غير معروف';
        try {
            name = await conn.getName(target);
        } catch (e) {}

        let about = '';
        try {
            let statusObj = await conn.fetchStatus(target);
            about = statusObj?.status || 'لا يوجد ستاتس (Bio)';
        } catch (e) {
            about = 'خاص / غير متوفر';
        }

        let phoneNumber = target.split('@')[0];
        let formattedPhone = '+\u200e' + new PhoneNumber('+' + phoneNumber).getNumber('international');

        // صياغة الرد الفخم
        let profileText = `👑 *[ الملف الشخصي - ITACHI & JOKER ]* 👑\n\n`;
        profileText += `👤 *الاسم:* ${name}\n`;
        profileText += `📞 *الرقم:* ${formattedPhone}\n`;
        profileText += `🔗 *الرابط المباشر:* wa.me/${phoneNumber}\n`;
        profileText += `📜 *الحالة (Bio):* ${about}\n`;
        profileText += `🆔 *الـ JID:* \`${target}\`\n\n`;
        profileText += `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

        // إرسال الصورة مع المعلومات
        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: profileText,
            ...channelContext
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('[PROFILE-ERROR]', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`❌ حدث خطأ أثناء جلب الملف الشخصي: ${err.message}`);
    }
};

handler.command = ['بروفايل', 'بروفايلي', 'profile', 'myprofile'];
handler.tags = ['tools', 'group'];
handler.help = ['بروفايل @منشن (للمشرفين)', 'بروفايلي (للجميع)'];

export default handler;

