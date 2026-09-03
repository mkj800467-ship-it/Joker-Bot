// plugins/anti-badword.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام منع الشتائم والألفاظ النابية السيبراني 🚫🔥

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
      antiBadword: false,
      badwordWarnings: {}
    };
  }

  let chat = global.db.data.chats[m.chat];

  if (!text) {
    const currentStatus = chat.antiBadword ? '🟢 مُفعل بنجاح' : '🔴 مُعطل حالياً';
    let statusText = `👑 *[ نظام حماية منع الشتائم والألفاظ - ITACHI & JOKER ]* 👑\n\n`;
    statusText += `🔮 *الحالة السيادية:* ${currentStatus}\n`;
    statusText += `⚠️ *نظام العقوبات:* مسح الرسالة الفوري + إنذار (3 تحذيرات ثم الطرد)\n\n`;
    statusText += `📌 *طريقة الاستخدام:*\n`;
    statusText += `• \`${usedPrefix}${command} تفعيل\` (لتشغيل درع الكلمات البذيئة)\n`;
    statusText += `• \`${usedPrefix}${command} تعطيل\` (لإيقاف الدرع)\n\n`;
    statusText += `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
    
    return conn.reply(m.chat, statusText, m, channelContext);
  }

  if (text.trim() === "تفعيل") {
    chat.antiBadword = true;
    return conn.reply(m.chat, `> ✅ *[ تم تفعيل درع منع الشتائم والألفاظ بنجاح ]*\n> 🛡️ الحلبة الآن مطهرة بالكامل من السباب والشتائم!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  if (text.trim() === "تعطيل") {
    chat.antiBadword = false;
    return conn.reply(m.chat, `> ❌ *[ تم تعطيل درع منع الشتائم ]*\n> 🔓 أصبحت الرقابة على الألفاظ معطلة الآن.\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "خطأ في المعاملة"* \n> 🔮 يجب استخدام الكود هكذا: \`${usedPrefix}${command} تفعيل\` أو \`تعطيل\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 نظام رصد وتطهير الشتائم التلقائي (Anti-Badword Engine)
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
      antiBadword: false,
      badwordWarnings: {}
    };
  }

  let chat = global.db.data.chats[m.chat];

  if (!chat.antiBadword) return;

  // استثناء المشرفين والمطورين من عقوبة الشتائم مع لفت انتباه ودي
  if (isAdmin || isOwner) {
    return;
  }

  // قائمة الكلمات المحظورة (بدون كلب، حمار، تفو)
  const badwords = [
    'كسم', 'كسمك', 'انيك', 'انيكك', 'انيكه', 'اهين عرضه', 'بزاز امك', 'كس', 'كسها', 'كسهم',
    'منيوك', 'قحبة', 'شراميط', 'شرموطة', 'عرص', 'خنيث', 'مخنث', 'منتاك', 'ينيك', 'الديوث',
    'يا ابن ال', 'ابن الكلاب', 'ابن الشرموطة', 'منيكة', 'عاهرة', 'بوس كسي'
  ];

  // فحص النص بطريقة ذكية تتجاوز المسافات والحروف المتكررة
  const cleanText = m.text.toLowerCase().replace(/[\s\-_]/g, '');
  const hasBadword = badwords.some(word => {
    const regex = new RegExp(word.replace(/[\s\-_]/g, ''), 'i');
    return regex.test(cleanText) || regex.test(m.text.toLowerCase());
  });

  if (hasBadword) {
    // التحقق مما إذا كان البوت مشرفاً ليتمكن من الحذف والطرد
    if (!isBotAdmin) {
      let noAdminNotice = `> ⚠️ *[ تنبيه سيبراني عاجل ]*\n> \n> 👤 تم رصد لفظ خارج أو شتيمة من قِبل: @${m.sender.split('@')[0]}\n> ❌ *المشكلة:* ليس لدي صلاحية "مشرف" لمسح الرسالة أو عقاب المخالف، يجعل البوت مشرفاً الآن!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
      return await conn.sendMessage(m.chat, {
        text: noAdminNotice,
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
    }

    if (!chat.badwordWarnings) chat.badwordWarnings = {};
    if (!chat.badwordWarnings[m.sender]) {
      chat.badwordWarnings[m.sender] = 0;
    }

    chat.badwordWarnings[m.sender]++;

    // 1. حذف رسالة الشتيمة المخالفة فوراً
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
      console.error('[ITACHI-ANTIBADWORD-DELETE-ERROR] فشل حذف رسالة الشتيمة:', err);
    }

    // 2. فحص ما إذا وصل العضو إلى 3 مخالفات شتائم ليتم طرده
    if (chat.badwordWarnings[m.sender] >= 3) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");
        delete chat.badwordWarnings[m.sender];

        let banText = `> 🚫 *[ تم طرد العضو بذيء اللسان بنجاح ]*\n> 👤 الضحية: @${m.sender.split('@')[0]}\n> 🔮 *السبب:* تكرار إرسال الشتائم والألفاظ النابية وتخطى حد التحذيرات (3/3)\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
        
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
        console.error('[ITACHI-ANTIBADWORD-BAN-ERROR] فشل طرد العضو:', err);
      }
    }

    // 3. إرسال تحذير فوري بمنشن مخفي ليراه الجميع
    const remainingWarnings = 3 - chat.badwordWarnings[m.sender];
    let warningText = `> ⚠️ *[ إنذار سيبراني: ألفاظ نابية غير مسموحة ]* ⚠️\n> \n> 👤 تم رصد شتيمة من قِبل: @${m.sender.split('@')[0]}\n> 🛑 *حالة الإنذار:* (${chat.badwordWarnings[m.sender]}/3)\n> ⏳ *التحذيرات المتبقية قبل الطرد:* ${remainingWarnings}\n> \n> *ملاحظة:* تم مسح رسالتك فوراً، احترم قوانين المجموعة لتجنب الطرد!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

    return await conn.sendMessage(m.chat, {
      text: warningText,
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
  }
};

handler.help = ['منع_الشتيام <تفعيل/تعطيل>'];
handler.tags = ['group', 'owner'];
handler.command = /^منع_الشتيام$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
