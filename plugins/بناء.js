// plugins/economy-castle-expansion.js
// ✧ THE JOKER & ITACHI - Advanced Empire, Economy & Worker Management System 🏰👑⚔️

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// دالة لتحديد مسار بنك المجموعة الفريد (لكل مجموعة ملفها الخاص)
const getGroupBankPath = (groupId) => {
  const safeId = (groupId || 'global').replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.resolve(`database/groups/${safeId}/bank.json`)
}

// الأرقام الموثوقة للمطور بصلاحيات الإمبراطور المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

function loadDatabase(groupId) {
  try {
    const dbPath = getGroupBankPath(groupId)
    if (!fs.existsSync(dbPath)) {
      const dir = path.dirname(dbPath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2))
    }
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    console.error('[Empire DB Error]', e)
    return {}
  }
}

function saveDatabase(groupId, data) {
  try {
    const dbPath = getGroupBankPath(groupId)
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Empire Save Error]', e)
  }
}

// دالة لضمان توفر هيكل الإمبراطورية والمباني والاقتصاد والربط الشامل بأوامر القلعة والبنك
function initEmpireEconomy(user) {
  // ربط بيانات البنك الأساسية لضمان عدم حدوث أخطاء مع أوامر القلعة الأخرى
  if (typeof user.points !== 'number') user.points = 0
  if (typeof user.coins !== 'number') user.coins = 0
  if (typeof user.diamonds !== 'number') user.diamonds = 0
  if (!user.name) user.name = 'مستخدم محارب'

  if (!user.castle) {
    user.castle = { 
      level: 1, 
      buildings: {}, 
      army: { infantry: 5, warPlanes: 7, ammoBoxes: 10, cannons: 5, shields: 1 } 
    }
  } else {
    // ضمان وجود خصائص الجيش والقلعة المترابطة
    if (!user.castle.level) user.castle.level = 1
    if (!user.castle.buildings) user.castle.buildings = {}
    if (!user.castle.army) user.castle.army = { infantry: 5, warPlanes: 7, ammoBoxes: 10, cannons: 5, shields: 1 }
  }

  if (!user.empire) {
    user.empire = {
      buildingsList: [], 
      workers: {
        goldWorkers: 0,
        diamondWorkers: 0,
        teachers: 0,
        farmers: 0
      },
      resources: {
        gold: 0,
        diamonds: 0,
        food: 100,
        wheat: 50,
        studentsCount: 0
      },
      lastHarvestTime: 0,
      lastWorkerFeedCheck: 0,
      pendingWorkerWages: false
    }
  } else {
    if (!user.empire.buildingsList) user.empire.buildingsList = []
    if (!user.empire.workers) user.empire.workers = { goldWorkers: 0, diamondWorkers: 0, teachers: 0, farmers: 0 }
    if (!user.empire.resources) user.empire.resources = { gold: 0, diamonds: 0, food: 100, wheat: 50, studentsCount: 0 }
  }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    // تحديد معرف المجموعة الحالي (أو الخاص إن لم يكن في جروب لضمان استقرار التشغيل)
    let groupId = m.isGroup ? m.chat : 'private_chats'
    let db = loadDatabase(groupId)
    let userId = m.sender
    let isDeveloper = allowedOwners.includes(userId) || allowedOwners.some(owner => owner.split('@')[0] === userId.split('@')[0])

    // ==========================================
    // 1. نظام البناء المتقدم (.بناء)
    // ==========================================
    if (command === 'بناء' || command === 'build') {
      if (isDeveloper) {
        return await conn.sendMessage(m.chat, { 
          text: `👑 *يا إمبراطور الأوتشيها:* إمبراطوريتك داخل هذه المجموعة تضم بالفعل كافة عجائب الدنيا والمباني الأسطورية المطلقة! 🏰✨` 
        }, { quoted: m })
      }

      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { 
          text: `⚠️ *يجب أن تمتلك قلعة مسجلة في بنك هذه المجموعة أولاً!\nاكتب:* ${usedPrefix}سجل_بنك ثم ${usedPrefix}قلعتي` 
        }, { quoted: m })
      }

      let user = db[userId]
      initEmpireEconomy(user)

      let buildingType = args[0] ? args[0].toLowerCase() : ''
      if (!buildingType) {
        let buildMenuText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
🏰 *قـائمـة المـبـاني الإمـبـراطـوريـة المـتـاحـة (لهذا الجروب)*
───────────────────
 ┠ 🪙 *1. منجم ذهب* (السعر: 50 نقطة)
 ┠      ▪️ *الأمر:* \`${usedPrefix}بناء منجم_ذهب\`
 ┠      ▪️ *الميزة:* يتيح لك جمع الذهب المستمر ويهديك 5 عمال مجاناً!
───────────────────
 ┠ 💎 *2. منجم الماس* (السعر: 100 نقطة)
 ┠      ▪️ *الأمر:* \`${usedPrefix}بناء منجم_الماس\`
 ┠      ▪️ *الميزة:* يتيح لك جمع الألماس النادر ويعطيك عمال منجم ألماس!
───────────────────
 ┠ 📚 *3. مدرسه* (السعر: 10 نقاط)
 ┠      ▪️ *الأمر:* \`${usedPrefix}بناء مدرسه\`
 ┠      ▪️ *الميزة:* ترفع عدد الطلاب وتدر عليك نقاط يومية وأرباح هائلة!
───────────────────
 ┠ 🌾 *4. مزرعه* (السعر: 20 نقطة)
 ┠      ▪️ *الأمر:* \`${usedPrefix}بناء مزرعه\`
 ┠      ▪️ *الميزة:* تنتج المحاصيل الوفيرة، القمح والفواكه لإطعام جيشك وعمالك!
───────────────────
 ┠ 🏛️ *5. برج الحراسة الدفاعي* (السعر: 75 نقطة)
 ┠      ▪️ *الأمر:* \`${usedPrefix}بناء برج_حراسة\`
 ┠      ▪️ *الميزة:* يرفع قوة ردع الهجمات ويحمي مخازن الغلال والقلعة.
───────────────────
💡 *اختر المبنى المناسب واكتب:* *${usedPrefix}بناء [اسم_المبنى]*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: buildMenuText }, { quoted: m })
      }

      let cost = 0
      let buildingName = ''
      let buildingKey = ''
      let bonusWorkers = 0

      if (buildingType.includes('منجم_ذهب') || buildingType.includes('ذهب') || buildingType.includes('gold')) {
        cost = 50
        buildingName = 'منجم الذهب الملكي 🪙'
        buildingKey = 'gold_mine'
        bonusWorkers = 5
      } else if (buildingType.includes('منجم_الماس') || buildingType.includes('الماس') || buildingType.includes('diamond')) {
        cost = 100
        buildingName = 'منجم الألماس الخام 💎'
        buildingKey = 'diamond_mine'
        bonusWorkers = 3
      } else if (buildingType.includes('مدرسه') || buildingType.includes('مدرسة') || buildingType.includes('school')) {
        cost = 10
        buildingName = 'المدرسة الإمبراطورية 📚'
        buildingKey = 'school'
        bonusWorkers = 2
      } else if (buildingType.includes('مزرعه') || buildingType.includes('مزرعة') || buildingType.includes('farm')) {
        cost = 20
        buildingName = 'المزرعة الكبرى 🌾'
        buildingKey = 'farm'
        bonusWorkers = 4
      } else if (buildingType.includes('برج') || buildingType.includes('tower')) {
        cost = 75
        buildingName = 'برج الحراسة الدفاعي 🏰'
        buildingKey = 'defense_tower'
        bonusWorkers = 0
      } else {
        return await conn.sendMessage(m.chat, { text: `❌ هذا المبنى غير مدرج في السجلات! اكتب ${usedPrefix}بناء لرؤية المباني المتاحة.` }, { quoted: m })
      }

      if (user.points < cost) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '🏗️ خزانة الإمبراطورية - خطأ في النقاط' },
            { type: 'warning', text: `نقاطك لا تكفي لبناء [${buildingName}]!\nالتكلفة المطلوبة: ${cost} نقطة، بينما رصيدك الحالي: ${user.points} نقطة.` }
          ])
        }, { quoted: m })
      }

      user.points -= cost
      if (!user.empire.buildingsList.includes(buildingName)) {
        user.empire.buildingsList.push(buildingName)
      }

      // ربط المبنى بخصائص القلعة الأساسية (.قلعتي)
      user.castle.buildings[buildingKey] = (user.castle.buildings[buildingKey] || 0) + 1

      if (buildingKey === 'gold_mine') {
        user.empire.workers.goldWorkers += bonusWorkers
      } else if (buildingKey === 'diamond_mine') {
        user.empire.workers.diamondWorkers += bonusWorkers
      } else if (buildingKey === 'school') {
        user.empire.workers.teachers += bonusWorkers
        user.empire.resources.studentsCount += bonusWorkers * 15
      } else if (buildingKey === 'farm') {
        user.empire.workers.farmers += bonusWorkers
        user.empire.resources.food += 150
        user.empire.resources.wheat += 100
      } else if (buildingKey === 'defense_tower') {
        user.castle.army.shields += 1
      }

      saveDatabase(groupId, db)

      let buildSuccessText = `🎉 *تم تشييد [ ${buildingName} ] بنجاح تام داخل إمبراطورية الجروب!* 🏗️⚔️
───────────────────
 ┠ ⭐ *النقاط المخصومة:* -${cost} نقطة
 ┠ 👷 *العمال والكوادر الممنوحة هدية:* +${bonusWorkers} عاملين/متخصصين بقرار ملكي!
 ┠ 🏰 *تم التحديث في هيكل قلعتك بنجاح.*
───────────────────
💡 *أوامر الجمع المتاحة الآن لاستخراج الثروات:*
 ┠ ▪️ \`${usedPrefix}جمع_ذهب\` (من منجم الذهب)
 ┠ ▪️ \`${usedPrefix}جمع_الماس\` (من منجم الألماس)
 ┠ ▪️ \`${usedPrefix}جمع_المدرسة\` (من المدرسة)
 ┠ ▪️ \`${usedPrefix}جمع_المزرعة\` (من المحاصيل)
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: buildSuccessText }, { quoted: m })
    }

    // ==========================================
    // 2. نظام الجمع الشامل (.جمع أو .جمع_...)
    // ==========================================
    if (command === 'جمع' || command === 'جمع_ذهب' || command === 'جمع_الماس' || command === 'جمع_المدرسة' || command === 'جمع_المزرعة' || command === 'collect') {
      if (isDeveloper) {
        return await conn.sendMessage(m.chat, { text: `👑 خزائن الإمبراطور تمتلئ تلقائياً بمليارات الأطنان من الذهب والألماس والقمح بلا حدود في هذا الجروب!` }, { quoted: m })
      }

      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ يجب تسجيلك في بنك هذا الجروب واللعبة أولاً!` }, { quoted: m })
      }

      let user = db[userId]
      initEmpireEconomy(user)

      let subAction = args[0] ? args[0].toLowerCase() : ''
      if (command.includes('ذهب') || subAction.includes('ذهب') || subAction.includes('gold')) {
        if (user.empire.workers.goldWorkers <= 0) {
          return await conn.sendMessage(m.chat, { text: `❌ ليس لديك عمال في منجم الذهب! ابنِ منجمًا أو استخدم أمر \`${usedPrefix}شراء_عمال\` لتعيين عمال جدد.` }, { quoted: m })
        }
        let collectedGold = user.empire.workers.goldWorkers * 12
        user.coins += collectedGold
        saveDatabase(groupId, db)
        return await conn.sendMessage(m.chat, { text: `🪙 *نجاح عملية جمع الذهب!* استخرج عمالك (${user.empire.workers.goldWorkers} عامل) مبلغ *${collectedGold} ذهبة* وأضيفت لبنكك في الجروب.` }, { quoted: m })
      }

      if (command.includes('الماس') || subAction.includes('الماس') || subAction.includes('diamond')) {
        if (user.empire.workers.diamondWorkers <= 0) {
          return await conn.sendMessage(m.chat, { text: `❌ ليس لديك عمال في منجم الألماس!` }, { quoted: m })
        }
        let collectedDiamonds = user.empire.workers.diamondWorkers * 3
        user.diamonds += collectedDiamonds
        saveDatabase(groupId, db)
        return await conn.sendMessage(m.chat, { text: `💎 *نجاح عملية جمع الألماس!* قام عمال الألماس باستخراج *${collectedDiamonds} ألماسة براقة* وإضافتها لرصيدك.` }, { quoted: m })
      }

      if (command.includes('المدرسة') || subAction.includes('المدرسة') || subAction.includes('school')) {
        if (user.empire.workers.teachers <= 0) {
          return await conn.sendMessage(m.chat, { text: `❌ ليس لديك مدرسون في المدرسة الإمبراطورية!` }, { quoted: m })
        }
        let schoolPoints = user.empire.workers.teachers * 8 + Math.floor(user.empire.resources.studentsCount / 5)
        user.points += schoolPoints
        saveDatabase(groupId, db)
        return await conn.sendMessage(m.chat, { text: `📚 *نجاح حصاد المدرسة!* بفضل جهود (${user.empire.workers.teachers} مدرس) وتفاعل (${user.empire.resources.studentsCount} طالب)، تم جني *${schoolPoints} نقطة* وإضافتها لرصيدك.` }, { quoted: m })
      }

      if (command.includes('المزرعة') || subAction.includes('المزرعة') || subAction.includes('farm')) {
        let farmFood = (user.empire.workers.farmers || 2) * 25
        let farmWheat = (user.empire.workers.farmers || 2) * 15
        user.empire.resources.food += farmFood
        user.empire.resources.wheat += farmWheat
        saveDatabase(groupId, db)
        return await conn.sendMessage(m.chat, { text: `🌾 *حصاد وفير من المزرعة الكبرى!* أنتج المزارعون *${farmWheat} وحدة قمح* و *${farmFood} وحدة فواكه وأغذية* لتغذية الجيش والعمال.` }, { quoted: m })
      }

      let collectMenu = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
