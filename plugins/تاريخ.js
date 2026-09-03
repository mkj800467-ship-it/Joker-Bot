// plugins/game-history.js
// ✧ THE JOKER & ITACHI - لعبة التاريخ 📜

import { theme } from '../core/theme.js';
import fs from 'fs';
import { join } from 'path';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

// جلب أسئلة التاريخ
const historyPath = join(process.cwd(), 'src', 'game', 'تاريخ.json');
let historyQuestions = [];

try {
    const data = fs.readFileSync(historyPath, 'utf8');
    historyQuestions = JSON.parse(data);
} catch (err) {
    console.error('خطأ في تحميل أسئلة التاريخ:', err);
    historyQuestions = [];
}

function getRandomQuestion() {
    return historyQuestions[Math.floor(Math.random() * historyQuestions.length)];
}

function getWrongAnswers(correctAnswer, count = 3) {
    const wrong = [];
    const used = new Set();
    used.add(correctAnswer.toLowerCase());

    for (let q of historyQuestions) {
        const ans = q.response;
        if (!used.has(ans.toLowerCase()) && ans !== correctAnswer && wrong.length < count) {
            wrong.push(ans);
            used.add(ans.toLowerCase());
        }
    }

    const fallback = ['صلاح الدين', 'عمر بن الخطاب', 'نابليون', 'الإسكندر الأكبر', 'هتلر', 'محمد الفاتح', 'هارون الرشيد', 'المعتصم'];
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

let handler = async (m, { conn }) => {

    if (!historyQuestions.length) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: 'خـطـأ في اللعبة' },
            { type: 'divider' },
            { type: 'error', text: 'لا توجد أسئلة في قاعدة بيانات التاريخ.' }
        ]), m);
    }

    const q = getRandomQuestion();
    const correctAnswer = q.response;
    const wrongAnswers = getWrongAnswers(correctAnswer, 3);
    const allAnswers = [correctAnswer, ...wrongAnswers];
    const shuffled = shuffle([...allAnswers]);

    const timestamp = Date.now();
    const userId = m.sender.split('@')[0];

    const correctCmd = `تاريخ_صحيح_${userId}_${timestamp}`;

    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {};
    }

    global.db.data.users[m.sender].currentHistory = {
        question: q.question,
        correctAnswer: correctAnswer,
        correctCmd: correctCmd,
        askedAt: timestamp
    };

    // بناء الأزرار التفاعلية
    const buttons = [];
    for (const answer of shuffled) {
        const isCorrect = answer === correctAnswer;
        const buttonCmd = isCorrect ? correctCmd : `تاريخ_خطأ_${userId}_${timestamp}_${answer.substring(0, 5)}`;

        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: answer.length > 35 ? answer.substring(0, 32) + '...' : answer,
                id: `.${buttonCmd}`
            })
        });
    }

    const menuText = theme.build([
        { type: 'title', text: 'لـعـبـة الـتـاريـخ' },
        { type: 'divider' },
        { type: 'info', label: 'السؤال', value: q.question },
        { type: 'divider' },
        { type: 'info', label: 'الوقت المتاح', value: '30 ثانية' },
        { type: 'info', label: 'الجائزة', value: '100 نقطة' }
    ]);

    const interactiveMessage = {
        body: { text: menuText },
        footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚫 ✧' },
        nativeFlowMessage: {
            buttons: buttons,
            messageParamsJson: JSON.stringify({
                bottom_sheet: {
                    list_title: "اختر الإجابة الصحيحة",
                    button_title: "الخيارات"
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
    }, { 
        userJid: conn.user.jid, 
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

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    // حذف السؤال بعد 30 ثانية
    setTimeout(async () => {
        const userData = global.db.data.users[m.sender];
        if (userData?.currentHistory && userData.currentHistory.askedAt === timestamp) {
            delete global.db.data.users[m.sender].currentHistory;
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: 'انـتـهـى الـوقـت' },
                { type: 'divider' },
                { type: 'error', text: 'انتهت ال30 ثانية، استخدم .تاريخ للعب مرة أخرى.' }
            ]), m);
        }
    }, 30000);
};

// 🔥 معالج الأزرار
handler.before = async (m, { conn }) => {
    if (!m.isCommand) return false;
    if (!m.text) return false;

    const cmd = m.text.toLowerCase();

    if (cmd.startsWith('.تاريخ_صحيح_') || cmd.startsWith('.تاريخ_خطأ_')) {

        const userHistory = global.db.data.users[m.sender]?.currentHistory;
        if (!userHistory) {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: 'خـطـأ في اللعبة' },
                { type: 'divider' },
                { type: 'error', text: 'لا يوجد سؤال نشط حالياً، استخدم .تاريخ لبدء اللعبة.' }
            ]), m);
            return true;
        }

        const isCorrect = cmd === `.${userHistory.correctCmd}`;

        if (isCorrect) {
            if (!global.db.data.users[m.sender].points) {
                global.db.data.users[m.sender].points = 0;
            }
            global.db.data.users[m.sender].points += 100;

            await conn.reply(m.chat, theme.build([
                { type: 'title', text: 'إجـابـة صـحـيـحـة' },
                { type: 'divider' },
                { type: 'info', label: 'النتيجة', value: 'أحسنت! +100 نقطة' },
                { type: 'info', label: 'الإجابة', value: userHistory.correctAnswer },
                { type: 'info', label: 'إجمالي النقاط', value: `${global.db.data.users[m.sender].points} نقطة` }
            ]), m);
        } else {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: 'إجـابـة خـاطـئـة' },
                { type: 'divider' },
                { type: 'info', label: 'النتيجة', value: 'للأسف إجابتك غير صحيحة' },
                { type: 'info', label: 'الإجابة الصحيحة', value: userHistory.correctAnswer }
            ]), m);
        }

        delete global.db.data.users[m.sender].currentHistory;
        return true;
    }

    return false;
};

handler.command = ['تاريخ', 'history'];
handler.tags = ['game'];
handler.help = ['تاريخ'];

export default handler;

