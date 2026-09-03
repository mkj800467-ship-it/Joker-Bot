// plugins/couplepp.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — وحدة صور الكابلز والتطقيم السيبرانية 💑🔥

import fetch from "node-fetch";

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // جلب قاعدة بيانات الصور من GitHub
    let res = await fetch("https://raw.githubusercontent.com/KazukoGans/database/main/anime/ppcouple.json");
    let data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return conn.reply(
        m.chat,
        `👑 *[ وحدة الكابلز السيبرانية ]* 👑\n\n` +
        `❌ *خطأ:* لم يتم العثور على صور الكابلز في قاعدة البيانات الخارجية!\n\n` +
        `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
        m
      );
    }

    // اختيار زوج عشوائي من الصور (ولد + بنت)
    let cita = data[Math.floor(Math.random() * data.length)];

    // إرسال صورة الولد
    await conn.sendMessage(m.chat, {
      image: { url: cita.cowo },
      caption: `👑 *[ قسم صور الكابلز (الطرف الأول) ]* 👑\n\n` +
               `💑 *الحالة:* تم جلب التطقيم السيبراني بنجاح.\n\n` +
               `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
    }, { quoted: m });

    // إرسال صورة البنت
    await conn.sendMessage(m.chat, {
      image: { url: cita.cewe },
      caption: `👑 *[ قسم صور الكابلز (الطرف الثاني) ]* 👑\n\n` +
               `💑 *الحالة:* اكتمل ثنائي التطقيم السيبراني.\n\n` +
               `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error('[ITACHI-CouplePP Error]:', err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    conn.reply(
      m.chat,
      `👑 *ITACHI & JOKER: "خطأ في الاتصال"* 👑\n\n` +
      `⚠️ ${err.message || 'حدث خطأ أثناء تحميل صور الكابلز'}\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      m
    );
  }
};

handler.help = ['كابلز', 'كابيلز', 'تطقيم'];
handler.tags = ['images'];
handler.command = /^(كابلز|كابيلز|couplepp|تطقيم)$/i;

export default handler;
