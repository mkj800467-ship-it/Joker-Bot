// plugins/scrape.js
// ✧ UCHIHA - Uchiha Itachi - أمر جلب كود المصدر بالشارينگان 🌐

import axios from 'axios';
import { theme } from '../core/theme.js';
import baileys from '@whiskeysockets/baileys';

const generateWAMessageFromContent = baileys.generateWAMessageFromContent || baileys.default?.generateWAMessageFromContent;
const proto = baileys.proto || baileys.default?.proto;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  };

  if (!text) {
    await react('❌');
    
    const warningText = theme.build([
      { type: 'title', text: '⛩️ إتاتشي: "بوابة فضح الأكواد والشارينگان"' },
      { type: 'subtitle', text: 'اكشف مصدر أي موقع إلكتروني' },
      { type: 'divider' },
      { type: 'info', label: '⚔️ الاستخدام', value: `${usedPrefix}${command} [رابط الموقع]` },
      { type: 'info', label: '📌 مثال', value: `${usedPrefix}${command} google.com` }
    ]);

    const interactiveMessage = {
      body: { text: warningText },
      footer: { text: '⛩️ Uchiha Itachi - Sharingan Source Scraper ⛩️' },
      nativeFlowMessage: {
        buttons: [{
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: '📢 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
            copy_code: '120363429074575231@newsletter'
          })
        }]
      }
    };

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
        }
      }
    }, { userJid: conn.user.jid, quoted: m });

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }

  let url = text.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  try { 
    new URL(url); 
  } catch {
    await react('❌');
    return m.reply('❌ إتاتشي: "هذا الرابط وهمي وغير صحيح، حاول مجدداً!"');
  }

  await react('⏳');
  await m.reply('⛩️ إتاتشي: "جاري اختراق أبعاد الموقع وجلب كود المصدر بالشارينگان..."');

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      maxRedirects: 5,
      validateStatus: (s) => s < 400,
    });

    const html = String(response.data);
    const sizeKB = (html.length / 1024).toFixed(1);

    let codeMessage = `⛩️ *إتاتشي: "تم الكشف بنجاح"*
🌐 *المصدر:* ${url}
📦 *الحجم:* ${sizeKB} KB

\`\`\`html\n${html.substring(0, 3800)}\`\`\``;

    if (html.length > 3800) {
      codeMessage += `\n\n⚠️ *الملف ضخم جداً، تم عرض أول 3800 حرف*\n📁 *الملف الكامل مرفق أدناه لعين الشارينگان*`;
    }

    // إرسال الكود المختصر في الشات مع معلومات القناة
    await conn.sendMessage(m.chat, {
      text: codeMessage,
      contextInfo: {
        forwardingScore: 200,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363429074575231@newsletter',
          newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
          serverMessageId: 1
        }
      }
    }, { quoted: m });

    // إرسال الملف الكامل كوثيقة نصية للملفات الكبيرة
    await conn.sendMessage(m.chat, {
      document: Buffer.from(html, 'utf-8'),
      mimetype: 'text/plain',
      fileName: `Itachi_Source_${Date.now()}.txt`,
      caption: theme.build([
        { type: 'title', text: '⛩️ إتاتشي: "الملف الكامل للموقع"' },
        { type: 'info', label: '🌐 الهدف', value: url },
        { type: 'info', label: '📦 الحجم', value: `${sizeKB} KB` }
      ]),
      contextInfo: {
        forwardingScore: 200,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363429074575231@newsletter',
          newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
          serverMessageId: 1
        }
      }
    }, { quoted: m });

    await react('⚡');

  } catch (e) {
    await react('❌');
    await m.reply(`❌ إتاتشي: "فشل استخراج الكود بسبب: ${e.message || 'خطأ غير معروف'}"`);
  }
};

handler.help = ['سكرب'];
handler.tags = ['tools'];
handler.command = /^(سكرب|scrape|موقع)$/i;

export default handler;
