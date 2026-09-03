// plugins/lakabi-system.js
// ✧ ITACHI & JOKER - Ultimate Cyber Titles & Ranks System 👑🔥

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// الأرقام الموثوقة للمطور بصلاحيات الملوك المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

// دالة لقراءة قاعدة بيانات المجموعة الموحدة
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
    console.error('[Titles DB Error]', e)
    return {}
  }
}

// دالة لحفظ قاعدة بيانات المجموعة الموحدة
function saveDatabase(chatId, data) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Titles Save Error]', e)
  }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, { text: `⚠️ نظام الألقاب الإمبراطوري مخصص للعمل داخل المجموعات فقط!` }, { quoted: m })
    }

    let db = loadDatabase(m.chat)
    let userId = m.sender
    let isDeveloper = allowedOwners.includes(userId) || allowedOwners.some(owner => owner.split('@')[0] === userId.split('@')[0])
    let userName = m.pushName || userId.split('@')[0]

    // الإطار الفخم المزخرف المعتمد لاتاشي والجوكر
    const jokerHeader = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖`

    const jokerFooter = ` ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

    // 1. أمر تسجيل البنك وحجز اللقب الافتتاحي (.سجل_بنك [اللقب])
    if (command === 'سجل_بنك' || command === 'register') {
      let titleArg = args.join(' ').trim()
      if (!titleArg) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ خطأ في التسجيل السيبراني*
───────────────────
 ┠ ❌ *يجب عليك كتابة لقبك المفضل بجانب أمر التسجيل!*
 ┠ 📌 *مثال:* *${usedPrefix}سجل_بنك زعيم الأوتشيها*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      // التحقق مما إذا كان اللقب محجوزاً مسبقاً لأي عضو آخر في نفس المجموعة
      let isTitleTaken = Object.values(db).some(user => user.title && user.title.toLowerCase() === titleArg.toLowerCase())
      if (isTitleTaken) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ خطأ: اللقب محجوز مسبقاً*
───────────────────
 ┠ ❌ *عذراً، هذا اللقب (${titleArg}) مسجل باسم عضو آخر في هذه المجموعة!*
 ┠ 💡 *اختر لقباً فريداً ومميزاً لا يملكه غيرك.*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      if (db[userId]) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ تنبيه: حسابك مسجل بالفعل*
───────────────────
 ┠ 📌 *لقبك الحالي في السجلات:* [ ${db[userId].title} ]
 ┠ 💡 *إذا أردت تغيير لقبك، استخدم أمر:* *${usedPrefix}تغيير_لقب القديم | الجديد* أو *${usedPrefix}حجز_لقب*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      // إنشاء حساب جديد في قاعدة البيانات للمجموعة
      db[userId] = {
        name: userName,
        title: titleArg,
        coins: 100,
        diamonds: 10,
        points: 50,
        wallet: 50,
        rankLevel: 1,
        lastDaily: 0,
        lastMissionDate: '',
        missionCompletedToday: false
      }
      saveDatabase(m.chat, db)

      let registerSuccess = `${jokerHeader}
🎉 *تم تسجيلك في بنك الإمبراطورية بنجاح!* 🏦🔥
───────────────────
 ┠ 👤 *العضو:* ${userName}
 ┠ 🏷️ *لقبك السيبراني المعتمد:* [ ${titleArg} ]
 ┠ 💰 *هدية التأسيس:* 100 ذهبة | 10 ألماس | 50 نقطة
───────────────────
⚡ *أنت الآن جزء من أساطير هذا العالم السيبراني!*
${jokerFooter}`

      return await conn.sendMessage(m.chat, { text: registerSuccess }, { quoted: m })
    }

    // 2. أمر حجز لقب جديد (.حجز_لقب [اللقب])
    if (command === 'حجز_لقب' || command === 'حجز') {
      if (!db[userId]) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ حساب غير موجود*
───────────────────
 ┠ ❌ *أنت لست مسجلاً في البنك بعد!*
 ┠ 💡 *اكتب ${usedPrefix}سجل_بنك [لقبك] أولاً لتسجيل حسابك.*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      let newTitle = args.join(' ').trim()
      if (!newTitle) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ خطأ في الاستخدام*
───────────────────
 ┠ ❌ *اكتب اللقب الذي ترغب في حجزه بعد الأمر!*
 ┠ 📌 *مثال:* *${usedPrefix}حجز_لقب ملك الظلال*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      let isTitleTaken = Object.values(db).some(user => user.title && user.title.toLowerCase() === newTitle.toLowerCase())
      if (isTitleTaken) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ اللقب محجوز مسبقاً*
───────────────────
 ┠ ❌ *عذراً، اللقب (${newTitle}) مسجل باسم عضو آخر في المجموعة!*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      let oldTitle = db[userId].title
      db[userId].title = newTitle
      saveDatabase(m.chat, db)

      let reserveSuccess = `${jokerHeader}
🛡️ *تم حجز وتحديث لقبك بنجاح!* ✨
───────────────────
 ┠ 🔄 *اللقب السابق:* [ ${oldTitle} ]
 ┠ ⭐ *لقبك السيبراني الجديد:* [ ${newTitle} ]
───────────────────
${jokerFooter}`

      return await conn.sendMessage(m.chat, { text: reserveSuccess }, { quoted: m })
    }

    // 3. أمر فحص توفر اللقب (.متوفر [اللقب])
    if (command === 'متوفر' || command === 'check') {
      let queryTitle = args.join(' ').trim()
      if (!queryTitle) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ خطأ في الفحص*
───────────────────
 ┠ ❌ *اكتب اللقب المراد التحقق من توفره بعد الأمر!*
 ┠ 📌 *مثال:* *${usedPrefix}متوفر الساموراي الأخير*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      let foundUserEntry = Object.entries(db).find(([id, user]) => user.title && user.title.toLowerCase() === queryTitle.toLowerCase())

      if (foundUserEntry) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
❌ *اللقب غير شاغر (محجوز)*
───────────────────
 ┠ 🏷️ *اللقب:* [ ${queryTitle} ]
 ┠ 👤 *مملوك حالياً للعضو:* @${foundUserEntry[0].split('@')[0]}
───────────────────
${jokerFooter}`,
          contextInfo: { mentionedJid: [foundUserEntry[0]] }
        }, { quoted: m })
      } else {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
✅ *اللقب شاغر ومتاح للحجز!*
───────────────────
 ┠ 🏷️ *اللقب المطلوب:* [ ${queryTitle} ]
 ┠ 💡 *يمكنك حجزه فوراً عبر كتابة:* *${usedPrefix}حجز_لقب ${queryTitle}*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }
    }

    // 4. أمر عرض لقبك الخاص (.لقبي)
    if (command === 'لقبي' || command === 'mynickname' || command === 'nick') {
      if (!db[userId]) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ غير مسجل*
───────────────────
 ┠ ❌ *أنت لست مسجلاً في هذه المجموعة بعد!*
 ┠ 📌 *استخدم أمر ${usedPrefix}سجل_بنك [لقبك] لتسجيلك.*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      let userTitle = db[userId].title || 'مواطن عادي'
      let myNickText = `${jokerHeader}
👑 *[ سجل الألقاب السيبراني ]* 👑
───────────────────
 ┠ 👤 *العضو:* ${userName}
 ┠ 🏷️ *لقبك المعتمد في المجموعة:* [ ${userTitle} ]
 ┠ 💰 *رصيدك البنكي:* ${db[userId].coins} ذهبة
───────────────────
${jokerFooter}`

      return await conn.sendMessage(m.chat, { text: myNickText }, { quoted: m })
    }

    // 5. أمر عرض كافة الألقاب المحجوزة في المجموعة (.الالقاب)
    if (command === 'الالقاب' || command === 'all_titles' || command === 'ألقاب') {
      let entries = Object.entries(db)
      if (entries.length === 0) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ لا توجد ألقاب مسجلة*
───────────────────
 ┠ ❌ *لم يتم تسجيل أي أعضاء أو ألقاب في هذه المجموعة بعد!*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      let titlesListText = `${jokerHeader}
📜 *سِجِلّ الألقاب والأساتذة في المجموعة* ⚔️
───────────────────\n`

      entries.forEach(([id, user], index) => {
        let t = user.title || 'بدون لقب'
        titlesListText += ` ┠ ${index + 1}. 🏷️ [ *${t}* ] ── 👤 @${id.split('@')[0]}\n`
      })

      titlesListText += `───────────────────
⚡ *إجمالي الألقاب المحجوزة:* ${entries.length} لقب
${jokerFooter}`

      let mentionedJids = entries.map(([id]) => id)
      return await conn.sendMessage(m.chat, {
        text: titlesListText,
        contextInfo: { mentionedJid: mentionedJids }
      }, { quoted: m })
    }

    // 6. أمر إلغاء حجز لقبك الحالي (.الغاء_حجز أو .حذف_لقبي)
    if (command === 'الغاء_حجز' || command === 'حذف_لقبي') {
      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ أنت لست مسجلاً في البنك أساساً!` }, { quoted: m })
      }

      let oldT = db[userId].title
      db[userId].title = 'مواطن عادي'
      saveDatabase(m.chat, db)

      let cancelText = `${jokerHeader}
🗑️ *تم إلغاء حجز لقبك بنجاح!*
───────────────────
 ┠ 🏷️ *اللقب المحذوف:* [ ${oldT} ]
 ┠ 📌 *لقبك الحالي الافتراضي:* [ مواطن عادي ]
───────────────────
${jokerFooter}`

      return await conn.sendMessage(m.chat, { text: cancelText }, { quoted: m })
    }

    // 7. أمر تغيير لقب شخص آخر أو تغيير نسق (تغيير_لقب القديم | الجديد) - أو عبر المنشن والمشرفين/المطور
    if (command === 'تغيير_لقب' || command === 'edit_title') {
      let bodyText = args.join(' ')
      let targetId = null

      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetId = m.mentionedJid[0]
      } else if (m.quoted && m.quoted.sender) {
        targetId = m.quoted.sender
      }

      if (targetId) {
        if (!isDeveloper) {
          return await conn.sendMessage(m.chat, { text: `⚠️ تعديل لقب عضو آخر باستخدام المنشن مخصص للمطور الإمبراطور فقط!` }, { quoted: m })
        }
        if (!db[targetId]) {
          return await conn.sendMessage(m.chat, { text: `❌ هذا العضو ليس مسجلاً في السجلات!` }, { quoted: m })
        }

        let newTargetTitle = bodyText.replace(/@\d+/g, '').trim()
        if (!newTargetTitle) {
          return await conn.sendMessage(m.chat, { text: `⚠️ اكتب اللقب الجديد بعد المنشن!` }, { quoted: m })
        }

        db[targetId].title = newTargetTitle
        saveDatabase(m.chat, db)

        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
👑 *تم تعديل لقب العضو بواسطة المطور بنجاح!*
───────────────────
 ┠ 👤 العضو: @${targetId.split('@')[0]}
 ┠ 🏷️ اللقب الجديد: [ ${newTargetTitle} ]
───────────────────
${jokerFooter}`,
          contextInfo: { mentionedJid: [targetId] }
        }, { quoted: m })
      }

      // نمط التغيير الذاتي: تغيير_لقب القديم | الجديد
      if (!bodyText.includes('|')) {
        return await conn.sendMessage(m.chat, {
          text: `${jokerHeader}
🔹 *⚠️ صيغة خاطئة للتغيير*
───────────────────
 ┠ ❌ *استخدم الصيغة الصحيحة التالية:*
 ┠ 📌 *${usedPrefix}تغيير_لقب اللقب القديم | اللقب الجديد*
───────────────────
${jokerFooter}`
        }, { quoted: m })
      }

      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ أنت لست مسجلاً في البنك!` }, { quoted: m })
      }

      let parts = bodyText.split('|').map(p => p.trim())
      let oldQuery = parts[0]
      let newQuery = parts[1]

      if (db[userId].title.toLowerCase() !== oldQuery.toLowerCase()) {
        return await conn.sendMessage(m.chat, { text: `❌ اللقب القديم الذي كتبته لا يطابق لقبك الحالي (${db[userId].title})!` }, { quoted: m })
      }

      let isTaken = Object.values(db).some(user => user.title && user.title.toLowerCase() === newQuery.toLowerCase())
      if (isTaken) {
        return await conn.sendMessage(m.chat, { text: `❌ عذراً، اللقب الجديد (${newQuery}) محجوز مسبقاً لعضو آخر!` }, { quoted: m })
      }

      db[userId].title = newQuery
      saveDatabase(m.chat, db)

      let changeSuccess = `${jokerHeader}
✨ *تم تغيير لقبك بنجاح تام!*
───────────────────
 ┠ 🔄 من: [ ${oldQuery} ]
 ┠ 🚀 إلى: [ ${newQuery} ]
───────────────────
${jokerFooter}`

      return await conn.sendMessage(m.chat, { text: changeSuccess }, { quoted: m })
    }

    // 8. أمر حذف جميع الألقاب في المجموعة (.حذف_الالقاب أو .مسح_الألقاب) - للمطور فقط
    if (command === 'حذف_الالقاب' || command === 'مسح_الألقاب') {
      if (!isDeveloper) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🃏 الـجـوكـر: "تنبيه أمني"' },
            { type: 'warning', text: 'أمر حذف وتصفير جميع الألقاب مخصص للمطور الإمبراطور فقط!' }
          ])
        }, { quoted: m })
      }

      // تصفير أو إعادة تعيين ألقاب كافة الأعضاء في قاعدة بيانات المجموعة
      for (let id in db) {
        db[id].title = 'مواطن عادي'
      }
      saveDatabase(m.chat, db)

      let wipeSuccess = `${jokerHeader}
⚠️ *تم مسح وتصفير جميع ألقاب المجموعة بنجاح!*
───────────────────
 ┠ 🧹 *تمت إعادة تعيين كافة الألقاب إلى (مواطن عادي).*
───────────────────
${jokerFooter}`

      return await conn.sendMessage(m.chat, { text: wipeSuccess }, { quoted: m })
    }

  } catch (err) {
    console.error('[ITACHI-Lakabi-System Error]', err)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ سيبراني"' },
        { type: 'warning', text: `حدث خطأ أثناء معالجة نظام الألقاب: ${err.message || err}` }
      ])
    }, { quoted: m })
  }
}

handler.help = ['سجل_بنك', 'حجز_لقب', 'متوفر', 'لقبي', 'الالقاب', 'الغاء_حجز', 'تغيير_لقب', 'حذف_الالقاب']
handler.tags = ['unions', 'bank']
handler.command = /^(سجل_بنك|register|حجز_لقب|حجز|متوفر|check|لقبي|mynickname|nick|الالقاب|all_titles|ألقاب|الغاء_حجز|حذف_لقبي|تغيير_لقب|edit_title|حذف_الالقاب|مسح_الألقاب)/i
handler.group = true

export default handler