🌾 *قـائمـة الـجـمـع والإنـتـاج الإمـبـراطـوري*
───────────────────
 ┠ 🪙 \`${usedPrefix}جمع_ذهب\` (جمع الأرباح من منجم الذهب)
 ┠ 💎 \`${usedPrefix}جمع_الماس\` (جمع الألماس من منجم الألماس)
 ┠ 📚 \`${usedPrefix}جمع_المدرسة\` (جمع النقاط من المدرسة والطلاب)
 ┠ 🌾 \`${usedPrefix}جمع_المزرعة\` (جمع القمح والفواكه والأغذية)
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: collectMenu }, { quoted: m })
    }

    // ==========================================
    // 3. أمر عرض الجيش الخاص بك (.جيشي) أو جيش الخصم (.جيشه)
    // ==========================================
    if (command === 'جيشي' || command === 'جيشه' || command === 'army') {
      let targetId = userId

      if (command === 'جيشه') {
        if (m.mentionedJid && m.mentionedJid.length > 0) {
          targetId = m.mentionedJid[0]
        } else if (m.quoted && m.quoted.sender) {
          targetId = m.quoted.sender
        } else {
          return await conn.sendMessage(m.chat, { text: `⚠️ يرجى عمل منشن أو الرد على رسالة الشخص لمعرفة تفاصيل جيشه وقمعه في هذا الجروب!` }, { quoted: m })
        }
      }

      let isTargetDev = allowedOwners.includes(targetId) || allowedOwners.some(owner => owner.split('@')[0] === targetId.split('@')[0])

      if (isTargetDev) {
        let devArmyReport = `🏰 *تـقـريـر الـجيش الإمـبـراطـوري الأَسْـطُـوري* ☠️⛓️
