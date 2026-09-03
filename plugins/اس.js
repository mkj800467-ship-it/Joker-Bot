// plugins/spotify.js
// ✧ THE JOKER & ITACHI - Spotify Downloader 🎵

import fetch from 'node-fetch';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 1. التحقق من وجود رابط
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🎵 تـحـمـيـل مـن سـبـوتـيـفـاي' },
        { type: 'divider' },
        { type: 'line', text: '🃏 *أمر تحميل الأغاني من منصة Spotify*' },
        { type: 'spacer' },
        { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix + command} <رابط الأغنية>` },
        { type: 'divider' },
        { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT` }
      ])
    }, { quoted: m });
  }

  // 2. استخراج رابط الـ track
  const spotifyRegex = /(?:https?:\/\/)?(?:open\.spotify\.com\/track\/)([a-zA-Z0-9]+)/;
  const match = text.match(spotifyRegex);

  if (!match) {
    return conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '❌ خـطـأ في الرابط' },
        { type: 'divider' },
        { type: 'error', text: 'رابط سبوتيفاي غير صالح أو ليس رابط أغنية (track) مباشر!' },
        { type: 'spacer' },
        { type: 'warning', text: 'تأكد من إرسال رابط track صحيح' }
      ])
    }, { quoted: m });
  }

  const spotifyUrl = match[0];

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  let statusMsg = await m.reply('🃏 *الجوكر وإيتاشي يجلبان معلومات الأغنية من سبوتيفاي...* ⏳');

  try {
    // 3. الاتصال بالـ API
    const apiUrl = 'https://gamepvz.com/api/download/get-url';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://gamepvz.com',
        'Referer': 'https://gamepvz.com/'
      },
      body: JSON.stringify({ url: spotifyUrl })
    });

    const data = await response.json();

    if (data.code !== 200 || !data.originalVideoUrl) {
      throw new Error('فشل التحميل من الخادم الخارجي');
    }

    // 4. تجهيز رابط التحميل
    const downloadUrl = `https://gamepvz.com${data.originalVideoUrl}`;

    // 5. تحميل صورة الغلاف
    let coverBuffer = null;
    if (data.coverUrl) {
      try {
        const coverRes = await fetch(data.coverUrl);
        coverBuffer = await coverRes.buffer();
      } catch (e) {
        console.log('[Joker-Spotify] Cover load error:', e);
      }
    }

    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

    // 6. إرسال صورة الغلاف والمعلومات أولاً (إن وجدت)
    const caption = theme.build([
      { type: 'title', text: '🎵 تـم الـعـثـور عـلى الأغـنـيـة' },
      { type: 'divider' },
      { type: 'info', label: '🎤 الأغنية', value: data.title || 'غير معروف' },
      { type: 'info', label: '👤 الفنان', value: data.authorName || 'غير معروف' },
      { type: 'divider' },
      { type: 'line', text: '⚡ *جاري إرسال ملف الصوت...*' }
    ]);

    if (coverBuffer) {
      await conn.sendMessage(m.chat, {
        image: coverBuffer,
        caption: caption
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    }

    // 7. إرسال ملف الصوت بصيغة MP3
    const safeTitle = (data.title || 'song').replace(/[\\/:*?"<>|]/g, '');
    const safeArtist = (data.authorName || 'artist').split(',')[0].replace(/[\\/:*?"<>|]/g, '');

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${safeTitle} - ${safeArtist}.mp3`,
      ptt: false
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('[Joker-Spotify] Error:', error);
    try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
        { type: 'divider' },
        { type: 'error', text: error.message || 'حدث خطأ أثناء جلب الأغنية' },
        { type: 'spacer' },
        { type: 'warning', text: 'تأكد من صحة الرابط أو أن الخدمة تعمل بشكل سليم' }
      ])
    }, { quoted: m });
  }
};

handler.help = ['سبوتيفاي'].map(v => v + ' *<رابط>*');
handler.tags = ['download', 'music'];
handler.command = /^(سبوتيفاي|spotify|تحميل اغنية|اغنية)$/i;

export default handler;
