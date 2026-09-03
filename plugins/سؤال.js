// plugins/quiz.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰 - نظام الأسئلة التفاعلية المتقدم 🎯

import { theme } from '../core/theme.js';
import fs from 'fs';
import { join } from 'path';
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const questionsPath = join(process.cwd(), 'src', 'game', 'questions.json');
let questions = [];

try {
    if (fs.existsSync(questionsPath)) {
        const data = fs.readFileSync(questionsPath, 'utf8');
        questions = JSON.parse(data);
    }
} catch (err) {
    console.error('[Itachi-Quiz] خطأ في تحميل قاعدة البيانات:', err);
    questions = [];
}

function getQuestionsByCategory(category) {
    if (!questions.length) return [];
    if (category === 'منوع' || category === 'عام') return questions;

    return questions.filter(q => {
        const text = (q.question + ' ' + (q.response || '')).toLowerCase();
        if (category === 'أنمي') {
            return text.includes('أنمي') || text.includes('مانجا') || text.includes('ناروتو') || text.includes('لوفي') || text.includes('دراغون') || text.includes('ون بيس') || text.includes('ساسكي') || text.includes('اتاشي') || text.includes('غوكو');
        }
        if (category === 'رياضة') {
            return text.includes('كرة') || text.includes('دوري') || text.includes('ميسي') || text.includes('رونالدو') || text.includes('رياضة') || text.includes('ملعب') || text.includes('فريق') || text.includes('بطولة');
        }
        if (category === 'تاريخ') {
            return text.includes('حرب') || text.includes('عصر') || text.includes('تاريخ') || text.includes('ملك') || text.includes('سلطان') || text.includes('معركة') || text.includes('امبراطورية') || text.includes('خلافة');
        }
        if (category === 'جغرافيا') {
            return text.includes('عاصمة') || text.includes('دولة') || text.includes('نهر') || text.includes('جبل') || text.includes('بحر') || text.includes('قارة') || text.includes('محيط') || text.includes('بلد');
        }
        if (category === 'علوم') {
            return text.includes('عنصر') || text.includes('كوكب') || text.includes('فيزياء') || text.includes('كيمياء') || text.includes('ظاهرة') || text.includes('ذرة') || text.includes('فضاء') || text.includes('تفاعل');
        }
        return false;
    });
}

