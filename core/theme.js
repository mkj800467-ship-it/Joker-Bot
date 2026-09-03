// core/theme.js
// ✧ THE JOKER & ITACHI - Core Theme ✧
export const theme = {
  // الرموز الأساسية (Joker & Itachi Style)
  skull: '🃏',
  blood: '⚔️',
  virus: '🗡️',
  eye: '👁️',
  sword: '🥷',
  target: '✧',
  darkStar: '⭐',
  lightStar: '✨',                                                     
  
  // فواصل نظيفة وبسيطة داخل النص لعدم التشوش
  divider: '───────────────────',
  smallDivider: '───────────────',
  endDivider: '───────────────────',                                   
  
  // تنسيق النصوص
  title: (text) => `🃏 *${text}*`,
  subtitle: (text) => `⚔️ *${text}*`,
  info: (text) => `📌 *${text}*`,
  warning: (text) => `⚠️ *${text}* ⚠️`,
  success: (text) => `✅ *${text}*`,
  error: (text) => `❌ *${text}*`,

  // بناء الرسائل العامة (نفس الستايل الملكي الفخم في البداية والنهاية، مع تنظيم هادئ بالنص)
  build: (sections) => {
    let msg = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖\n        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤\n❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖\n`
    for (const section of sections) {
      if (section.type === 'title') {
        msg += `🔹 *${section.text}*\n`
      } else if (section.type === 'subtitle') {
        msg += `⚔️ *${section.text}*\n`
      } else if (section.type === 'info') {
        msg += ` ┠ 🔸 *${section.label}:* ${section.value}\n`
      } else if (section.type === 'line') {
        msg += ` ▪️ ${section.text}\n`
      } else if (section.type === 'divider') {
        msg += `───────────────────\n`                     
      } else if (section.type === 'spacer') {
        msg += `\n`
      }
    }
    msg += `❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖\n        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
    return msg
  },

  // رسالة الملف الشخصي (نفس الستايل الملكي الفخم مع محتوى مرتب)
  profile: (data) => {
    let msg = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖\n        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤\n❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖\n`
    for (const item of data) {
      if (item.type === 'header') {
        msg += `❖ *${item.text}*\n`
      } else if (item.type === 'info') {
        msg += ` ┠ 🔸 *${item.label}:* ${item.value}\n`
      } else if (item.type === 'line') {
        msg += ` ▪️ ${item.text}\n`
      }
    }
    msg += `❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖\n        〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`
    return msg
  }
}

export const formatWithTheme = (data) => {
  return theme.build(data)
}
