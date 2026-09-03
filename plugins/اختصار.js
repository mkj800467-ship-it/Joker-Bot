// plugins/animelek_quality.js
// ✧ THE JOKER & ITACHI - AnimeLek Downloader 🎬

import { theme } from '../core/theme.js'
import fetch from 'node-fetch'
import fs from 'fs'
import { pipeline } from 'stream/promises'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // عرض المساعدة لو مافيش رابط
  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🎬 تـحـمـيـل حـلـقـات AnimeLek' },
        { type: 'divider' },
        { type: 'line', text: '🃏 *أمر تحميل الحلقات مع اختيار الجودة*' },
        { type: 'spacer' },
        { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix + command} [الرابط] [الجودة]` },
        { type: 'divider' },
        { type: 'info', label: '144', value: 'جودة منخفضة (للاختبار)' },
        { type: 'info', label: '360', value: 'جودة متوسطة' },
        { type: 'info', label: '720', value: 'جودة عالية' },
        { type: 'info', label: '1080', value: 'جودة عالية جداً' },
        { type: 'divider' },
        { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} https://animelek.top/episode/... 720` }
      ])
    }, { quoted: m })
  }

  const episodeUrl = args[0]
  let quality = (args[1] || '720').toString()

  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })
  let statusMsg = await m.reply('🃏 *الجوكر وإيتاشي يبحثان عن روابط الحلقة...* ⏳')

  try {
    // 1. جلب الصفحة
    const res = await fetch(episodeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const html = await res.text()

    // 2. استخراج عنوان الحلقة
    const titleMatch = html.match(/<h1>([^<]+?)<\/h1>/)
    const episodeTitle = titleMatch ? titleMatch[1] : 'Anime_Episode'

    // 3. البحث عن روابط التحميل
    const downloadLinks = []
    const regex = /<a href="([^"]+)"[^>]*class="btn labeled secondary"[^>]*>[\s\S]*?<\/a>\s*<\/td>\s*<td>\s*<div class="favicon[^>]*data-src="https:\/\/s2\.googleusercontent\.com\/s2\/favicons\?domain=([^"]+)">[\s\S]*?<\/div>\s*<\/td>\s*<td>\s*<strong class="badge light-soft">\s*([^<]+?)\s*<\/strong>\s*<\/td>/gi                                                                             
    let match
    while ((match = regex.exec(html)) !== null) {
      downloadLinks.push({
        url: match[1],
        host: match[2],
        quality: match[3].toLowerCase()
      })
    }

    if (downloadLinks.length === 0) {
      try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '❌ خـطـأ' },
          { type: 'error', text: 'لا توجد روابط تحميل متاحة لهذه الحلقة' }
        ])
      }, { quoted: m })
    }

    // 4. فلترة الروابط حسب الجودة المطلوبة
    let targetQuality = quality
    let filteredLinks = downloadLinks.filter(link =>
      link.quality === targetQuality ||
      link.quality.includes(targetQuality)
    )

    // لو مالقيناش الجودة المطلوبة، ناخد أول رابط
    if (filteredLinks.length === 0) {
      filteredLinks = [downloadLinks[0]]
      targetQuality = filteredLinks[0].quality
    }

    const selectedLink = filteredLinks[0]

    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
    statusMsg = await m.reply(`🃏 *جاري تجهيز التحميل بجودة ${targetQuality} (${selectedLink.host.toUpperCase()})...* ⏳`)

    // محاولة الحصول على الرابط المباشر
    let videoUrl = selectedLink.url

    // لو الرابط من mp4upload، نحاول نستخرج الرابط المباشر
    if (selectedLink.host.includes('mp4upload')) {
      const embedRes = await fetch(selectedLink.url.replace('/d/', '/embed-') + '.html', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      const embedHtml = await embedRes.text()
      const directMatch = embedHtml.match(/src:\s*"([^"]+\.mp4[^"]*)"/)
      if (directMatch) videoUrl = directMatch[1]
    }

    // لو الرابط من gofile، نحاول نستخرج الرابط المباشر
    if (selectedLink.host.includes('gofile')) {
      const apiUrl = `https://api.gofile.io/getContent?contentId=${selectedLink.url.split('/').pop()}`
      const apiRes = await fetch(apiUrl)
      const apiData = await apiRes.json()
      if (apiData.data?.contents) {
        const firstFile = Object.values(apiData.data.contents)[0]
        if (firstFile.link) videoUrl = firstFile.link
      }
    }

    // تحميل الفيديو
    const videoRes = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://animelek.top/'
      }
    })

    const totalSize = parseInt(videoRes.headers.get('content-length') || '0')
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2)

    // حفظ مؤقت
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
    const tempFile = `./temp/anime_${Date.now()}.mp4`
    const writer = fs.createWriteStream(tempFile)
    await pipeline(videoRes.body, writer)

    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

    // إرسال الفيديو بستايل فخم
    await conn.sendMessage(m.chat, {
      video: { url: tempFile },
      caption: theme.build([
        { type: 'title', text: '🎬 تـم تـحـمـيـل الـحـلـقـة' },
        { type: 'divider' },
        { type: 'line', text: `📌 ${episodeTitle.substring(0, 60)}` },
        { type: 'divider' },
        { type: 'info', label: '🎯 الجودة', value: targetQuality },
        { type: 'info', label: '📦 الحجم', value: `${sizeMB} MB` },
        { type: 'info', label: '🌐 الخادم', value: selectedLink.host.toUpperCase() }
      ]),
      mimetype: 'video/mp4'
    }, { quoted: m })

    // تنظيف الملف المؤقت
    fs.unlinkSync(tempFile)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (error) {
    console.error('[Joker-Anime]', error)
    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
        { type: 'divider' },
        { type: 'error', text: error.message || 'حدث خطأ أثناء تحميل الحلقة' },
        { type: 'spacer' },
        { type: 'warning', text: 'تأكد من صحة الرابط أو جرب جودة مختلفة' }
      ])
    }, { quoted: m })
  }
}

handler.help = ['حمل'].map(v => v + ' *<الرابط> <الجودة>*')
handler.tags = ['anime', 'tools']
handler.command = /^(حمل|download|dl)$/i

export default handler
