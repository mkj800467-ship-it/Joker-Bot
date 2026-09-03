// plugins/castle.js
// ✧ THE JOKER & ITACHI - Ultimate Castle, Army & War System 🏰⚔️
import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// الأرقام الموثوقة للمطور بصلاحيات الملوك المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

// دالة لقراءة قاعدة البيانات للمجموعة الحالية (متوافقة تماماً مع مسار البنك الموحد)
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
    console.error('[Castle DB Error]', e)
    return {}
  }
}

// دالة لحفظ قاعدة البيانات للمجموعة الحالية (متوافقة تماماً مع مسار البنك الموحد)
function saveDatabase(chatId, data) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Castle Save Error]', e)
  }
}

// تهيئة بيانات القلعة والجيش الافتراضية للمستخدمين الجدد
function initUserCastle(user) {
  if (!user.castle) {
    user.castle = {
      level: 1,
      buildings: {
        mainCastle: 'القلعة الرئيسية (مستوى 1)',
        hospital: 'المستشفى (مستوى 1)',
        barracks: 'معسكر الجيش (مستوى 1)'
      },
      army: {
        infantry: 5,
        warPlanes: 7,
        ammoBoxes: 10,
        cannons: 5,
        shields: 1
      }
    }
  } else {
    if (!user.castle.level) user.castle.level = 1
    if (!user.castle.buildings) {
      user.castle.buildings = { mainCastle: 'القلعة الرئيسية (مستوى 1)', hospital: 'المستشفى (مستوى 1)', barracks: 'معسكر الجيش (مستوى 1)' }
    }
    if (!user.castle.army) {
      user.castle.army = { infantry: 5, warPlanes: 7, ammoBoxes: 10, cannons: 5, shields: 1 }
    }
  }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    let db = loadDatabase(m.chat)
    let userId = m.sender
    let isDeveloper = allowedOwners.includes(userId) || allowedOwners.some(owner => owner.split('@')[0] === userId.split('@')[0])

    // 1. أمر عرض القلعة (.قلعتي)
    if (command === 'قلعتي' || command === 'castle') {
      if (isDeveloper) {
        let devCastleText = `🏰 *قـلـعـة الإمـبـراطـر الأَسْـطُـوريّة* ☠️⛓️
───────────────────
 ┠ 👤 ╎ مالك القلعة: الملك الأوتشيها الأوحد
 ┠ 🛡️ ╎ مستوى التحصين: [مستوى أقصى لا يُقهر ∞]
 ┠ 🏛️ ╎ المباني الملكية الكبرى:
 ┠      ▪️ القلعة الإمبراطورية المنيعة
 ┠      ▪️ مستشفى الشفاء الأبدي
 ┠      ▪️ معسكر الفيالق الجهنمية
 ┠ 🪖 ╎ الجيش الأسطوري المرعب:
 ┠      ▪️ 999999 مشاة الظل ⚔️
 ┠      ▪️ 999999 طائرات حربية خارقة ✈️
 ┠      ▪️ 999999 صناديق ذخيرة لا تنفد 📦
 ┠      ▪️ 999999 مدافع الدمار الشامل 🎯
 ┠      ▪️ 999999 دروع الطاقة المطلقة 🛡️
───────────────────
⚡ *تحذير صارم: هذه القلعة محصنة إلهياً، أي محاولة هجوم ستنتهي بتدمير المهاجم الفوري!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, {
          text: devCastleText,
          contextInfo: { mentionedJid: [userId] }
        }, { quoted: m })
      }

      if (!db[userId]) {
        let notRegisteredText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝓩𝑶𝑲𝑬𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: حساب غير موجود*
───────────────────
 ┠ ❌ *أنت لست مسجلاً في البنك والعالم بعد!*
 ┠ 💡 *اكتب ${usedPrefix}سجل_بنك أولاً لتسجيلك في اللعبة والانضمام للمعارك*
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝐄𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: notRegisteredText }, { quoted: m })
      }

      let user = db[userId]
      initUserCastle(user)
      saveDatabase(m.chat, db)

      // جلب اللقب الأساسي المعتمد في نظام البنك الجديد
      let userMainTitle = user.title || 'مواطن عادي'

      let castleInfoText = `🏰 *مـرحبـاً بك في قـلعتك يا [ ${userMainTitle} ]*
───────────────────
 ┠ 🛡️ ╎ مستوى القلعة والتحصين: مستوى ${user.castle.level}
 ┠ 🏛️ ╎ مبانيك العسكرية:
 ┠      ▪️ ${user.castle.buildings.mainCastle}
 ┠      ▪️ ${user.castle.buildings.hospital}
 ┠      ▪️ ${user.castle.buildings.barracks}
 ┠ 🪖 ╎ عتاد جيشك الحالي:
 ┠      ▪️ ${user.castle.army.infantry} مشاة 🪖
 ┠      ▪️ ${user.castle.army.warPlanes} طائرات حربية ✈️
 ┠      ▪️ ${user.castle.army.ammoBoxes} صناديق ذخيرة 📦
 ┠      ▪️ ${user.castle.army.cannons} مدافع 🎯
 ┠      ▪️ ${user.castle.army.shields} درع حماية 🛡️
───────────────────
💡 *استخدم أوامر التجنيد والشراء لتوسيع قلعتك:*
 ▪️ ${usedPrefix}تجنيد [النوع] [العدد] (مثال: .تجنيد مشاه 10)
 ▪️ ${usedPrefix}تطوير (بـ 100 نقطة لتحصين القلعة)
 ▪️ ${usedPrefix}شراء_درع (بـ 10 نقاط)
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: castleInfoText }, { quoted: m })
    }

    // 2. أمر تجنيد الجيش العسكري (.تجنيد)
    if (command === 'تجنيد' || command === 'recruit') {
      if (isDeveloper) {
        return await conn.sendMessage(m.chat, { text: `👑 جيشك الإمبراطورى كامل ولا يحتاج لتجنيد!` }, { quoted: m })
      }
      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ يجب تسجيلك في البنك أولاً عبر أمر ${usedPrefix}سجل_بنك` }, { quoted: m })
      }

      let user = db[userId]
      initUserCastle(user)

      let type = args[0] ? args[0].toLowerCase() : ''
      let count = args[1] ? parseInt(args[1]) : 0

      if (!type || isNaN(count) || count <= 0) {
        let usageRecruit = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝑲𝐄𝑹 ] ── ✦ ── ❖
🔹 *⚠️ كيفية استخدام التجنيد*
──────────────────
 ┠ 🔸 *${usedPrefix}تجنيد [النوع] [العدد]*
 ┠ *أنواع العتاد المتاحة وأسعارها بالذهب:*
 ┠   ▪️ مشاه (5 عملات ذهبية للواحدة)
 ┠   ▪️ طائرات (8 عملات ذهبية للواحدة)
 ┠   ▪️ ذخيرة (2 عملة ذهبية للصندوق)
 ┠   ▪️ مدافع (12 عملة ذهبية للمدفوع)
📌 *مثال:* *${usedPrefix}تجنيد مشاه 10*
──────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, { text: usageRecruit }, { quoted: m })
      }

      let unitKey = ''
      let unitNameArabic = ''
      let pricePerUnit = 0

      if (type.includes('مشاه') || type.includes('مشاة') || type.includes('infantry')) {
        unitKey = 'infantry'
        unitNameArabic = 'مشاة'
        pricePerUnit = 5
      } else if (type.includes('طائرات') || type.includes('طائرة') || type.includes('planes')) {
        unitKey = 'warPlanes'
        unitNameArabic = 'طائرات حربية'
        pricePerUnit = 8
      } else if (type.includes('ذخيرة') || type.includes('صناديق') || type.includes('ammo')) {
        unitKey = 'ammoBoxes'
        unitNameArabic = 'صناديق ذخيرة'
        pricePerUnit = 2
      } else if (type.includes('مدافع')  || type.includes('مدفع') || type.includes('cannons')) {
        unitKey = 'cannons'
        unitNameArabic = 'مدافع'
        pricePerUnit = 12
      } else {
        return await conn.sendMessage(m.chat, { text: `❌ نوع العتاد غير معروف! اكتب ${usedPrefix}تجنيد لمعرفة الأنواع المتاحة.` }, { quoted: m })
      }

      let totalPrice = pricePerUnit * count
      if (user.coins < totalPrice) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🏦 بنك الجوكر - خطأ في التمويل' },
            { type: 'warning', text: `عذراً، رصيدك البنكي لا يكفي!\nالتكلفة الإجمالية لـ ${count} من ${unitNameArabic} هي ${totalPrice} عملة ذهبية، بينما رصيدك البنكي: ${user.coins} ذهبة.` }
          ])
        }, { quoted: m })
      }

      user.coins -= totalPrice
      user.castle.army[unitKey] += count
      saveDatabase(m.chat, db)

      let recruitSuccess = `⚔️ *تم التجنيد بنجاح يا بطل!* 🛡️
───────────────────
 ┠ 🪖 *التموين العسكري:* تجنيد ${count} من [${unitNameArabic}]
 ┠ 💰 *التكلفة المخصومة:* ${totalPrice} عملة ذهبية
 ┠ 🏦 *رصيدك البنكي الحالي:* ${user.coins} ذهبة
───────────────────
💡 *اكتب ${usedPrefix}قلعتي لمراجعة تطويرات جيشك ومبانيك.*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
      return await conn.sendMessage(m.chat, { text: recruitSuccess }, { quoted: m })
    }

    // 3. أمر تطوير القلعة (.تطوير)
    if (command === 'تطوير' || command === 'upgrade') {
      if (isDeveloper) {
        return await conn.sendMessage(m.chat, { text: `👑 قلعتك في أقصى مستوى أسطوري لا تقبل تطويرًا إضافيًا!` }, { quoted: m })
      }
      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ يجب تسجيلك في البنك أولاً عبر أمر ${usedPrefix}سجل_بنك` }, { quoted: m })
      }

      let user = db[userId]
      initUserCastle(user)

      let upgradeCost = 100
      if (user.points < upgradeCost) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🏰 نظام القلاع - خطأ في النقاط' },
            { type: 'warning', text: `نقاطك لا تكفي لتطوير القلعة والتحصين!\nتحتاج إلى ${upgradeCost} نقطة ترقية، بينما رصيدك الحالي: ${user.points} نقطة.` }
          ])
        }, { quoted: m })
      }

      user.points -= upgradeCost
      user.castle.level += 1
      saveDatabase(m.chat, db)

      let upgradeSuccess = `🎉 *تم تطوير وتحصين قلعتك بنجاح!* 🛡️🏰
───────────────────
 ┠ 🚀 *مستوى القلعة الجديد:* مستوى ${user.castle.level}
 ┠ ⭐ *النقاط المخصومة:* ${upgradeCost} نقطة ترقية
 ┠ 💎 *نقاطك المتبقية:* ${user.points} نقطة
───────────────────
⚡ *قلعتك أصبحت أكثر صلابة ضد هجمات الأعداء الغاشمة!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
      return await conn.sendMessage(m.chat, { text: upgradeSuccess }, { quoted: m })
    }

    // 4. أمر شراء الدرع (.شراء_درع)
    if (command === 'شراء_درع' || command === 'buy_shield') {
      if (isDeveloper) {
        return await conn.sendMessage(m.chat, { text: `👑 قلعتك محمية بحصن إمبراطوري أبدي!` }, { quoted: m })
      }
      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ يجب تسجيلك في البنك أولاً عبر أمر ${usedPrefix}سجل_بنك` }, { quoted: m })
      }

      let user = db[userId]
      initUserCastle(user)

      let shieldCost = 10
      if (user.points < shieldCost) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🛡️ مخزن الدروع - خطأ' },
            { type: 'warning', text: `رصيد نقاطك لا يكفي لشراء درع حماية!\nتكلفة الدرع: ${shieldCost} نقطة، بينما رصيدك الحالي: ${user.points} نقطة.` }
          ])
        }, { quoted: m })
      }

      user.points -= shieldCost
      user.castle.army.shields += 1
      saveDatabase(m.chat, db)

      let shieldSuccess = `🛡️ *تم شراء درع الحماية بنجاح!*
───────────────────
 ┠ 🛍️ *الدرع المضاف:* +1 درع طاقة حربي
 ┠ 🛡️ *إجمالي دورتك من الدروع:* ${user.castle.army.shields} درع
 ┠ ⭐ *نقاطك المتبقية:* ${user.points} نقطة
───────────────────
💡 *أنت الآن مستعد تماماً لردع أي هجوم مفاجئ!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
      return await conn.sendMessage(m.chat, { text: shieldSuccess }, { quoted: m })
    }

    // 5. نظام الهجوم الحربي المتبادل (.هجوم)
    if (command === 'هجوم' || command === 'attack') {
      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ يجب تسجيلك في البنك أولاً لتتمكن من شن الهجمات!` }, { quoted: m })
      }

      let attacker = db[userId]
      initUserCastle(attacker)

      let targetId = null
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetId = m.mentionedJid[0]
      } else if (m.quoted && m.quoted.sender) {
        targetId = m.quoted.sender
      }

      if (!targetId) {
        return await conn.sendMessage(m.chat, {
          text: `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝑶𝐊𝐄𝑹 ] ── ✦ ── ❖
