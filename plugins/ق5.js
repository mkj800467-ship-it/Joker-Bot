// plugins/q5-tools.js
// ✧ THE JOKER & ITACHI - Tools Menu 🛠️

import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'
import fetch from 'node-fetch'
import { theme } from '../core/theme.js';

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    // التفاعل بإيموجي القسم الخاص بالأدوات
    await conn.sendMessage(m.chat, { react: { text: '🛠️', key: m.key } });

    const imageUrl = 'https://i.postimg.cc/TPyP0drF/9fd5c30ccf511b89d6f1709890cae4ea.jpg';
    const imageRes = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

    let menuText = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 👤 ╎ الاسـم: @${m.sender.split('@')[0]}
 ┠ 🛠️ ╎ قــسم الأدَوات والمُساعَدَة
 ┠ ${_p}كشف
 ┠ ${_p}تحسين
 ┠ ${_p}رفع
 ┠ ${_p}رابط
 ┠ ${_p}سكرب
 ┠ ${_p}لفيديو
 ┠ ${_p}لصوره
 ┠ ${_p}لصوت
 ┠ ${_p}لكرتون
 ┠ ${_p}ارسم
 ┠ ${_p}اختصار
 ┠ ${_p}ترجم
 ┠ ${_p}حلل
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;

    const channel = "https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A"
    const developerNumber = "249916221538"
    const developerContact = `https://wa.me/${developerNumber}`

    let sectionRows = [
      { "title": "👮‍♂️ قـسـم الأدْمـن", "description": "🔱 عـرض اوامـر الادارة والـتـحـكـم فـي الـجـروب 🔱", "id": ".ق1" },
      { "title": "🎨 قـسـم الاسـتـيـكـر", "description": "🎨 عـرض اوامـر صـنـع وتـصـمـيـم الـاسـتـيـكـرات 🎨", "id": ".ق2" },
      { "title": "🎮 قـسـم الألـعـاب", "description": "🎮 عـرض اوامـر الـعـلـاب والـمـسـابـقـات والـتـسـلـيـه 🎮", "id": ".ق3" },
      { "title": "📥 قـسـم الـتـحـمـيـل", "description": "📥 عـرض اوامـر تـحـمـيـل الـفـيـديـوهـات والـصـوتـيـات 📥", "id": ".ق4" },
      { "title": "🧰 قـسـم الأدوات", "description": "🧰 عـرض الادوات والـمـسـاعـدات الـذكـيـه لـلـبـوت 🧰", "id": ".ق5" },
      { "title": "📚 قـسـم الـمـانـجـا", "description": "📚 عـرض اوامـر وبـحـث فـصـول الـمـانـجـا والـأنـيـمـي 📚", "id": ".ق6" },
      { "title": "🤖 الـذكـاء الاصـطـنـاعـي", "description": "🤖 عـرض اوامـر الـذكـاء الاصـطـنـاعـي والـمـحـادثـات 🤖", "id": ".ق7" },
      { "title": "🎌 قـسـم الـنـقـابـات", "description": "🎌 عـرض اوامـر وانـظـمـة الـنـقـابـات والـعـشـائـر 🎌", "id": ".ق8" },
      { "title": "🖼️ قـسـم الـصـور", "description": "🖼️ عـرض اوامـر الـصـور والـخـلـفـيـات والـتـصـامـيـم 🖼️", "id": ".ق9" },
      { "title": "⛄ قـسـم الـتـسـلـيـة", "description": "🥳 عـرض اوامـر التــسلـيـه والتــرفيــه 🥳", "id": ".ق10" },
      { "title": "👑 قـسـم الـمـطـور", "description": "👑 عـرض اوامـر والـصـلاحـيـات الخاصه بـالـمـطـور 👑", "id": ".ق11" },
      { "title": "🏦 قـسـم الـبـنـك والـقـلاع", "description": "💰 عـرض اوامـر الـبـنـك والـقـلاع والـرصـيـد (ق12) 💰", "id": ".ق12" }
    ];

    const nativeFlowPayload = {
      body: {
        text: menuText,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      },
      footer: { text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' },
      header: {
        hasMediaAttachment: true,
        subtitle: '🛠️ قـسـم الأدَوات والمُساعَدَة',
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: "🔱 إخـتـار مــن الاتـي 🔱",
              sections: [
                {
                  title: "اخــتــر الــقــســم الـمـطـلـوب",
                  rows: sectionRows
                }
              ]
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: "🤖 تــنــصــيــب الــبــوت",
              id: ".تنصيب"
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
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            divider_indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 999],
            list_title: "🔱 إخـتـار مــن الاتـي 🔱",
            button_title: "▻ عــرض جــمــيــع الأقــســام  ⚡"
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
    const fkontak = await makeFkontak();
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, {
      userJid: conn.user.jid,
      quoted: fkontak
    });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error('[Joker-Tools]', e);
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء تحميل لوحة الأدوات' }
      ])
    }, { quoted: m });
  }
}

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/TPyP0drF/9fd5c30ccf511b89d6f1709890cae4ea.jpg');
    const thumb2 = Buffer.from(await res.arrayBuffer());
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'JOKER' },
      message: { locationMessage: { name: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    };
  } catch {
    return undefined;
  }
}

handler.help = ['ق5'];
handler.tags = ['main'];
handler.command = ['ق5'];

export default handler;

