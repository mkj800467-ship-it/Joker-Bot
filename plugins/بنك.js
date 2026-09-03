// plugins/bank.js
// ✧ THE JOKER & ITACHI - Bank Account Balance System 🏦
import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// الأرقام الموثوقة للمطور بصلاحيات الملوك المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

// دالة لقراءة قاعدة البيانات الخاصة بالمجموعة الحالية (متوافقة مع نظام العزل التام للمجموعات)
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

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // التأكد من أن الأمر يتم تنفيذه داخل مجموعة لضمان فصل بيانات المجموعات تماماً
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '⚠️ خطأ' },
          { type: 'warning', text: 'هذا الأمر يعمل داخل المجموعات فقط لعرض بنك المجموعة!' }
        ])
      }, { quoted: m })
    }

    let db = loadDatabase(m.chat)

    // تحديد المستهدف (إما بالمنشن، أو الرد على رسالة، أو الشخص نفسه)
    let targetId = m.sender
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetId = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
      targetId = m.quoted.sender
    }

    // إذا تم استخدام أمر .بنكه (أو .banke) يتم التحقق من وجود منشن أو رد لإجبار عرض بنك شخص آخر
    let isTargetOtherCmd = command === 'بنكه' || command === 'banke'
    if (isTargetOtherCmd && !m.mentionedJid?.length && (!m.quoted || !m.quoted.sender)) {
      return await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '⚠️ خطأ في الاستخدام' },
          { type: 'warning', text: `الرجاء عمل رشاد (رد) على رسالة الشخص أو منشنته لعرض بنكه.\nمثال: ${usedPrefix}بنكه @منشن` }
        ])
      }, { quoted: m })
    }

    // التحقق مما إذا كان المستخدم المستهدف هو المطور لعرض رصيده الأسطوري المنيع
    let isTargetDeveloper = allowedOwners.includes(targetId) || allowedOwners.some(owner => owner.split('@')[0] === targetId.split('@')[0])
    if (isTargetDeveloper) {
      let devBankText = `🏦 *لوحة حسابك البنكي الأسطوري*
───────────────────
 ┠ 🏷️ ╎ اللقب [الملك الأسطوري] / العمر [خلود أبدي]
 ┠ 📊 ╎ اللفل (المستوي): ملك الاوتشيها ☠️
 ┠ 🏷️ ╎ اللقب الحالي: ملك المطورين ⚡
 ┠ 💰 ╎ رصيدك الخرافي في البنك:
 ┠      ▪️ 1000000000 عمله ذهبيه 🪙
 ┠      ▪️ 1000000000 الماس 💎
 ┠      ▪️ 1000000000 نقاط ⭐
 ┠ 🏷️ ╎ الحاله: غني لابعد الحدود 💴🍀
───────────────────
⚡ *سلطة مطلقة لا تُمس ولا تُقهر!*
💡 *اكتب ${usedPrefix}قلعتي لعرض قلعتك*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, {
        text: devBankText,
        contextInfo: { mentionedJid: [targetId] }
      }, { quoted: m })
    }

    // التحقق مما إذا كان المستخدم العادي مسجلاً في البنك أم لا
    if (!db[targetId]) {
      let notRegisteredText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝓉𝐇𝐄 𝓩𝑶𝑲𝑬𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: حساب غير موجود*
───────────────────
 ┠ ❌ *هذا الشخص ليس مسجلا في بنك هذه المجموعة*
 ┠ 💡 *اكتب ${usedPrefix}سجل_بنك ليتم تسجيلك*
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: notRegisteredText }, { quoted: m })
    }

    let user = db[targetId]
    // جلب اللقب الأساسي وحفظه ليتوافق مع إزالة الاسم تماماً
    let userMainTitle = user.title || 'مواطن عادي'
    let userTitle = user.customTitle || userMainTitle

    // عرض تفاصيل الحساب البنكي للمستخدم باللقب والعمر بدلاً من الاسم
    let bankInfoText = `🏦 *لوحة حسابك البنكي*
───────────────────
 ┠ 🏷️ ╎ اللقب [${userMainTitle}] / العمر [${user.age}]
 ┠ 📊 ╎ اللفل (المستوي): ${user.level}
 ┠ 🏷️ ╎ اللقب الحالي: ${userTitle}
 ┠ 💰 ╎ رصيدك في البنك:
 ┠      ▪️ ${user.coins} عمله ذهبيه
 ┠      ▪️ ${user.diamonds} الماس
 ┠      ▪️ ${user.points} نقاط
 ┠ 🏷️ ╎ الحاله: ${user.status}
───────────────────
💡 *اكتب ${usedPrefix}قلعتي لعرض قلعتك*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

    await conn.sendMessage(m.chat, {
      text: bankInfoText,
      contextInfo: { mentionedJid: [targetId] }
    }, { quoted: m })

  } catch (e) {
    console.error('[Bank Balance Error]', e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء جلب تفاصيل الحساب البنكي' }
      ])
    }, { quoted: m })
  }
}

handler.help = ['بنك', 'bank', 'رصيدي', 'بنكه']
handler.tags = ['bank']
handler.command = ['بنك', 'bank', 'رصيدي', 'بنكه', 'banke']

export default handler
