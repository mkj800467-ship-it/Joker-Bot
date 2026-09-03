// plugins/exif.js
// 👑 Change Sticker Exif (Metadata Changer) 🎭

import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import webp from 'node-webpmux'
import crypto from 'crypto'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = q.mimetype || ''

    if (!m.quoted || !mime.includes('webp')) {
        return m.reply(`⚠️ يجب الرد على ملصق (ثابت أو متحرك) لتغيير حقوقه!\n\n⚡ الاستخدام:\n${usedPrefix + command} <اسم البكج> | <اسم الناشر>\n\n🔹 مثال:\n${usedPrefix + command} Itachi Pack | Joker Bot\nأو بالطريقة السريعة:\n${usedPrefix + command} اتاتشي عمك`)
    }

    if (!text) {
        return m.reply(`⚠️ يجب كتابة الحقوق الجديدة!\n\n⚡ مثال:\n${usedPrefix + command} Itachi Pack | Joker Bot\nأو:\n${usedPrefix + command} اتاتشي عمك`)
    }

    let [packName, authorName] = text.split('|').map(v => v.trim())
    if (!authorName) {
        authorName = packName
        packName = 'Itachi Pack'
    }

    let inputPath = join(tmpdir(), `sticker_${Date.now()}.webp`)
    let outputPath = join(tmpdir(), `output_${Date.now()}.webp`)

    try {
        let buffer = await m.quoted.download()
        writeFileSync(inputPath, buffer)

        let img = new webp.Image()
        await img.load(inputPath)

        let json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': packName,
            'sticker-pack-publisher': authorName,
            'emojis': ['👑', '🔥', '⚔️']
        }

        let exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ])

        let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
        let exif = Buffer.concat([exifAttr, jsonBuffer])
        exif.writeUIntLE(jsonBuffer.length, 14, 4)
        img.exif = exif

        await img.save(outputPath)
        let finalBuffer = readFileSync(outputPath)

        await conn.sendMessage(m.chat, { sticker: finalBuffer }, { quoted: m })

    } catch (e) {
        console.error('[Exif Error]:', e)
        m.reply(`❌ حدث خطأ أثناء تعديل حقوق الملصق.`)
    } finally {
        try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
        try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
    }
}

handler.command = ['حقوق', 'exif', 'take', 'steal']
handler.help = ['حقوق <اسم البكج> | <الناشر>']
handler.tags = ['sticker']

export default handler