🔹 *⚠️ خطأ في الاستهداف*
──────────────────
 ┠ ❌ *يجب عليك المنشن أو الرد على رسالة الشخص الذي تريد الهجوم على قلعته!*
 ┣ 📌 *مثال:* *${usedPrefix}هجوم @مستهدف*
──────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        }, { quoted: m })
      }

      if (targetId === userId) {
        return await conn.sendMessage(m.chat, { text: `❌ هل أنت مجنون لتهجم على قلعتك الخاصة؟! اختر هدفاً آخر.` }, { quoted: m })
      }

      let isTargetDeveloper = allowedOwners.includes(targetId) || allowedOwners.some(owner => owner.split('@')[0] === targetId.split('@')[0])
      if (isTargetDeveloper) {
        let attackerLossCoins = Math.floor(attacker.coins * 0.5) || 50
        attacker.coins = Math.max(0, attacker.coins - attackerLossCoins)
        saveDatabase(m.chat, db)

        let devCounterAttackText = `🚨 *هجوم مرتد فوري من قلعة الإمبراطور الأسطوري!* ☠️⛓️
───────────────────
 ┠ 👤 ╎ المهاجم الطائش: [@${userId.split('@')[0]}]
 ┠ ⚡ *الرد الإمبراطوري:* هذه القلعة لا يمكن اختراقها.. إنها قلعة الإمبراطور!
 ┠ 💥 *العقاب الفوري:* تم صد هجومك وتغريمك نصف رصيدك البنكي (${attackerLossCoins} ذهبة) لتطاولك على العرش!
───────────────────
☠️ *إياك ومحاولة اللعب مع الكبار مرة أخرى!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
        return await conn.sendMessage(m.chat, {
          text: devCounterAttackText,
          contextInfo: { mentionedJid: [userId] }
        }, { quoted: m })
      }

      if (!db[targetId]) {
        return await conn.sendMessage(m.chat, { text: `❌ هذا الشخص ليس مسجلاً في البنك واللعبة، قلعته غير موجودة لتهاجمها!` }, { quoted: m })
      }

      let victim = db[targetId]
      initUserCastle(victim)

      let attackAlertText = `🚨 *تنبيه خطير: تعرضت قلعتك لهجوم عسكري شرس!* ⚔️
───────────────────
 ┠ 👤 ╎ المهاجم الشرس: [@${userId.split('@')[0]}]
 ┠ 🏰 ╎ مستواه/قلعته: مستوى ${attacker.castle.level}
───────────────────
⚡ *أمامك خياران للدفاع عن حصنك وعرشك:*
 ┠ 🛡️ *1. ردع الهجوم:* (يستهلك درعاً واحداً إن وجد لصد الغارة بسلام).
 ┠ ❌ *2. تجاهل الهجوم:* (في حال التجاهل، سيتم سحق قلعتك والاستيلاء على كل عتادك وذهبك للمهاجم!).
───────────────────
💡 *قم بالرد على هذه الرسالة واكتب:*
 ▪️ **ردع** (لصد الهجوم بسلام وحماية قلعتك)
 ▪️ **تجاهل** (لترك قلعتك تواجه مصيرها المحتوم)
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      victim.pendingAttack = {
        attackerId: userId,
        timestamp: Date.now()
      }
      saveDatabase(m.chat, db)

      return await conn.sendMessage(m.chat, {
        text: attackAlertText,
        contextInfo: { mentionedJid: [targetId, userId] }
      }, { quoted: m })
    }

  } catch (e) {
    console.error('[Castle System Error]', e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ عسكري"' },
        { type: 'warning', text: 'حدث خطأ أثناء معالجة النظام العسكري والقلعة' }
      ])
    }, { quoted: m })
  }
}

