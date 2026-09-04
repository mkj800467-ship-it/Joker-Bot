// plugins/owner.js
// ✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ - المطور ⚡

import { theme } from '../core/theme.js'

let handler = async (m, { conn }) => {
  // تفاعل أسطوري مع الأمر
  await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

  try {
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: 'https://file.garden/aauvg01sjleV_ic1/pro.opus' },
        mimetype: 'audio/mp4',
        ptt: true
      },
      { quoted: m }
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (e) {}

  // رقم المطور الدولي
  const ownerNumber = '249916221538'
  const ownerProfileUrl = 'https://wa.me/' + ownerNumber

  // استمارة ملكية فخمة ومرتبة مع صورة ورابط تواصل مباشر (تتجاوز حظر جهات الاتصال في المجموعات)
  const ownerCardText = `جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝐎𝚃

⚡ *بطاقة المطور الرسمي*
───────────────────
👑 *الاسم:* 𝒜7𝑀𝐸𝒟 𝒜𝒩𝒲𝒜𝑅ヅ
💻 *اللقب:* 𝒰𝒞𝐻𝐼𝐻𝒜 𝐼𝒯𝒜𝒞𝐻𝐼♞
🌍 *الدولة:* 𝒮𝒰𝒟𝒜𝒩 🇸🇩
📧 *البريد:* itachi588.com
───────────────────
💬 *للتواصل المباشر مع المطور:*
wa.me/${ownerNumber}

〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;

  await conn.sendMessage(m.chat, {
    image: { url: 'https://i.postimg.cc/pdpqVg02/70a7c820d3c80a36c1c6f0b74d869b80.jpg' },
    caption: ownerCardText,
    footer: 'ITACHI UCHIHA',
    buttons: [
      {
        buttonId: `${ownerProfileUrl}`,
        buttonText: { displayText: '💬 تواصل مع المطور' },
        type: 1
      }
    ],
    headerType: 4
  }, { quoted: m });
}

handler.help = ['owner', 'creator']
handler.tags = ['main']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري|creador)$/i

export default handler;
