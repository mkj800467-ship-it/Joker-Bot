// plugins/bank-register.js
// ✧ THE JOKER & ITACHI - Bank Registration System 🏦
import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// مسار قاعدة البيانات بحيث يتم حفظ بيانات مستقلة لكل مجموعة على حدة (Group-Based Database)
const getDbPath = (groupId) => path.resolve(`database/groups/${groupId}/bank.json`)

// دالة لقراءة قاعدة البيانات الخاصة بالمجموعة
function loadDatabase(groupId) {
  try {
    let dbPath = getDbPath(groupId)
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

// دالة لحفظ قاعدة البيانات الخاصة بالمجموعة
function saveDatabase(groupId, data) {
  try {
    let dbPath = getDbPath(groupId)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Bank Save Error]', e)
  }
}

// دالة التحقق من المطور أو المشرف
async function isAdminOrOwner(m, conn) {
  try {
    let owner = global.owner || ['9677xxxxxxxxx'] // استبدل برقمك أو اعتمد على إعدادات بوتك
    let isOwner = owner.some(v => m.sender.includes(v)) || m.fromMe
    if (isOwner) return true
    if (!m.isGroup) return false
    let chat = conn.chats[m.chat] || await conn.groupMetadata(m.chat).catch(() => null)
    if (!chat) return false
    let admins = chat.participants ? chat.participants.filter(v => v.admin).map(v => v.id) : []
    return admins.includes(m.sender)
  } catch {
    return false
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // التأكد من أن الأمر يتم تنفيذه داخل مجموعة لضمان فصل بيانات المجموعات تماماً
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '⚠️ خطأ' },
          { type: 'warning', text: 'هذا الأمر يعمل داخل المجموعات فقط لربط بنك المجموعة!' }
        ])
      }, { quoted: m })
    }

    let groupId = m.chat
    let db = loadDatabase(groupId)
    let isRegCmd = command === 'سجل_بنك' || command === 'تسجيل_بنك'
    let isDelCmd = command === 'احذف_تسجيل'

    // ==========================================
    // 1. قسم الحذف (للمشرفين والمطورين فقط)
    // ==========================================
    if (isDelCmd) {
      let authorized = await isAdminOrOwner(m, conn)
      if (!authorized) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '⚠️ صلاحيات مرفوضة' },
            { type: 'warning', text: 'هذا الأمر خاص بالمطورين ومشرفي المجموعة فقط!' }
          ])
        }, { quoted: m })
      }

      let targetId = null
      if (m.quoted) {
        targetId = m.quoted.sender
      } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetId = m.mentionedJid[0]
      }
      
      if (!targetId) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '⚠️ خطأ في الاستخدام' },
            { type: 'warning', text: `الرجاء عمل رشاد (رد) على رسالة الشخص أو منشنته للحذف.\nمثال: ${usedPrefix}احذف_تسجيل @منشن` }
          ])
        }, { quoted: m })
      }

      if (!db[targetId]) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🏦 بنك الجوكر' },
            { type: 'warning', text: 'هذا المستخدم غير مسجل في البنك في هذه المجموعة أصلاً!' }
          ])
        }, { quoted: m })
      }

      let deletedTitle = db[targetId].title || db[targetId].name
      delete db[targetId]
      saveDatabase(groupId, db)

      return await conn.sendMessage(m.chat, {
        text: `🗑️ *تم حذف تسجيل المستخدم (اللقب: ${deletedTitle}) من بنك هذه المجموعة بنجاح بواسطة المشرف!*\n\n〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
      }, { quoted: m })
    }

    // ==========================================
    // 2. قسم التسجيل العادي أو تسجيل شخص آخر
    // ==========================================
    let targetId = m.sender
    let cleanText = text ? text.trim() : ''

    // التحقق إذا كان المشرف أو المطور يريد تسجيل شخص آخر عبر المنشن أو الرد
    let isPrivileged = await isAdminOrOwner(m, conn)
    let mentioned = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    
    if (mentioned && isPrivileged) {
      targetId = mentioned
      let parts = cleanText.split(' ').filter(v => !v.includes('@'))
      cleanText = parts.join(' ')
    }

    if (!cleanText) {
      let usageText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝓩𝑶𝑲𝑬𝑹 ] ── ✦ ── ❖
🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: كيفيه استخدام الامر*
───────────────────
 ┠ 🔸 *${usedPrefix}سجل_بنك اللقب العمر*
 ┠ 🔸 *${usedPrefix}سجل_بنك @منشن اللقب العمر* (للمشرفين)
📌 *مثال:* *${usedPrefix}سجل_بنك اسطوره 19*
───────────────────
▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: usageText }, { quoted: m })
    }

    // التحقق مما إذا كان مسجلاً مسبقاً في بنك هذه المجموعة
    if (db[targetId]) {
      return await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '🏦 بـنـك الـجـوكـر' },
          { type: 'warning', text: 'هذا المستخدم مسجل بالفعل في بنك هذه المجموعة!' }
        ])
      }, { quoted: m })
    }

    let args = cleanText.split(' ')
    let age = args.pop()
    let title = args.join(' ')

    if (!title || isNaN(age)) {
      return await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '⚠️ خطأ في التسجيل' },
          { type: 'warning', text: `الرجاء إدخال اللقب والعمر بشكل صحيح.\nمثال: ${usedPrefix}سجل_بنك اسطوره 19` }
        ])
      }, { quoted: m })
    }

    // إنشاء حساب جديد مع اعتماد المدخل كلقب رئيسي وحفظه لنظام الألقاب
    db[targetId] = {
      title: title,        // استبدال الاسم تماماً باللقب الأساسي
      customTitle: '',     // مخصص لحجز الألقاب لاحقاً
      age: parseInt(age),
      level: 'مواطن عادي',
      coins: 10,
      diamonds: 0,
      points: 10,
      status: 'فقير جداً',
      registeredAt: new Date().toISOString()
    }
    saveDatabase(groupId, db)

    let successText = `🎉 *تم تسجيل المستخدم بنجاح في بنك المجموعة!*

🎁 *هدية التسجيل:* 10 عمله ذهبيه و 10 نقاط
🏷️ *اللقب المسجل:* ${title} (تم حفظه واعتماده لنظام الألقاب)

📋 *قائمتك البنكية:*
───────────────────
 ┠ 🏷️ ╎ اللقب [${title}] / العمر [${age}]
 ┠ 📊 ╎ اللفل (المستوى): مواطن عادي
 ╠ 💰 ╎ رصيدك في البنك:
 ┠      ▪️ 10 عمله ذهبيه
 ┠      ▪️ 0 الماس
 ┠      ▪️ 10 نقاط
 ┠ 🏷️ ╎ الحاله: فقير جداً
───────────────────
💡 *اكتب امر* *${usedPrefix}بنك* *لعرض تفاصيل حسابك البنكي بالكامل!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

    await conn.sendMessage(m.chat, { text: successText }, { quoted: m })
  } catch (e) {
    console.error('[Register Bank Error]', e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء عملية التسجيل في البنك' }
      ])
    }, { quoted: m })
  }
}

handler.help = ['سجل_بنك', 'تسجيل_بنك', 'احذف_تسجيل']
handler.tags = ['bank']
handler.command = ['سجل_بنك', 'تسجيل_بنك', 'احذف_تسجيل']

export default handler
