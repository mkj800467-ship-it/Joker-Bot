// plugins/detect.js
// ✧ THE JOKER & ITACHI - كشف تغييرات المجموعة 🔍

import { WAMessageStubType } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';

export async function before(m, { conn }) {
  if (!m.isGroup || !m.messageStubType) return;
  let chat = global.db.data.chats[m.chat];
  if (!chat?.detect) return;

  const senderJid = m.sender;
  const pushName = m.pushName || 'User';

  let senderName = pushName;
  try {
    let name = await conn.getName(senderJid);
    if (name && !name.match(/^\d+$/)) senderName = name;
  } catch {}

  let targetName = '';
  let targetId = '';
  let rawParam = m.messageStubParameters?.[0] || '';

  if (rawParam) {
    try {
      if (rawParam.startsWith('{')) {
        let parsed = JSON.parse(rawParam);
        targetId = parsed.id || '';
        let username = parsed.username || '';
        let phoneJid = parsed.phoneNumber || '';

        if (username && !username.match(/^\d+$/)) {
          targetName = username;
        } else if (phoneJid) {
          targetName = await conn.getName(phoneJid);
        } else if (targetId) {
          targetName = await conn.getName(targetId);
        }
      } else {
        targetId = rawParam;
        targetName = await conn.getName(rawParam);
      }
    } catch {}
  }

  if (!targetName || targetName.match(/^\d+$/)) targetName = 'عضو';

  let senderMention = senderJid.split('@')[0];
  let targetMention = targetId ? targetId.split('@')[0] : '';

  const fk = {
    key: {
      participant: senderJid,
      remoteJid: 'status@broadcast'
    },
    message: {
      contactMessage: {
        displayName: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚫 ✧',
        vcard: `BEGIN:VCARD
VERSION:3.0
FN:${pushName}
END:VCARD`
      }
    }
  };

  // رسائل التنبيهات مع تفعيل نظام الـ theme الملكي ومعرف القناة الموحد
  let nombre = theme.build([
    { type: 'title', text: 'تـغـيـر اسـم الـمـجـمـوعـة' },
    { type: 'divider' },
    { type: 'info', label: 'بواسطة', value: '@' + senderMention },
    { type: 'info', label: 'الاسم الجديد', value: rawParam || '-' }
  ]);

  let foto = theme.build([
    { type: 'title', text: 'تـغـيـر صـورة الـمـجـمـوعـة' },
    { type: 'divider' },
    { type: 'info', label: 'بواسطة', value: '@' + senderMention }
  ]);

  let edit = theme.build([
    { type: 'title', text: 'تـغـيـر إعـدادات الـمـجـمـوعـة' },
    { type: 'divider' },
    { type: 'info', label: 'بواسطة', value: '@' + senderMention }
  ]);

  let status = theme.build([
    { type: 'title', text: 'تـغـيـر وضـع الـمـجـمـوعـة' },
    { type: 'divider' },
    { type: 'info', label: 'بواسطة', value: '@' + senderMention }
  ]);

  let admingp = theme.build([
    { type: 'title', text: 'تـم الـتـرقـيـة لـمشرف' },
    { type: 'divider' },
    { type: 'info', label: 'العضو', value: '@' + targetMention },
    { type: 'line', text: 'أصبح مشرفاً في المجموعة بنجاح' }
  ]);

  let noadmingp = theme.build([
    { type: 'title', text: 'تـم الإعـفـاء مـن الإدارة' },
    { type: 'divider' },
    { type: 'info', label: 'العضو', value: '@' + targetMention },
    { type: 'line', text: 'تم إعفاء العضو من إدارة المجموعة' }
  ]);

  let addMember = theme.build([
    { type: 'title', text: 'عـضـو جـديـد' },
    { type: 'divider' },
    { type: 'info', label: 'العضو', value: '@' + targetMention },
    { type: 'line', text: 'انضم إلى المجموعة' }
  ]);

  let removeMember = theme.build([
    { type: 'title', text: 'طـرد عـضـو' },
    { type: 'divider' },
    { type: 'info', label: 'العضو', value: '@' + targetMention },
    { type: 'line', text: 'تم طرد العضو أو مغادرته للمجموعة' }
  ]);

  let text = null;
  let mentions = [senderJid];

  switch (m.messageStubType) {
    case WAMessageStubType.GROUP_CHANGE_SUBJECT:
      text = nombre;
      break;
    case WAMessageStubType.GROUP_CHANGE_ICON:
      text = foto;
      break;
    case WAMessageStubType.GROUP_CHANGE_SETTINGS:
      text = edit;
      break;
    case WAMessageStubType.GROUP_CHANGE_ANNOUNCE:
      text = status;
      break;
    case WAMessageStubType.GROUP_PARTICIPANT_PROMOTE:
      text = admingp;
      if (targetId) mentions.push(targetId);
      break;
    case WAMessageStubType.GROUP_PARTICIPANT_DEMOTE:
      text = noadmingp;
      if (targetId) mentions.push(targetId);
      break;
    case WAMessageStubType.GROUP_PARTICIPANT_ADD:
      text = addMember;
      if (targetId) mentions.push(targetId);
      break;
    case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
    case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
      text = removeMember;
      if (targetId) mentions.push(targetId);
      break;
    default:
      return;
  }

  await conn.sendMessage(m.chat, { 
    text, 
    mentions,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363410276242111@newsletter',
        newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
        serverMessageId: 970
      }
    }
  }, { quoted: fk });
}

