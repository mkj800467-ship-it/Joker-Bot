// plugins/anime-edit.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — نظام جلب الإيديتات الأسطوري 🎬⚔️

import yts from 'yt-search'
import { join } from 'path'
import { tmpdir } from 'os'
import { existsSync, unlinkSync, statSync } from 'fs'
import { getYTDLP, download as downloadYTDLP } from '../core/ytdlp.js'

function cleanQuery(text) {
  return text.trim().replace(/\s+/g, ' ').slice(0, 100)
}

function isUsableVideo(v) {
  return !!(v?.url && (v?.type === 'video' || v?.seconds || v?.duration))
}

async function searchEdits(query) {
  // دمج البحث بالعربية والإنجليزية معاً لضمان إيجاد نتائج حقيقية واحترافية فوراً
  const queries = [
    `${query} anime edit 4k`,
    `${query} إيديت أنمي`,
    `${query} edit 60fps`,
    query
  ]

  let allVideos = []
  for (const q of queries) {
    try {
      const result = await yts(q)
      const videos = (result?.videos || [])
        .filter(isUsableVideo)
        .filter(v => v.seconds > 0 && v.seconds <= 300) // فيديوهات قصيرة وسريعة (تحت 5 دقائق)
      
      allVideos.push(...videos)
    } catch {}
  }

  // إزالة التكرار بناءً على الـ videoId
  const uniqueVideos = Array.from(new Map(allVideos.map(v => [v.videoId, v])).values())
  return uniqueVideos.sort((a, b) => (a.seconds || 9999) - (b.seconds || 9999))
}

async function downloadEdit(url, outputPath) {
  await getYTDLP()
  return downloadYTDLP(url, outputPath, {
    format: 'best[ext=mp4][height<=720]/best[ext=mp4]/best[height<=720]/best',
    maxHeight: 720
  })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    let menuText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
🎬 *نـظـام جـلـب الإيـديـتـات الأَسْـطُـوري*
───────────────────
📌 *طريقة الاستخدام:*
 \`${usedPrefix}${command} [اسم الشخصية أو الأنمي]\`

💡 *أمثلة سريعة:*
 ┠ \`${usedPrefix}${command} itachi\`
 ┠ \`${usedPrefix}${command} جوجوتسو كايسن\`
 ┠ \`${usedPrefix}${command} goku ultra instinct\`
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;
    return await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }

  const queryName = cleanQuery(text)
  const status = await m.reply(`⚡ *[ Itachi ]* : جاري استدعاء إيديت أسطوري لـ (*${queryName}*) عبر بُعد الشارينگان... 👁️‍🗨️`)
  await conn.sendMessage(m.chat, { react: { text: '👁️', key: m.key } }).catch(() => {})

  let outPath = null

  try {
    const videos = await searchEdits(queryName)
    if (!videos.length) throw new Error('لا توجد نتائج مطابقة في الأبعاد الروحية')

    let lastError = null
    // تجربة أول 6 فيديوهات متاحة لضمان نجاح التحميل الفوري
    for (const video of videos.slice(0, 6)) {
      try {
        const safeId = String(video.videoId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '')
        outPath = join(tmpdir(), `itachi_edit_${safeId}_${Date.now()}.mp4`)
        await downloadEdit(video.url, outPath)

        if (!existsSync(outPath) || statSync(outPath).size < 15 * 1024) {
          throw new Error('ملف الفيديو غير صالح أو تالف')
        }

        // إعدادات القناة والمعاينة الرسمية (External Ad Reply)
        const channelContext = {
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363429074575231@newsletter',
              newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
              serverMessageId: 970
            },
            externalAdReply: {
              title: `🎬 EDIT: ${queryName.toUpperCase()}`,
              body: 'اضغط للانضمام لقناة البوت الرسمية',
              thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg',
              sourceUrl: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }

        await conn.sendMessage(m.chat, {
          video: { url: outPath },
          mimetype: 'video/mp4',
          caption: `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖\n🎬 *العنوان:* ${video.title || 'Anime Masterpiece'}\n⏱️ *المدة:* ${video.timestamp || 'غير محدد'}\n👁️ *بواسطة:* 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹\n───────────────────\n〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`,
          ...channelContext
        }, { quoted: m })

        try { await conn.sendMessage(m.chat, { delete: status.key }) } catch {}
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
        return
      } catch (e) {
        lastError = e
        try { if (outPath && existsSync(outPath)) unlinkSync(outPath) } catch {}
        outPath = null
      }
    }

    throw lastError || new Error('فشلت جميع محاولات التحميل المتاحة')
  } catch (e) {
    console.error('[Itachi-Edit-Error]', e?.message || e)
    try { await conn.sendMessage(m.chat, { delete: status.key }) } catch {}
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    await m.reply(`❌ *عذراً يا محارب:* تعذر جلب الإيديت المطلوب حالياً بسبب ضغط السيرفرات أو قيود الرابط.\n\n💡 *جرّب كتابة اسم الشخصية بالإنجليزية (مثل: Sasuke أو Gojo) أو حاول مرة أخرى بعد قليل.*`)
  } finally {
    try { if (outPath && existsSync(outPath)) unlinkSync(outPath) } catch {}
  }
}

handler.help = ['ايديت', 'edit', 'إيديت']
handler.tags = ['anime']
handler.command = /^(ايديت|edit|إيديت)$/i

export default handler
