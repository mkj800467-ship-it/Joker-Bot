// plugins/fun-stats.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - أوامر التسلية المتقدمة 🎭

let handler = async (m, { conn, command, text, usedPrefix }) => {
  const rand = (max) => Math.floor(Math.random() * (max + 1));

  // مصفوفة المطورين المعتمدة (تتضمن الأرقام العادية و الـ LID)
  const allowedOwners = [
    '249916221538@s.whatsapp.net',
    '14904274759837@lid'
  ];

  // دالة لفحص ما إذا كان الـ JID أو الـ Sender يخص المطور
  const isDeveloper = (jid, sender) => {
    if (!jid && !sender) return false;
    return allowedOwners.includes(jid) || allowedOwners.includes(sender) || allowedOwners.some(owner => (jid && jid.includes(owner.split('@')[0])) || (sender && sender.includes(owner.split('@')[0])));
  };

  const senderJid = typeof conn.convertLidToRealJid === 'function' 
    ? await conn.convertLidToRealJid(m.sender, m.chat).catch(() => m.sender) 
    : m.sender;
    
  const isSenderDev = isDeveloper(senderJid, m.sender);

  let targetName = '';
  let targetJid = '';
  let isTargetDev = false;

  // حالة 1: منشن
  if (m.mentionedJid && m.mentionedJid[0]) {
    targetJid = typeof conn.convertLidToRealJid === 'function' 
      ? await conn.convertLidToRealJid(m.mentionedJid[0], m.chat).catch(() => m.mentionedJid[0]) 
      : m.mentionedJid[0];
      
    isTargetDev = isDeveloper(targetJid, m.mentionedJid[0]);
    try {
      targetName = await conn.getName(targetJid);
    } catch {
      targetName = targetJid.split('@')[0];
    }
  } 
  // حالة 2: رد على رسالة
  else if (m.quoted && m.quoted.sender) {
    targetJid = typeof conn.convertLidToRealJid === 'function' 
      ? await conn.convertLidToRealJid(m.quoted.sender, m.chat).catch(() => m.quoted.sender) 
      : m.quoted.sender;
      
    isTargetDev = isDeveloper(targetJid, m.quoted.sender);
    try {
      targetName = await conn.getName(targetJid);
    } catch {
      targetName = targetJid.split('@')[0];
    }
  }
  // حالة 3: كتابة اسم/رقم مباشر
  else if (text && text.trim()) {
    const input = text.trim();
    if (/^\d+$/.test(input)) {
      targetJid = input + '@s.whatsapp.net';
      isTargetDev = isDeveloper(targetJid, '');
      try { targetName = await conn.getName(targetJid); } catch { targetName = input; }
    } else {
      targetName = input;
      // محاولة البحث عن العضو بالاسم داخل الجروب إذا وجد
      if (m.isGroup) {
        let chatMetadata = await conn.groupMetadata(m.chat).catch(() => null);
        if (chatMetadata && chatMetadata.participants) {
          let found = chatMetadata.participants.find(p => p.id.split('@')[0] === input || (p.name && p.name.toLowerCase().includes(input.toLowerCase())));
          if (found) targetJid = found.id;
        }
      }
    }
  }
  // حالة 4: لا يوجد هدف (المرسل هو المستهدف شخصياً)
  else {
    targetJid = senderJid;
    isTargetDev = isSenderDev;
    try {
      targetName = await conn.getName(senderJid);
    } catch {
      targetName = 'أنت';
    }
  }

  if (!targetName) targetName = 'المستخدم';
  if (!targetJid) targetJid = m.sender;

  const randomPercent = rand(100);
  let reply = '';
  let emoji = '';

  // إعدادات القناة والمعاينة (External Ad Reply & Newsletter) الرابط الجديد المحدث
  const channelContext = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      mentionedJid: [targetJid], // تفعيل المنشن الحقيقي داخل الرسالة
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      },
      externalAdReply: {
        title: '⚜️ JK & ITACHI - SYSTEM STATS',
        body: 'اضغط للانضمام لقناة البوت الرسمية',
        thumbnailUrl: 'https://i.postimg.cc/kgRcfMv8/3a89b16821a26b79273c9c6d8aeaf14e.jpg',
        sourceUrl: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  };

  // معالجة خاصة بالذكاء للمطور
  if (command === 'ذكاء' && (isTargetDev || (!m.mentionedJid?.[0] && !m.quoted?.sender && isSenderDev))) {
    emoji = '🧠';
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    const devName = isTargetDev ? targetName : 'سيدي ومطوري';
    let devReply = `> ⚡ *JK: "نسبة الذكاء"*\n>\n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ♾️ (لا نهائية)\n> 💬 لم استطع كتابة نسبه ذكائه لانها هائله وعابرة للحدود الكونيه ☠️✨`;
    return await conn.sendMessage(m.chat, { text: devReply, ...channelContext }, { quoted: m });
  }

  // معالجة خاصة بالغباء للمطور
  if (command === 'غباء' && (isTargetDev || (!m.mentionedJid?.[0] && !m.quoted?.sender && isSenderDev))) {
    emoji = '🧠';
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    const devName = isTargetDev ? targetName : 'سيدي';
    let devReply = `> ⚡ *JK: "نسبة الغباء"*\n>\n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* 0%\n> 💬 يا سيدي أنت لا تملك نسبة غباء لأنك الأذكى على الإطلاق ☠️👑`;
    return await conn.sendMessage(m.chat, { text: devReply, ...channelContext }, { quoted: m });
  }

  // معالجة باقي الأوامر للمطور
  if (isTargetDev && (m.mentionedJid?.[0] || m.quoted?.sender)) {
    let devSpecialReply = '';
    if (command === 'ورع') {
      emoji = '👑';
      devSpecialReply = `> ⚡ *JK: "نسبة الورع"*\n>\n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* 0%\n> 💬 هذا الشخص فخم جداً ولا يملك أي نسبة ورع، إنه القائد الأعلى 😎⚔️`;
    } else if (command === 'اهبل') {
      emoji = '🧠';
      devSpecialReply = `> ⚡ *JK: "نسبة الهبل"*\n>\n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* 0%\n> 💬 عقلاني تماماً، مستحيل أن تجد ذرة هبل لدى هذا العبقري 🧠✨`;
    } else if (command === 'خروف') {
      emoji = '🛡️';
      devSpecialReply = `> ⚡ *JK: "نسبة الخرفنة"*\n>\n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* 0%\n> 💬 هيبته تمنع عنه هذه الصفات تماماً، عالي المقام أسطورة البوت ⚡`;
    } else if (command === 'زنجي') {
      emoji = '⚜️';
      devSpecialReply = `> ⚡ *JK: "التصنيف"*\n>\n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 💬 هذا مطوري الأسطوري، مقامه أرفع وأعلى من هذه التصنيفات تماماً 🖤🔥`;
    } else if (command === 'غباء') {
      emoji = '🧠';
      devSpecialReply = `> ⚡ *JK: "نسبة الغباء"*\n>\n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* 0%\n> 💬 هذا الشخص لا يملك أي نسبة غباء لأنه ذكي جداً 🙂😂`;
    }

    if (devSpecialReply) {
      await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
      return await conn.sendMessage(m.chat, { text: devSpecialReply, ...channelContext }, { quoted: m });
    }
  }

  // التبديل العادي لباقي الحالات والأشخاص مع المنشن الحقيقي المضمن (@)
  switch (command) {
    case 'ورع':
      emoji = '🧒';
      reply = `> ⚡ *JK: "نسبة الورع"*\n> \n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ${randomPercent}%\n> 💬 ${randomPercent > 70 ? 'يا سلام ورع بمعنى الكلمة 😂' : 'لسه صغير واعد 🧒'}`;
      break;

    case 'اهبل':
      emoji = '🤪';
      reply = `> ⚡ *JK: "نسبة الهبل"*\n> \n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ${randomPercent}%\n> 💬 ${randomPercent > 70 ? 'اهبل بطل خلي بالك منه 😂' : 'لسه شاطر وواعي 🧠'}`;
      break;

    case 'خروف':
      emoji = '🐑';
      reply = `> ⚡ *JK: "نسبة الخرفنة"*\n> \n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ${randomPercent}%\n> 💬 ${randomPercent > 70 ? 'خروف والله يابو حمل 🐑' : 'لسه مش خروف كفاية 😅'}`;
      break;

    case 'جميل':
      emoji = '😍';
      reply = `> ⚡ *JK: "نسبة الجمال"*\n> \n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ${randomPercent}%\n> 💬 ${randomPercent > 70 ? 'فديت القمر 🌙' : 'جمالك جايب آخره ✨'}`;
      break;

    case 'ذكا':
      emoji = '🧠';
      reply = `> ⚡ *JK: "نسبة الذكاء"*\n> \n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ${randomPercent}%\n> 💬 ${randomPercent > 70 ? 'عبقري بمعنى الكلمة 🧠' : 'ذكائك في ازدياد 📈'}`;
      break;

    case 'غباء':
      emoji = '🤦';
      reply = `> ⚡ *JK: "نسبة الغباء"*\n> \n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ${randomPercent}%\n> 💬 ${randomPercent > 70 ? 'غبي بطل خلي بالك 🤦' : 'لسه فيه أمل 🤞'}`;
      break;

    case 'زنجي':
      emoji = '🖤';
      reply = `> ⚡ *JK: "نسبة السمار"*\n> \n> 👤 *الشخص:* @${targetJid.split('@')[0]}\n> 📊 *النسبة:* ${randomPercent}%\n> 💬 ${randomPercent > 70 ? 'ملك الفخامة والسمار الأنيق 🖤🔥' : 'ملامح هادئة وجميلة ✨'}`;
      break;

    default:
      reply = `> ⚡ *JK: "خطأ"*\n> \n> 🔮 الأمر ${command} غير معروف`;
  }

  await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  return await conn.sendMessage(m.chat, { text: reply, ...channelContext }, { quoted: m });
};

handler.help = ['ورع', 'اهبل', 'خروف', 'جميل', 'ذكا', 'غباء', 'زنجي'];
handler.tags = ['entertainment'];
handler.command = /^(ورع|اهبل|خروف|جميل|ذكاء|غباء|زنجي)$/i;

export default handler;
