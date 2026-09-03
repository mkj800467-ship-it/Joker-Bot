// plugins/game-emoji.js
// ✧ THE JOKER & ITACHI - لعبة الأيموجي 🃏

import { theme } from '../core/theme.js';
import fs from 'fs';
import { join } from 'path';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

// جلب أسئلة الأيموجي
const emojiPath = join(process.cwd(), 'src', 'game', 'mi.json');
let emojiQuestions = [];

try {
    const data = fs.readFileSync(emojiPath, 'utf8');
    emojiQuestions = JSON.parse(data);
} catch (err) {
    console.error('خطأ في تحميل أسئلة الأيموجي:', err);
    emojiQuestions = [];
}

function getRandomQuestion() {
    return emojiQuestions[Math.floor(Math.random() * emojiQuestions.length)];
}

function getWrongAnswers(correctAnswer, count = 3) {
    const wrong = [];
    const used = new Set();
    used.add(correctAnswer.toLowerCase());

    for (let q of emojiQuestions) {
        const ans = q.response;
        if (!used.has(ans.toLowerCase()) && ans !== correctAnswer && wrong.length < count) {
            wrong.push(ans);
            used.add(ans.toLowerCase());
        }
    }

    const fallback = ['😊 سعيد', '😂 ضحك', '😢 حزين', '😡 غاضب', '😍 حب', '🤔 تفكير', '🥺 توسل', '😎 رائع'];
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

    if (!emojiQuestions.length) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '🃏 خـطـأ في العدم' },
            { type: 'subtitle', text: 'لا توجد أسئلة أيموجي مسجلة في ذاكرة البوت' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]), m);
    }

    const q = getRandomQuestion();
    const correctAnswer = q.response;
    const wrongAnswers = getWrongAnswers(correctAnswer, 3);
    const allAnswers = [correctAnswer, ...wrongAnswers];
    const shuffled = shuffle([...allAnswers]);

    const timestamp = Date.now();
    const userId = m.sender.split('@')[0];

    const correctCmd = `ايموجي_صحيح_${userId}_${timestamp}`;

    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {};
    }

    global.db.data.users[m.sender].currentEmoji = {
        question: q.question,
        correctAnswer: correctAnswer,
        correctCmd: correctCmd,
        askedAt: timestamp
    };

    // بناء الأزرار التفاعلية
    const buttons = [];
    for (const answer of shuffled) {
        const isCorrect = answer === correctAnswer;
        const buttonCmd = isCorrect ? correctCmd : `ايموجي_خطأ_${userId}_${timestamp}_${answer.substring(0, 5)}`;

        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: answer.length > 35 ? answer.substring(0, 32) + '...' : answer,
                id: `.${buttonCmd}`
            })
        });
    }

    const menuText = theme.build([
        { type: 'title', text: '🃏 لـعـبـة الأيـمـوجـي الـفـلسـفـيـة' },
        { type: 'divider' },
        { type: 'line', text: `❄️ اللغز: *${q.question}*` },
        { type: 'divider' },
        { type: 'info', label: '⚔️ التحدي', value: 'اختر المعنى الخفي من الأزرار أدناه' },
        { type: 'info', label: '⏰ الوقت', value: '30 ثانية' },
        { type: 'info', label: '🎁 الجائزة', value: '100 نقطة' },
        { type: 'divider' },
        { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
    ]);

    const interactiveMessage = {
        body: { text: menuText },
        footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧' },
        nativeFlowMessage: {
            buttons: buttons,
            messageParamsJson: JSON.stringify({
                bottom_sheet: {
                    list_title: "🃏 اختر المعنى الصحيح",
                    button_title: "⚔️ خيارات العدم"
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

    // حذف السؤال بعد 30 ثانية إن لم يتم الإجابة
    setTimeout(async () => {
        const userData = global.db.data.users[m.sender];
        if (userData?.currentEmoji && userData.currentEmoji.askedAt === timestamp) {
            delete global.db.data.users[m.sender].currentEmoji;
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '⏰ انـتـهـى الـوقـت' },
                { type: 'subtitle', text: 'لقد تبخرت الإجابة في هواء العدم.. استخدم .ايموجي مرة أخرى' },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]), m);
        }
    }, 30000);
};

// معالج الأزرار التفاعلية
handler.before = async (m, { conn }) => {
    if (!m.isCommand) return false;
    if (!m.text) return false;

    const cmd = m.text.toLowerCase();

    if (cmd.startsWith('.ايموجي_صحيح_') || cmd.startsWith('.ايموجي_خطأ_')) {

        const userEmoji = global.db.data.users[m.sender]?.currentEmoji;
        if (!userEmoji) {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '🃏 لا يوجد سؤال نشط' },
                { type: 'subtitle', text: 'انتهت صلاحية هذا التحدي أو أنك أجبَت مسبقاً.' },
                { type: 'divider' },
                { type: 'line', text: '⚔️ استخدم .ايموجي لبدء لعبة جديدة' }
            ]), m);
            return true;
        }

        const isCorrect = cmd === `.${userEmoji.correctCmd}`;

        if (isCorrect) {
            if (!global.db.data.users[m.sender].points) {
                global.db.data.users[m.sender].points = 0;
            }
            global.db.data.users[m.sender].points += 100;

            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '✅ إجـابـة صـحـيـحـة وعبقرية' },
                { type: 'subtitle', text: '🎉 لقد أدركت الحقيقة! +100 نقطة' },
                { type: 'divider' },
                { type: 'info', label: 'المعنى الصحيح', value: userEmoji.correctAnswer },
                { type: 'info', label: 'رصيدك الحالي', value: `${global.db.data.users[m.sender].points} نقطة` },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]), m);
        } else {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '❌ إجـابـة خـاطـئـة' },
                { type: 'subtitle', text: 'الابتسامة وحدها لا تكفي.. لقد أخطأت الوجهة في عالم الأقنعة.' },
                { type: 'divider' },
                { type: 'info', label: 'المعنى الحقيقي كان', value: userEmoji.correctAnswer },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]), m);
        }

        delete global.db.data.users[m.sender].currentEmoji;
        return true;
    }

    return false;
};

handler.command = ['ايموجي', 'emoji'];
handler.tags = ['game'];
handler.help = ['ايموجي'];

export default handler;
