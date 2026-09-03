// plugins/channel-info.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — وحدة فحص وجلب معلومات القنوات السيبرانية 📢🔥

import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `👑 *[ وحدة فحص القنوات السيبرانية ]* 👑\n\n` +
      `⚠️ *طريقة الاستخدام:* قم بكتابة الأمر بجانب رابط القناة.\n` +
      `📌 *مثال:* \`${usedPrefix + command} https://whatsapp.com/channel/xxxx\`\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      m
    );
  }

  if (!text.includes('whatsapp.com/channel/')) {
    return conn.reply(
      m.chat,
      `👑 *[ وحدة فحص القنوات السيبرانية ]* 👑\n\n` +
      `❌ *خطأ:* رابط القناة غير صحيح أو غير داعم لواتساب!\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      m
    );
  }

  let channelId = text.split('channel/')[1]?.split(/[/?]/)[0];
  if (!channelId) {
    return conn.reply(
      m.chat,
      `👑 *[ وحدة فحص القنوات السيبرانية ]* 👑\n\n` +
      `❌ تعذر استخراج معرف القناة من الرابط المرفق.\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      m
    );
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let res;
  try {
    res = await conn.newsletterMetadata('invite', channelId);
  } catch {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return conn.reply(
      m.chat,
      `👑 *[ وحدة فحص القنوات السيبرانية ]* 👑\n\n` +
      `⚠️ حدث خطأ أثناء الاتصال بقاعدة بيانات واتساب أو أن الرابط غير صالح.\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      m
    );
  }

  if (!res?.thread_metadata) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return conn.reply(
      m.chat,
      `👑 *[ وحدة فحص القنوات السيبرانية ]* 👑\n\n` +
      `❌ لم يتم العثور على بيانات تفصيلية لهذه القناة.\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      m
    );
  }

  const meta = res.thread_metadata;
  const name = meta.name?.text || 'غير معروف';
  const description = meta.description?.text || 'لا يوجد وصف متاح';
  const subscribers = meta.subscribers_count || 'غير متاح';
  const verification = meta.verification === 'VERIFIED' ? 'مُحققة ✅' : 'غير مُحققة ❌';

  const previewUrl = meta.preview?.direct_path
    ? `https://mmg.whatsapp.net${meta.preview.direct_path}`
    : null;

  let imgMsg = null;
  if (previewUrl) {
    try {
      imgMsg = await prepareWAMessageMedia(
        { image: { url: previewUrl } },
        { upload: conn.waUploadToServer }
      );
    } catch {}
  }

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: {
            text: `👑 *[ تقرير معلومات القناة السيبرانية ]* 👑\n\n` +
                  `📢 *الاسـم:* ${name}\n` +
                  `🆔 *الـمـعـرف:* ${res.id}\n` +
                  `👥 *الـمـشـتـركـيـن:* ${subscribers}\n` +
                  `✅ *حالة الـتـحـقـيـق:* ${verification}\n` +
                  `📝 *الـوصـف:* ${description}\n\n` +
                  `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
          },
          footer: { text: '▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' },
          header: imgMsg ? {
            hasMediaAttachment: true,
            imageMessage: imgMsg.imageMessage
          } : { hasMediaAttachment: false },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: '📋 نسخ معرف القناة السيبراني',
                  copy_code: res.id
                })
              }
            ],
            messageParamsJson: ''
          }
        })
      }
    }
  }, { userJid: conn.user.jid, quoted: m });

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['قناة', 'قناه', 'channel'];
handler.tags = ['tools'];
handler.command = /^(قناه|قناة|channel|قناتي)$/i;

export default handler;