───────────────────
 ┠ 👤 ╎ القائد الأعلى: الملك الأوتشيها الأوحد
 ┠ 🪖 ╎ المشاة: 999,999 جندي ظل لا يقهورن
 ┠ ✈️ ╎ القوات الجوية: 999,999 طائرة حربية خارقة
 ┠ 🎯 ╎ المدفعية الثقيلة: 999,999 مدفع دمار شامل
 ┠ 📦 ╎ الذحيرة والمؤن: بلا حدود (أزلية)
 ┠ 🛡️ ╎ دروع الطاقة: درع إلهي مطلق لا يمكن اختراقه
───────────────────
☠️ *هذا الجيش يحمي عروش السلاطين، إقترابك منه يعني الفناء الفوري!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { 
          text: devArmyReport, 
          contextInfo: { mentionedJid: [targetId] } 
        }, { quoted: m })
      }

      if (!db[targetId]) {
        let notRegisteredArmy = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
🔹 *⚠️ خطأ في الاستعلام العسكري*
───────────────────
 ┠ ❌ *هذا المستخدم ليس لديه قلعة أو حساب مسجل في بنك هذا الجروب!*
 ┠ 💡 *لا توجد أي قوات عسكرية مسجلة لهذا الشخص هنا.*
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: notRegisteredArmy }, { quoted: m })
      }

      let targetUser = db[targetId]
      initEmpireEconomy(targetUser)

      let armyReportText = `🛡️ *تـقـريـر جـيش وإمـبـراطـوريـة [ ${targetUser.name || 'المستخدم'} ]*
───────────────────
 ┠ 🏰 *مستوى القلعة:* المستوى ${targetUser.castle.level || 1}
 ┠ 🪖 *المشاة والجنود:* ${targetUser.castle.army.infantry} جندي
 ┠ ✈️ *الطائرات الحربية:* ${targetUser.castle.army.warPlanes} طائرة
 ┠ 🎯 *المدافع الثقيلة:* ${targetUser.castle.army.cannons} مدفع
 ┠ 📦 *صناديق الذخيرة:* ${targetUser.castle.army.ammoBoxes} صندوق
 ┠ 🛡️ *دروع الحماية:* ${targetUser.castle.army.shields} درع
───────────────────
👷 *الكوادر والعمال الميدانيون:*
 ┠      ▪️ عمال الذهب: ${targetUser.empire.workers.goldWorkers} عامل 🪙
 ┠      ▪️ عمال الألماس: ${targetUser.empire.workers.diamondWorkers} عامل 💎
 ┠      ▪️ المدرسون: ${targetUser.empire.workers.teachers} مدرس 📚 (الطلاب: ${targetUser.empire.resources.studentsCount})
 ┠      ▪️ المزارعون: ${targetUser.empire.workers.farmers} مزارع 🌾
───────────────────
🌾 *مخزون المؤن والغلال الغذائية:*
 ┠      ▪️ وحدات القمح: ${targetUser.empire.resources.wheat} وحدة
 ┠      ▪️ وحدات الفواكه والطعام: ${targetUser.empire.resources.food} وحدة
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { 
        text: armyReportText, 
        contextInfo: { mentionedJid: [targetId] } 
      }, { quoted: m })
    }

    // ==========================================
    // 4. أمر شراء العمال والمدرسين (.شراء_عمال)
    // ==========================================
    if (command === 'شراء_عمال' || command === 'buy_workers') {
      if (isDeveloper) {
        return await conn.sendMessage(m.chat, { text: `👑 جيوش العمال والمهندسين تحت طوع الإمبراطور بلا حساب في هذه المجموعة!` }, { quoted: m })
      }

      if (!db[userId]) {
        return await conn.sendMessage(m.chat, { text: `⚠️ يجب تسجيلك في بنك هذا الجروب أولاً!` }, { quoted: m })
      }

      let user = db[userId]
      initEmpireEconomy(user)

      let workerType = args[0] ? args[0].toLowerCase() : ''
      let amount = args[1] ? parseInt(args[1]) : 1

      if (!workerType || isNaN(amount) || amount <= 0) {
        let workerUsage = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
👷 *نـظـام تـعيـين وشـراء العـمـال والمـخـتـصـين*
───────────────────
 ┠ 🪙 *عامل ذهب* (تكلفة العامل: 1 نقطة) ➔ \`${usedPrefix}شراء_عمال ذهب 5\`
 ┠ 💎 *عامل ألماس* (تكلفة العامل: 3 نقاط) ➔ \`${usedPrefix}شراء_عمال الماس 2\`
 ┠ 📚 *مدرس مدرسة* (تكلفة المدرس: 2 نقطة) ➔ \`${usedPrefix}شراء_عمال مدرس 3\`
 ┠ 🌾 *مزارع* (تكلفة المزارع: 1 نقطة) ➔ \`${usedPrefix}شراء_عمال مزارع 4\`
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

        return await conn.sendMessage(m.chat, { text: workerUsage }, { quoted: m })
      }

      let costPerWorker = 1
      let workerKey = ''
      let workerArabicName = ''

      if (workerType.includes('ذهب') || workerType.includes('gold')) {
        costPerWorker = 1
        workerKey = 'goldWorkers'
        workerArabicName = 'عامل منجم ذهب'
      } else if (workerType.includes('الماس') || workerType.includes('diamond')) {
        costPerWorker = 3
        workerKey = 'diamondWorkers'
        workerArabicName = 'عامل منجم ألماس'
      } else if (workerType.includes('مدرس') || workerType.includes('teacher')) {
        costPerWorker = 2
        workerKey = 'teachers'
        workerArabicName = 'مدرس إمبراطوري'
      } else if (workerType.includes('مزارع') || workerType.includes('farmer')) {
        costPerWorker = 1
        workerKey = 'farmers'
        workerArabicName = 'مزارع محترف'
      } else {
        return await conn.sendMessage(m.chat, { text: `❌ نوع العمالة غير معروف! اكتب ${usedPrefix}شراء_عمال لمعرفة الخيارات المتاحة.` }, { quoted: m })
      }

      let totalCost = costPerWorker * amount

      if (user.points < totalCost) {
        return await conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '👷 خزانة النقاط - خطأ' },
            { type: 'warning', text: `نقاطك لا تكفي لتعيين هؤلاء العمال!\nالتكلفة الإجمالية: ${totalCost} نقطة، بينما رصيدك: ${user.points} نقطة.` }
          ])
        }, { quoted: m })
      }

      user.points -= totalCost
      user.empire.workers[workerKey] += amount

      if (workerKey === 'teachers') {
        user.empire.resources.studentsCount += amount * 12
      }

      saveDatabase(groupId, db)

      let buyWorkerSuccess = `👷 *تم تعيين العمال الجدد بنجاح داخل إمبراطورية الجروب!* 🏛️
