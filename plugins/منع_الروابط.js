// plugins/anti-link.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام منع الروابط والتحكم السيبراني 🔗🔥

let handler = async (m, { conn, text, isAdmin, isOwner, usedPrefix, command }) => {

  const channelContext = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      }
    }
  };

  if (!m.isGroup) {
    return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "تنبيه"* \n> 🔮 هذا الأمر يعمل حصرياً داخل المجموعات السيبرانية!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "صلاحيات سيادية"* \n> 🔮 هذا الأمر مخصص للمشرفين والمطورين فقط!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  if (!global.db || !global.db.data) {
    global.db = { data: { chats: {} } };
  }
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {
      antiLink: false,
      warnings: {}
    };
  }

  let chat = global.db.data.chats[m.chat];

  if (!text) {
    const currentStatus = chat.antiLink ? '🟢 مُفعل بنجاح' : '🔴 مُعطل حالياً';
    let statusText = `👑 *[ نظام حماية منع الروابط - ITACHI & JOKER ]* 👑\n\n`;
    statusText += `🔮 *الحالة السيادية:* ${currentStatus}\n`;
    statusText += `⚠️ *نظام العقوبات:* 3 تحذيرات ثم الطرد الفوري من المجموعة\n\n`;
    statusText += `📌 *طريقة الاستخدام:*\n`;
    statusText += `• \`${usedPrefix}${command} تفعيل\` (لتشغيل الدرع)\n`;
    statusText += `• \`${usedPrefix}${command} تعطيل\` (لإيقاف الدرع)\n\n`;
    statusText += `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
    
    return conn.reply(m.chat, statusText, m, channelContext);
  }

  if (text.trim() === "تفعيل") {
    chat.antiLink = true;
    return conn.reply(m.chat, `> ✅ *[ تم تفعيل درع منع الروابط بنجاح ]*\n> 🛡️ الروابط الآن محظورة تماماً على الأعضاء العاديين!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  if (text.trim() === "تعطيل") {
    chat.antiLink = false;
    return conn.reply(m.chat, `> ❌ *[ تم تعطيل درع منع الروابط ]*\n> 🔓 أصبحت الروابط متاحة للجميع الآن.\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "خطأ في المعاملة"* \n> 🔮 يجيب استخدام الكود هكذا: \`${usedPrefix}${command} تفعيل\` أو \`تعطيل\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 نظام الرصد والتطهير التلقائي (Anti-Link Engine)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
handler.before = async function (m, { conn, isBotAdmin, isAdmin, isOwner }) {
  if (!m.isGroup) return;
  if (!m.text) return;

  if (!global.db || !global.db.data) {
    global.db = { data: { chats: {} } };
  }
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {
      antiLink: false,
      warnings: {}
    };
  }

  let chat = global.db.data.chats[m.chat];

  if (!chat.antiLink) return;
  if (!isBotAdmin) return;

  // استثناء المشرفين والمطورين من نظام منع الروابط مع رسالة تنبيه فخمة
  if (isAdmin || isOwner) {
    const linkRegexCheck = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|telegram\.me|\.com|\.net|\.org)/i;
    if (linkRegexCheck.test(m.text)) {
      // إذا أرسل المشرف رابطاً، يقوم البوت بالرد عليه بلطف وإعلامه بأنه مستثنى لأنه مشرف
      const adminNotice = `> 👑 *ITACHI & JOKER: "حالة استثنائية"* \n> 👤 أهلاً بك يا بطل، الروابط ممنوعة تماماً هنا، لكن لأنك مشرف سيادي أو مطور، مُرحباً برابطك 🙂✔️\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
      await conn.sendMessage(m.chat, {
        text: adminNotice,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363429074575231@newsletter',
            newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
            serverMessageId: 970
          }
        }
      }, { quoted: m });
    }
    return;
  }

  // الكشف عن الروابط والـ Domains المختلفة
  const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|telegram\.me|\.com|\.net|\.org)/i;

  if (linkRegex.test(m.text)) {
    if (!chat.warnings) chat.warnings = {};
    if (!chat.warnings[m.sender]) {
      chat.warnings[m.sender] = 0;
    }

    chat.warnings[m.sender]++;

    // 1. حذف رسالة الرابط المخالفة فوراً
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender
        }
      });
    } catch (err) {
      console.error('[ITACHI-ANTILINK-DELETE-ERROR] فشل حذف رسالة الرابط:', err);
    }

    // 2. فحص ما إذا وصل العضو إلى 3 مخالفات ليتم طرده
    if (chat.warnings[m.sender] >= 3) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");
        delete chat.warnings[m.sender];

        let banText = `> 🚫 *[ تم طرد العضو المخالف بنجاح ]*\n> 👤 الضحية: @${m.sender.split('@')[0]}\n> 🔮 *السبب:* تكرار إرسال الروابط وتخطى حد التحذيرات (3/3)\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
        
        return await conn.sendMessage(m.chat, {
          text: banText,
          mentions: [m.sender],
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363429074575231@newsletter',
              newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
              serverMessageId: 970
            }
          }
        });
      } catch (err) {
        console.error('[ITACHI-ANTILINK-BAN-ERROR] فشل طرد العضو:', err);
        return await conn.sendMessage(m.chat, { text: '> 👑 *ITACHI & JOKER:* فشل طرد العضو، يجعل البوت مشرفاً بصلاحيات كاملة!' });
      }
    }

    // 3. إرسال تحذير فوري بمنشن مخفي ليراه الجميع (Invisible / Hidden Mention)
    const remainingWarnings = 3 - chat.warnings[m.sender];
    let warningText = `> ⚠️ *[ تحذير سيبراني صارم ]* ⚠️\n> \n> 👤 تم رصد رابط مخالف من قِبل: @${m.sender.split('@')[0]}\n> 🛑 *حالة الإنذار:* (${chat.warnings[m.sender]}/3)\n> ⏳ *التحذيرات المتبقية قبل الطرد:* ${remainingWarnings}\n> \n> *ملاحظة:* الروابط ممنوعة تماماً في هذه المجموعة، احذر التكرار!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

    return await conn.sendMessage(m.chat, {
      text: warningText,
      mentions: [m.sender], // منشن العضو المخالف ليعلم الجميع من هو
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363429074575231@newsletter',
          newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
          serverMessageId: 970
        }
      }
    });
  }
};

handler.help = ['منع_الروابط <تفعيل/تعطيل>'];
handler.tags = ['group', 'owner'];
handler.command = /^منع_الروابط$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
