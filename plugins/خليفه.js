// plugins/خلفيات.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - بحث خلفيات احترافية 🖼️

import fetch from "node-fetch"
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from "@whiskeysockets/baileys"
import { theme } from '../core/theme.js'

// تخزين الصفحة الحالية والروابط السابقة لكل بحث لمنع التكرار تماماً
const searchPages = new Map()
const sentImagesCache = new Map()

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  let currentPage = 1
  const cacheKey = m.sender + '_' + (text || '').trim().toLowerCase()

  if (searchPages.has(cacheKey)) {
    currentPage = searchPages.get(cacheKey) + 1
  }
  searchPages.set(cacheKey, currentPage)

  if (!text) {
    react('❌')
    return m.reply(theme.build([
      { type: 'title', text: '🖼️ 𝐈𝐭𝐚𝐜𝐡𝐢: وحدة استخبارات الصور' },
      { type: 'subtitle', text: 'البحث عن أجمل خلفيات البكسل العالية من Pinterest و Unsplash' },
      { type: 'divider' },
      { type: 'info', label: '⚔️ الاستخدام', value: `${usedPrefix + command} <كلمة البحث>` },
      { type: 'divider' },
      { type: 'info', label: '📌 أمثلة', value: `${usedPrefix + command} anime 4k | طبيعة ساحرة` },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }

  react('🔍')
  await m.reply(theme.build([
    { type: 'title', text: '🔍 𝐈𝐭𝐚𝐜𝐡𝐢: جاري رصد الأهداف البصرية' },
    { type: 'subtitle', text: `تتم عمليات الفلترة المتقدمة لضمان جودة الصور` },
    { type: 'divider' },
    { type: 'info', label: '📄 الصفحة الحالية', value: currentPage.toString() },
    { type: 'info', label: '🎯 الهدف المطلق', value: text },
    { type: 'divider' },
    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
  ]))

  try {
    const rawImages = await searchPinterest(text, currentPage)

    if (!rawImages || rawImages.length === 0) {
      react('❌')
      return m.reply(theme.build([
        { type: 'title', text: '⚠️ 𝐈𝐭𝐚𝐜𝐡𝐢: عذراً، لا توجد نتائج' },
        { type: 'subtitle', text: `لم يتم العثور على أصول بصرية مطابقة للبحث: ${text}` },
        { type: 'divider' },
        { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
      ]))
    }

    // منع تكرار الخلفيات عبر فحص الكاش الشخصي
    if (!sentImagesCache.has(cacheKey)) {
      sentImagesCache.set(cacheKey, new Set())
    }
    const userCache = sentImagesCache.get(cacheKey)

    const uniqueImages = rawImages.filter(img => !userCache.has(img))
    
    // لو نفدت الصور الفريدة، نعيد تعيين الكاش لنبدأ دورة جديدة نظيفة
    if (uniqueImages.length === 0) {
      userCache.clear()
      uniqueImages.push(...rawImages)
    }

    let cards = []
    let counter = 1

    for (let imageUrl of uniqueImages.slice(0, 10)) {
      try {
        const imgRes = await fetch(imageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        })

        if (!imgRes.ok) continue

        const buffer = Buffer.from(await imgRes.arrayBuffer())
        if (buffer.length < 5000) continue // فلترة الصور التالفة أو الصغيرة جداً

        userCache.add(imageUrl)

        const { imageMessage } = await generateWAMessageContent(
          { image: buffer },
          { upload: conn.waUploadToServer }
        )

        if (!imageMessage) continue

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: theme.build([
              { type: 'title', text: `🖼️ خلفية احترافية #${counter}` },
              { type: 'info', label: '🎯 التصنيف', value: text },
              { type: 'info', label: '📄 الإصدار', value: `صفحة ${currentPage}` },
              { type: 'divider' },
              { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ])
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: imageMessage
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [{
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🔄 جلب المزيد من الخلفيات الفاخرة",
                id: `${usedPrefix + command} ${text}`
              })
            }]
          })
        })

        counter++
      } catch {
        continue
      }
    }

    if (cards.length === 0) {
      react('❌')
      return m.reply(theme.build([
        { type: 'title', text: '❌ خطأ في معالجة الوسائط' },
        { type: 'subtitle', text: 'فشل النظام في تحميل وحفظ الملفات البصرية' },
        { type: 'divider' },
        { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
      ]))
    }

    const finalMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: theme.build([
                { type: 'title', text: '🖼️ 𝐈𝐭𝐚𝐜𝐡𝐢: معرض الخلفيات النخبة' },
                { type: 'subtitle', text: 'تم استخراج أفضل اللقطات عالية الدقة المتاحة' },
                { type: 'divider' },
                { type: 'info', label: '🎯 الكلمة المفتاحية', value: text },
                { type: 'info', label: '📊 الحصيلة', value: `${cards.length} خلفية فريدة` },
                { type: 'info', label: '📄 الصفحة', value: currentPage.toString() },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
              ])
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: cards
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id })
    react('✅')

  } catch (e) {
    console.error('❌ Itachi-Wallpaper Error:', e)
    react('❌')
    m.reply(theme.build([
      { type: 'title', text: '❌ خطأ غير متوقع' },
      { type: 'subtitle', text: e.message || 'فشلت مهمة معالجة البيانات' },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }
}

async function searchPinterest(query, page = 1) {
  try {
    const randomSeed = Date.now() + Math.random()
    const offset = (page - 1) * 20

    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed&offset=${offset}&_=${randomSeed}`

    const sessionRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      redirect: 'follow'
    })

    if (sessionRes.ok) {
      const html = await sessionRes.text()
      const patterns = [
        /https:\/\/i\.pinimg\.com\/(?:originals|736x|564x)\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi,
        /https:\/\/i\.pinimg\.com\/[0-9]+x\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi
      ]

      let allMatches = []
      for (const pattern of patterns) {
        const matches = html.match(pattern)
        if (matches) allMatches.push(...matches)
      }

      if (allMatches.length > 0) {
        // تحويل الجودة لـ originals والحصول على أعلى دقة ممكنة
        const highQuality = allMatches.map(img => img.replace(/\/(?:564x|736x)\//, '/originals/'))
        return [...new Set(highQuality)]
      }
    }
  } catch (e) {
    console.log('❌ Pinterest engine warning:', e.message)
  }

  // محرك بديل: Unsplash الاحترافي بدقة عالية جداً
  try {
    const unsplashUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=25&page=${page}`
    const res = await fetch(unsplashUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    })

    if (res.ok) {
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        const imgs = data.results
          .map(photo => photo.urls?.full || photo.urls?.regular)
          .filter(Boolean)
        if (imgs.length > 0) return imgs
      }
    }
  } catch (e) {
    console.log('❌ Unsplash engine warning:', e.message)
  }

  return []
}

handler.help = ['خلفيات <بحث>']
handler.tags = ['downloader']
handler.command = /^(خلفيات|خالفيات|خلفيه|خلفية|wallpaper)$/i

export default handler;

