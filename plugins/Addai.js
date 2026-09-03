// plugins/joinGroup.js
// ✧ THE JOKER & ITACHI - Join Group via Link or JID 🃏

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`⚠️ يرجى إرسال رابط المجموعة أو الآي دي (JID) بعد الأمر!\n\n📌 أمثلة:\n*${usedPrefix + command}* https://chat.whatsapp.com/ExAmPlEcOdE\n*${usedPrefix + command}* 120363012345678945@g.us`);
    }

    let groupJid = text.trim();

    // تفاعل بإيموجي الانتظار
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // التحقق مما إذا كان المدخل رابط واتساب أو JID مباشر
    if (groupJid.includes('chat.whatsapp.com')) {
      let [_, code] = groupJid.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i) || [];
      if (!code) {
        return m.reply("❌ رابط المجموعة غير صحيح!");
      }
      // الانضمام عبر رابط الدعوة
      groupJid = await conn.groupAcceptInvite(code);
    } else if (!groupJid.endsWith('@g.us')) {
      // إذا أدخل الرقم فقط بدون @g.us
      groupJid = `${groupJid}@g.us`;
    }

    // تفاعل بإيموجي النجاح
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    // إعلام المستخدم بالنجاح في الشات الخاص أو الحالي
    await m.reply("⚡ تم الانضمام إلى المجموعة بنجاح وإرسال رسالة الترحيب!");

    // نص رسالة الترحيب الفخمة داخل المجموعة الجديدة
    let welcomeMessage = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 & 𝓘𝓣𝓐𝓒𝓗𝓘 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖

👑 **أهـلاً وسـهـلاً بـكـم فـي عـالـم الـجـوكـر وإيـتـاشـي!** 👑

🔥 **تـمـت إضـافـتـي بـواصـطـة الـمـطـور إيـتـاشـي** ✨
⚡ وجـايـب مـعـايـا شـويـة حـاجـات جـامـدة جـداً راح تـعـجـبـكـم! 🃏🔥

🎯 *لـرؤيـة قـائـمـة الأوامـر أرسـل:*
📌 `.الاوامر` أو `.قائمة`

❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
      ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;

    // إرسال رسالة الترحيب للمجموعة
    await conn.sendMessage(groupJid, { text: welcomeMessage });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`❌ حدث خطأ أثناء تنفيذ الأمر!\nتأكد من صحة الرابط أو الآي دي، وأن البوت يملك صلاحية الدخول.`);
  }
};

// الأوامر المتاحة
handler.command = /^(ادخل|خش|هنا)$/i;

export default handler;
