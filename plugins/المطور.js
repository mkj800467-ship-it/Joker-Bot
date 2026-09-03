// plugins/owner.js
// ✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ - المطور

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
    await new Promise(resolve => setTimeout(resolve, 1200));
  } catch (e) {}

  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ ✧ [ 𝚰𝚻𝚫𝚂𝚮𝚰 ]
ORG:ITACHI UCHIHA
TITLE:Supreme Developer & Owner ⚡
EMAIL;type=INTERNET:go588288@gmail.com
TEL;type=CELL;waid=249916221538:+249916221538
ADR;type=WORK:;;Sudan;Hidden Leaf Village ;;
URL;type=WORK:https://www.instagram.com/go24.q?igsh=MWdoYWtjZWNnMGhncQ==
X-WA-BIZ-NAME:✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ ✧
X-WA-BIZ-DESCRIPTION:❄️ THE JOKER BOT - Mfd by Itachi 卍
X-WA-BIZ-HOURS:Mo-Su 00:00-23:59
END:VCARD`

  let qkontak = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧",
        vcard
      }
    }
  }

  // إرسال ثيم نصي أنيق يسبق البطاقة لمسة إيتاشي الخالصة
  await conn.sendMessage(m.chat, {
    text: theme.build([
      { type: 'title', text: '⚡ الـمـطـوريـن الأَسـاطـيـر ⚡' },
      { type: 'divider' },
      { type: 'info', label: '👑 المطور', value: '✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ' },
      { type: 'info', label: '🌙 الماستر', value: '𝚰𝚻𝚫𝚂𝚮𝚰 (Uchiha)' },
      { type: 'divider' },
      { type: 'line', text: '❄️ تواصل مع المطور عبر بطاقة الاتصال أدناه ♞' },
      { type: 'divider' },
      { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
    ])
  }, { quoted: m });

  await conn.sendMessage(
    m.chat,
    {
      contacts: {
        displayName: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧',
        contacts: [{ vcard }]
      }
    },
    { quoted: qkontak }
  )
}

handler.help = ['owner', 'creator']
handler.tags = ['main']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري|creador)$/i

export default handler;
