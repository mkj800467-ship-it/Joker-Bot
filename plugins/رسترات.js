// plugins/ريستارت.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - إعادة التشغيل التلقائي 🔄

import { theme } from '../core/theme.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (text && !isNaN(text)) {
    let minutes = parseInt(text)
    if (minutes < 1) minutes = 1

    await m.reply(theme.build([
      { type: 'title', text: '🔄 تـم تـفـعـيـل إعـادة الـتـشـغـيـل' },
      { type: 'subtitle', text: 'جاري جدولة وقت إغلاق النظام' },
      { type: 'divider' },
      { type: 'info', label: '⏰ المدى الزمني', value: `${minutes} دقيقة` },
      { type: 'line', text: '⏳ سيتم إعادة تشغيل النظام تلقائياً عند انتهاء المهلة' },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))

    setTimeout(() => {
      console.log('🔄 Itachi: إعادة تشغيل تلقائية للنظام...')
      process.exit(1)
    }, minutes * 60 * 1000)

  } else {
    return m.reply(theme.build([
      { type: 'title', text: '🔄 وِحـدَة إعـادة الـتـشـغـيـل' },
      { type: 'subtitle', text: 'نظام التحكم الآلي في سيرفر البوت' },
      { type: 'divider' },
      { type: 'info', label: '⚔️ الاستخدام', value: `${usedPrefix + command} <بالدقائق>` },
      { type: 'divider' },
      { type: 'info', label: '📌 أمثلة', value: `${usedPrefix + command} 30 | 60 | 120` },
      { type: 'info', label: '⚡ للإلغاء', value: `${usedPrefix + command} 0` },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }
}

handler.command = ['ريستارت', 'restart', 'اعاده', 'ريست', 'اعادة_تشغيل']
handler.help = ['ريستارت']
handler.tags = ['owner']
handler.owner = true

export default handler;

