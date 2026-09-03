// plugins/bank-transfer.js
// ✧ THE JOKER & ITACHI - Deposit & Withdraw System (Group-Synced) 💰
import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// الأرقام الموثوقة للمطور بصلاحيات الملوك المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

// دالة لقراءة قاعدة البيانات للمجموعة الحالية (متطابقة مع نظام القلاع والبنك الموحد)
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

// دالة لحفظ قاعدة البيانات للمجموعة الحالية
function saveDatabase(chatId, data) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Bank Save Error]', e)
  }
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  try {
    // التأكد من أن الأمر يُنفذ داخل مجموعة لتوحيد القاعدة مع نظام القلاع
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, { text: `⚠️ أوامر البنك والإيداع والسحب مخصصة للعمل داخل المجموعات فقط!` }, { quoted: m })
    }

    let db = loadDatabase(m.chat)
    let userId = m.sender

    // التحقق مما إذا كان المستخدم هو المطور
    let isDeveloper = allowedOwners.includes(userId) || allowedOwners.some(owner => owner.split('@')[0] === userId.split('@')[0])

    // إذا كان المطور، يمتلك بلا حدود ودون الحاجة لتسجيل أو خصم حقيقي
    if (isDeveloper) {
      return await conn.sendMessage(m.chat, {
        text: `👑 *أهلاً بك يا ملك الأوتشيها!*\n⚡ رصيدك الأسطوري لا يحتاج للإيداع أو السحب، فأنت تمتلك ملياراً ثابتاً لا ينفد ومصرح لك بكل الصلاحيات المطلقة 💴🍀`,
        contextInfo: { mentionedJid: [userId] }
      }, { quoted: m })
    }

    // التحقق مما إذا كان المستخدم العادي مسجلاً في البنك
    if (!db[userId]) {
      let notRegisteredText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝐑 ] ── ✦ ── ❖
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

    // تهيئة خاصية الرصيد النقدي خارج البنك إذا لم تكن موجودة (wallet)
    if (user.wallet === undefined) user.wallet = 50 // محفظة افتتاحية لمن لم يكن يملكها

    let amountText = args[0]

    // معالجة أمر .ايداع
    if (command === 'ايداع' || command === 'deposit') {
      if (!amountText || isNaN(amountText) || parseInt(amountText) <= 0) {
        let usageDeposit = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: كيفية استخدام الإيداع*
───────────────────
 ┠ 🔸 *${usedPrefix}ايداع [الكمية]*
 📌 *مثال:* *${usedPrefix}ايداع 100*
 ┠ 💰 *محفظتك النقدية حالياً:* ${user.wallet} ذهبة
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, { text: usageDeposit }, { quoted: m })
      }

      let amount = parseInt(amountText)
      if (user.wallet < amount) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🏦 بـنـك الـجـوكـر' },
            { type: 'warning', text: `عذراً، محفظتك لا تحتوي على هذا المبلغ!\nالمبلغ المتوفر معك في المحفظة: ${user.wallet} ذهبة.` }
          ])
        }, { quoted: m })
      }

      // خصم من المحفظة وإضافة للبنك (coins)
      user.wallet -= amount
      user.coins += amount
      saveDatabase(m.chat, db)

      let depositSuccess = `📥 *تمت عملية الإيداع بنجاح!*
───────────────────
 ┠ 💰 *المبلغ المودع:* ${amount} عملة ذهبية
 ┠ 🏦 *رصيدك الجديد في البنك:* ${user.coins} ذهبة
 ┠ 👛 *المتبقي في محفظتك:* ${user.wallet} ذهبة
───────────────────
💡 *اكتب ${usedPrefix}بنك لعرض تفاصيل حسابك*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: depositSuccess }, { quoted: m })
    }

    // معالجة أمر .سحب
    if (command === 'سحب' || command === 'withdraw') {
      if (!amountText || isNaN(amountText) || parseInt(amountText) <= 0) {
        let usageWithdraw = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: كيفية استخدام السحب*
───────────────────
 ┠ 🔸 *${usedPrefix}سحب [الكمية]*
 📌 *مثال:* *${usedPrefix}سحب 50*
 ┠ 🏦 *رصيدك في البنك حالياً:* ${user.coins} ذهبة
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, { text: usageWithdraw }, { quoted: m })
      }

      let amount = parseInt(amountText)
      if (user.coins < amount) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🏦 بـنـك الـجـوكـر' },
            { type: 'warning', text: `عذراً، رصيدك البنكي لا يکفي!\nالمبلغ المتوفر في البنك: ${user.coins} ذهبة.` }
          ])
        }, { quoted: m })
      }

      // خصم من البنك وإضافة للمحفظة
      user.coins -= amount
      user.wallet += amount
      saveDatabase(m.chat, db)

      let withdrawSuccess = `📤 *تمت عملية السحب بنجاح!*
───────────────────
 ┠ 💵 *المبلغ المسحوب:* ${amount} عملة ذهبية
 ┠ 🏦 *رصيدك المتبقي في البنك:* ${user.coins} ذهبة
 ┠ 👛 *رصيدك في المحفظة الآن:* ${user.wallet} ذهبة
───────────────────
💡 *اكتب ${usedPrefix}بنك لعرض تفاصيل حسابك*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: withdrawSuccess }, { quoted: m })
    }

  } catch (e) {
    console.error('[Bank Transfer Error]', e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء تنفيذ عملية الإيداع أو السحب' }
      ])
    }, { quoted: m })
  }
}

handler.help = ['ايداع', 'سحب', 'deposit', 'withdraw']
handler.tags = ['bank']
handler.command = ['ايداع', 'سحب', 'deposit', 'withdraw']

export default handler
