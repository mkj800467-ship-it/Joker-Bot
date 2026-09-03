// plugins/level.js
// ✧ THE JOKER & ITACHI - 100 Ranks Progressive Level & Mission System 📊
import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

// الأرقام الموثوقة للمطور بصلاحيات الملوك المطلقة
const allowedOwners = [
  '249916221538@s.whatsapp.net',
  '14904274759837@lid'
];

// قائمة الـ 100 رتبة المتدرجة وصولاً إلى الإمبراطور
const ranksList = [
  { level: 1, name: 'مواطن عادي', status: 'فقير جداً' },
  { level: 2, name: 'شرطي', status: 'فقير فقط' },
  { level: 3, name: 'حارس أمن', status: 'مبتدئ' },
  { level: 4, name: 'جندي', status: 'يكفي قوت يومه' },
  { level: 5, name: 'عريف', status: 'مستور الحال' },
  { level: 6, name: 'رقيب', status: 'متوسط الدخل' },
  { level: 7, name: 'ملازم', status: 'يبني مستقبله' },
  { level: 8, name: 'نقيب', status: 'صاحب دخل جيد' },
  { level: 9, name: 'رائد', status: 'ميسور الحال' },
  { level: 10, name: 'مقدم', status: 'ناجح مالياً' },
  { level: 11, name: 'عقيد', status: 'ثري صغير' },
  { level: 12, name: 'عميد', status: 'مالك عقار' },
  { level: 13, name: 'لواء', status: 'تاجر محلي' },
  { level: 14, name: 'فريق', status: 'رجل أعمال صاعد' },
  { level: 15, name: 'مشير', status: 'مستثمر بارز' },
  { level: 16, name: 'زعيم حي', status: 'صاحب نفوذ' },
  { level: 17, name: 'عمدة المدينة', status: 'شخصية عامة' },
  { level: 18, name: 'محافظ', status: 'صانع قرار' },
  { level: 19, name: 'وزير مصغر', status: 'ثري معروف' },
  { level: 20, name: 'رئيس وزراء', status: 'صاحب ثروة ضخمة' },
  { level: 21, name: 'بارون تجارة', status: 'مليونير مبتدئ' },
  { level: 22, name: 'كونت', status: 'نبيل البلاط' },
  { level: 23, name: 'ماركيز', status: 'مالك أساطيل' },
  { level: 24, name: 'دوق', status: 'صاحب إقطاعية' },
  { level: 25, name: 'أمير الإقليم', status: 'ملك الشوارع' },
  { level: 26, name: 'ملك الظل', status: 'مسيطر خفي' },
  { level: 27, name: 'سيد الأبراج', status: 'عملاق عقاري' },
  { level: 28, name: 'إمبراطور الذهب', status: 'مليونير مخضرم' },
  { level: 29, name: 'أسطورة المال', status: 'مكتفي ذاتياً كلياً' },
  { level: 30, name: 'فارس المافيا', status: 'قائد عصابة' },
  { level: 31, name: 'زعيم الجريمة المنظمة', status: 'مسيطر إقليمي' },
  { level: 32, name: 'أبرز الأثرياء', status: 'قائمة فوربس' },
  { level: 33, name: 'مستذئب الليل', status: 'شخصية مرعبة وثري' },
  { level: 34, name: 'مصاص دماء ملكي', status: 'خالد بالثروة' },
  { level: 35, name: 'ساموراي عتيق', status: 'سيف الحقيقة' },
  { level: 36, name: 'نينجا الأساطير', status: 'ظل لا يُرى' },
  { level: 37, name: 'معلم الشينوبي', status: 'حكيم العصر' },
  { level: 38, name: 'بطل الكونوها', status: 'فخر القرية' },
  { level: 39, name: 'قائد الأوبنهايمر', status: 'عالم ذو نفوذ' },
  { level: 40, name: 'مخترع الملايين', status: 'عبقري مالي' },
  { level: 41, name: 'مهندس الاقتصاد', status: 'مخطط استراتيجي' },
  { level: 42, name: 'مستشار البنوك العليا', status: 'متحكم بالأسواق' },
  { level: 43, name: 'حاكم البورصة', status: 'متحكم بالأسعار' },
  { level: 44, name: 'إمبراطور النفط', status: 'صاحب الذهب الأسود' },
  { level: 45, name: 'مالك الطاقة النووية', status: 'قوة مدمرة' },
  { level: 46, name: 'مستكشف الفضاء', status: 'عابر للنجوم' },
  { level: 47, name: 'رائد الفضاء الملياردير', status: 'مالك أقمار صناعية' },
  { level: 48, name: 'ملك المريخ', status: 'مستعمر كواكب' },
  { level: 49, name: 'حارس المجرة', status: 'حامي الكون' },
  { level: 50, name: 'أساطير الأولين', status: 'تاريخ محفور' },
  { level: 51, name: 'تيتان النفوذ', status: 'عملاق بشري' },
  { level: 52, name: 'غول الثروة', status: 'نهم للأموال' },
  { level: 53, name: 'تنين الخزائن', status: 'حارس الكنوز' },
  { level: 54, name: 'فينيكس النهوض', status: 'يعود من الرماد' },
  { level: 55, name: 'كايزن التطور', status: 'متطور مستمر' },
  { level: 56, name: 'سيد الأبعاد', status: 'عابر للعوالم' },
  { level: 57, name: 'فارس الزمن', status: 'مالك الدقائق' },
  { level: 58, name: 'حاكم الفراغ', status: 'فراغ مطلق' },
  { level: 59, name: 'نجم الأفق', status: 'ساطع لا يغيب' },
  { level: 60, name: 'شمس العوالم', status: 'مصدر النور' },
  { level: 61, name: 'قمر الظلمات', status: 'منير الليالي' },
  { level: 62, name: 'محبوب الجماهير', status: 'شعبية جارفة' },
  { level: 63, name: 'رمز العدالة', status: 'ميزان الحق' },
  { level: 64, name: 'طاغية العصر', status: 'لا يُرد له طلب' },
  { level: 65, name: 'مرعب الأعداء', status: 'يهابه الجميع' },
  { level: 66, name: 'مبيد الأزمات', status: 'حلال المشاكل' },
  { level: 67, name: 'حكيم الزمان', status: 'عقل مدبر' },
  { level: 68, name: 'فيلسوف المال', status: 'صانع النظريات' },
  { level: 69, name: 'ساحر الأسواق', status: 'يقلب الموازين' },
  { level: 70, name: 'كاهن الأسرار', status: 'يعلم الخبايا' },
  { level: 71, name: 'ملك الكروت الخفية', status: 'استراتيجي بارع' },
  { level: 72, name: 'جوكير القمة', status: 'المفاجأة الكبرى' },
  { level: 73, name: 'سيد الأوراق', status: 'متحكم باللعبة' },
  { level: 74, name: 'مهندس الأساطير', status: 'صانع الملاحم' },
  { level: 75, name: 'أسطورة الحكاية', status: 'بطل الرواية' },
  { level: 76, name: 'سيد الشينوبي الأوحد', status: 'قوة مطلقة' },
  { level: 77, name: 'بطل العالم الخفي', status: 'حامي الكواليس' },
  { level: 78, name: 'ملك العواصف', status: 'صانع الأعاصير' },
  { level: 79, name: 'حاكم البحار السبعة', status: 'سيد المحيطات' },
  { level: 80, name: 'إمبراطور القارات', status: 'مسيطر عالمي' },
  { level: 81, name: 'سيد الأكوان المتعددة', status: 'متجاوز الحدود' },
  { level: 82, name: 'ملك الموت الفخري', status: 'مهيب الجانب' },
  { level: 83, name: 'حارس البوابة الأخيرة', status: 'حارس الأسرار الكبرى' },
  { level: 84, name: 'حاكم عرش الجليد', status: 'بارد الأعصاب وصلب' },
  { level: 85, name: 'سيد النار الأزلية', status: 'مشتعل طاقة' },
  { level: 86, name: 'حارس الرعد والبرق', status: 'سريع وحاسم' },
  { level: 87, name: 'صانع الزلازل', status: 'يهز عروش الخصوم' },
  { level: 88, name: 'ملك العمالقة', status: 'مهيب الضخامة' },
  { level: 89, name: 'سيد الأطياف', status: 'غامض وخطر' },
  { level: 90, name: 'إمبراطور النور', status: 'يشع هيبة' },
  { level: 91, name: 'سيد الظلام المطلق', status: 'سلطة الليل' },
  { level: 92, name: 'ملك الفوضى المنظمة', status: 'مبدع الأزمات' },
  { level: 93, name: 'حاكم الحقيقة المطلقة', status: 'لا يقبل الشك' },
  { level: 94, name: 'أسطورة الأساطير الحية', status: 'رمز الخلود' },
  { level: 95, name: 'ملك الملوك العظام', status: 'تاج فوق الرؤوس' },
  { level: 96, name: 'سيد السلاطين', status: 'سلطان الزمان' },
  { level: 97, name: 'إمبراطور العوالم الخمسة', status: 'مسيطر بلا منازع' },
  { level: 98, name: 'سيد الأوتشيها الأعظم', status: 'عين الشارينجان الأبدية' },
  { level: 99, name: 'ملك الملوك والأباطرة', status: 'قمة المجد البشري' },
  { level: 100, name: 'الامبراطور', status: 'القوة المطلقة العظمى 👑☠️' }
];

