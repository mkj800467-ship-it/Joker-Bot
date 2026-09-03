// plugins/revoke-link.js
// ✧ THE JOKER & ITACHI - تجديد رابط المجموعة 🔄

import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!isAdmin) return global.dfail('admin', m, conn);
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn);

  try {
    const groupId = m.chat;
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // تجديد رابط الدعوة
    const newInviteCode = await conn.groupRevokeInvite(groupId);
    const newLink = `https://chat.whatsapp.com/${newInviteCode}`;

    // الحصول على صورة المجموعة
    let groupImage;
    try {
      groupImage = await conn.profilePictureUrl(groupId, 'image');
    } catch (e) {
      groupImage = 'https://file.garden/aauvg01sjleV_ic1/2b676b830f863f489572f163466adb97.jpg';
    }

    // تجهيز الصورة للإرسال
    const media = await prepareWAMessageMedia(
      { image: { url: groupImage } },
      { upload: conn.waUploadToServer }
    );

    const teks = theme.build([
      { type: 'title', text: 'تـم تـجـديـد الـرابـط' },
      { type: 'divider' },
      { type: 'line', text: 'تم إنشاء رابط دعوة جديد للمجموعة بنجاح' },
      { type: 'info', label: 'رابط الدعوة', value: newLink },
      { type: 'divider' },
      { type: 'line', text: 'اضغط على الزر أدناه لنسخ الرابط مباشرة' }
    ]);

    // إنشاء الرسالة التفاعلية مع الزر ومعرف القناة
    const msg = generateWAMessageFromContent(groupId, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: { text: teks.trim() },
            footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚫 ✧' },
            header: {
              hasMediaAttachment: true,
              imageMessage: media.imageMessage,
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: '📋 نسخ الرابط',
                    copy_code: newLink
                  })
                }
              ],
              messageParamsJson: ""
            },
            contextInfo: {
              isForwarded: true,
              forwardingScore: 1,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363410276242111@newsletter',
                newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                serverMessageId: 970
              }
            }
          })
        }
      }
    }, { quoted: m });

    await conn.relayMessage(groupId, msg.message, { messageId: msg.key.id });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(theme.build([
      { type: 'title', text: 'خـطـأ في النظام' },
      { type: 'divider' },
      { type: 'error', text: 'حدث خطأ أثناء محاولة تجديد رابط المجموعة.' }
    ]));
  }
};

handler.help = ['تجديد_الرابط'];
handler.command = /^(تجديد|تحديث_الرابط|newlink)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

