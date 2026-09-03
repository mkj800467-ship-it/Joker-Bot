// plugins/rate.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — نظام التقييم والتواصل السيبراني المتطور ⭐🔥

import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys';

// تحديد المطورين المعتمدين والمواصفات السيبرانية (تم اعتماد رقم المطور الحقيقي بصيغة JID الصحيحة)
const allowedOwners = [
    '249916221538@s.whatsapp.net'
];

const channelUrl = 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A';
const channelName = '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '⭐', key: m.key } });

        // رابط الصورة السيبرانية الافتراضية
        const imageUrl = 'https://i.postimg.cc/qRP4k4jD/060dd92527391a0367195f8fe94db60c.jpg';
        const mediaMessage = await prepareWAMessageMedia(
            { image: { url: imageUrl } },
            { upload: conn.waUploadToServer }
        );

        // إنشاء رسالة التفاعلية مع أزرار القائمة المندسلة والخيارات الستة باستخدام الهيكل الحديث
        const interactiveMessage = {
            body: {
                text: `👑 *[ نظام التقييم السيبراني لـ ITACHI & JOKER ]* 👑\n\n` +
                      `⭐ مرحباً بك أيها المحارب في وحدة التقييم الرسمية.\n` +
                      `🔮 نسعى دائماً لتطوير النظام وتقديم أفضل تجربة سيبرانية لك.\n\n` +
                      `📌 *اضغط على الزر أدناه لاختيار تقييمك أو إرسال ملاحظاتك الخاصة للمطور مباشرة!*`
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
                    // 1. زر القائمة المندسلة (النجوم الستة للتقييم والملاحظات)
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
                                            title: "غير راضي أبداً ❌",
                                            description: "تقييم منخفض، يحتاج النظام لتطوير جذري."
                                        },
                                        {
                                            header: "⭐⭐ [ نجمتان ]",
                                            id: `${usedPrefix}rate_submit 2`,
                                            title: "غير راضي 😕",
                                            description: "هناك الكثير من القصور والأخطاء."
                                        },
                                        {
                                            header: "⭐⭐⭐ [ 3 نجوم ]",
                                            id: `${usedPrefix}rate_submit 3`,
                                            title: "محايد 😐",
                                            description: "الأداء مقبول لكنه بحاجة لتحسينات."
                                        },
                                        {
                                            header: "⭐⭐⭐⭐ [ 4 نجوم ]",
                                            id: `${usedPrefix}rate_submit 4`,
                                            title: "راضي وجيد 👍",
                                            description: "التجربة ممتازة وتلبي الاحتياجات."
                                        },
                                        {
                                            header: "⭐⭐⭐⭐⭐ [ 5 نجوم ]",
                                            id: `${usedPrefix}rate_submit 5`,
                                            title: "راضي جداً وبوت أسطوري 😍🔥",
                                            description: "أداء خارق، دقيق، وفي غاية الجمال والروعة!"
                                        },
                                        {
                                            header: "📝 [ ارسل ملاحظاتك ]",
                                            id: `${usedPrefix}rate_feedback`,
                                            title: "إرسال اقتراح أو ملاحظة للمطور 📨",
                                            description: "تواصل مباشرة مع فريق إيتاشي والجوكر لتسجيل ملاحظتك."
                                        }
                                    ]
                                }
                            ]
                        })
                    },
                    // 2. زر قناة الواتساب الرسمية المحدث بالرابط الجديد
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📢 تابع قناة النظام الرسمية",
                            url: channelUrl,
                            merchant_url: channelUrl
                        })
                    }
                ],
                messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                        list_title: "⭐ وحدة التقييم السيبراني",
                        button_title: "📂 اختر تقييمك ⚡"
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
        console.error('[ITACHI-Rate Error]:', e);
        await conn.reply(
            m.chat,
            `👑 *ITACHI & JOKER: "خطأ في النظام"* 👑\n\n` +
            `⚠️ ${e.message || 'حدث خطأ غير متوقع في تحميل نظام التقييم'}\n\n` +
            `▪️ 👑 ${channelName}`,
            m
        );
    }
};

// معالج الأزرار والتفاعل (handler.before) لمعالجة التقييمات وإرسالها للمطورين
handler.before = async (m, { conn, usedPrefix }) => {
    if (!m.text) return false;
    const cmdText = m.text.trim();

    // التعامل مع اختيار التقييم بالنجوم
    if (cmdText.startsWith(`${usedPrefix}rate_submit `)) {
        const rating = cmdText.replace(`${usedPrefix}rate_submit `, '').trim();
        const stars = '⭐'.repeat(Number(rating) || 1);
        const userJid = m.sender;
        const userName = m.pushName || 'محارب مجهول';

        // إرسال رد فوري للمستخدم يؤكد نجاح التقييم
        await conn.reply(
            m.chat,
            `👑 *[ شكراً لتقييمك الأسطوري! ]* 👑\n\n` +
            `🎯 *تقييمك المسجل:* ${stars} (${rating}/5)\n` +
            `🔥 تم إرسال تقييمك بنجاح إلى غرفة عمليات المطورين!\n\n` +
            `▪️ 👑 ${channelName}`,
            m
        );

        // توجيه وإرسال تقييم المستخدم مباشرة لكل المطورين المعتمدين في أروقة البوت
        for (const ownerJid of allowedOwners) {
            try {
                await conn.sendMessage(ownerJid, {
                    text: `👑 *[ إشعار تقييم سيبراني جديد ]* 👑\n\n` +
                          `👤 *المستخدم:* @${userJid.split('@')[0]} (${userName})\n` +
                          `⭐ *التقييم:* ${stars} (${rating} نجوم)\n` +
                          `📍 *رقم الجروب/الشات:* ${m.chat}\n\n` +
                          `▪️ 👑 ${channelName}`,
                    mentions: [userJid]
                });
            } catch (err) {
                // تخطي في حال كان JID غير متاح للمراسلة الفورية المباشرة
            }
        }
        return true;
    }

    // التعامل مع خيار إرسال الملاحظات والاقتراحات للمطور
    if (cmdText === `${usedPrefix}rate_feedback`) {
        await conn.reply(
            m.chat,
            `👑 *[ صندوق الملاحظات السيبراني ]* 👑\n\n` +
            `💬 يرجى الرد على هذه الرسالة واكتب اقتراحك أو ملاحظتك أو المشكلة التي واجهتك، وسيقوم فريق إيتاشي والجوكر بالاطلاع عليها فوراً!\n\n` +
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
