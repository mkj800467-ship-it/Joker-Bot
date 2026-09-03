// plugins/replace.js
// ✧ THE JOKER & ITACHI - Text Replacer in Files 🔄

import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

let handler = async (m, { text, conn, usedPrefix, command }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🔄 اسـتـبـدال نـص في الـمـلـفـات' },
                { type: 'divider' },
                { type: 'line', text: '🃏 *استبدال كلمة بأخرى في كافة ملفات البوت*' },
                { type: 'spacer' },
                { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix + command} <الكلمة القديمة> | <الكلمة الجديدة>` },
                { type: 'divider' },
                { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} 2B | Joker` }
            ])
        }, { quoted: m })
    }

    let parts = text.split('|')
    if (parts.length < 2) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ في الصيغة' },
                { type: 'divider' },
                { type: 'error', text: 'يجب استخدام الفاصلة العمودية بالشكل الصحيح' },
                { type: 'spacer' },
                { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} القديم | الجديد` }
            ])
        }, { quoted: m })
    }

    let oldWord = parts[0].trim()
    let newWord = parts[1].trim()

    if (!oldWord || !newWord) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'divider' },
                { type: 'error', text: 'الكلمة القديمة والكلمة الجديدة مطلوبتان!' }
            ])
        }, { quoted: m })
    }

    let foundFiles = []

    function walkDir(dir) {
        let files = fs.readdirSync(dir)
        for (let file of files) {
            let fullPath = path.join(dir, file)
            let stat = fs.statSync(fullPath)

            if (stat.isDirectory()) {
                if (file === 'node_modules' || file === '.git' || file === 'temp') continue
                walkDir(fullPath)
            } else if (file.endsWith('.js') || file.endsWith('.json')) {
                try {
                    let content = fs.readFileSync(fullPath, 'utf8')
                    if (content.includes(oldWord)) {
                        foundFiles.push(fullPath.replace('.\\', '').replace('./', ''))
                    }
                } catch {}
            }
        }
    }

    walkDir('.')

    if (foundFiles.length === 0) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ لـم يـتـم الـعـثـور' },
                { type: 'divider' },
                { type: 'error', text: `لم يتم العثور على الكلمة (${oldWord}) في أي ملف!` }
            ])
        }, { quoted: m })
    }

    // تخزين البيانات مؤقتاً
    global.replaceData = global.replaceData || {}
    let sessionId = Date.now().toString()
    global.replaceData[sessionId] = { oldWord, newWord, foundFiles }

    let fileListText = foundFiles.slice(0, 15).map((f, i) => `├ ${i + 1}. ${f}`).join('\n')
    if (foundFiles.length > 15) {
        fileListText += `\n└ ... و ${foundFiles.length - 15} ملفات أخرى`
    } else if (foundFiles.length > 0) {
        fileListText += `\n└ إجمالي الملفات المتاحة`
    }

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: {
                        text: theme.build([
                            { type: 'title', text: '🔄 تـأكـيـد اسـتـبـدال الـنـص' },
                            { type: 'divider' },
                            { type: 'info', label: '🔍 القديم', value: oldWord },
                            { type: 'info', label: '✨ الجديد', value: newWord },
                            { type: 'info', label: '📁 الملفات', value: `${foundFiles.length} ملف` },
                            { type: 'divider' },
                            { type: 'line', text: fileListText }
                        ])
                    },
                    footer: { text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '✅ تأكيد الاستبدال',
                                    id: `.replace_confirm ${sessionId}`
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '❌ إلغاء العمليات',
                                    id: `.replace_cancel ${sessionId}`
                                })
                            }
                        ],
                        messageParamsJson: ''
                    }
                })
            }
        }
    }, { userJid: conn.user.jid, quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

// أمر التأكيد والإلغاء مدمجين مع فحص السلامة والصلاحيات
handler.before = async function (m, { conn }) {
    let text = m.text || ''

    if (text.startsWith('.replace_confirm ')) {
        // التحقق من أن المستخدم المالك للبوت
        if (!global.owner || !global.owner.some(o => (Array.isArray(o) ? o[0] : o) === m.sender.split('@')[0])) {
            return
        }

        let sessionId = text.replace('.replace_confirm ', '').trim()
        if (!sessionId) return

        let data = global.replaceData?.[sessionId]
        if (!data) {
            return conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '⏰ انـتـهـت الـصـلاحـيـة' },
                    { type: 'divider' },
                    { type: 'warning', text: 'انتهت صلاحية جلسة الاستبدال أو تم تنفيذها مسبقاً' }
                ])
            }, { quoted: m })
        }

        let { oldWord, newWord, foundFiles } = data
        let changedCount = 0

        for (let filePath of foundFiles) {
            try {
                let content = fs.readFileSync(filePath, 'utf8')
                if (content.includes(oldWord)) {
                    let escapedOldWord = oldWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    let newContent = content.replace(new RegExp(escapedOldWord, 'g'), newWord)
                    fs.writeFileSync(filePath, newContent, 'utf8')
                    changedCount++
                }
            } catch (e) {
                console.error(`[Joker-Replace] Error in file ${filePath}:`, e)
            }
        }

        delete global.replaceData[sessionId]

        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '✅ تـم الاسـتـبـدال بـنـجـاح' },
                { type: 'divider' },
                { type: 'info', label: '🔍 من', value: oldWord },
                { type: 'info', label: '✨ إلى', value: newWord },
                { type: 'info', label: '📁 الملفات المعدلة', value: `${changedCount} / ${foundFiles.length}` },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ])
        }, { quoted: m })
    }

    if (text.startsWith('.replace_cancel ')) {
        if (!global.owner || !global.owner.some(o => (Array.isArray(o) ? o[0] : o) === m.sender.split('@')[0])) {
            return
        }

        let sessionId = text.replace('.replace_cancel ', '').trim()
        if (!sessionId) return

        if (global.replaceData?.[sessionId]) {
            delete global.replaceData[sessionId]
        }

        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ تـم الـإلـغـاء' },
                { type: 'divider' },
                { type: 'line', text: 'تم إلغاء عملية الاستبدال بنجاح' }
            ])
        }, { quoted: m })
    }
}

handler.help = ['استبدال'].map(v => v + ' *<القديم> | <الجديد>*');
handler.tags = ['owner', 'tools'];
handler.command = /^(استبدال|replace)$/i;
handler.owner = true;
handler.rowner = true;

export default handler;
