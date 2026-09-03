// plugins/ytv-dl.js
// ✧ THE JOKER & ITACHI - Advanced YouTube Downloader 📥⚔️

import fetch from 'node-fetch'
import { join } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, unlinkSync, statSync } from 'fs'
import { pipeline } from 'stream/promises'
import { theme } from '../core/theme.js'

async function downloadFromSaveNow(url, quality) {
  const isAudio = quality === 'mp3'
  const format = isAudio ? 'mp3' : quality

  const initRes = await fetch(
    `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&add_info=1`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://savenow.to/',
        Origin: 'https://savenow.to'
      },
      timeout: 30000
    }
  )
  const initJson = await initRes.json()
  console.log('[YTDL] savenow init:', JSON.stringify(initJson).slice(0, 200))

  const jobId = initJson?.id
  if (!jobId) throw new Error('فشل بدء التحميل من SaveNow')

  let downloadUrl = null
  const maxTries = isAudio ? 30 : 60
  for (let i = 0; i < maxTries; i++) {
    await new Promise(r => setTimeout(r, 3000))

    const progRes = await fetch(
      `https://p.savenow.to/ajax/progress?id=${jobId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://savenow.to/'
        },
        timeout: 15000
      }
    )
    const progJson = await progRes.json()
    console.log('[YTDL] progress:', progJson?.progress, progJson?.text)

    if (progJson?.success === 1 && progJson?.download_url) {
      downloadUrl = progJson.download_url
      break
    }
    if (progJson?.error) throw new Error('فشل SaveNow: ' + progJson?.error)
  }

  if (!downloadUrl) throw new Error(`انتهى الوقت بعد ${maxTries * 3} ثانية — جرب جودة أقل`)
  return downloadUrl
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // إذا لم يكتب المستخدم شيئاً أو الجودة، اعرض طريقة الاستخدام الفخمة بالـ theme
  if (!args[0] || !args[1]) {
    let usageText = theme.build([
      { type: 'title', text: '📥 تـحـمـيـل يـوتـيـوب' },
      { type: 'divider' },
      { type: 'info', label: 'تحميل صوت', value: `${usedPrefix + command} mp3 <رابط>` },
      { type: 'info', label: 'تحميل فيديو', value: `${usedPrefix + command} 360 <رابط>` },
      { type: 'info', label: 'جودات متاحة', value: 'mp3 | 360 | 480 | 720 | 1080' },
      { type: 'divider' },
      { type: 'line', text: '📌 مثال: .ytv-dl 720 https://youtu.be/xxxx' }
    ])

    return await conn.sendMessage(m.chat, {
      text: usageText,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363429074575231@newsletter',
          newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
          serverMessageId: 970
        },
        externalAdReply: {
          title: '⚜️ JOKER BOT - YOUTUBE DOWNLOADER',
          body: 'اضغط هنا للانضمام لقناة البوت الرسمية',
          thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg', // رابط صورة البوت أو القناة
          sourceUrl: 'https://whatsapp.com/channel/0029Vb3hUaY0LKZ3b5Z3b53c', // رابط قناتك
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  }

  const quality = args[0]
  const url = args.slice(1).join(' ')

  if (!url || (!url.includes('youtube') && !url.includes('youtu.be'))) {
    let errText = theme.build([
      { type: 'title', text: '❌ خطأ في الرابط' },
      { type: 'divider' },
      { type: 'error', text: 'الرابط المدخل غير صالح أو ليس رابط يوتيوب!' }
    ])
    return m.reply(errText)
  }

  const isAudio = quality === 'mp3'

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})
  
  let waitText = theme.build([
    { type: 'title', text: '⏳ جـاري الـتـحـمـيـل' },
    { type: 'divider' },
    { type: 'line', text: `يتم الآن جلب ${isAudio ? 'الصوت 🎵' : 'الفيديو بجودة ' + quality + 'p 🎬'}` },
    { type: 'info', label: 'المصدر', value: 'SaveNow Engine' }
  ])
  await m.reply(waitText)

  const ts = Date.now()
  const ext = isAudio ? 'mp3' : 'mp4'
  const outPath = join(tmpdir(), `yt_${ts}.${ext}`)

  try {
    const downloadUrl = await downloadFromSaveNow(url, quality)
    console.log('[YTDL] download url:', downloadUrl)

    const dlRes = await fetch(downloadUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 120000
    })
    if (!dlRes.ok) throw new Error(`فشل التحميل: ${dlRes.status}`)

    await pipeline(dlRes.body, createWriteStream(outPath))

    const size = statSync(outPath).size
    console.log('[YTDL] file size:', size)
    if (size < 1000) throw new Error('الملف صغير جداً أو تالف')

    // إرسال الملف مع تفاصيل القناة والمطور وتنسيق فخم
    let captionText = theme.build([
      { type: 'title', text: '✅ تـم الـتـحـمـيـل بـنـجـاح' },
      { type: 'divider' },
      { type: 'info', label: 'النوع', value: isAudio ? 'ملف صوتي (MP3)' : `فيديو (${quality}p)` },
      { type: 'info', label: 'الحجم', value: `${(size / (1024 * 1024)).toFixed(2)} MB` },
      { type: 'info', label: 'المطور', value: 'ITACHI & JOKER' },
      { type: 'divider' },
      { type: 'line', text: '⚡ ⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽ v2' }
    ])

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: outPath },
        mimetype: 'audio/mpeg',
        ptt: false,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363429074575231@newsletter',
            newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
            serverMessageId: 970
          },
          externalAdReply: {
            title: '🎧 JOKER AUDIO DOWNLOADER',
            body: 'استمتع بأفضل تجربة صوتية مع بوت الجوكر',
            thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg',
            sourceUrl: 'https://whatsapp.com/channel/0029Vb3hUaY0LKZ3b5Z3b53c',
            mediaType: 2,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: outPath },
        mimetype: 'video/mp4',
        caption: captionText,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363429074575231@newsletter',
            newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
            serverMessageId: 970
          },
          externalAdReply: {
            title: '🎬 JOKER VIDEO DOWNLOADER',
            body: `تم التحميل بجودة ${quality}p بنجاح`,
            thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg',
            sourceUrl: 'https://whatsapp.com/channel/0029Vb3hUaY0LKZ3b5Z3b53c',
            mediaType: 2,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})

  } catch (err) {
    console.error('[YTDL] error:', err.message)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    
    let errResText = theme.build([
      { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
      { type: 'divider' },
      { type: 'error', text: err.message }
    ])
    m.reply(errResText)
  } finally {
    try { unlinkSync(outPath) } catch {}
  }
}

handler.help = ['ytv-dl']
handler.tags = ['downloader']
handler.command = /^ytv-dl$/i

export default handler

