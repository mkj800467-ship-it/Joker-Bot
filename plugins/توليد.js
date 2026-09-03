// plugins/imagine.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - توليد الصور بالذكاء الاصطناعي 🎨

import axios from 'axios'
import { join } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, unlinkSync, statSync } from 'fs'
import { pipeline } from 'stream/promises'
import { theme } from '../core/theme.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!text) {
    await react('❌')
    return m.reply(theme.build([
      { type: 'title', text: '🎨 تـولـيـد الـصـور بالذكاء الاصطناعي' },
      { type: 'divider' },
      { type: 'info', label: '⚔️ الاستخدام', value: `${usedPrefix}${command} [وصف الصورة]` },
      { type: 'spacer' },
      { type: 'info', label: '📝 أمثلة', value: '' },
      { type: 'line', text: 'قطة لطيفة في حديقة' },
      { type: 'line', text: 'غروب الشمس على البحر' },
      { type: 'line', text: 'مدينة مستقبلية' },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }

  await react('🎨')
  await m.reply(theme.build([
    { type: 'title', text: '🎨 جـاري تـولـيـد الـصـورة...' },
    { type: 'divider' },
    { type: 'line', text: '⏳ انتظر قليلاً...' }
  ]))

  try {
    let englishText = text
    try {
      const trRes = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`,
        { timeout: 8000 }
      )
      const translated = trRes.data?.[0]?.map(x => x?.[0]).filter(Boolean).join('') || text
      if (translated) englishText = translated
    } catch { englishText = text }

    const fullPrompt = `${englishText}, high quality, highly detailed`
    const encoded = encodeURIComponent(fullPrompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&enhance=true`

    const filePath = join(tmpdir(), `joker_img_${Date.now()}.jpg`)
    const imgRes = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    await pipeline(imgRes.data, createWriteStream(filePath))

    const size = statSync(filePath).size
    if (size < 5000) {
      try { unlinkSync(filePath) } catch {}
      throw new Error('فشل توليد الصورة — جرب وصف مختلف')
    }

    await conn.sendMessage(m.chat, {
      image: { url: filePath },
      caption: theme.build([
        { type: 'title', text: '✅ تـم تـولـيـد الـصـورة بـنـجـاح' },
        { type: 'divider' },
        { type: 'info', label: '📝 الوصف', value: text },
        { type: 'info', label: '📁 الحجم', value: `${(size / 1024).toFixed(2)} KB` },
        { type: 'divider' },
        { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
      ])
    }, { quoted: m })

    await react('✅')
    try { unlinkSync(filePath) } catch {}

  }	catch (err) {
    await react('❌')
    console.error('[Joker-Imagine] Error:', err.message)
    m.reply(theme.build([
      { type: 'title', text: '❌ فـشـل الـتـولـيـد' },
      { type: 'error', text: err.message },
      { type: 'divider' },
      { type: 'line', text: '💡 جرب وصف مختلف' }
    ]))
  }
}

handler.help    = ['صورة', 'image']
handler.tags    = ['ai']
handler.command = /^(صورة|صوره|توليد|imagine|img|imag)$/i

export default handler

