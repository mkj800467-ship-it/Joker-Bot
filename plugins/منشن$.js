// plugins/tagall.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام المنشن الجماعي السيبراني 👥🔥

let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, '> 👑 *ITACHI & JOKER: "تنبيه"* \n> 🔮 هذا الأمر يعمل حصرياً داخل المجموعات السيبرانية!');
  }

  // تحديد المطورين المعتمدين (JID و LID الخاص بك)
  const allowedOwners = [
    '249916221538@s.whatsapp.net',
    '14904274759837@lid'
  ];

  // التحقق مما إذا كان المرسل هو المشرف أو المطور المعتمد حصراً
  const senderJid = m.sender;
  const isAuthorizedOwner = allowedOwners.includes(senderJid) || isOwner;

  if (!isAdmin && !isAuthorizedOwner) {
    return conn.reply(m.chat, '> 👑 *ITACHI & JOKER: "صلاحيات سيادية"* \n> 🔮 هذا الأمر مخصص للمشرفين والمطورين فقط!');
  }

  let groupData = conn.chats?.[m.chat];
  if (!groupData?.metadata?.participants) {
    try {
      groupData = await conn.groupMetadata(m.chat);
    } catch (e) {
      return m.reply('> ❌ لا يمكن الوصول لبيانات وقائمة أعضاء المجموعة حالياً.');
    }
  }

  const participants = groupData.metadata?.participants || groupData.participants;
  if (!participants) return m.reply('> ❌ فشل جلب أعضاء المجموعة.');

  let mentions = participants.map(p => p.id);
  
  // تنسيق المنشنات داخل إطار جميل ومنسق
  let tags = participants.map((p, index) => `│ ${index + 1}. @${p.id.split('@')[0]}`).join('\n');

  let text = `👑 *[ منشن جميع أعضاء الحلبة ]* 👑\n\n`;
  text += `┌─── ❖ *قائمة الأعضاء* ❖ ───\n`;
  text += `${tags}\n`;
  text += `└─── ❖ *ITACHI & JOKER* ❖ ───\n\n`;
  text += `> ⚡ *تم استدعاء الجميع بنجاح بواسطة سيادة المشرف أو المطور.*`;

  let imageUrl = 'https://i.postimg.cc/dtd8Vpfg/c8b1419bcf35feb34e093e26e1d1f606.jpg';

  const channelContext = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      },
      mentionedJid: mentions
    }
  };

  await conn.sendMessage(m.chat, { 
    image: { url: imageUrl }, 
    caption: text, 
    mentions,
    ...channelContext
  }, { quoted: m });
};

handler.command = /^منشن$/i;
handler.group = true;
handler.admin = true;

export default handler;