function getRandomQuestion(category = 'عام') {
    let pool = getQuestionsByCategory(category);
    if (!pool.length) pool = questions;
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

function getWrongAnswers(correctAnswer, category = 'عام', count = 3) {
    const wrong = [];
    const used = new Set();
    used.add(correctAnswer.toLowerCase());

    let categoryPool = getQuestionsByCategory(category);
    if (!categoryPool.length) categoryPool = questions;

    for (let q of categoryPool) {
        const ans = q.response;
        if (ans && !used.has(ans.toLowerCase()) && ans !== correctAnswer && wrong.length < count) {
            wrong.push(ans);
            used.add(ans.toLowerCase());
        }
    }

    const fallback = ['إيتاشي', 'الجوكر', 'ناروتو', 'ساسكي', 'لوفي', 'مادارا', 'غوكو', 'سراتوبي'];
    while (wrong.length < count) {
        const fb = fallback[Math.floor(Math.random() * fallback.length)];
        if (!used.has(fb.toLowerCase()) && fb !== correctAnswer) {
            wrong.push(fb);
            used.add(fb.toLowerCase());
        }
    }

    return wrong;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. معالجة اختيار الأقسام أو بدء السؤال
    if (text && text.startsWith('بدء_سؤال_')) {
        const category = text.replace('بدء_سؤال_', '');

        let activeQuestions = questions.length ? questions : [
            { question: "ما هي عاصمة اليابان؟", response: "طوكيو" },
            { question: "من هو بطل أنمي ناروتو؟", response: "ناروتو" },
            { question: "كم عدد سور القرآن الكريم؟", response: "114" },
            { question: "ما هو العنصر الكيميائي للذهب؟", response: "ذهب" }
        ];

        const q = getRandomQuestion(category) || activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
        const correctAnswer = q.response;
        const wrongAnswers = getWrongAnswers(correctAnswer, category, 3);
        const allAnswers = [correctAnswer, ...wrongAnswers];
        const shuffled = shuffle([...allAnswers]);

        const timestamp = Date.now();
        const userId = m.sender.split('@')[0];
        const correctCmd = `جواب_صحيح_${userId}_${timestamp}`;

        if (!global.db.data.users) global.db.data.users = {};
        if (!global.db.data.users[m.sender]) {
            global.db.data.users[m.sender] = {};
        }

        global.db.data.users[m.sender].currentQuiz = {
            question: q.question,
            correctAnswer: correctAnswer,
            correctCmd: correctCmd,
            askedAt: timestamp
        };

        const buttons = [];
        for (const answer of shuffled) {
            const isCorrect = answer === correctAnswer;
            const buttonCmd = isCorrect ? correctCmd : `جواب_خطأ_${userId}_${timestamp}_${answer.substring(0, 5)}`;

            buttons.push({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: answer.length > 35 ? answer.substring(0, 32) + '...' : answer,
                    id: `${usedPrefix}${buttonCmd}`
                })
            });
        }

        const menuText = theme.build([
            { type: 'title', text: `🎯 𝐈𝐭𝐚𝐜𝐡𝐢: اختبار قسم (${category})` },
            { type: 'spacer' },
            { type: 'line', text: `🔮 *${q.question}*` },
            { type: 'divider' },
            { type: 'info', label: '⏰ المهلة', value: '30 ثانية' },
            { type: 'info', label: '⭐ الجائزة', value: '100 نقطة' },
            { type: 'spacer' },
            { type: 'line', text: '⚔️ اختر الإجابة الصحيحة من الأزرار أدناه' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' }
        ]);

        const interactiveMessage = {
            body: { text: menuText },
            footer: { text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' },
            nativeFlowMessage: {
                buttons: buttons,
                messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                        list_title: `🎯 اختبار قسم ${category}`,
                        button_title: "▻ اختر إجابتك ⚡"
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

        setTimeout(async () => {
            const userData = global.db.data.users[m.sender];
            if (userData?.currentQuiz && userData.currentQuiz.askedAt === timestamp) {
                delete global.db.data.users[m.sender].currentQuiz;
                await conn.reply(m.chat, theme.build([
                    { type: 'title', text: '⏰ 𝐈𝐭𝐚𝐜𝐡𝐢: انتهى وقت المهمة' },
                    { type: 'line', text: `استخدم ${usedPrefix + command} لبدء اختبار جديد` },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' }
                ]), m);
            }
        }, 30000);

        return;
    }

    // 2. الواجهة الرئيسية لاختيار القسم (عند كتابة .سؤال)
    const coverImage = 'https://i.postimg.cc/Dz49XDBJ/32882135c22085dfaabfd5bed46f3197.jpg';
    const userName = m.pushName || m.sender.split('@')[0];

    const shortMenuText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝓣𝐇𝐄 𝐉𝐎𝐊𝑬𝑹 ] ── ✦ ── ❖\n` +
                          `🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤\n` +
                          `❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖\n` +
                          `🔹 *🎯 𝐈𝐭𝐚𝐜𝐡𝐢: "نظام التحدي والاختبارات الذكية"*  \n` +
                          `⚔️ *مرحباً بك يا* *@${userName}* *في ساحة المعرفة والتحدي*\n` +
                          `───────────────────\n` +
                          `▪️ 🔮 أهلاً بك يا بطل! اختر فئة الاختبار المفضلة لديك من قائمة الأزرار التفاعلية بالأسفل لاختبار معلوماتك وكسب النقاط.\n` +
                          `───────────────────\n` +
                          ` ┠ 🔸 *⭐ المكافأة:* 100 نقطة لكل إجابة صحيحة\n` +
                          ` ┠ 🔸 *⚡ الأقسام:* عامه، أنمي، رياضة، تاريخ، جغرافيا، علوم\n` +
                          `───────────────────\n` +
                          ` ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰\n` +
                          `❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖\n` +
                          `〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;

    const buttons = [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '🎯 أسئلة عامة ومنوعة',
                id: `${usedPrefix + command} بدء_سؤال_عام`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '⛩️ اسئلة الأنمي والمانجا',
                id: `${usedPrefix + command} بدء_سؤال_أنمي`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '⚽ اسئلة الرياضة والملاعب',
                id: `${usedPrefix + command} بدء_سؤال_رياضة`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '📜 اسئلة التاريخ والمعارك',
                id: `${usedPrefix + command} بدء_سؤال_تاريخ`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '🌍 اسئلة الجغرافيا والدول',
                id: `${usedPrefix + command} بدء_سؤال_جغرافيا`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '🔬 اسئلة العلوم والاكتشافات',
                id: `${usedPrefix + command} بدء_سؤال_علوم`
            })
        }
    ];

    const media = await prepareWAMessageMedia({ image: { url: coverImage } }, { upload: conn.waUploadToServer });

    const interactiveMessage = {
        body: { text: shortMenuText },
        footer: { text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' },
        header: {
            title: "🎯 ساحة التحدي والاختبارات",
            subtitle: "اختر القسم المناسب",
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
        },
        nativeFlowMessage: {
            buttons: buttons,
            messageParamsJson: JSON.stringify({
                bottom_sheet: {
                    list_title: "🎯 أقسام التحدي والاختبارات",
                    button_title: "📂 اختر قسم الأسئلة ⚡"
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

    // ✅ تم إزالة الخيار المعطوب `additionalNodes` بالكامل لأنه كان يسبب الخطأ لعدم توافق هيكل الـ tags
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    await conn.sendMessage(m.chat, { react: { text: '🎯', key: m.key } });
};

// 3. معالج الإجابات عبر الـ before لضمان استقبال تفاعل الأزرار بدقة
handler.before = async (m, { conn }) => {
    if (!m.text) return false;
    const cmd = m.text.toLowerCase();

    if (cmd.includes('جواب_صحيح_') || cmd.includes('جواب_خطأ_')) {
        const userQuiz = global.db?.data?.users?.[m.sender]?.currentQuiz;
        if (!userQuiz) {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '❄️ 𝐈𝐭𝐚𝐜𝐡𝐢: لا توجد مهمة نشطة' },
                { type: 'line', text: 'استخدم .سؤال لبدء تحدٍ جديد واختيار القسم' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' }
            ]), m);
            return true;
        }

        const isCorrect = cmd.includes(userQuiz.correctCmd.toLowerCase());

        if (!global.db.data.users) global.db.data.users = {};
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};

        if (isCorrect) {
            if (!global.db.data.users[m.sender].points) {
                global.db.data.users[m.sender].points = 0;
            }
            global.db.data.users[m.sender].points += 100;

            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '✅ 𝐈𝐭𝐚𝐜𝐡𝐢: إجابة صحيحة مبهرة' },
                { type: 'line', text: '🎉 أحسنت أيها المحارب العبقري! +100 نقطة' },
                { type: 'divider' },
                { type: 'info', label: 'الإجابة الصحيحة', value: userQuiz.correctAnswer },
                { type: 'info', label: 'إجمالي نقاطك', value: `${global.db.data.users[m.sender].points} نقطة` },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' }
            ]), m);
        } else {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '❌ 𝐈𝐭𝐚𝐜𝐡𝐢: إجابة خاطئة' },
                { type: 'line', text: 'للأسف لم تكن الإجابة دقيقة هذه المرة، حاول مجدداً' },
                { type: 'divider' },
                { type: 'info', label: 'الإجابة الصحيحة كانت', value: userQuiz.correctAnswer },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' }
            ]), m);
        }

        delete global.db.data.users[m.sender].currentQuiz;
        return true;
    }

    return false;
};

handler.command = ['سؤال_خيارات', 'سؤال', 'quiz'];
handler.tags = ['game'];
handler.help = ['سؤال'];

export default handler;
