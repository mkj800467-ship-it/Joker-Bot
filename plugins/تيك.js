// plugins/tiktok.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - تحميل فيديوهات تيك توك 🎬

import axios from "axios";
import { theme } from '../core/theme.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!args[0]) {
    await react('❌')
    return m.reply(theme.build([
      { type: 'title', text: '🎬 تـحـمـيـل تـيـك تـوك' },
      { type: 'divider' },
      { type: 'info', label: '⚔️ الاستخدام', value: `${usedPrefix}${command} <رابط>` },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }

  let url = args[0];

  if (!/tiktok|douyin|vm\.tiktok|vt\.tiktok/i.test(url)) {
    await react('❌')
    return m.reply(theme.build([
      { type: 'title', text: '❌ خـطـأ' },
      { type: 'subtitle', text: 'رابط تيك توك غير صالح' },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }

  await react('⏳')
  let statusMsg = await m.reply(theme.build([
    { type: 'title', text: '📥 جـاري الـتـحـمـيـل' },
    { type: 'subtitle', text: '⏳ جاري جلب فيديو التيك توك...' }
  ]))

  try {
    let result = await Tiktok(url);
    if (!result || result.code !== 0) throw new Error("لم يتم العثور على فيديو");

    let { play, hdplay, music, title } = result.data;
    let videoUrl = hdplay || play;

    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

    // إرسال الفيديو
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: theme.build([
        { type: 'title', text: '✅ تـم الـتـحـمـيـل بـنـجـاح' },
        { type: 'subtitle', text: title ? title.substring(0, 50) : 'فيديو تيك توك' },
        { type: 'divider' },
        { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
      ])
    }, { quoted: m })

    // إرسال الصوت
    if (music) {
      await conn.sendMessage(m.chat, {
        audio: { url: music },
        mimetype: 'audio/mpeg'
      }, { quoted: m })
    }

    await react('✅')

  } catch (error) {
    console.error("[Joker-TikTok]", error);
    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
    await react('❌')
    m.reply(theme.build([
      { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
      { type: 'subtitle', text: 'لم يتم العثور على الفيديو أو حدث خطأ في الخادم' },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]))
  }
};

const Tiktok = async (url) => {
  let params = new URLSearchParams();
  params.append("url", url);

  let { data } = await axios.post("https://tikwm.com/api/", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Cookie: "current_language=en",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
    },
  });

  return data;
};

handler.help = ["تيك <رابط>"];
handler.tags = ["downloader"];
handler.command = /^(تيك|tik|تيكتوك|tiktok)$/i;

export default handler;

