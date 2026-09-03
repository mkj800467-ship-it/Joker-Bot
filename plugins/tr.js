// plugins/tr.js
// ✧ THE JOKER & ITACHI - Search in Plugins 🔍

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

let handler = async (m, { conn, text, usedPrefix, command, isROwner }) => {
  if (!isROwner) return

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🔍 بـحـث في الـمـلـفـات' },
        { type: 'divider' },
        { type: 'line', text: '🃏 *ابحث عن أي كلمة أو أمر داخل ملفات البوت*' },
        { type: 'spacer' },
        { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix + command} <الكلمة>` },
        { type: 'spacer' },
        { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} apk` }
      ])
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })
  let statusMsg = await m.reply('🃏 *الجوكر وإيتاشي يبحثان في الملفات...* ⏳')

  const basePath = 'plugins'
  let matchedResults = []
  let fileReadErrors = []

  try {
    const files = fs.readdirSync(basePath).filter(file => file.endsWith('.js'))

    const validPatterns = [
      /^handler\.command\s*=\s*\/\^.*\$/i,
      /^const\s+audioCommands\s*=\s*\[.*\]/,
      /handler\.help\s*=\s*\[.*\]/,
      /=\s*\[.*\]/
    ]

    for (let i = 0; i < files.length; i++) {
      const fileName = files[i]
      const filePath = path.join(basePath, fileName)

      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const fileLines = fileContent.split('\n')

        fileLines.forEach((line, index) => {
          if (line.includes(text)) {
            if (validPatterns.some(pattern => pattern.test(line))) {
              matchedResults.push({
                fileIndex: i + 1,
                fileName,
                lineNumber: index + 1,
                lineContent: line.trim(),
              })
            }
          }
        })
      } catch (error) {
        fileReadErrors.push({ fileName, error: error.message })
      }
    }

    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

    if (matchedResults.length > 0) {
      let responseText = `🔍 *نـتـائـج الـبـحـث عـن:* "${text}"\n\n`
      matchedResults.forEach(({ fileIndex, fileName, lineNumber, lineContent }) => {
        responseText += `📄 *الملف:* ${fileName} (رقم: ${fileIndex})\n🔢 *السطر:* ${lineNumber}\n💻 \`\`\`${lineContent}\`\`\`\n\n`
      })

      await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '🔍 نـتـائـج الـبـحـث' },
          { type: 'divider' },
          { type: 'line', text: responseText }
        ])
      }, { quoted: m })

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } else {
      let errorText = `❌ لم يتم العثور على "${text}" مطابهاً للأنماط المحددة.\n`
      if (fileReadErrors.length > 0) {
        errorText += '\n⚠️ أخطاء القراءة:\n'
        fileReadErrors.forEach(({ fileName, error }) => {
          errorText += `- ${fileName}: ${error}\n`
        })
      }

      await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '❌ لـم يـتـم الـعـثـور' },
          { type: 'error', text: errorText }
        ])
      }, { quoted: m })

      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }

  } catch (e) {
    console.error('[Joker-Search]', e)
    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '❌ خطأ' },
        { type: 'error', text: 'حدث خطأ أثناء فحص المجلد' }
      ])
    }, { quoted: m })
  }
}

handler.help = ['كشف'].map(v => v + ' *<الكلمة>*')
handler.tags = ['owner']
handler.command = /^(كش|tr)$/i
handler.rowner = true

export default handler
