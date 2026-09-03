// plugins/game-kt.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — لعبة الألغاز والتحدي السيبرانية 📝🔥

import fs from 'fs';
import { join } from 'path';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

// جلب أسئلة اللعبة بأمان
const ktPath = join(process.cwd(), 'src', 'game', 'كت.json');
let ktQuestions = [];

try {
    const data = fs.readFileSync(ktPath, 'utf8');
    ktQuestions = JSON.parse(data);
} catch (err) {
    console.error('[ITACHI-KT] خطأ في تحميل ملف الأسئلة:', err);
    ktQuestions = [];
}

// دالة لاختيار سؤال عشوائي
function getRandomQuestion() {
    if (!ktQuestions.length) return null;
    return ktQuestions[Math.floor(Math.random() * ktQuestions.length)];
}

// دالة جلب إجابات خاطئة دقيقة ومقاومة للتكرار
function getWrongAnswers(correctAnswer, count = 3) {
    const wrong = [];
    const used = new Set();
    used.add(correctAnswer.toLowerCase().trim());

    // جمع الإجابات الخاطئة من نفس الملف أولاً
    for (let q of ktQuestions) {
        const ans = q.response;
        if (ans && !used.has(ans.toLowerCase().trim()) && ans.trim() !== correctAnswer.trim() && wrong.length < count) {
            wrong.push(ans.trim());
            used.add(ans.toLowerCase().trim());
        }
    }

    // إجابات احتياطية في حال كان الملف صغيراً
    const fallback = ['برمجة', 'ذكاء اصطناعي', 'سيبراني', 'إيتاشي', 'الجوكر', 'خوارزمية', 'سيرفر', 'قاعدة بيانات', 'تشفير', 'نظام'];
    while (wrong.length < count) {
        const fb = fallback[Math.floor(Math.random() * fallback.length)];
        if (!used.has(fb.toLowerCase()) && fb !== correctAnswer) {
            wrong.push(fb);
            used.add(fb.toLowerCase());
        }
    }

    return wrong;
}

