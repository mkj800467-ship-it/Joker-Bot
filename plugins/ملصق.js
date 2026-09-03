// plugins/sticker.js
// 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Perfect Square Sticker Maker (FFmpeg Edition) 🎨⚔️

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import webp from 'node-webpmux'
import crypto from 'crypto'

const execAsync = promisify(exec)

// ⚡ إضافة Metadata للملصق بحقوق أتاتشي والجوكر
async function addStickerMetadata(webpBuffer, packName = '👑 𝐈𝐭𝐚𝐜𝐡𝐢 𝑷𝒂𝒄𝒌 ✧', authorName = '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ') {
  try {
    const img = new webp.Image()
    await img.load(webpBuffer)

    const json = {
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
      'sticker-pack-name': packName,
      'sticker-pack-publisher': authorName,
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

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime || (!mime.includes('image') && !mime.includes('video'))) {
        return m.reply('👑 *𝐈𝐭𝐚𝐜𝐡𝐢: "الرجاء الرد على صورة أو فيديو لتوليد الملصق المربع الأسطوري"*')
    }

    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    let inputPath = join(tmpdir(), `in_${Date.now()}.${mime.includes('image') ? 'jpg' : 'mp4'}`)
    let outputPath = join(tmpdir(), `out_${Date.now()}.webp`)

    try {
        let media = await q.download()
        writeFileSync(inputPath, media)

        if (mime.includes('image')) {
            // 🖼️ تعديل الفلتر لقص الصورة وملء الأبعاد المربعة (512x512) تماماً مثل البوتات الاحترافية بدون أي مستطيلات أو فراغات
            let cmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -vcodec libwebp -lossless 0 -q:v 85 "${outputPath}" -y`
            await execAsync(cmd, { timeout: 30000 })
        } else {
            // 🎞️ معالجة الفيديوهات لتكون مربعة ومتناسقة تماماً وبسرعة فائقة
            let cmd = `ffmpeg -i "${inputPath}" -t 7 -vf "fps=15,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -c:v libwebp -loop 0 -preset default -an -vsync 0 "${outputPath}" -y`
            await execAsync(cmd, { timeout: 45000 })
        }

        if (!existsSync(outputPath)) throw new Error('فشل نظام توليد الملصق عبر FFmpeg')

        let stickerBuffer = readFileSync(outputPath)
        stickerBuffer = await addStickerMetadata(stickerBuffer, '👑 𝐈𝐭𝐚𝐜𝐡𝐢 𝑷𝒂𝒄𝒌 ✧', '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ')

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error('[Itachi-Sticker-FFmpeg] Error:', e)
        await m.reply('❌ *𝐈𝐭𝐚𝐜𝐡𝐢: "فشل توليد الملصق، تأكد من تثبيت حزمة ffmpeg"*')
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    } finally {
        // تنظيف الملفات المؤقتة لمنع امتلاء الذاكرة
        try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
        try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
    }
}

handler.command = ['ستيكر', 'sticker', 'ملصق']
handler.help = ['ستيكر']
handler.tags = ['sticker']

export default handler
