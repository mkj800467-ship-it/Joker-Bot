// plugins/getstickerhash.js
// ✧ THE JOKER & ITACHI - Get Sticker Hash 🆔

import crypto from 'crypto'
import { theme } from '../core/theme.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted || !m.quoted.mimetype?.includes('webp')) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🆔 بـصـمـة الـمـلـصـق' },
                { type: 'divider' },
                { type: 'line', text: '⚠️ *يجب الرد على ملصق لاستخراج بصمته*' },
                { type: 'spacer' },
                { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix + command} (بالرد على استيكر)` }
            ])
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '🆔', key: m.key } })

    try {
        let buffer = await m.quoted.download()
        let hash = crypto.createHash('sha256').update(buffer).digest('hex')

        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🆔 بـصـمـة الـمـلـصـق (SHA-256)' },
                { type: 'divider' },
                { type: 'line', text: `\`\`\`${hash}\`\`\`` }
            ])
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error('[Joker-Hash]', e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خطأ' },
                { type: 'error', text: 'فشل في استخراج بصمة الملصق' }
            ])
        }, { quoted: m })
    }
}

handler.command = ['بصمة', 'stickerhash']
handler.help = ['بصمة']
handler.tags = ['sticker']

export default handler
