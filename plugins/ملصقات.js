// plugins/stickers-search.js
// 👑 Itachi Pack & Joker Bot - Pinterest Ultimate Sticker Generator 🎨⚔️

import axios from 'axios'
import fetch from 'node-fetch'
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import { tmpdir } from 'os'
import webp from 'node-webpmux'
import crypto from 'crypto'

// ═══════════════════════════════════════
// سكرابر بينترست الدقيق للبحث
// ═══════════════════════════════════════
const PINTEREST_BASE = 'https://www.pinterest.com'
const PINTEREST_SEARCH_PATH = '/resource/BaseSearchResource/get/'
const PINTEREST_HEADERS = {
   accept: 'application/json, text/javascript, */*, q=0.01',
   referer: 'https://www.pinterest.com/',
   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
   'x-app-version': 'a9522f',
   'x-pinterest-appstate': 'active',
   'x-pinterest-pws-handler': 'www/[username]/[slug].js',
   'x-requested-with': 'XMLHttpRequest'
}

async function getPinterestCookies() {
   try {
      const res = await axios.get(PINTEREST_BASE, { timeout: 15000 })
      const setCookies = res.headers['set-cookie']
      if (!setCookies) return null
      return setCookies.map(c => c.split(';')[0].trim()).join('; ')
   } catch {
      return null
   }
}

async function searchPinterest(query, needed = 10, isAnimated = false) {
   const images = { static: [], animated: [] }
   const cookies = await getPinterestCookies()
   if (!cookies) return images

   let bookmarks = ['']
   let attempts = 0
   const maxAttempts = 5

   while (images.static.length + images.animated.length < needed && bookmarks.length && attempts < maxAttempts) {
      attempts++
      try {
         const params = {
            source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
            data: JSON.stringify({
               options: { isPrefetch: false, query, scope: 'pins', bookmarks, page_size: 50 },
               context: {}
            }),
            _: Date.now()
         }

         const { data } = await axios.get(`${PINTEREST_BASE}${PINTEREST_SEARCH_PATH}`, {
            headers: { ...PINTEREST_HEADERS, cookie: cookies },
            params,
            timeout: 15000
         })

         const results = data?.resource_response?.data?.results?.filter(v => v?.images?.orig?.url) || []
         if (!results.length) break

         for (const r of results) {
            const url = r.images.orig.url
            if (url.endsWith('.gif') || url.endsWith('.mp4')) {
               images.animated.push(url)
            } else {
               images.static.push(url)
            }
            if (images.static.length + images.animated.length >= needed * 2) break
         }

         const nextBookmark = data?.resource_response?.bookmark
         if (!nextBookmark || nextBookmark === '-end-') break
         bookmarks = [nextBookmark]
      } catch {
         break
      }
   }

   return {
      static: [...new Set(images.static)],
      animated: [...new Set(images.animated)]
   }
}

// ⚡ إضافة حقوق Itachi Pack و Joker Bot للملصق
async function addStickerMetadata(webpBuffer) {
  try {
    const img = new webp.Image()
    await img.load(webpBuffer)

    const json = {
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
      'sticker-pack-name': 'Itachi Pack',
      'sticker-pack-publisher': 'Joker Bot',
      'emojis': ['👑', '⚔️', '🔥']
    }

    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])

    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuffer])
    exif.writeUIntLE(jsonBuffer.length, 14, 4)
    img.exif = exif

    return await img.save(null)
  } catch {
    return webpBuffer
  }
}

// معالجة الصورة الثابتة بدقة مربعة احترافية وخلفية شفافة
async function makeStaticSticker(buffer) {
  let ts = Date.now() + Math.random()
  let inputPath = join(tmpdir(), `img_${ts}.jpg`)
  let outputPath = join(tmpdir(), `out_${ts}.webp`)

  try {
    writeFileSync(inputPath, buffer)
    let cmd = `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -vcodec libwebp -lossless 0 -q:v 80 "${outputPath}"`
    execSync(cmd, { stdio: 'ignore', timeout: 15000 })

    if (!existsSync(outputPath)) throw new Error('فشل معالجة الصورة الثابتة')
    let resBuffer = readFileSync(outputPath)
    return await addStickerMetadata(resBuffer)
  } finally {
    try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
    try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
  }
}

