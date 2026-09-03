// plugins/pinterest.js
// ✧ THE JOKER & ITACHI - Pinterest 📌

import axios from 'axios'
import { exec } from 'child_process'
import { promisify } from 'util'
import { unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from "@whiskeysockets/baileys"
import { theme } from '../core/theme.js'

const execAsync = promisify(exec)
const YTDLP_PATH = '/home/container/yt-dlp'
const COOKIES_PATH = '/home/container/cookies/pinterest.txt'

// ═══════════════════════════════════════
// سكرابر Pinterest الرسمي
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

async function searchPinterest(query, needed = 30) {
   const images = []
   const cookies = await getPinterestCookies()
   if (!cookies) return images

   let bookmarks = ['']
   let attempts = 0
   const maxAttempts = 10

   while (images.length < needed && bookmarks.length && attempts < maxAttempts) {
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
            images.push(r.images.orig.url)
            if (images.length >= needed) break
         }

         const nextBookmark = data?.resource_response?.bookmark
         if (!nextBookmark || nextBookmark === '-end-') break
         bookmarks = [nextBookmark]
      } catch {
         break
      }
   }

   return [...new Set(images)].slice(0, needed)
}

// ═══════════════════════════════════════
// Handler
// ═══════════════════════════════════════
let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!text) {
    const usageText = theme.build([
      { type: 'title', text: 'بـحـث بـيـنـتـرسـت' },
      { type: 'divider' },
      { type: 'info', label: 'بحث صور', value: `${usedPrefix + command} <كلمة>` },
      { type: 'info', label: 'تحميل فيديو', value: `${usedPrefix + command} <رابط>` }
    ])
    return m.reply(usageText)
  }

  // تحميل فيديو من الرابط
  if (text.includes('pin.it') || text.includes('pinterest.com/pin/')) {
    await react('⏳')
    let waitMsg = await m.reply(theme.build([
      { type: 'title', text: 'جَـاري الـتـحـمـيـل' },
      { type: 'divider' },
      { type: 'line', text: 'يتم الآن تنزيل فيديو بينترست...' }
    ]))

    try {
      const outputPath = join(tmpdir(), `pin_${Date.now()}.mp4`)
      const cmd = `export PATH=$HOME/.deno/bin:$PATH && ${YTDLP_PATH} -o ${outputPath} ${text} --cookies ${COOKIES_PATH} --no-playlist --force-overwrites --no-cookies --sleep-interval 5 --user-agent "Mozilla/5.0"`
      await execAsync(cmd, { timeout: 180000 })

      if (!existsSync(outputPath)) throw new Error('فشل')
      const sizeMB = ((await (await import('fs')).statSync(outputPath)).size / 1048576).toFixed(2)

      try { await conn.sendMessage(m.chat, { delete: waitMsg.key }) } catch {}

      const captionText = theme.build([
        { type: 'title', text: 'تـم التنزيل بـنـجـاح' },
        { type: 'divider' },
        { type: 'info', label: 'الحجم', value: `${sizeMB} MB` }
      ])

      await conn.sendMessage(m.chat, {
        video: { url: outputPath },
        caption: captionText
      }, { 
        quoted: m,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363429074575231@newsletter',
            newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
            serverMessageId: 970
          }
        }
      })
      await react('✅')
      try { unlinkSync(outputPath) } catch {}
    } catch (e) {
      await react('❌')
      try { await conn.sendMessage(m.chat, { delete: waitMsg.key }) } catch {}
      const errText = theme.build([
        { type: 'title', text: 'خـطـأ في التحميل' },
        { type: 'divider' },
        { type: 'error', text: 'فشل تحميل الفيديو، تأكد من صحة الرابط.' }
      ])
      m.reply(errText)
    }
    return
  }

  // بحث صور
  await react('🔍')
  let searchMsg = await m.reply(theme.build([
    { type: 'title', text: 'جَـاري الـبـحـث' },
    { type: 'divider' },
    { type: 'info', label: 'الكلمة', value: text }
  ]))

  try {
    const images = await searchPinterest(text, 30)

    try { await conn.sendMessage(m.chat, { delete: searchMsg.key }) } catch {}

    if (!images || images.length === 0) {
      await react('❌')
      const notFoundText = theme.build([
        { type: 'title', text: 'لَم تـُعـثـر نـَتـيـجـة' },
        { type: 'divider' },
        { type: 'error', text: `لم يتم العثور على صور لـ: "${text}"` }
      ])
      return m.reply(notFoundText)
    }

    let cards = []

    for (let i = 0; i < images.length; i++) {
      try {
        const imgRes = await axios.get(images[i], {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 15000
        })

        const buffer = Buffer.from(imgRes.data)
        if (buffer.length < 1000) continue

        const { imageMessage } = await generateWAMessageContent(
          { image: buffer },
          { upload: conn.waUploadToServer }
        )

        if (!imageMessage) continue

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `📸 صورة ${i + 1} | 🔎 ${text}`,
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: imageMessage
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [{
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "📌 فتح في Pinterest",
                url: 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(text)
              })
            }]
          })
        })
      } catch (e) {
        continue
      }
    }

    if (cards.length === 0) {
      await react('❌')
      const errCardsText = theme.build([
        { type: 'title', text: 'خـطـأ في المعالجة' },
        { type: 'divider' },
        { type: 'error', text: 'فشل معالجة وتحميل الصور المطلوبة.' }
      ])
      return m.reply(errCardsText)
    }

    const carouselText = theme.build([
      { type: 'title', text: `نـتـائـج: ${text}` },
      { type: 'divider' },
      { type: 'info', label: 'عدد الصور', value: `${cards.length} صورة` }
    ])

    const finalMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: { message: { interactiveMessage: proto.Message.InteractiveMessage.fromObject({
        body: proto.Message.InteractiveMessage.Body.create({
          text: carouselText
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({ text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧' }),
        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
      })}}
    }, { 
      quoted: m,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363429074575231@newsletter',
          newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
          serverMessageId: 970
        }
      }
    })

    await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id })
    await react('✅')

  } catch (e) {
    console.error(e)
    try { await conn.sendMessage(m.chat, { delete: searchMsg.key }) } catch {}
    await react('❌')
    const generalErrText = theme.build([
      { type: 'title', text: 'خـطـأ في النظام' },
      { type: 'divider' },
      { type: 'error', text: 'حدث خطأ أثناء تنفيذ عملية البحث.' }
    ])
    m.reply(generalErrText)
  }
}

handler.help = ['بنترست']
handler.tags = ['downloader']
handler.command = /^(بنترست|بينترست|بينتر|pinterest)$/i

export default handler
