// plugins/نوبوت.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ - Advanced Anti-Bot Security System 🛡️🤖

import fs from 'fs';

const detectedBots = {};
const antibotPath = './data/antibot.json';

// 🔥 الروابط المخصصة للميديا (الفيديو والصوت) عند كشف بوت
const MEDIA_URLS = {
    video: 'https://file.garden/aauvg01sjleV_ic1/VID-20260511-WA0128.mp4',
    audio: 'https://file.garden/aauvg01sjleV_ic1/VID-20260511-WA0128.mp3'
};

// التأكد من وجود مجلد وقاعدة بيانات الحماية
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
if (!fs.existsSync(antibotPath)) fs.writeFileSync(antibotPath, JSON.stringify({}, null, 2));

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isAdmin }) => {
    // التحقق من أن الأمر في مجموعة
    if (!m.isGroup) return m.reply('❌ هذا الأمر يخص المجموعات فقط!');

    // التحقق من الصلاحيات (المطور أو المشرف)
    if (!isOwner && !isAdmin) return m.reply('⚠️ عذراً، هذا الأمر مخصص للمشرفين والمطورين فقط!');

    let chatId = m.chat;
    let antibott = {};
    try {
        antibott = JSON.parse(fs.readFileSync(antibotPath));
    } catch {
        antibott = {};
    }
    let antibot = antibott[chatId] === true;

    // تفعيل مضاد البوتات
    if (args[0] === "اون" || args[0] === "on" || args.includes("تشغيل")) {
        if (antibot) return m.reply("🛡️ *مضاد البوتات مفعل بالفعل في هذا الجروب!*");
        antibott[chatId] = true;
        fs.writeFileSync(antibotPath, JSON.stringify(antibott, null, 2));
        return m.reply("✅ *تم تفعيل نظام مضاد البوتات بنجاح! سيتم رصد وطرد أي بوت غريب فوراً.*");
    }
    // تعطيل مضاد البوتات
    else if (args[0] === "اوف" || args[0] === "off" || args.includes("ايقاف")) {
        if (!antibot) return m.reply("❌ *مضاد البوتات معطل أصلاً!*");
        delete antibott[chatId];
        fs.writeFileSync(antibotPath, JSON.stringify(antibott, null, 2));
        return m.reply("❌ *تم تعطيل نظام مضاد البوتات.*");
    }
    // عرض حالة النظام
    else {
        let status = antibot ? '🟢 مفعل (يحمي المجموعة)' : '🔴 معطل';
        let usageText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
🛡️ *نظام حماية المجموعة (مضاد البوتات)*
───────────────────
📊 *الحالة الحالية:* ${status}
 
📌 *طريقة الاستخدام:*
 ┠ 🔸 *${usedPrefix + command} اون* (لتشغيل الحماية)
 ┠ 🔸 *${usedPrefix + command} اوف* (لإيقاف الحماية)
───────────────────
▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
        return m.reply(usageText);
    }
};

// المراقب الأمني الذكي الذي يعمل في الخلفية لكل رسالة
handler.before = async function (m, { conn }) {
    try {
        // 1. التأكد أن الرسالة داخل مجموعة
        if (!m.isGroup) return false;

        let chatId = m.chat;
        let antibott = {};
        try {
            antibott = JSON.parse(fs.readFileSync(antibotPath));
        } catch {
            return false;
        }

        // 2. التحقق مما إذا كان النظام مفعلاً في المجموعة
        if (antibott[chatId] !== true) return false;

        // 3. استثناء رسائل البوت الشخصية
        if (m.key.fromMe) return false;

        // 4. تحليل بصمة الرسالة للكشف عن البوتات بدقة متناهية
        let msgId = m.key?.id || m.id || '';
        let isBot = false;
        let botType = 'Unknown Bot';

        if (msgId && msgId.length > 0) {
            if (msgId.startsWith('3EB0') && msgId.length < 25) { isBot = true; botType = 'Baileys Core Bot'; }
            else if (msgId.startsWith('BAE5') && msgId.length === 16) { isBot = true; botType = 'Baileys v2 Bot'; }
            else if (msgId.startsWith('B24E') && msgId.length === 20) { isBot = true; botType = 'Baileys v3 Bot'; }
            else if (msgId.startsWith('8SCO') && msgId.length === 20) { isBot = true; botType = 'Baileys v4 Bot'; }
            else if (msgId.startsWith('NJX-')) { isBot = true; botType = 'NJX Bot Engine'; }
        }

        if (!isBot) return false;

        // 5. فك وتجهيز معرف المستخدم (JID)
        let senderId = m.sender;
        if (typeof conn.decodeJid === 'function') {
            senderId = conn.decodeJid(senderId);
        }
        let senderNum = senderId.split('@')[0];

        // 6. منع تكرار معالجة نفس البوت في غضون ثوانٍ معدودة
        if (detectedBots[chatId]?.includes(senderId)) return false;
        if (!detectedBots[chatId]) detectedBots[chatId] = [];
        detectedBots[chatId].push(senderId);

        let fixedChatId = typeof conn.decodeJid === 'function' ? conn.decodeJid(chatId) : chatId;

        // 7. إرسال الوسائط التحذيرية الهجومية (فيديو وصوت)
        try {
            await conn.sendMessage(fixedChatId, {
                video: { url: MEDIA_URLS.video },
                gifPlayback: true,
                caption: `🚨 *[ نظام رصد الاختراق - JOKER SECURITY ]* 🚨\n\n⚠️ *تم رصد واكتشاف بوت متسلل!*\n👤 *رقم البوت:* @${senderNum}\n🔍 *نوع المحرك:* ${botType}\n⚡ *الإجراء:* جاري الطرد الفوري...`,
                mentions: [senderId]
            });

            await conn.sendMessage(fixedChatId, {
                audio: { url: MEDIA_URLS.audio },
                mimetype: 'audio/mpeg',
                ptt: false
            });
        } catch (mediaErr) {
            console.error('[Anti-Bot Media Error]:', mediaErr);
            await conn.sendMessage(fixedChatId, {
                text: `🚨 *تم رصد بوت مخترق!*\n📞 الرقم: @${senderNum}\n🏷️ النوع: ${botType}\n⚡ جاري الطرد...`,
                mentions: [senderId]
            });
        }

        // 8. تنفيذ أمر الطرد الفوري (Remove)
        try {
            await conn.groupParticipantsUpdate(fixedChatId, [senderId], "remove");
            await conn.sendMessage(fixedChatId, {
                text: `✅ *تم التخلص من البوت بنجاح وطرده من الجروب!*\n📞 الرقم: @${senderNum}\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                mentions: [senderId]
            });
        } catch (err) {
            await conn.sendMessage(fixedChatId, {
                text: `⚠️ *فشلت عملية الطرد!* يرجى التأكد من أن بوت الجوكر يمتلك صلاحية "مشرف" (Admin) في المجموعة.\n📞 رقم البوت المخترق: @${senderNum}`,
                mentions: [senderId]
            });
        }

        // 9. تنظيف الذاكرة المؤقتة للبوت بعد 10 ثوانٍ
        setTimeout(() => {
            if (detectedBots[chatId]) {
                const index = detectedBots[chatId].indexOf(senderId);
                if (index > -1) detectedBots[chatId].splice(index, 1);
            }
        }, 10000);

        return false;

    } catch (e) {
        console.error('❌ خطأ فادح في نظام مضاد البوتات:', e);
        return false;
    }
};

handler.command = /^(مضاد_البوتات|antibot|نوبوت|مضاد)$/i;
handler.tags = ['group'];
handler.group = true;
handler.botAdmin = true;

export default handler;