// معالجة الملصقات المتحركة أو الـ GIF بدقة خرافية
async function makeAnimatedSticker(buffer) {
  let ts = Date.now() + Math.random()
  let inputPath = join(tmpdir(), `vid_${ts}.mp4`)
  let outputPath = join(tmpdir(), `out_${ts}.webp`)

  try {
    writeFileSync(inputPath, buffer)
    let cmd = `ffmpeg -y -i "${inputPath}" -t 4 -vf "fps=15,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -c:v libwebp -loop 0 -preset default -an -vsync 0 "${outputPath}"`
    execSync(cmd, { stdio: 'ignore', timeout: 25000 })

    if (!existsSync(outputPath)) throw new Error('فشل معالجة الملصق المتحرك')
    let resBuffer = readFileSync(outputPath)
    return await addStickerMetadata(resBuffer)
  } finally {
    try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
    try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
  }
}

// ═══════════════════════════════════════
// Handler الأساسي للأوامر
// ═══════════════════════════════════════
let handler = async (m, { conn, text, usedPrefix, command }) => {
  let isAnimatedCmd = command.includes('متحرك') || command.includes('animated')

  if (!text) {
    let cmdName = isAnimatedCmd ? 'متحرك' : 'ملصقات'
    return m.reply(`⚠️ الاستخدام الصحيح:\n🔹 \`${usedPrefix + cmdName} اتاتشي 5\`\n🔹 \`${usedPrefix + cmdName} هانتر 4\``)
  }

  let args = text.trim().split(' ')
  let lastArg = args[args.length - 1]
  let count = 5
  let query = text

  if (!isNaN(lastArg) && args.length > 1) {
    count = Math.min(10, Math.max(1, parseInt(lastArg)))
    query = args.slice(0, -1).join(' ')
  }

  let statusMsg = await m.reply(`جارٍ البحث في بينترست عن (${query}) وتجهيز (${count}) ملصق...`)
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

  try {
    const searchResult = await searchPinterest(query, count, isAnimatedCmd)
    const targetUrls = isAnimatedCmd ? searchResult.animated : searchResult.static
    
    // إذا لم یجد متحرك، يبحث في الصور العادية ويحولها
    let finalUrls = targetUrls.length > 0 ? targetUrls : searchResult.static

    if (!finalUrls || finalUrls.length === 0) {
      try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
      return m.reply(`❌ لم يتم العثور على نتائج مطابقة لـ "${query}" في بينترست`)
    }

    let successCount = 0
    for (let i = 0; i < finalUrls.length && successCount < count; i++) {
      try {
        let mediaRes = await axios.get(finalUrls[i], {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 15000
        })
        let buffer = Buffer.from(mediaRes.data)
        if (buffer.length < 1000) continue

        let stickerBuffer = isAnimatedCmd && finalUrls[i].endsWith('.mp4') || finalUrls[i].endsWith('.gif')
          ? await makeAnimatedSticker(buffer) 
          : await makeStaticSticker(buffer)

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
        successCount++
      } catch (err) {
        console.error('Sticker Generation Error:', err)
      }
    }

    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

    if (successCount === 0) {
      return m.reply(`❌ عذراً، فشل توليد الملصقات المطلوبة، جرب كلمة بحث أخرى.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('[Pinterest Sticker Search Error]:', e)
    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
    await m.reply(`❌ حدث خطأ غير متوقع أثناء جلب وتوليد الملصقات.`)
  }
}

handler.command = ['ملصقات', 'باكج', 'متحرك', 'animatedpack', 'stickers']
handler.help = ['ملصقات [بحث] [عدد]', 'متحرك [بحث] [عدد]']
handler.tags = ['sticker']

export default handler
