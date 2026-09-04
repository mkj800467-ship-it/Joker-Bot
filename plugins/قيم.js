// plugins/rate.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — نظام التقييم والتواصل ⭐🔥

import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys';

// رقم المطور المعتمد
const ownerNumber = '249916221538';
const ownerJid = `${ownerNumber}@s.whatsapp.net`;

const channelUrl = 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A';
const channelName = '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '⭐', key: m.key } });

        const imageUrl = 'https://i.postimg.cc/qRP4k4jD/060dd92527391a0367195f8fe94db60c.jpg';
        const mediaMessage = await prepareWAMessageMedia(
            { image: { url: imageUrl } },
            { upload: conn.waUploadToServer }
        );

        const interactiveMessage = {
            body: {
                text: `⛩️ *[ نظام التقييم الرسمي لـ ITACHI & JOKER ]* ⛩️\n\n` +
                      `⭐ أهلاً بك يا محارب. رأيك يهمنا لنستمر في التطوير.\n` +
                      `🔮 يرجى اختيار تقييمك لتجربتك مع البوت عبر القائمة أدناه.`
            },
            footer: {
                text: `▪️ 👑 ${channelName}`
            },
            header: {
                hasMediaAttachment: true,
                imageMessage: mediaMessage.imageMessage
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "🪔 قـيـم تـجـربـتك",
                            sections: [
                                {
                                    title: "🔮 خيارات التقييم 🍀",
                                    rows: [
                                        {
                                            header: "⭐ [ 1 نجمة ]",
                                            id: `${usedPrefix}rate_submit 1`,
                                            title: "سيء جداً ❌",
                                            description: "تجربة سيئة للغاية ويحتاج لإصلاحات جزرية."
                                        },
                                        {
                                            header: "⭐⭐ [ نجمتان ]",
                                            id: `${usedPrefix}rate_submit 2`,
                                            title: "ضعيف 😕",
                                            description: "هناك الكثير من الأخطاء التي تواجهني."
                                        },
                                        {
                                            header: "⭐⭐⭐ [ 3 نجوم ]",
                                            id: `${usedPrefix}rate_submit 3`,
                                            title: "مقبول 😐",
                                            description: "الأداء عادي ويؤدي الغرض."
                                        },
                                        {
                                            header: "⭐⭐⭐⭐ [ 4 نجوم ]",
                                            id: `${usedPrefix}rate_submit 4`,
                                            title: "ممتاز 👍",
                                            description: "تجربة رائعة وتلبي احتياجاتي."
                                        },
                                        {
                                            header: "⭐⭐⭐⭐⭐ [ 5 نجوم ]",
                                            id: `${usedPrefix}rate_submit 5`,
                                            title: "أسطوري ورائع 😍🔥",
                                            description: "أداء خارق وسريع جداً!"
                                        },
                                        {
                                            header: "📝 [ ارسل ملاحظاتك ]",
                                            id: `${usedPrefix}rate_feedback`,
                                            title: "إرسال اقتراح أو ملاحظة للمطور 📨",
                                            description: "تواصل مباشرة مع إيتاشي لإرسال ملحوظتك."
                                        }
                                    ]
                                }
                            ]
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📢 تابع قناة البوت الرسمية",
                            url: channelUrl,
                            merchant_url: channelUrl
                        })
                    }
                ],
                messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                        list_title: "⭐ قائمة التقييم",
                        button_title: "📂 اختر التقييم ⚡"
                    }
                })
            }
        };

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
                    }
                }
            },
            {
                userJid: conn.user.jid,
                quoted: m
            }
        );

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error('[Rate Error]:', e);
        await conn.reply(
            m.chat,
            `⛩️ *خطأ في النظام:* ${e.message || 'حدث خطأ غير متوقع'}`,
            m
        );
    }
};

handler.before = async (m, { conn, usedPrefix }) => {
    if (!m.text) return false;
    const cmdText = m.text.trim();

    if (cmdText.startsWith(`${usedPrefix}rate_submit `)) {
        const rating = cmdText.replace(`${usedPrefix}rate_submit `, '').trim();
        const stars = '⭐'.repeat(Number(rating) || 1);
        const userJid = m.sender;
        const userName = m.pushName || 'مستخدم مجهول';

        // رد مخصص للمستخدم حسب التقييم الذي اختاره
        let customReply = '';
        const rateNum = Number(rating);

        if (rateNum === 1) {
            customReply = `شكراً على لا شيء! سيتم إرسال تقريرك السيء للمطور فوراً ليتحقق من المشكلة 🙂`;
        } else if (rateNum === 2) {
            customReply = `شكراً لتقييمك. تم إرسال ملاحظتك للمطور لمعالجة الأخطاء والقصور.`;
        } else if (rateNum === 3) {
            customReply = `شكراً لك! تم إرسال تقييمك للمطور لنعمل على تحسين الأداء أكثر.`;
        } else if (rateNum === 4) {
            customReply = `شكراً جزيلاً لتقييمك الجميل! تم إرسال تقريرك للمطور 🌟`;
        } else if (rateNum === 5) {
            customReply = `أشكرك يا أسطورة على التقييم الخرافي! تم إرسال تقريرك وسعادتك للمطور إيتاشي 🔥`;
        } else {
            customReply = `شكراً لتقييمك، تم إرسال التقرير للمطور بنجاح.`;
        }

        await conn.reply(
            m.chat,
            `⛩️ *[ نظام التقييم ]* ⛩️\n\n` +
            `🎯 *تقييمك:* ${stars} (${rating}/5)\n` +
            `💬 ${customReply}\n\n` +
            `▪️ 👑 ${channelName}`,
            m
        );

        // إرسال التقييم مباشرة للمطور عبر رقمه الخاص
        try {
            await conn.sendMessage(ownerJid, {
                text: `⛩️ *[ إشعار تقييم جديد من المستخدم ]* ⛩️\n\n` +
                      `👤 *المستخدم:* @${userJid.split('@')[0]} (${userName})\n` +
                      `⭐ *التقييم:* ${stars} (${rating} نجوم)\n` +
                      `📍 *رقم الجروب/الشات:* ${m.chat}\n\n` +
                      `▪️ 👑 ${channelName}`,
                mentions: [userJid]
            });
        } catch (err) {
            console.error('فشل إرسال التقييم للمطور:', err);
        }

        return true;
    }

    if (cmdText === `${usedPrefix}rate_feedback`) {
        await conn.reply(
            m.chat,
            `⛩️ *[ صندوق الاقتراحات والملاحظات ]* ⛩️\n\n` +
            `💬 قم بالرد على هذه الرسالة واكتب اقتراحك أو مشكلتك، وسيتم إرسالها مباشرة للمطور إيتاشي للاطلاع عليها!\n\n` +
            `▪️ 👑 ${channelName}`,
            m
        );
        return true;
    }

    return false;
};

handler.command = ['rate', 'تقييم', 'قيم'];
handler.help = ['rate'];
handler.tags = ['main'];

export default handler;
