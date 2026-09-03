// plugins/game-fakk-kitaba.js
// ✧ ITACHI & JOKER - Games: Fakk & Kitaba System 🔤⚔️

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

let timeout = 60000
let poin = 20 // تم ضبط الجائزة لتكون 20 نقطة وذهب

// الأرقام الموثوقة للمطور بصلاحيات الملوك المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

// دالة لقراءة قاعدة البيانات الموحدة للمجموعة
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
    console.error('[Game DB Error]', e)
    return {}
  }
}

// دالة لحفظ قاعدة البيانات الموحدة للمجموعة
function saveDatabase(chatId, data) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Game Save Error]', e)
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, { text: `⚠️ ألعاب التحدي مخصصة للعمل داخل المجموعات فقط!` }, { quoted: m })
    }

    conn.tekateki = conn.tekateki || {}
    let id = m.chat

    if (id in conn.tekateki) {
      await m.react("⏳")
      return await conn.sendMessage(m.chat, {
        text: `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه سيبراني*
───────────────────
 ┠ ❌ *هناك مهمة قائمة بالفعل في المجموعة، انتظر انتهاء الجولة الحالية!*
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`,
        contextInfo: {
          externalAdReply: {
            title: "𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ",
            body: "لعبة التحدي قيد التشغيل...",
            thumbnailUrl: "https://files.catbox.moe/123456.jpg",
            sourceUrl: "https://whatsapp.com/channel/120363429074575231",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    }

    // التحقق من ملف الأسئلة المشترك
    if (!fs.existsSync("./src/game/فكك.json")) {
      return await conn.sendMessage(m.chat, { text: `⚠️ ملف أسئلة الألعاب غير موجود في النظام!` }, { quoted: m })
    }

    let tekateki = JSON.parse(fs.readFileSync("./src/game/فكك.json"))
    let json = tekateki[Math.floor(Math.random() * tekateki.length)]
    let originalWord = json.response.trim()

    let questionText = ""
    let gameTitle = ""

    if (command === 'فكك') {
      gameTitle = "🔤 تحدي فك الكلمة"
      let spacedLetters = originalWord.split('').join('   ')
      questionText = `🔮 *الكلمة المراد تفكيكها:* [ *${originalWord}* ]\n\n📌 *المطلوب:* أرسل الحروف مفرقة هكذا (${spacedLetters}) أو الكلمة!`
    } else if (command === 'كتابه' || command === 'كتابة') {
      gameTitle = "✍️ تحدي دمج وكتابة الكلمة"
      let spacedLetters = originalWord.split('').join('   ')
      questionText = `🔮 *الحروف المبعثرة:* [ *${spacedLetters}* ]\n\n📌 *المطلوب:* اكتب الكلمة متصلة وصحيحة!`
    }

    let caption = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔥 *${gameTitle}* 🔥
───────────────────
 ${questionText}

 ⏰ *الوقت المتاح:* ${(timeout / 1000).toFixed(0)} ثانية
 ⭐ *الجائزة:* ${poin} نقطة وذهب
 👤 *المتحدي:* @${m.sender.split("@")[0]}
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

    let sent = await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ",
          body: "عالم التحديات والألقاب السيبرانية",
          thumbnailUrl: "https://files.catbox.moe/123456.jpg",
          sourceUrl: "https://whatsapp.com/channel/120363429074575231",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    conn.tekateki[id] = [
      sent,
      json,
      poin,
      setTimeout(async () => {
        if (conn.tekateki[id]) {
          await conn.sendMessage(m.chat, {
            text: `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
⏰ *انتهى وقت التحدي يا محاربين!*
───────────────────
 ❌ *لم يتم الإجابة في الوقت المحدد.*
 💡 *الإجابة الصحيحة كانت:* [ *${originalWord}* ]
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`,
            contextInfo: {
              externalAdReply: {
                title: "𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ",
                body: "انتهى الوقت!",
                thumbnailUrl: "https://files.catbox.moe/123456.jpg",
                sourceUrl: "https://whatsapp.com/channel/120363429074575231",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: sent })
          delete conn.tekateki[id]
        }
      }, timeout),
      command
    ]

    await m.react("✍️")

  } catch (e) {
    console.error('[Game Error]', e)
    await m.reply(`> 🃏 *ITACHI & JOKER: "خطأ"*\n> 🔮 حدث خطأ أثناء تشغيل اللعبة`)
  }
}

// معالج الإجابات التلقائي
handler.before = async (m, { conn, usedPrefix }) => {
  let id = m.chat
  if (!conn.tekateki || !conn.tekateki[id]) return false
  if (!m.text) return false

  let game = conn.tekateki[id]
  let json = game[1]
  let poin = game[2]
  let gameType = game[4]

  let userAnswer = m.text.trim().toLowerCase()
  let correctAnswer = json.response.trim().toLowerCase()

  let isMatch = false
  if (gameType === 'فكك') {
    let userClean = userAnswer.replace(/\s+/g, '')
    let correctClean = correctAnswer.replace(/\s+/g, '')
    if (userClean === correctClean || userAnswer.includes(correctClean)) {
      isMatch = true
    }
  } else {
    if (userAnswer === correctAnswer || userAnswer.includes(correctAnswer)) {
      isMatch = true
    }
  }

  if (isMatch) {
    let db = loadDatabase(m.chat)
    let isNewUser = false

    // إذا لم يكن العضو مسجلاً في بنك المجموعة، افتح له حساباً جديداً باللقب الافتراضي (مستخدم جديد)
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
      }
      isNewUser = true
    }

    // إضافة الجائزة (20 نقطة وذهب) إلى البنك
    db[m.sender].coins = (db[m.sender].coins || 0) + poin
    db[m.sender].points = (db[m.sender].points || 0) + poin
    saveDatabase(m.chat, db)

    let newUserNotice = ''
    if (isNewUser) {
      newUserNotice = `\n ⚠️ *تنبيه بنكي:* تم فتح حساب جديد لك باللقب الافتراضي (*مستخدم جديد*).\n 💡 *لتغيير لقبك استخدم الأمر:* *${usedPrefix || '.'}تغيير_لقب مستخدم جديد | لقبك_الجديد*\n`
    }

    let successText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
✅ *إجابة صحيحة يا بطل الأوتشيها!* 🎉
───────────────────
 👤 *المتحدي الفائز:* @${m.sender.split("@")[0]}
 🏆 *المكافأة المضافة:* +${poin} نقطة وذهب
 📌 *الإجابة الصحيحة:* [ *${json.response}* ]
 💰 *رصيدك البنكي الحالي:* ${db[m.sender].coins} ذهبة (${db[m.sender].points} نقطة)
 ${newUserNotice}───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

    await conn.sendMessage(m.chat, {
      text: successText,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ",
          body: "إجابة صحيحة ومظفرة!",
          thumbnailUrl: "https://files.catbox.moe/123456.jpg",
          sourceUrl: "https://whatsapp.com/channel/120363429074575231",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    clearTimeout(game[3])
    delete conn.tekateki[id]
    return true
  }

  return false
}

handler.help = ["فكك", "كتابه", "كتابة"]
handler.tags = ["game"]
handler.command = /^(فكك|كتابه|كتابة)$/i
handler.group = true

export default handler
