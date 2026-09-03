// plugins/fzora.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — وحدة الفوازير والتحدي السيبرانية المتقدمة 🧩🔥

import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys";

// معلومات القناة الرسمية
const channelJid = '120363429074575231@newsletter';
const channelName = '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ';

// قاعدة بيانات الفوازير الاحترافية والممتعة
const fawazeerList = [
    { question: "ما هو الشيء الذي كلما أخذت منه كبر وتضخم؟", answer: "الحفرة" },
    { question: "من هو الذى يرى عدوه وصديقه بعين واحدة؟", answer: "الأعور" },
    { question: "ما هي القناة التي تجمع كل دول العالم بدون ماء؟", answer: "قناة التلفزيون" },
    { question: "أين يوجد البحر الذي لا يوجد به قطرة ماء واحدة؟", answer: "على الخريطة" },
    { question: "ما هو الشيء الذي يقرقش أسنانك ولكنه لا يأكلك؟", answer: "المشط" },
    { question: "ما هو الشيء الذي يمشي ويثبت ليس له أرجل؟", answer: "الساعة" },
    { question: "كم شهراً في السنة يحتوي على 28 يوم؟", answer: "جميع الشهور" },
    { question: "ما هو الشيء الذي إذا أزلنا حرفه طار؟", answer: "قطار" },
    { question: "ابن أمك وأبيك، وليس بأخيك ولا أختك، فمن يكون؟", answer: "أنت" },
    { question: "ما هو الشيء الذي يتكلم جميع لغات العالم؟", answer: "صدى الصوت" },
    { question: "ما هو البيت الذي ليس فيه أبواب ولا نوافذ؟", answer: "بيت الشعر" },
    { question: "يولد كبيراً ويموت صغيراً، فما هو؟", answer: "الشمعة" },
    { question: "ما هو الشّيء الّذي يَكتُب ولا يقرأ؟", answer: "القلم" },
    { question: "ما هو الشيء الذي يحملك وتحمله في نفس الوقت؟", answer: "الحذاء" },
    { question: "ما هو الشيء الذي إذا دخل الماء لا يبتل؟", answer: "الضوء" },
    { question: "ما هو الشيء الذي كلما خطوت خطوة نقص شيئاً من طوله؟", answer: "العصا" },
    { question: "ما هو الشيء الذي لا يبتل حتى لو دخل وسط البحر؟", answer: "الظل" },
    { question: "ما هو الشيء الذي يرفع اثقال ولا يقدر يرفع مسمار؟", answer: "البحر" },
    { question: "من هو الشخص الذي يرى رفيقه أمامه طوال الوقت ولا يمكنه لمسه؟", answer: "المرايا" },
    { question: "ما هو الشيء الذي يكسر نفسه بنفسه دون مساعدة؟", answer: "البيض" }
];

function getRandomFzora() {
    return fawazeerList[Math.floor(Math.random() * fawazeerList.length)];
}

