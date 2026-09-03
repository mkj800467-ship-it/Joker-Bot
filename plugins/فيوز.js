// plugins/fuse.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — وحدة الاقتباسات وصانع الملصقات السيبرانية 🎨🔥

import axios from 'axios';

let handler = async (m, { conn, args, command, usedPrefix }) => {
  try {
    // إذا كان المستخدم كتب نصاً بجانب الأمر (يعمل كصانع ملصقات اقتباس)
    if (args.length > 0) {
      await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });
      
      await conn.reply(
        m.chat,
        `👑 *[ وحدة الملصقات السيبرانية ]* 👑\n\n` +
        `🎨 *الحالة:* جاري هندسة وصناعة الملصق السيبراني...\n\n` +
        `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
        m
      );

      let text = encodeURIComponent(args.join(" "));
      let name = encodeURIComponent(m.pushName || "User");
      
      // استخدام API PopCat الموثوق لصناعة صور الاقتباسات
      const api = `https://api.popcat.xyz/quote?text=${text}&author=${name}`;                 
      const { data } = await axios.get(api, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      // إرسال الصورة الناتجة كملصق سيبراني مباشر (Sticker)
      await conn.sendMessage(m.chat, {
        sticker: Buffer.from(data)
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return;
    }

    // إذا لم يكتب نصاً → يقوم بجلب اقتباس ملهم عشوائي من واجهة برمجة التطبيقات
    await conn.sendMessage(m.chat, { react: { text: '📖', key: m.key } });

    // API جديد ومستقر لجلب الاقتباسات العشوائية
    const apiUrl = 'https://quoteslate.vercel.app/api/quotes/random';
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    const quoteText = data.quote || 'لا يوجد نص للاقتباس';
    const quoteAuthor = data.author || 'مجهول';

    // تصميم الرسالة النصية بطابع إيتاشي والجوكر الفخم (بدون أي علامات اقتباس مزعجة >)
    const resultText = 
      `👑 *[ لوحة الاقتباسات السيبرانية ]* 👑\n\n` +
      `💬 *"${quoteText}"*\n\n` +
      `✍️ *المؤلف / الشخصية:* ${quoteAuthor}\n\n` +
      `📌 *لصناعة ملصق خاص بك اكتب:* \`${usedPrefix + command} [اكتب النص هنا]\`\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

    await conn.sendMessage(m.chat, { text: resultText }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error('[ITACHI-Fuse Error]:', err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    conn.reply(
      m.chat,
      `👑 *ITACHI & JOKER: "خطأ في النظام"* 👑\n\n` +
      `⚠️ فشل في تنفيذ العملية: ${err.message || 'حدث خطأ غير متوقع'}\n\n` +
      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      m
    );
  }
};

handler.help = ['فيوز <نص>'];
handler.tags = ['tools'];
handler.command = /^(فيوز|fuse)$/i;

export default handler;
