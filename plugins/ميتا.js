// plugins/متقدم.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - مركز القيادة والتحكم المتقدم للجوكر 🃏✨

import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys';

let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '🃏', key: m.key } });

        // 1. إعدادات الـ Meta المخصصة لجوكر واتاتشي
        const botMeta = {
            isForwarded: true,
            forwardingScore: 999,
            forwardedAiBotMessageInfo: {
                botJid: "867051314767696@bot"
            },
            forwardOrigin: 4,
            externalAdReply: {
                title: '⚜️ ITACHI & JOKER - CENTRAL COMMAND',
                body: 'تم هندسة هذا الكيان بواسطة الأسطورة اتاتشي',
                thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029Vb3hUaY0LKZ3b53c',
                mediaType: 1,
                renderLargerThumbnail: true
            },
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363429074575231@newsletter',
                newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                serverMessageId: 970
            }
        };

        // 2. جلب صورة البروفايل ديناميكياً
        let imageUrl = 'https://files.catbox.moe/g2w389.jpg';
        try {
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            imageUrl = await conn.profilePictureUrl(botJid, 'image');
        } catch(e) {}

        // 3. بناء الهيكل الاحترافي المتطور
        const richMessage = {
            richResponseMessage: {
                messageType: 1,
                submessages: [
                    {
                        messageType: 2,
                        messageText: "\n🃏 *[ 👑 نظام الجوكر الملكي والذكاء السيبراني 👑 ]* 🃏\n",
                    },
                    {
                        messageType: 2,
                        messageText: "\n💡 *نبذة عن المطور والكيان:*\n> تم تصميم هذا النظام تحت إشراف المهندس الأسطوري **« اتاتشي »**، العبقري الذي أعاد كتابة قواعد السحر البرمجي وصنع هذا الكيان المرعب ليكون سيد البوتات بلا منازع.\n",
                    },
                    {
                        messageType: 2,
                        messageText: "\n📊 *1- جدول الأوامر الأساسية والأساطير:*\n",
                    },
                    {
                        messageType: 4,
                        tableMetadata: {
                            title: "أوامر 𝐈𝐭𝐚𝐜𝐡𝐢 & 𝑱𝑶𝑲𝑬𝑹",
                            rows: [
                                { items: ["الأمر", "الوصف الأساسي", "مثال استخدامه"], isHeading: true },
                                { items: [".جوكر", "محادثة الجوكر الفلسفية", ".جوكر ما هي الحقيقة؟"], isHeading: false },
                                { items: [".ملصقات", "صناعة ملصقات احترافية", ".ملصقات (رد على صورة)"], isHeading: false },
                                { items: [".ميدجورني", "توليد صور بالذكاء الاصطناعي", ".ميدجورني قطة في الفضاء"], isHeading: false },
                                { items: [".اغنيه", "تحميل وتشغيل الأغاني", ".اغنيه اسم الموسيقى"], isHeading: false },
                                { items: [".بينترست", "البحث في بينترست", ".بينترست خلفيات فخمة"], isHeading: false }
                            ]
                        }
                    },
                    {
                        messageType: 2,
                        messageText: "\n💻 *2- التوقيع البرمجي (System Architecture):*\n",
                    },
                    {
                        messageType: 5,
                        codeMetadata: {
                            codeLanguage: "javascript",
                            codeBlocks: [
                                { highlightType: 2, codeContent: 'const Master = "Itachi & The Joker";' },
                                { highlightType: 3, codeContent: 'const Power = "Infinite Control";' },
                                { highlightType: 4, codeContent: 'const Status = "Legendary System Active";' },
                                { highlightType: 1, codeContent: 'console.log("Welcome to the Chaos!");' }
                            ]
                        }
                    },
                    {
                        messageType: 2,
                        messageText: "\n🖼️ *3- بطاقة القيادة العلوية:*\n",
                    },
                    {
                        messageType: 3,
                        imageMetadata: {
                            imageUrl: {
                                imagePreviewUrl: imageUrl,
                                imageHighResUrl: imageUrl,
                                sourceUrl: "https://whatsapp.com/channel/0029Vb3hUaY0LKZ3b53c"
                            },
                            imageText: "👑 ITACHI & JOKER EMPIRE 👑",
                            alignment: 2,
                            tapLinkUrl: "https://whatsapp.com/channel/0029Vb3hUaY0LKZ3b53c"
                        }
                    }
                ],
                contextInfo: botMeta
            }
        };

        // 4. إنشاء وتوليد الرسالة البرمجية
        const msg = await generateWAMessageFromContent(m.chat, {
            botForwardedMessage: { message: richMessage }
        }, {
            senderId: conn.user.id,
            userJid: conn.user.id,
            messageId: generateMessageIDV2(conn.user.id)
        });

        // 5. إرسال الرسالة بنجاح
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error("[ITACHI-META-ERROR]", err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        // رسالة بديلة في حال عدم دعم التطبيق للواجهة المتقدمة
        let fallbackText = `🃏 *[ 👑 نظام الجوكر واتاتشي الأسطوري 👑 ]* 🃏\n\n`;
        fallbackText += `> تم هندسة هذا الكيان بواسطة العبقري **« اتاتشي »**.\n\n`;
        fallbackText += `📊 *قائمة الأوامر السريعة:*\n`;
        fallbackText += `┌──────────┬────────────────────────┐\n`;
        fallbackText += `│ .جوكر    │ محادثة ذكاء الجوكر     │\n`;
        fallbackText += `│ .ملصقات  │ صنع الملصقات الفورية    │\n`;
        fallbackText += `│ .ميدجورني│ رسم وتوليد الصور       │\n`;
        fallbackText += `│ .اغنيه   │ تحميل الملفات الصوتية   │\n`;
        fallbackText += `│ .بينترست │ البحث في صور بينترست   │\n`;
        fallbackText += `└──────────┴────────────────────────┘\n\n`;
        fallbackText += `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

        await conn.sendMessage(m.chat, {
            text: fallbackText,
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
};

handler.help = ['متقدم', 'ميتا', 'قائمة'];
handler.tags = ['tools', 'ai'];
handler.command = /^(متقدم|ميتا|meta|rich|قائمة)$/i;

export default handler;
