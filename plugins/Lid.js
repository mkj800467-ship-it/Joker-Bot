// plugins/mylid.js
// ✧ THE JOKER & ITACHI - Get LID Menu 🆔

import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'
import fetch from 'node-fetch'
import { theme } from '../core/theme.js';

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    // التفاعل بإيموجي الهوية
    await conn.sendMessage(m.chat, { react: { text: '🆔', key: m.key } });

    let sender = m.sender;
    const imageUrl = 'https://file.garden/aauvg01sjleV_ic1/2cfe027e0a045daa76a551309a8040df.jpg';
    const imageRes = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

    let menuText = `🃏 هـويـة الـمُـسـتـخـدم (LID)
❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 👤 ╎ الاسـم: @${sender.split('@')[0]}
 ┠ 🆔 ╎ الـمُـعرف: ${sender}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;

    const channel = "https://whatsapp.com/channel/0029Vb8We2VKrWR2Z9E5KQ1P"
    const developerNumber = "249916221538"
    const developerContact = `https://wa.me/${developerNumber}`

    const nativeFlowPayload = {
      body: {
        text: menuText,
        contextInfo: {
          mentionedJid: [sender]
        }
      },
      footer: { text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' },
      header: {
        hasMediaAttachment: true,
        subtitle: '🆔 قـسـم هـويـة الـمُـسـتـخـدم',
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: "📋 نـسـخ LID",
              copy_code: sender
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: "📢 الــقــنــاة الــرَّســمــيــة",
              url: channel
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: "👑 تــواصــل مــع الــمــطــور",
              url: developerContact
            })
          }
        ],
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: `⚡ ${speed}ms`,
            url: developerContact,
            copy_code: `المطور: +${developerNumber}`,
            expiration_time: Date.now() + 86400000
          },
          tap_target_configuration: {
            description: "Powered by THE JOKER & ITACHI",
            canonical_url: developerContact,
            domain: "https://ryzobot.vercel.app",
            button_index: 0
          }
        })
      }
    };

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload);
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, {
      userJid: conn.user.jid,
      quoted: m
    });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error('[Joker-LID]', e);
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء جلب الـ LID' }
      ])
    }, { quoted: m });
  }
}

handler.command = /^lid$/i;
handler.group = true;

export default handler;