// دالة لمعالجة ردود الأفعال التلقائية (ردع أو تجاهل)
let beforeHandler = async (m, { conn }) => {
  if (!m.text || m.isBaileys || !m.isGroup) return

  let text = m.text.trim().toLowerCase()
  if (text !== 'ردع' && text !== 'تجاهل') return

  let db = loadDatabase(m.chat)
  let userId = m.sender

  if (!db[userId]) return
  let victim = db[userId]
  initUserCastle(victim)

  if (!victim.pendingAttack) return

  let attackerId = victim.pendingAttack.attackerId
  let attacker = db[attackerId]
  delete victim.pendingAttack

  if (!attacker) {
    saveDatabase(m.chat, db)
    return await conn.sendMessage(m.chat, { text: `⚠️ انتهت صلاحية المعركة أو اختفى المهاجم.` }, { quoted: m })
  }

  initUserCastle(attacker)

  if (text === 'ردع') {
    if (victim.castle.army.shields > 0) {
      victim.castle.army.shields -= 1
      saveDatabase(m.chat, db)

      let shieldSuccessText = `🛡️ *تم ردع الهجوم بنجاح تامة يا بطل!* ⚔️
───────────────────
 ┠ 🛑 *النتيجة:* استبسل جيشك واستخدمت درع الحماية لصد غارة المهاجم بنجاح.
 ┠ 🛡️ *الدروع المتبقية لديك:* ${victim.castle.army.shields} درع.
───────────────────
💡 *تحتاج لمزيد من الدروع؟ اكتب .شراء_درع أو طور قلعتك بـ .تطوير لتصبح القلعة أقوى وأقوى!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: shieldSuccessText }, { quoted: m })
    } else {
      if (victim.castle.level > attacker.castle.level) {
        let stolenCoins = Math.floor(attacker.coins * 0.3) || 100
        attacker.coins = Math.max(0, attacker.coins - stolenCoins)
        victim.coins += stolenCoins

        saveDatabase(m.chat, db)

        let counterVictoryText = `⚡ *قلعتك المطورة أحدثت انقلاباً أسطورياً!* 🏰🔥
───────────────────
 ┠ 🛡️ *النتيجة:* لم يكن لديك دروع، لكن لأن قلعتك (**مستوى ${victim.castle.level}**) مطورة أكثر من قلعة المهاجم (**مستوى ${attacker.castle.level}**)، فقد انقلب الهجوم عليه!
 ┠ 💰 *الغنائم المستردة:* قمت بالاستيلاء على غنائم المهاجم وغرامة قدرها ${stolenCoins} عملة ذهبية!
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: counterVictoryText }, { quoted: m })
      } else {
        let lootedCoins = victim.coins
        attacker.coins += lootedCoins
        victim.coins = 0
        victim.castle = {
          level: 1,
          buildings: {
            mainCastle: 'القلعة الرئيسية (مستوى 1)',
            hospital: 'المستشفى (مستوى 1)',
            barracks: 'معسكر الجيش (مستوى 1)'
          },
          army: {
            infantry: 5,
            warPlanes: 7,
            ammoBoxes: 10,
            cannons: 5,
            shields: 1
          }
        }

        saveDatabase(m.chat, db)

        let defeatText = `💥 *للأسف! لم تكن تمتلك دروعاً كافية وقلعتك كانت أقل تحصيناً!* 🏴‍☠️
───────────────────
 ┠ ☠️ *النتيجة:* نجح الهجوم وسحق قلعتك بالكامل وتم الاستيلاء على كل رصيدك البنكي (${lootedCoins} ذهبة)!
 ┠ 🔄 *إعادة البناء:* تم مسح قلعتك القديمة وبناء قلعة جديدة لك من الصفر (مستوى 1 مع العتاد الابتدائي).
───────────────────
💡 *تعلم الدرس، وطور قلعتك بـ .تطوير واشترِ دروعاً بـ .شراء_درع قبل فوات الأوان!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: defeatText }, { quoted: m })
      }
    }
  }

  if (text === 'تجاهل') {
    let lootedCoins = victim.coins
    attacker.coins += lootedCoins
    victim.coins = 0
    victim.castle = {
      level: 1,
      buildings: {
        mainCastle: 'القلعة الرئيسية (مستوى 1)',
        hospital: 'المستشفى (مستوى 1)',
        barracks: 'معسكر الجيش (مستوى 1)'
      },
      army: {
        infantry: 5,
        warPlanes: 7,
        ammoBoxes: 10,
        cannons: 5,
        shields: 1
      }
    }

    saveDatabase(m.chat, db)

    let ignoredDefeatText = `🏴‍☠️ *لقد تجاهلت الهجوم فتم سحقك بالكامل!* 💥
───────────────────
 ┠ 💀 *النتيجة:* استولى المهاجم على كل رصيدك البنكي (${lootedCoins} ذهبة) وجميع عتادك!
 ┠ 🔄 *إعادة البناء من الصفر:* تم مسح قلعتك السابقة وبناء قلعة جديدة كلياً لك لتبدأ من جديد.
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

    return await conn.sendMessage(m.chat, { text: ignoredDefeatText }, { quoted: m })
  }
}

handler.help = ['قلعتي', 'تجنيد', 'تطوير', 'شراء_درع', 'هجوم', 'castle']
handler.tags = ['bank', 'castle']
handler.command = ['قلعتي', 'تجنيد', 'تطوير', 'شراء_درع', 'هجوم', 'castle']
handler.before = beforeHandler

export default handler