// خوارزمية خلط العشوائية (Fisher-Yates) لتوزيع الأزرار باحترافية
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        if (!ktQuestions.length) {
            return conn.reply(
                m.chat,
                `👑 *[ وحدة الألغاز السيبرانية ]* 👑\n\n` +
                `⚠️ *خطأ فادح:* قاعدة بيانات الأسئلة (كت.json) فارغة أو غير موجودة!\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
        }

        const q = getRandomQuestion();
        if (!q) {
            throw new Error('فشل في جلب السؤال العشوائي');
        }

        const correctAnswer = q.response.trim();
        const wrongAnswers = getWrongAnswers(correctAnswer, 3);
        const allAnswers = [correctAnswer, ...wrongAnswers];
        const shuffled = shuffle([...allAnswers]);

        const timestamp = Date.now();
        const userId = m.sender.split('@')[0];
        const correctCmd = `كت_صحيح_${userId}_${timestamp}`;

        // تهيئة قاعدة البيانات للمستخدم إن لم تكن موجودة
        if (!global.db.data.users) global.db.data.users = {};
        if (!global.db.data.users[m.sender]) {
            global.db.data.users[m.sender] = { points: 0 };
        }

        // تخزين بيانات السؤال النشط للمستخدم
        global.db.data.users[m.sender].currentKt = {
            question: q.question,
            correctAnswer: correctAnswer,
            correctCmd: correctCmd,
            askedAt: timestamp
        };

        // بناء الأزرار التفاعلية بشكل آمن (مع تتبع معرف فريد لكل زر لضمان عدم التداخل)
        const buttons = [];
        for (let i = 0; i < shuffled.length; i++) {
            const answer = shuffled[i];
            const isCorrect = answer === correctAnswer;
            const buttonCmd = isCorrect ? correctCmd : `كت_خطأ_${userId}_${timestamp}_${i}`;

            buttons.push({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: answer.length > 35 ? answer.substring(0, 32) + '...' : answer,
                    id: `.${buttonCmd}`
                })
            });
        }

        // تصميم الواجهة السيبرانية النظيفة (بدون علامات > المزعجة، خط واضح ومتناسق)
        const menuText = 
            `👑 *[ تحدي الألغاز السيبرانية ]* 👑\n\n` +
            `🔮 *السؤال:* ${q.question}\n\n` +
            `⏰ *المهلة الزمنية:* 30 ثانية\n` +
            `⭐ *الجائزة الكبرى:* 100 نقطة\n\n` +
            `⚔️ *اختر الإجابة الصحيحة من الأزرار أدناه:*`;

        const interactiveMessage = {
            body: { text: menuText },
            footer: { text: '▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' },
            nativeFlowMessage: {
                buttons: buttons,
                messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                        list_title: "📝 اختر الإجابة الصحيحة",
                        button_title: "▻ خيارات التحدي ⚡"
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

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        // مؤقت انتهاء وقت السؤال (30 ثانية)
        setTimeout(async () => {
            try {
                const userData = global.db.data.users[m.sender];
                if (userData?.currentKt && userData.currentKt.askedAt === timestamp) {
                    delete global.db.data.users[m.sender].currentKt;
                    await conn.reply(
                        m.chat,
                        `👑 *[ انتهاء وقت التحدي ]* 👑\n\n` +
                        `⏰ لقد انتهت الـ 30 ثانية ولم تقم بالإجابة!\n` +
                        `🔮 استخدم \`${usedPrefix + command}\` لبدء تحدٍ جديد.\n\n` +
                        `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                        m
                    );
                }
            } catch (err) {}
        }, 30000);

    } catch (e) {
        console.error('[ITACHI-KT Error]:', e);
        await m.reply(`👑 *خطأ في النظام:* ${e.message}`);
    }
};

// معالج الأزرار والإجابات (handler.before)
handler.before = async (m, { conn }) => {
    if (!m.isCommand) return false;
    if (!m.text) return false;

    const cmd = m.text.toLowerCase();

    if (cmd.startsWith('.كت_صحيح_') || cmd.startsWith('.كت_خطأ_')) {
        const userKt = global.db.data.users[m.sender]?.currentKt;

        if (!userKt) {
            await conn.reply(
                m.chat,
                `👑 *[ وحدة الألغاز السيبرانية ]* 👑\n\n` +
                `⚠️ *انتبه:* لا توجد مهمة نشطة لك حالياً، أو أن الوقت قد انتهى!\n` +
                `🔮 استخدم الأمر \`.كت\` لبدء تحدٍ جديد.\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
            return true;
        }

        const isCorrect = cmd === `.${userKt.correctCmd}`;

        if (!global.db.data.users[m.sender].points) {
            global.db.data.users[m.sender].points = 0;
        }

        if (isCorrect) {
            global.db.data.users[m.sender].points += 100;
            await conn.reply(
                m.chat,
                `👑 *[ إجابة صحيحة ومظفرة! ]* 👑\n\n` +
                `🎉 أحسنت أيها المحارب السيبراني!\n` +
                `💰 *المكاسب:* +100 نقطة\n` +
                `🔮 *الإجابة الدقيقة:* ${userKt.correctAnswer}\n` +
                `⭐ *رصيدك الإجمالي:* ${global.db.data.users[m.sender].points} نقطة\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
        } else {
            await conn.reply(
                m.chat,
                `👑 *[ إجابة خاطئة ]* 👑\n\n` +
                `❌ للأسف، لقد فشلت في هذا السؤال.\n` +
                `🔮 *الإجابة الصحيحة كانت:* ${userKt.correctAnswer}\n` +
                `⭐ *رصيدك الحالي:* ${global.db.data.users[m.sender].points} نقطة\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
        }

        // مسح السؤال النشط فوراً لمنع التكرار أو الغش
        delete global.db.data.users[m.sender].currentKt;
        return true;
    }

    return false;
};

handler.command = ['كت', 'kt'];
handler.tags = ['game', 'fun'];
handler.help = ['كت'];

export default handler;
