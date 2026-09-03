// plugins/screenshot.js
// ✧ UCHIHA - Uchiha Itachi - أمر التقاط الشاشة بالشارينگان 📸

import fetch from 'node-fetch';
import { theme } from '../core/theme.js';
import baileys from '@whiskeysockets/baileys';

const generateWAMessageFromContent = baileys.generateWAMessageFromContent || baileys.default?.generateWAMessageFromContent;
const proto = baileys.proto || baileys.default?.proto;

const SCREENSHOT_APIS = [
  // 1. Microlink API
  (url) => `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`,
  // 2. Pikwy API
  (url) => `https://api.pikwy.com/v1/screenshot?t=1&w=1280&h=800&u=${encodeURIComponent(url)}`,
  // 3. PagePeeker API
  (url) => `https://free.pagepeeker.com/v2/thumbs.php?size=x&url=${encodeURIComponent(url)}`,
  // 4. Thum.io
  (url) => `https://image.thum.io/get/width/1280/crop/800/maxAge/1/${url.replace(/^https?:\/\//, '')}`,
  // 5. Render-Tron API
  (url) => `https://render-tron.appspot.com/screenshot/${encodeURIComponent(url)}`
];

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await m.react('✍️');
    
    const warningText = theme.build([
      { type: 'title', text: '⛩️ إتاتشي: "وحدة التجسس والشارينگان"' },
      { type: 'subtitle', text: 'التقاط لقطة شاشة لأي موقع في الأبعاد الرقمية' },
      { type: 'divider' },
      { type: 'info', label: '⚔️ الاستخدام', value: `${usedPrefix + command} رابط_الموقع` },
      { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} google.com` }
    ]);

    const interactiveMessage = {
      body: { text: warningText },
      footer: { text: '⛩️ Uchiha Itachi - Sharingan Screenshot ⛩️' },
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
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  await m.react('⏳');
  let success = false;

  for (let i = 0; i < SCREENSHOT_APIS.length; i++) {
    const screenshotUrl = SCREENSHOT_APIS[i](url);
    try {
      const res = await fetch(screenshotUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (res.ok) {
        const buffer = await res.buffer();
        if (buffer.length > 1000) {
          const captionText = theme.build([
            { type: 'title', text: '⛩️ إتاتشي: "تم كشف الحقيقة والتقاط الشاشة"' },
            { type: 'info', label: '🌐 البعد المستهدف', value: url },
            { type: 'info', label: '⚙️ بصيرة السيرفر', value: `Method #${i + 1}` }
          ]);

          const interactiveMessage = {
            body: { text: captionText },
            footer: { text: '⛩️ Uchiha Itachi - Sharingan Screenshot ⛩️' },
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
                imageMessage: {
                  url: null,
                  mimetype: 'image/jpeg',
                  jpegThumbnail: null,
                  fileLength: buffer.length,
                  caption: captionText
                },
                interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
              }
            }
          }, { userJid: conn.user.jid, quoted: m });

          // الطريقة البديلة السلسة لإرسال الصورة مع الكابشن وزر القناة عبر الـ relayMessage أو الـ sendMessage المعتادة
          await conn.sendMessage(m.chat, {
            image: buffer,
            caption: captionText,
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

          success = true;
          await m.react('✅');
          break;
        }
      }
    } catch (e) {
      continue;
    }
  }

  // خطة الطوارئ في حال فشل جميع البوابات
  if (!success) {
    try {
      const backupUrl = `https://api.screenshotmachine.com/?key=100346&url=${encodeURIComponent(url)}&device=desktop&dimension=1024x768&format=jpg`;
      const res = await fetch(backupUrl);
      if (res.ok) {
        const buffer = await res.buffer();
        await conn.sendMessage(m.chat, {
          image: buffer,
          caption: `⛩️ إتاتشي: "تم الالتقاط عبر بوابات الطوارئ للشارينگان"\n🌐 ${url}`,
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
        await m.react('✅');
        success = true;
      }
    } catch (e) {}
  }

  if (!success) {
    await m.react('❌');
    
    const failText = theme.build([
      { type: 'title', text: '❄️ إتاتشي: "فشل التسلل الرقمي"' },
      { type: 'warning', text: 'جميع السيرفرات والأبعاد لا تستجيب حالياً أو أن هذا الموقع محصن ضد الشارينگان.' }
    ]);

    const interactiveMessage = {
      body: { text: failText },
      footer: { text: '⛩️ Uchiha Itachi - Sharingan Screenshot ⛩️' },
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

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }
};

handler.help = ['سكرين'];
handler.tags = ['tools'];
handler.command = /^(سكرين|screen|screenshot)$/i;

export default handler;
