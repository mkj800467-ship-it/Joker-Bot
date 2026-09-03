// plugins/game-flag.js
// ✧ UCHIHA - Uchiha Itachi - لعبة أعلام الدول 🏁

import { theme } from '../core/theme.js';
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const timeout = 60000;
const rewardPoints = 20; // 20 نقطة
const rewardCoins = 5;   // 5 ذهب

// دالة لقراءة قاعدة البيانات الموحدة للمجموعة للبنك
function loadDatabase(chatId) {
    try {
        const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global';
        const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`);

        if (!fs.existsSync(dbPath)) {
            const dir = path.dirname(dbPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
        }
        const data = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error('[Game DB Error]', e);
        return {};
    }
}

// دالة لحفظ قاعدة البيانات الموحدة للمجموعة للبنك
function saveDatabase(chatId, data) {
    try {
        const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global';
        const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`);
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('[Game Save Error]', e);
    }
}

let handler = async (m, { conn, command, usedPrefix }) => {
    conn.obito = conn.obito || {};
    let id = m.chat;

    // 🎯 معالج الإجابة على الأزرار
    if (command.startsWith('اجاب_')) {
        let obito = conn.obito ? conn.obito[id] : null;

        if (!obito) {
            await m.react('⏳');
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '⚠️ إتاتشي: "تنبيه"' },
                { type: 'subtitle', text: 'لا توجد مهمة نشطة الآن' }
            ]), m);
        }

        let selectedAnswerIndex = parseInt(command.split('_')[1]);
        if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 1 || selectedAnswerIndex > 4) {
            await m.react('❌');
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '👁️ إتاتشي: "اختيار غير صالح"' }
            ]), m);
        }

        let selectedAnswer = obito.options[selectedAnswerIndex - 1];
        let isCorrect = obito.correctAnswer === selectedAnswer;

        if (isCorrect) {
            await m.react('✅');

            // تحميل بيانات البنك الخاصة بالمجموعة
            let db = loadDatabase(m.chat);
            let isNewUser = false;

            // إنشاء حساب بنكي تلقائي للاعب إذا لم يكن مسجلاً
            if (!db[m.sender]) {
                db[m.sender] = {
                    name: m.pushName || m.sender.split('@')[0],
                    title: 'مستخدم جديد',
                    coins: 0,
                    diamonds: 5,
                    points: 0,
                    wallet: 0,
                    rankLevel: 1,
                    lastDaily: 0,
                    lastMissionDate: '',
                    missionCompletedToday: false
                };
                isNewUser = true;
            }

            // إضافة المكافأة (20 نقطة و 5 ذهب)
            db[m.sender].coins = (db[m.sender].coins || 0) + rewardCoins;
            db[m.sender].points = (db[m.sender].points || 0) + rewardPoints;
            saveDatabase(m.chat, db);

            let newUserNotice = '';
            if (isNewUser) {
                newUserNotice = `\n ⚠️ *تنبيه بنكي:* تم فتح حساب جديد لك باللقب الافتراضي (*مستخدم جديد*).\n 💡 *لتغيير لقبك استخدم الأمر:* *${usedPrefix || '.'}تغيير_لقب مستخدم جديد | لقبك_الجديد*\n`;
            }

            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '✅ إتاتشي: "إجابة صحيحة"' },
                { type: 'line', text: `🎉 أحسنت أيها المحارب! لقد أثبت إدراكاتك الثاقبة +${rewardPoints} نقطة و +${rewardCoins} ذهب` },
                { type: 'divider' },
                { type: 'info', label: 'الدولة', value: obito.correctAnswer },
                { type: 'info', label: 'الرصيد البنكي', value: `${db[m.sender].coins} ذهبة (${db[m.sender].points} نقطة)` },
                { type: 'line', text: newUserNotice.trim() }
            ]), m);

            clearTimeout(obito.timer);
            delete conn.obito[id];
        } else {
            obito.attempts -= 1;

            if (obito.attempts > 0) {
                await m.react('❌');
                await conn.reply(m.chat, theme.build([
                    { type: 'title', text: '❌ إتاتشي: "إجابة خاطئة"' },
                    { type: 'info', label: 'المحاولات المتبقية', value: obito.attempts },
                    { type: 'divider' },
                    { type: 'line', text: '👁️ استعن بالشارينگان وحاول مرة أخرى' }
                ]), m);
            } else {
                await m.react('❌');
                await conn.reply(m.chat, theme.build([
                    { type: 'title', text: '❌ إتاتشي: "انتهت المحاولات"' },
                    { type: 'info', label: 'الإجابة الصحيحة', value: obito.correctAnswer }
                ]), m);
                clearTimeout(obito.timer);
                delete conn.obito[id];
            }
        }
        return;
    }

    // 🎯 بدء مهمة جديدة
    try {
        if (conn.obito[id]) {
            await m.react('⏳');
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '⚠️ إتاتشي: "تنبيه"' },
                { type: 'subtitle', text: 'لديك مهمة نشطة بالفعل' }
            ]), m);
        }

        // جلب بيانات الأعلام
        const response = await fetch('https://raw.githubusercontent.com/ze819/game/master/src/game.js/luffy1.json');
        const obitoData = await response.json();

        if (!obitoData.length) throw new Error('No data');

        const obitoItem = obitoData[Math.floor(Math.random() * obitoData.length)];
        const { img, name } = obitoItem;

        // توليد خيارات عشوائية
        let options = [name];
        while (options.length < 4) {
            let randomItem = obitoData[Math.floor(Math.random() * obitoData.length)].name;
            if (!options.includes(randomItem)) options.push(randomItem);
        }
        options.sort(() => Math.random() - 0.5);

        const media = await prepareWAMessageMedia(
            { image: { url: img } }, 
            { upload: conn.waUploadToServer }
        );

        // بناء الأزرار
        const buttons = options.map((option, index) => ({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `${theme.blood || '⚡'} ${option}`,
                id: `.اجاب_${index + 1}`
            })
        }));

        const interactiveMessage = {
            body: { 
                text: theme.build([
                    { type: 'title', text: '🏁 إتاتشي: "مهمة أعلام الدول"' },
                    { type: 'spacer' },
                    { type: 'line', text: '🔮 *ما هي الدولة صاحبة هذا العلم؟*' },
                    { type: 'divider' },
                    { type: 'info', label: '⏰ الوقت', value: '60 ثانية' },
                    { type: 'info', label: '⭐ الجائزة', value: `${rewardPoints} نقطة و ${rewardCoins} ذهب` },
                    { type: 'info', label: '🎯 المحاولات', value: '2' }
                ]) 
            },
            footer: { text: '⛩️ Uchiha Itachi - Sharingan Flag ⛩️' },
            header: {
                hasMediaAttachment: true,
                subtitle: '🏁 اختر الدولة الصحيحة',
                imageMessage: media.imageMessage,
            },
            nativeFlowMessage: {
                buttons: buttons,
                messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                        list_title: "🏁 اختر اسم الدولة",
                        button_title: "▻ الخيارات ⚡"
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
            { userJid: conn.user.jid, quoted: m }
        );

        await m.react('🏁');
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        conn.obito[id] = {
            correctAnswer: name,
            options: options,
            attempts: 2,
            timer: setTimeout(async () => {
                if (conn.obito[id]) {
                    await conn.reply(m.chat, theme.build([
                        { type: 'title', text: '⏰ إتاتشي: "انتهى وقت المهمة"' },
                        { type: 'info', label: 'الإجابة الصحيحة', value: name }
                    ]), m);
                    delete conn.obito[id];
                }
            }, timeout)
        };

    } catch (e) {
        console.error('[Itachi-Flag]', e);
        await m.react('❌');
        conn.reply(m.chat, theme.build([
            { type: 'title', text: '⛩️ إتاتشي: "فشلت المهمة"' },
            { type: 'warning', text: 'حدث خطأ أثناء بدء اللعبة' }
        ]), m);
    }
};

handler.help = ['علم'];
handler.tags = ['game'];
handler.command = /^(علم|اعلام|اجاب_\d+)$/i;

export default handler;