// دالة لقراءة قاعدة البيانات المتوافقة مع مسار البنك الموحد
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

// دالة لحفظ قاعدة البيانات المتوافقة مع مسار البنك الموحد
function saveDatabase(chatId, data) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Bank Save Error]', e)
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '⚠️ خطأ' },
          { type: 'warning', text: 'هذا الأمر يعمل داخل المجموعات فقط!' }
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

    // دعم أمر .مستوحه أو .لفله لشخص آخر عبر المنشن أو الرد
    let isTargetOtherCmd = command === 'لفله' || command === 'مستواه' || command === 'level'
    if (isTargetOtherCmd && command !== 'لفل' && command !== 'مستوى' && !m.mentionedJid?.length && (!m.quoted || !m.quoted.sender)) {
      // السماح بعرض مستواه الخاص إذا لم يقم بمنشنة أحد، أو إرشاده
    }

    // التحقق مما إذا كان المطور هو المستهدف لتطبيق الرتبة الأسطورية المطلقة
    let isTargetDeveloper = allowedOwners.includes(targetId) || allowedOwners.some(owner => owner.split('@')[0] === targetId.split('@')[0])

    if (isTargetDeveloper) {
      let devLevelText = `👑 *مـسـتـواك الأَسْـطُـوري فـي الـبـنـك*
───────────────────
 ┠ 🛡️ ╎ لفلك: ملك الاوتشيها ☠️
 ┠ 🏷️ ╎ اللقب الحالي: ملك المطورين ⚡
 ┠ 🏷️ ╎ الحاله: غني لابعد الحدود 💴🍀
 ┠ 💰 ╎ رصيدك الخرافي في البنك:
 ┠      ▪️ 1000000000 ذهب 🪙
 ┠      ▪️ 1000000000 الماس 💎
 ┠      ▪️ 1000000000 نقاط ⭐
───────────────────
⚡ *سلطة مطلقة يعجز الوصف عن مجاراتها!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, {
        text: devLevelText,
        contextInfo: { mentionedJid: [targetId] }
      }, { quoted: m })
    }

    // للمستخدمين العاديين: التحقق مما إذا كان مسجلاً في البنك أم لا
    if (!db[targetId]) {
      let notRegisteredText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝓉𝐇𝐄 𝓩𝑶𝑲𝑬𝑹 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
🔹 *⚠️ تنبيه: حساب غير موجود*
───────────────────
 ┠ ❌ *هذا الشخص ليس مسجلا في البنك*
 ┠ 💡 *اكتب ${usedPrefix}سجل_بنك ليتم تسجيلك*
───────────────────
 ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

      return await conn.sendMessage(m.chat, { text: notRegisteredText }, { quoted: m })
    }

    let user = db[targetId]

    // تهيئة خصائص المستوى والخبرة إذا لم تكن موجودة
    if (user.rankLevel === undefined) user.rankLevel = 1
    if (user.points === undefined) user.points = 10
    if (user.level === undefined) user.level = 'مواطن عادي'
    if (user.status === undefined) user.status = 'فقير جداً'
    saveDatabase(m.chat, db)

    let nextLevelPointsNeeded = user.rankLevel * 50
    let userMainTitle = user.title || 'مواطن عادي'
    let userTitle = user.customTitle || userMainTitle

    let levelText = `📊 *مـسـتـواك فـي الـبـنـك*
───────────────────
 ┠ 🏷️ ╎ اللقب [${userMainTitle}] / العمر [${user.age}]
 ┠ 🛡️ ╎ لفلك: ${user.level} (الرتبة ${user.rankLevel}/100)
 ┠ 🏷️ ╎ اللقب الحالي: ${userTitle}
 ┠ 🏷️ ╎ الحاله: ${user.status}
 ┠ ⭐ ╎ رصيد النقاط: ${user.points} نقطة
 ┠ 📈 ╎ مطلوب للترقية للرتبة التالية: ${nextLevelPointsNeeded} نقطة
───────────────────
💡 *اكتب الأمر ${usedPrefix}مهام لتعلية لفلك والحصول على جوائز فخمة!*
` + `〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`

    await conn.sendMessage(m.chat, {
      text: levelText,
      contextInfo: { mentionedJid: [targetId] }
    }, { quoted: m })

  } catch (e) {
    console.error('[Level Error]', e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء جلب معلومات المستوى' }
      ])
    }, { quoted: m })
  }
}

// دالة لمعالجة تتبع الرسائل وتصاعد مستويات الرتب الـ 100 بناءً على النقاط
handler.before = async (m, { conn }) => {
  if (!m.text || m.isBaileys || !m.isGroup) return

  let db = loadDatabase(m.chat)
  let userId = m.sender

  if (allowedOwners.includes(userId) || allowedOwners.some(owner => owner.split('@')[0] === userId.split('@')[0])) {
    return
  }

  if (db[userId]) {
    let user = db[userId]

    if (user.messageCount === undefined) user.messageCount = 0
    if (user.rankLevel === undefined) user.rankLevel = 1
    if (user.points === undefined) user.points = 10

    user.messageCount += 1
    let nextLevelPointsNeeded = user.rankLevel * 50

    if (user.points >= nextLevelPointsNeeded && user.rankLevel < ranksList.length) {
      user.rankLevel += 1
      let newRankData = ranksList[user.rankLevel - 1]
      user.level = newRankData.name
      user.status = newRankData.status
      user.coins += user.rankLevel * 20
      user.diamonds += 1
      user.points += 30

      saveDatabase(m.chat, db)

      let promotionText = `🎉 *تهانينا، لقد ارتفعت رتبتك في البنك!* 🎊
───────────────────
 ┠ 🚀 *الرتبة الجديدة (${user.rankLevel}/100):* [${newRankData.name}]
 ┠ 🏷️ *الحالة الجديدة:* [${newRankData.status}]
 ┠ 🎁 *مكافأة الصعود:*
 ┠      ▪️ جوائز ذهبية وألماسية ونقاط إضافية 💰
───────────────────
💡 *اكتب .مستواه أو .لفل لمتابعة تقدمك المستمر!*
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀CHI 卍`

      await conn.sendMessage(m.chat, { text: promotionText }, { quoted: m })
    } else {
      saveDatabase(m.chat, db)
    }
  }
}

handler.help = ['لفل', 'مستوى', 'لفله', 'مستواه', 'level']
handler.tags = ['bank']
handler.command = ['لفل', 'مستوى', 'لفله', 'مستواه', 'level']

export default handler
