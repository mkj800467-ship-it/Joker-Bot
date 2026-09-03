const handler = async (m, { conn, participants, usedPrefix, command }) => {
  let kickte = `*✳️ الاستخدام الصحيح للأمر*\n*${usedPrefix + command}*`;

  if (!m.isGroup || !m.sender) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

  let groupMetadata = await conn.groupMetadata(m.chat);
  let owner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

  let botDevelopers = ['201002435496@s.whatsapp.net'];
  const CHANNEL_LINK = 'https://whatsapp.com/channel/0029Vb8We2VKrWR2Z9E5KQ1P';
  const CHANNEL_NAME = '⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽';

  // إرسال رابط القناة قبل الطرد
  await conn.sendMessage(m.chat, {
    text: `╔═══「 ⚠️ *تنبيه* ⚠️ 」═══╗
│
│ 🜲⃝☠️ *سيتم طرد جميع الأعضاء* ☠️⃝🜲
│ 👁️⃝🩸 ما عدا المطورين
│
│ 📢 *لمعرفة كل جديد تابع قناتنا:*
│ ${CHANNEL_LINK}
│
│ 💡 *رابط القناة:*
│ ${CHANNEL_NAME}
│
╚════════════════════╝`,
    mentions: [owner, ...botDevelopers]
  });

  // انتظار ثانيتين قبل الطرد (عشان الناس تقرأ الرسالة)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // تصفية الأعضاء الذين سيتم طردهم، مع استثناء المالك والمطورين
  let participantsToKick = participants.filter(participant => 
    participant.id !== owner &&
    participant.id !== conn.user.jid &&
    !botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  // طرد جميع الأعضاء دفعة واحدة
  if (participantsToKick.length > 0) {
    await conn.groupParticipantsUpdate(m.chat, participantsToKick, 'remove');
  }

  await conn.sendMessage(m.chat, {
    text: `✅ *تم طرد ${participantsToKick.length} عضو بنجاح!*\n\n📢 قناتنا: ${CHANNEL_LINK}\n⚡ ${global.botName || '⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽ v2'}`
  });
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = ['هاك', 'هش'];
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;