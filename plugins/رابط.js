// plugins/رابط_الجروب.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - رابط المجموعة الرسمي 🔗

import { theme } from '../core/theme.js'

const LINK_IMAGE = 'https://i.postimg.cc/zvsW3sQf/9fd5c30ccf511b89d6f1709890cae4ea.jpg'

const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  try {
    if (!m.isGroup) return global.dfail('group', m, conn)
    if (!isAdmin) return global.dfail('admin', m, conn)
    if (!isBotAdmin) return global.dfail('botAdmin', m, conn)

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let inviteCode = await conn.groupInviteCode(m.chat)
    let inviteLink = 'https://chat.whatsapp.com/' + inviteCode

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    let captionMessage = theme.build([
      { type: 'title', text: '🔗 رابـط دعـوة الـمـجـمـوعـة' },
      { type: 'subtitle', text: 'قم بمشاركة الرابط مع أصدقائك للانضمام' },
      { type: 'divider' },
      { type: 'info', label: '🌐 الرابط', value: inviteLink },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]);

    await conn.sendMessage(m.chat, {
      image: { url: LINK_IMAGE },
      caption: captionMessage
    }, { quoted: m })

  } catch (e) {
    console.error('[Itachi-Link] خطأ:', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(theme.build([
      { type: 'title', text: '❌ خـطـأ' },
      { type: 'subtitle', text: 'فشل جلب رابط المجموعة - تأكد من صلاحيات البوت الإدارية' },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }
}

handler.command = /^(لينك|رابط_الجروب|invite|getlink|رابط|الرابط)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler;
