// plugins/tovideo.js
// 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Universal Sticker to Video Converter (FFmpeg) 🎥⚔️

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { theme } from '../core/theme.js'

const execAsync = promisify(exec)

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = q.mimetype || ''

    // فحص شامل لضمان استقبال الملصقات بمختلف أنواع الـ MimeTypes
    if (!m.quoted || (!mime.includes('webp') && !mime.includes('image'))) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🎥 تحويل الملصق إلى فيديو' },
                { type: 'divider' },
                { type: 'line', text: '⚠️ *يجب الرد على ملصق (متحرك، ثابت، أو مأخوذ من GIF) لتحويله*' },
                { type: 'spacer' },
                { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix + command} (بالرد على استيكر)` }
            ])
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    let statusMsg = await m.reply('👑 *جارٍ فك وتوليد الفيديو من الملصق...* ⏳')

    let inputPath = join(tmpdir(), `sticker_${Date.now()}.webp`)
    let outputPath = join(tmpdir(), `video_${Date.now()}.mp4`)

    try {
        let buffer = await m.quoted.download()
        writeFileSync(inputPath, buffer)

        // أمر FFmpeg المعزز للتعامل مع كافة أنماط WebP (المتحركة، الثابتة، ومالكي ملفات الـ GIF المتحولة)
        let cmd = `ffmpeg -y -i "${inputPath}" -pix_fmt yuv420p -c:v libx264 -movflags faststart -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -loop 0 "${outputPath}"`
        
        try {
            await execAsync(cmd, { timeout: 45000 })
        } catch (err) {
            // خط دفاع ثاني: لو فشل التحويل بالطريقة الأولى بسبب صيغة معقدة، نجرب طريقة توافقية بديلة
            let fallbackCmd = `ffmpeg -y -i "${inputPath}" -c:v libx264 -pix_fmt yuv420p -vf "fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outputPath}"`
            await execAsync(fallbackCmd, { timeout: 45000 })
        }

        if (!existsSync(outputPath)) throw new Error('فشل نظام توليد الفيديو عبر FFmpeg')

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        await conn.sendMessage(m.chat, {
            video: readFileSync(outputPath),
            caption: theme.build([
                { type: 'title', text: '🎥 تـم تـحـويـل الـمـلـصـق بـنـجـاح' },
                { type: 'divider' },
                { type: 'line', text: '⚡ *تم تحويل الملصق إلى فيديو بنجاح*' }
            ]),
            gifPlayback: true
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error('[Itachi-ToVideo-Universal] Error:', e)
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })

        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خطأ في التحويل' },
                { type: 'error', text: 'عذراً، هذا الملصق تالف أو مشفر بطريقة تمنع فكه.' }
            ])
        }, { quoted: m })
    } finally {
        try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
        try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
    }
}

handler.usage = ["لفيديو"]
handler.category = "tools"
handler.command = /^(tovideo|tovid|tomp4|لفيديو)$/i

export default handler