let handler = async (m, { conn, usedPrefix, command }) => {
    // التأكد من تهيئة قاعدة بيانات المستخدمين والبنك
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = { points: 0, bank: 0 };
    }

    // التحقق مما إذا كان لدى المستخدم فزورة نشطة بالفعل
    let userData = global.db.data.users[m.sender];
    if (userData.currentFzora) {
        return conn.reply(
            m.chat,
            `👑 *[ وحدة الفوازير السيبرانية ]* 👑\n\n` +
            `⚠️ لديك لغز نشط بالفعل ولم تقم بحله بعد!\n` +
            `🔮 *اللغز الحالي:* ${userData.currentFzora.question}\n\n` +
            `💡 أجب بالرد على رسالة اللغز أو اكتب إجابتك مباشرة.\n\n` +
            `▪️ 👑 ${channelName}`,
            m
        );
    }

    const fzora = getRandomFzora();
    const timestamp = Date.now();

    // حفظ الفزورة النشطة للمستخدم (بمهلة دقيقة واحدة)
    userData.currentFzora = {
        question: fzora.question,
        answer: fzora.answer.toLowerCase().trim(),
        askedAt: timestamp
    };

    // تصميم الواجهة السيبرانية الفخمة بدون أي علامات إخفاء (>)
    const menuText = 
        `👑 *[ لعبة الفوازير والتحدي السيبراني ]* 👑\n\n` +
        `🧩 *اللغز:* ${fzora.question}\n\n` +
        `⏰ *المهلة الزمنية:* دقيقة واحدة (60 ثانية)\n` +
        `💰 *الجائزة:* 100 نقطة تودع مباشرة في بنكك الشخصي!\n\n` +
        `💡 أجب عن اللغز في المحادثة قبل انتهاء الوقت.`;

    const interactiveMessage = {
        body: { text: menuText },
        footer: { text: `▪️ 👑 ${channelName}` },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 تابع قناة النظام الرسمية',
                        url: `https://whatsapp.com/channel/${channelJid.replace('@newsletter', '')}`,
                        merchant_url: `https://whatsapp.com/channel/${channelJid.replace('@newsletter', '')}`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🧩 لغز آخر جديد ⚡',
                        id: `${usedPrefix + command}`
                    })
                }
            ],
            messageParamsJson: JSON.stringify({
                bottom_sheet: {
                    in_thread_buttons_limit: 3,
                    divider_indices: []
                }
            })
        }
    };

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
            }
        }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '🧩', key: m.key } });
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    // مؤقت انتهاء المهلة (دقيقة كاملة: 60000 ميلي ثانية)
    setTimeout(async () => {
        try {
            let uData = global.db.data.users[m.sender];
            if (uData?.currentFzora && uData.currentFzora.askedAt === timestamp) {
                const correctAnswer = uData.currentFzora.answer;
                delete uData.currentFzora;

                await conn.reply(
                    m.chat,
                    `👑 *[ انتهاء وقت الفزورة ]* 👑\n\n` +
                    `⏰ لقد انتهت الدقيقة ولم تستطع الإجابة في الوقت المحدد!\n` +
                    `🔮 *الإجابة الصحيحة كانت:* ${correctAnswer}\n\n` +
                    `▪️ 👑 ${channelName}`,
                    m
                );
            }
        } catch (err) {}
    }, 60000);
};

// معالج الإجابات التلقائي عبر handler.before
handler.before = async (m, { conn }) => {
    if (!m.text || m.isCommand) return false;

    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = { points: 0, bank: 0 };
    }

    let userData = global.db.data.users[m.sender];
    if (!userData.currentFzora) return false;

    const userAnswer = m.text.toLowerCase().trim();
    const correctAnswer = userData.currentFzora.answer;

    // التحقق من صحة الإجابة
    if (userAnswer === correctAnswer) {
        // تهيئة البنك ونقاط المستخدم في حال لم تكن موجودة
        if (typeof userData.bank !== 'number') userData.bank = 0;
        userData.bank += 100; // إضافة 100 نقطة للبنك

        const wonText = 
            `👑 *[ إجابة صحيحة ومظفرة! ]* 👑\n\n` +
            `🎉 أحسنت أيها المحارب السيبراني الذكي!\n` +
            `💰 *تم إيداع 100 نقطة بنجاح في بنكك الشخصي!*\n` +
            `🏦 *رصيدك البنكي الحالي:* ${userData.bank} نقطة\n\n` +
            `▪️ 👑 ${channelName}`;

        await conn.reply(m.chat, wonText, m);
        await conn.sendMessage(m.chat, { react: { text: '🎉', key: m.key } });

        // مسح الفزورة النشطة فوراً
        delete userData.currentFzora;
        return true;
    }

    return false;
};

handler.help = ['فزوره', 'فزورة', 'لغز', 'فوازير'];
handler.tags = ['fun', 'game'];
handler.command = /^(فزوره|فزورة|لغز|فوازير)$/i;

export default handler;
