// plugins/welcome.js
// ✧ THE JOKER & ITACHI - الترحيب والمغادرة الذكي 👋

import { theme } from '../core/theme.js';

const defaultWelcomeImage = 'https://i.postimg.cc/x8s36pqP/bd9e1b09ff6df675e7150f1443dd21d7.jpg';
const goodbyeImage = 'https://i.postimg.cc/nLkZSqYm/ddc6dc460109876feff264ddfb94eac1.jpg';
const audioUrl = 'https://file.garden/aauvg01sjleV_ic1/%D8%AA%D8%B1%D8%AD%D9%8A%D8%A8.opus';

let handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.');

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  const chat = global.db.data.chats[m.chat];
  const type = (args[0] || '').toLowerCase();
  const enable = command === 'on';

  if (type !== 'welcome') {
    return m.reply(theme.build([
      { type: 'title', text: 'نـظـام الـتـرحـيـب' },
      { type: 'divider' },
      { type: 'info', label: 'للتفعيل', value: '.on welcome' },
      { type: 'info', label: 'للتعطيل', value: '.off welcome' }
    ]));
  }

  if (!(isAdmin || isOwner)) return m.reply('❌ هذا الأمر للمشرفين فقط.');

  chat.welcome = enable;
  return m.reply(`✅ *الترحيب* ${enable ? 'تم التفعيل' : 'تم التعطيل'} بنجاح.`);
};

handler.command = ['on', 'off'];
handler.group = true;
handler.register = true;

handler.before = async (m, { conn, isBotAdmin }) => {
  if (!m.isGroup) return;
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  const chat = global.db.data.chats[m.chat];

  if (!chat.welcome) return;
  if (![27, 28, 32].includes(m.messageStubType)) return;

  let groupMetadata, groupSize, groupDescription;
  try {
    groupMetadata = await conn.groupMetadata(m.chat);
    groupSize = groupMetadata.participants.length;
    groupDescription = groupMetadata.desc || "لا يوجد وصف متاح";
  } catch (e) {
    console.error('[Welcome] Error getting group metadata:', e.message);
    return;
  }

  // استخراج معرف المستخدم
  let rawParam = m.messageStubParameters?.[0] || '';
  let userId = '';
  let userName = 'عضو';
  let targetJid = '';

  try {
    if (rawParam.startsWith('{')) {
      const parsed = JSON.parse(rawParam);
      userId = parsed.id || '';
      if (parsed.phoneNumber) {
        targetJid = parsed.phoneNumber;
        userName = await conn.getName(targetJid);
      }
      if (!userName || userName.match(/^\d+$/)) {
        targetJid = userId;
        userName = await conn.getName(targetJid);
      }
      if (!userName || userName.match(/^\d+$/)) {
        userName = parsed.username || 'عضو';
      }
    } else {
      userId = rawParam;
      targetJid = userId;
      userName = await conn.getName(targetJid);
      if (!userName || userName.match(/^\d+$/)) userName = 'عضو';
    }
  } catch {
    userId = rawParam;
    targetJid = userId;
    try { userName = await conn.getName(targetJid); } catch {}
    if (!userName || userName.match(/^\d+$/)) userName = 'عضو';
  }

  if (!userId) userId = m.sender;
  if (!targetJid) targetJid = userId;

  const userMention = '@' + userId.split('@')[0];

  // جلب صورة العضو الشخصية أو استخدام الصورة الافتراضية إذا لمשجد صورة
  let userAvatar = defaultWelcomeImage;
  try {
    let pp = await conn.profilePictureUrl(targetJid, 'image');
    if (pp) userAvatar = pp;
  } catch {}

  // 1. ترحيب (GROUP_PARTICIPANT_ADD -> 27)
  if (m.messageStubType === 27) {
    const txtwelcome = theme.build([
      { type: 'title', text: 'تـرحـيـب بـعـضـو جـديـد' },
      { type: 'divider' },
      { type: 'line', text: 'أهلاً بك في مجموعتنا الجديدة!' },
      { type: 'info', label: 'العضو', value: userMention },
      { type: 'info', label: 'المجموعة', value: groupMetadata.subject },
      { type: 'info', label: 'عدد الأعضاء', value: `${groupSize} عضو` },
      { type: 'divider' },
      { type: 'line', text: `وصف المجموعة:\n${groupDescription.substring(0, 100)}` }
    ]);

    try {
      await conn.sendMessage(m.chat, {
        image: { url: userAvatar },
        caption: txtwelcome,
        mentions: [userId],
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363410276242111@newsletter',
            newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
            serverMessageId: 970
          }
        }
      });

      await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      });
    } catch (e) {
      console.error('[Welcome] Error sending welcome:', e.message);
    }
  }

  // 2. مغادرة أو طرد (28 أو 32)
  if (m.messageStubType === 28 || m.messageStubType === 32) {
    const txtBye = theme.build([
      { type: 'title', text: 'وداعـاً عـضـو عـزيـز' },
      { type: 'divider' },
      { type: 'line', text: 'لقد غادر العضو المجموعة.' },
      { type: 'info', label: 'العضو', value: userMention },
      { type: 'info', label: 'المجموعة', value: groupMetadata.subject },
      { type: 'info', label: 'عدد الأعضاء الحالي', value: `${groupSize} عضو` }
    ]);

    try {
      await conn.sendMessage(m.chat, {
        image: { url: goodbyeImage },
        caption: txtBye,
        mentions: [userId],
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363410276242111@newsletter',
            newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
            serverMessageId: 970
          }
        }
      });
    } catch (e) {
      console.error('[Welcome] Error sending goodbye:', e.message);
    }
  }
};

export default handler;
