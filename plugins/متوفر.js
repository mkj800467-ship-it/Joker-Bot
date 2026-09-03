// plugins/motawer.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام التحقق من توفر الألقاب السيبراني 👑🔥

let handler = async (m, { conn, text }) => {
    try {
        const groupId = m.chat;
        const name = text?.trim();

        if (!name) {
            return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "وحدة التحقق من اللقب"* \n> ✍️ *يرجى إدخال اللقب المطلوب*\n> 📌 *مثال:* \`.متوفر الأسطورة\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m);
        }

        // التأكد من وجود قاعدة البيانات
        if (!global.db?.data?.users) {
            return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "خطأ سيبراني"* \n> 🔮 قاعدة البيانات غير جاهزة أو فارغة!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m);
        }

        const users = global.db.data.users;
        let taken = false;
        let owner = null;

        // البحث في قاعدة البيانات عن مالك اللقب داخل نفس المجموعة
        for (let key in users) {
            const user = users[key];
            if (user.groups?.[groupId]?.name?.toLowerCase() === name.toLowerCase()) {
                taken = true;
                owner = key;
                break;
            }
        }

        if (taken) {
            let ownerName = owner.split('@')[0];
            try {
                const nameFromConn = await conn.getName(owner);
                if (nameFromConn) ownerName = nameFromConn;
            } catch (e) {}

            let takenText = `> 👑 *[ اللقب محجوز وغير متاح ]* 👑\n> \n> ❌ *اللقب:* "${name}"\n> 👤 *مملوك بواسطة:* ${ownerName}\n> 🏷️ *JID:* @${owner.split('@')[0]}\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

            return await conn.sendMessage(m.chat, {
                text: takenText,
                mentions: [owner],
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363429074575231@newsletter',
                        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                        serverMessageId: 970
                    }
                }
            }, { quoted: m });

        } else {
            let availableText = `> ✅ *[ اللقب متاح للحجز السيادي ]* ✅\n> \n> ✨ *اللقب:* "${name}" متاح تماماً.\n> 💡 *للحجز الفوري:* استخدم أمر حجز اللقب الخاص بك.\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

            return await conn.sendMessage(m.chat, {
                text: availableText,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363429074575231@newsletter',
                        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                        serverMessageId: 970
                    }
                }
            }, { quoted: m });
        }

    } catch (err) {
        console.error('[ITACHI-MOTAWER-ERROR]', err);
        await conn.reply(m.chat, `> 👑 *ITACHI & جركر: "خطأ غير متوقع"*\n> 🔮 ${err.message || err}`, m);
    }
};

handler.help = ['متوفر <لقب>'];
handler.tags = ['unions', 'group'];
handler.command = /^(متوفر|available|check)$/i;
handler.group = true;

export default handler;
