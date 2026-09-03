// plugins/transcribe.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - محول الصوتيات الاحترافي إلى نصوص 🎙️✨

import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import fetch from 'node-fetch';
import { theme } from '../core/theme.js';

let handler = async (m, { conn }) => {
  // فحص إذا كان فيه ملف صوت أو فيديو
  const isQuotedAudio = m.quoted && (m.quoted.mtype === 'audioMessage' || m.quoted.mtype === 'videoMessage');
  const isAudio = m.mtype === 'audioMessage' || m.mtype === 'videoMessage';

  // إعدادات القناة الرسمية للإعلان والتفاعل
  const channelContext = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      },
      externalAdReply: {
        title: '⚜️ ITACHI & JOKER - AUDIO TRANSCRIBER',
        body: 'اضغط للانضمام لقناة البوت الرسمية',
        thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg',
        sourceUrl: 'https://whatsapp.com/channel/0029Vb3hUaY0LKZ3b53c',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  };

  if (!isQuotedAudio && !isAudio) {
    return conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🎙️ مـحـول الـصـوتـيـات' },
        { type: 'divider' },
        { type: 'line', text: '❌ يرجى إرسال أو الرد على ملف صوتي أو فيديو لتحويله إلى نص!' },
        { type: 'info', label: 'طريقة الاستخدام', value: 'قم بعمل Reply على الصوت واكتب .نسخ' }
      ]),
      ...channelContext
    }, { quoted: m });
  }

  let processingMsg = await conn.sendMessage(m.chat, {
    text: theme.build([
      { type: 'title', text: '⏳ جـاري المعالجة' },
      { type: 'divider' },
      { type: 'line', text: '🎙️ جاري سحب وتحويل الصوت إلى نص بدقة فائقة...' }
    ]),
    react: { text: '🎙️', key: m.key },
    ...channelContext
  }, { quoted: m });

  let tempFilePath = '';

  try {
    let media;
    let mime;
    let filename;

    if (isQuotedAudio) {
      media = await m.quoted.download();
      mime = m.quoted.mimetype;
      filename = `audio_${Date.now()}.${mime.split('/')[1]}`;
    } else {
      media = await m.download();
      mime = m.mimetype;
      filename = `file_${Date.now()}.${mime.split('/')[1]}`;
    }

    tempFilePath = join(tmpdir(), filename);
    await writeFile(tempFilePath, media);

    // 1. طلب رابط رفع
    const fileStats = await import('fs').then(fs => fs.statSync(tempFilePath));
    const fileSize = fileStats.size;
    const ext = filename.split('.').pop().toLowerCase();

    const signPayload = {
      filename: filename.replace(/\.[^/.]+$/, ''),
      fileType: ext,
      fileSize: fileSize,
      duration: 60,
      languageCode: 'ar',
      transcriptionType: 'transcript',
      enableSpeakerDiarization: false,
      forceUpload: true,
      providerHint: 'r2'
    };

    const signRes = await fetch('https://api.uniscribe.co/upload/generate-signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signPayload)
    });

    const signData = await signRes.json();

    if (!signData.preSignedUrl) {
      throw new Error('فشل في الحصول على رابط الرفع السحابي');
    }

    // 2. رفع الملف
    const fileStream = (await import('fs')).createReadStream(tempFilePath);
    const uploadRes = await fetch(signData.preSignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mime },
      body: fileStream
    });

    if (!uploadRes.ok) throw new Error('فشل في رفع الملف إلى الخادم');

    // 3. بدء النسخ
    const transcribeRes = await fetch('https://api.uniscribe.co/tasks/transcription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcriptionFileId: signData.transcriptionFileId })
    });

    const transcribeData = await transcribeRes.json();
    if (!transcribeData.data?.taskId) {
      throw new Error('فشل في بدء عملية استخراج النص');
    }

    // 4. انتظار النتيجة (كل 3 ثواني لمدة 60 ثانية كحد أقصى)
    let result = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts && !result) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const statusRes = await fetch(
        `https://www.uniscribe.co/transcriptions/${signData.transcriptionFileId}?_rsc=1`,
        { headers: { 'RSC': '1' } }
      );
      const textResponse = await statusRes.text();

      if (textResponse.includes('"status":"completed"') || textResponse.includes('"text":')) {
        const textMatch = textResponse.match(/text\\":\\"([^\\"]+)\\"/);
        if (textMatch) {
          result = textMatch[1];
          break;
        }
      }
      attempts++;
    }

    // حذف الملف المؤقت فوراً
    if (tempFilePath) await unlink(tempFilePath).catch(() => {});

    if (result) {
      const finalText = result.length > 4000 ? result.substring(0, 3997) + '...' : result;

      await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '✅ تـم نـسـخ الـصـوت بـنـجـاح' },
          { type: 'divider' },
          { type: 'success', text: finalText },
          { type: 'divider' },
          { type: 'line', text: '▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]),
        edit: processingMsg.key,
        ...channelContext
      }, { quoted: m });

    } else {
      throw new Error('انتهى وقت الانتظار، لم يتم التعرف على الكلام بوضوح');
    }

  } catch (error) {
    console.error('Itachi Transcribe Error:', error);
    if (tempFilePath) await unlink(tempFilePath).catch(() => {});

    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '❌ خـطـأ فـي الـمـعـالـجـة' },
        { type: 'error', text: error.message || 'حدث خطأ غير متوقع أثناء تحويل الصوت' },
        { type: 'divider' },
        { type: 'info', label: '💡 الحل', value: 'تأكد من وضوح الصوت وحجمه' }
      ]),
      edit: processingMsg.key,
      ...channelContext
    }, { quoted: m });
  }
};

handler.help = ['نسخ', 'تحويل'];
handler.tags = ['tools'];
handler.command = /^(نسخ|تحويل|transcribe)$/i;

export default handler;
