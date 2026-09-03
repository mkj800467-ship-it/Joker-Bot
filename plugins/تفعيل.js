// plugins/joker.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام تفعيل وإيقاف الجوكر 🤖

import { theme } from '../core/theme.js';

let handler = async (m, { conn, isAdmin, isROwner, isOwner, usedPrefix, command }) => {
  if (!m.text.startsWith(usedPrefix)) return;

  if (!m.isGroup) {
    return m.reply(theme.build([
      { type: 'title', text: '🜲⃝☠️ خـطـأ ☠️⃝🜲' },
      { type: 'divider' },
      { type: 'error', text: '👁️⃝🩸 للمجموعات فقط' }
    ]));
  }

  if (!isAdmin && !isROwner && !isOwner) {
    return m.reply(theme.build([
      { type: 'title', text: '🜲⃝☠️ خـطـأ ☠️⃝🜲' },
      { type: 'divider' },
      { type: 'error', text: '👁️⃝🩸 للأدمن فقط' }
    ]));
  }

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].jokerAI = !global.db.data.chats[m.chat].jokerAI;

  const isActive = global.db.data.chats[m.chat].jokerAI;

  const msgText = isActive
    ? `🜲⃝☠️ *تم تفعيل الجوكر* ☠️⃝🜲\n👁️⃝🩸 جندي النخبة جاهز\n𖤐⃝🩸 ${global.botName || '𝐈𝐭𝐚𝐜𝐡𝐢 & 𝑱𝑶𝑲𝑬𝑹'}`
    : `🜲⃝☠️ *تم إيقاف الجوكر* ☠️⃝🜲\n𖤐⃝🩸 ${global.botName || '𝐈𝐭𝐚𝐜𝐡𝐢 & 𝑱𝑶𝑲𝑬𝑹'}`;

  await conn.sendMessage(m.chat, {
    text: msgText,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      }
    }
  }, { quoted: m });
};

handler.command = /^(الجوكر|joker)$/i;
handler.group = true;

export default handler;
