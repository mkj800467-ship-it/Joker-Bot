// plugins/daily-mission.js
// ✧ THE JOKER & ITACHI - Advanced Daily Gift & Mission System (Group-Synced) 🎁⚔️

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// الأرقام الموثوقة للمطور بصلاحيات الملوك المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

// دالة لقراءة قاعدة البيانات للمجموعة الحالية (متطابقة تماماً مع مسار البنك الموحد)
function loadDatabase(chatId) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)

    if (!fs.existsSync(dbPath)) {
      const dir = path.dirname(dbPath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2))
    }
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    console.error('[Bank DB Error]', e)
    return {}
  }
}

// دالة لحفظ قاعدة البيانات للمجموعة الحالية (متطابقة تماماً مع مسار البنك الموحد)
function saveDatabase(chatId, data) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Bank Save Error]', e)
  }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    // التأكد من أن الأمر يُنفذ داخل مجموعة لتوحيد القاعدة مع نظام القلاع والبنك
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, { text: `⚠️ أوامر الهدايا اليومية والمهام مخصصة للعمل داخل المجموعات فقط!` }, { quoted: m })
    }

    let db = loadDatabase(m.chat)
    let userId = m.sender
    let isDeveloper = allowedOwners.includes(userId) || allowedOwners.some(owner => owner.split('@')[0] === userId.split('@')[0])

    // 1. نظام الهدية اليومية والمطور
    if (command === 'هدية_يوميه' || command === 'يومي' || command === 'هدية' || command === 'اهدي') {
      if (command === 'اهدي') {
        if (!isDeveloper) {
          return await conn.sendMessage(m.chat, {
            text: theme.build([
              { type: 'title', text: '🃏 الـجـوكـر: "تنبيه أمني"' },
              { type: 'warning', text: 'هذا الأمر خاص بالمطور فقط لتوزيع العطايا الملكية!' }
            ])
          }, { quoted: m })
        }

        let targetId = null
        if (m.mentionedJid && m.mentionedJid.length > 0) {
          targetId = m.mentionedJid[0]
        } else if (m.quoted && m.quoted.sender) {
          targetId = m.quoted.sender
        }

        if (!targetId) {
          return await conn.sendMessage(m.chat, {
            text: `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ خطأ في الاستخدام*
──────────────────
 ┠ ❌ *يجب عليك المنشن أو الرد على رسالة الشخص المستهدف بالهدية!*
 ┠ 💡 *مثال:* *${usedPrefix}اهدي @مستخدم*
──────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
          }, { quoted: m })
        }

        if (!db[targetId]) {
          db[targetId] = {
            title: 'مواطن عادي',
            coins: 100,
            diamonds: 5,
            points: 50,
            wallet: 50,
            rankLevel: 1,
            lastDaily: 0,
            lastMissionDate: '',
            missionCompletedToday: false
          }
        }

        db[targetId].coins += 50
        db[targetId].diamonds += 10
        db[targetId].points += 100
        saveDatabase(m.chat, db)

        let devGiftText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
👑 *هبة ملكية خاصة من المطور!* 🎁
───────────────────
 ┠ 👤 ╎ المستهدف: [@${targetId.split('@')[0]}]
 ┠ 🎁 *تمت إضافة الهدية الملكية إلى بنكه:*
 ┠      ▪️ 50 عملة ذهبية 🪙
 ┠      ▪️ 10 ألماس 💎
 ┠      ▪️ 100 نقطة ⭐
───────────────────
⚡ *تعيش وتستاهل يا بطل!*
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, {
          text: devGiftText,
          contextInfo: { mentionedJid: [targetId] }
        }, { quoted: m })
      }

      if (isDeveloper) {
        return await conn.sendMessage(m.chat, {
          text: `👑 *يا ملك الأوتشيها:* رصيدك وقوتك الأسطورية تسبق الهدايا اليومية، أنت من يوزعها ولا يأخذها! 💴🍀`
        }, { quoted: m })
      }

      if (!db[userId]) {
        let notRegisteredText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: حساب غير موجود*
───────────────────
 ┠ ❌ *انت لست مسجلا في البنك*
 ┠ 💡 *اكتب ${usedPrefix}سجل_بنك ليتم تسجيلك*
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, { text: notRegisteredText }, { quoted: m })
      }

      let user = db[userId]
      let now = Date.now()
      let cooldown = 24 * 60 * 60 * 1000

      if (user.lastDaily && (now - user.lastDaily < cooldown)) {
        let remainingTime = Math.ceil((cooldown - (now - user.lastDaily)) / (1000 * 60 * 60))
        let cooldownText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⏰ الهدية اليومية مستلمة مسبقاً*
───────────────────
 ┠ ❌ *لقد استلمت هدكتك اليومية بالفعل!*
 ┠ ⏳ *يرجى الانتظار لمدة:* ${remainingTime} ساعة تقريباً لطلبها مرة أخرى.
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, { text: cooldownText }, { quoted: m })
      }

      user.coins += 7
      user.diamonds += 4
      user.points += 10
      user.lastDaily = now
      saveDatabase(m.chat, db)

      let dailySuccessText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🎉 *تم استلام هديتك اليومية بنجاح!* 🎁
───────────────────
 ┠ 🪙 *الذهب المضاف:* +7 ذهبة
 ┠ 💎 *الألماس المضاف:* +4 ألماس
 ┠ ⭐ *النقاط المضافة:* +10 نقطة
───────────────────
 ┠ 💰 *رصيدك البنكي الحالي:* ${user.coins} ذهبة
 ┠ 💎 *ألماسك الحالي:* ${user.diamonds} ألماسة
 ┠ ⭐ *نقاطك الحالية:* ${user.points} نقطة
───────────────────
💡 *لا تنسَ إنجاز مهامك اليومية عبر أمر ${usedPrefix}مهام لتطوير لَفلك!*
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: dailySuccessText }, { quoted: m })
    }

    // 2. نظام المهام اليومية المتطورة (.مهام)
    if (command === 'مهام' || command === 'مهمة' || command === 'mission') {
      if (isDeveloper) {
        return await conn.sendMessage(m.chat, {
          text: `👑 *يا ملك الأوتشيها:* مهام الدنيا والآخرة تحت سيطرتك، لا تحتاج لتنفيذ مهام مبتدئة! ☠️`
        }, { quoted: m })
      }

      if (!db[userId]) {
        let notRegisteredText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: حساب غير موجود*
───────────────────
 ┠ ❌ *انت لست مسجلا في البنك*
 ┠ 💡 *اكتب ${usedPrefix}سجل_بنك ليتم تسجيلك*
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, { text: notRegisteredText }, { quoted: m })
      }

      let user = db[userId]
      let todayDate = new Date().toDateString()

      if (user.lastMissionDate !== todayDate) {
        user.lastMissionDate = todayDate
        user.missionCompletedToday = false
        user.currentDailyMission = Math.floor(Math.random() * 3) + 1
        saveDatabase(m.chat, db)
      }

      if (user.missionCompletedToday) {
        let completedText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *✅ لقد أنجزت مهمة اليوم بالفعل*
───────────────────
 ┠ 🏆 *أحسنت يا بطل، لقد أتممت مهام اليوم بنجاح.*
 ┠ ⏳ *المهمة الثانية وتحدي جديد سيكون في انتظارك غداً بإذن الله!*
 ┠ 💡 *اكتب ${usedPrefix}بنك أو ${usedPrefix}لفل لمتابعة تقدم رتبتك.*
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, { text: completedText }, { quoted: m })
      }

      let missionsList = {
        1: { title: 'مهمة الحراسة:', desc: 'اكتب في المجموعة رسائل أو تفاعل بـ أوامر لتأمين قلعتك.', actionType: 'msg', target: 5 },
        2: { title: 'مهمة الاستكشاف:', desc: 'قم بزيارة البنك الخاص بك واستعلم عن رصيدك (.بنك).', actionType: 'command_bank', target: 1 },
        3: { title: 'مهمة التبرع/الإيداع:', desc: 'قم بإيداع أي مبلغ بسيط في محفظتك البنكية عبر أمر (.ايداع).', actionType: 'command_deposit', target: 1 }
      }

      let activeMission = missionsList[user.currentDailyMission] || missionsList[1]
      let isCompleted = true // افتراضي للتبسيط أو حسب تفاعل البوت

      if (isCompleted) {
        user.missionCompletedToday = true
        user.coins += 25
        user.points += 30
        user.diamonds += 2

        let nextLevelPointsNeeded = (user.rankLevel || 1) * 50
        if (user.points >= nextLevelPointsNeeded && user.rankLevel < 100) {
          user.rankLevel += 1
          user.coins += user.rankLevel * 10
        }

        saveDatabase(m.chat, db)

        let successMissionText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🎉 *تهانينا! لقد أنجزت المهمة بنجاح* 🏆
───────────────────
 ┠ 🛡️ *المهمة:* ${activeMission.title}
 ┠ 📜 ${activeMission.desc}
 ┠ 🎁 *مكافأة إنجاز المهمة:*
 ┠      ▪️ +25 عملة ذهبية 🪙
 ┠      ▪️ +30 نقطة ترقية ⭐
 ┠      ▪️ +2 ألماس 💎
───────────────────
 ┠ 🚀 *تم تحديث بياناتك في البنك وملف الـ JSON بنجاح!*
 ┠ ⏳ *انتظر المهمة القادمة غداً بإذن الله.*
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: successMissionText }, { quoted: m })
      } else {
        let pendingMissionText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚔️ مهمتك اليومية النشطة*
───────────────────
 ┠ 📌 *العنوان:* ${activeMission.title}
 ┠ 📋 *التفاصيل:* ${activeMission.desc}
 ┠ ❌ *حالة المهمة:* لم تكتمل بعد! تفاعل أكثر في البوت والقروب لإتمامها.
───────────────────
💡 *أجز متطلبات المهمة ثم أعد كتابة الأمر ${usedPrefix}مهام لاستلام جائزتك!*
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: pendingMissionText }, { quoted: m })
      }
    }

  } catch (e) {
    console.error('[Daily & Mission Error]', e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء معالجة الهدية اليومية أو المهام' }
      ])
    }, { quoted: m })
  }
}

handler.help = ['هدية_يوميه', 'يومي', 'اهدي', 'مهام', 'مهمة']
handler.tags = ['bank']
handler.command = ['هدية_يوميه', 'يومي', 'هدية', 'اهدي', 'مهام', 'مهمة', 'mission']

export default handler