───────────────────
 ┠ 👥 *التعيين:* إضافة ${amount} من [${workerArabicName}]
 ┠ ⭐ *التكلفة المخصومة:* ${totalCost} نقطة ترقية
 ┠ 📈 *إجمالي العمالة من هذا النوع:* ${user.empire.workers[workerKey]} عامل
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: buyWorkerSuccess }, { quoted: m })
    }

  } catch (e) {
    console.error('[Empire System Error]', e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ في إدارة الإمبراطورية"' },
        { type: 'warning', text: 'حدث خطأ أثناء معالجة نظام المباني والجيش والعمال' }
      ])
    }, { quoted: m })
  }
}

// دالة تفاعلية خلف الكواليس لإدارة أجور العمال والمؤن الأسبوعية لكل مجموعة على حدة
let beforeEmpireHandler = async (m, { conn }) => {
  if (!m.text || m.isBaileys || !m.isGroup) return
  let text = m.text.trim().toLowerCase()

  if (text === 'إطعام' || text === 'اكل' || text === 'دعهم يموتون' || text === 'موتوا') {
    let groupId = m.chat
    let db = loadDatabase(groupId)
    let userId = m.sender
    if (!db[userId]) return
    let user = db[userId]
    initEmpireEconomy(user)

    if (!user.empire.pendingWorkerWages) return
    user.empire.pendingWorkerWages = false

    if (text.includes('إطعام') || text.includes('اكل')) {
      user.empire.resources.food = Math.max(0, user.empire.resources.food - 20)
      saveDatabase(groupId, db)
      return await conn.sendMessage(m.chat, {
        text: `🍖 *تم إطعام العمال والجيش بنجاح تام داخل إمبراطورية الجروب!* واصلوا العمل بكل طاقة في مناجم الذهب والألماس والمزارع.`
      }, { quoted: m })
    } else {
      user.empire.workers.goldWorkers = 0
      user.empire.workers.diamondWorkers = 0
      saveDatabase(groupId, db)
      return await conn.sendMessage(m.chat, {
        text: `💀 *للأسف، بسبب المجاعة رفض العمال مواصلة العمل ولقوا حتفهم أو هربوا!* توقف إنتاج مناجم الذهب والألماس تماماً. استخدم \`${m.usedPrefix || '.'}شراء_عمال\` لجلب عمال جدد.`
      }, { quoted: m })
    }
  }
}

handler.help = ['بناء', 'جمع', 'جمع_ذهب', 'جمع_الماس', 'جمع_المدرسة', 'جمع_المزرعة', 'جيشي', 'جيشه', 'شراء_عمال']
handler.tags = ['castle', 'empire']
handler.command = ['بناء', 'جمع', 'جمع_ذهب', 'جمع_الماس', 'جمع_المدرسة', 'جمع_المزرعة', 'جيشي', 'جيشه', 'شراء_عمال', 'build']
handler.before = beforeEmpireHandler

export default handler
