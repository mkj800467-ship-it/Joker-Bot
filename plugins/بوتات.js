// plugins/bots.js
// ✧ THE JOKER & ITACHI - نظام إدارة السب بوتات الشامل للمطور 🤖⚔️

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import ws from 'ws';

const YORU_IMAGE = 'https://file.garden/aauvg01sjleV_ic1/nier%20automata%20by%20GoddessMechanic.jpg';

// دالة حساب الوقت المنقضي
function convertirMs(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  return [d ? `${d}d` : '', `${h}h`, `${m}m`, `${s}s`].filter(Boolean).join(' ');
}

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  // 🛡️ التحقق من أن المستخدم هو المطور حصرياً
  const ownerNumber = '249916221538'; // رقمك المعتمد
  const senderNumber = m.sender.replace(/[^0-9]/g, '');
  if (!isOwner && senderNumber !== ownerNumber) {
    return m.reply('❌ *عذراً يا محارب:* هذا الأمر مخصص للمطور الأسطوري (إيتاشي) فقط! ⚡');
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const carpetaBase = path.resolve(__dirname, '..', 'MB-2BSubBot');

  let conns = Array.isArray(global.conns) ? global.conns : [];
  let activeBots = conns.filter(c => c?.user && c?.ws?.socket && c.ws.socket.readyState !== ws.CLOSED);

  // 1️⃣ أمر عرض قائمة البوتات الفرعية (.بوتات أو .سب_بوتات)
  if (/^(قائمة_البوتات|البوتات|بوتات|bots|سب_بوتات)$/i.test(command)) {
    let cantidadCarpetas = 0;
    try {
      cantidadCarpetas = fs.readdirSync(carpetaBase, { withFileTypes: true }).filter(dir => dir.isDirectory()).length;
    } catch {}

    const uptime = convertirMs(process.uptime() * 1000);

    const message = activeBots.map((v, index) => {
      const jid = v.user.jid.replace(/[^0-9]/g, '');
      return `*${index + 1}.* 🤖 *الاسم:* ${v.user.name || 'مجهول'}\n   📌 *الرقم:* wa.me/${jid}\n   ⏱️ *التشغيل:* \`\`\`${v.uptime ? convertirMs(Date.now() - v.uptime) : 'نشط'}\`\`\``;
    }).join('\n\n');

    const replyMessage = message.length ? message : '❌ لا يوجد سب بوت متصل حالياً.';

    const responseText = `جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃

📊 *إحصائيات السب بوتات:*
• المتصلة حالياً: \`${activeBots.length}\`
• الجلسات بالمجلد: \`${cantidadCarpetas}\`
• وقت السيرفر: \`${uptime}\`

───────────────────
${replyMessage}

───────────────────
بواسطة: 𝚰𝚻𝚫𝐂𝚮𝚰 𝚫𝚲𝚱𝚮𝚫𝚰`;

    try {
      await conn.sendMessage(m.chat, { image: { url: YORU_IMAGE }, caption: responseText }, { quoted: m });
    } catch {
      await conn.sendMessage(m.chat, { text: responseText }, { quoted: m });
    }
  }

  // 2️⃣ أمر إيقاف بوت فرعي محدد (.ايقاف_بوت <الرقم>)
  else if (/^ايقاف_بوت|إيقاف_بوت/i.test(command)) {
    if (!activeBots.length) return m.reply('❌ لا توجد أي سب بوتات متصلة لإيقافها.');
    
    const botIndex = parseInt(text) - 1;
    if (isNaN(botIndex) || !activeBots[botIndex]) {
      let list = activeBots.map((v, i) => `*${i + 1}.* ${v.user.name || 'بوت'} (${v.user.jid.split('@')[0]})`).join('\n');
      return m.reply(`⚠️ *الرجاء تحديد رقم البوت المراد إيقافه من القائمة أدناه:*\n\n${list}\n\n💡 *مثال:* \`${usedPrefix}ايقاف_بوت 1\``);
    }

    const targetBot = activeBots[botIndex];
    const targetJid = targetBot.user.jid;

    try {
      // إغلاق الاتصال وحذف الجلسة إن وجدت
      targetBot.ws.close();
      global.conns = global.conns.filter(c => c.user.jid !== targetJid);
      
      // محاولة مسح مجلد الجلسة المرتبط به إن وجد
      const sessionPath = path.join(carpetaBase, targetJid.split('@')[0]);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      }

      await m.reply(`✅ *تم إيقاف وحذف السب بوت بنجاح:* \n🤖 ${targetBot.user.name || targetJid}`);
    } catch (e) {
      await m.reply(`❌ حدث خطأ أثناء إيقاف البوت: ${e.message}`);
    }
  }

  // 3️⃣ أمر الإذاعة الفرعية الشاملة (.اذاعة_فرعي أو .زيع_فرعي)
  else if (/^اذاعة_فرعي|زيع_فرعي/i.test(command)) {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    const textMsg = text || q.text;

    if (!textMsg && !mime) {
      return m.reply(`⚠️ *الرجاء كتابة النص المراد إذاعته أو الرد على رسالة (صورة، فيديو، نص) لإرسالها عبر جميع السب بوتات!*`);
    }

    if (!activeBots.length) {
      return m.reply('❌ لا توجد أي سب بوتات متصلة حالياً لتنفيذ الإذاعة.');
    }

    await m.reply('⚡ *جاري بدء الإذاعة عبر جميع السب بوتات المتصلة... انتظر قليلاً ⏳*');

    let report = `❖ ── ✦ ── [ تقرير الإذاعة الفرعية ] ── ✦ ── ❖\n\n`;
    let totalGroupsAll = 0;

    for (let i = 0; i < activeBots.length; i++) {
      const subBot = activeBots[i];
      const botName = subBot.user.name || `Bot ${i + 1}`;
      let successCount = 0;

      try {
        // جلب المجموعات الخاصة بهذا السب بوت
        let chats = Object.keys(subBot.chats || {}).filter(jid => jid.endsWith('@g.us'));
        
        // إذا لم يتم تسجيل المجموعات في الذاكرة المؤقتة للاتصال، نحاول جلبها عبر store إن وجد
        if (!chats.length && subBot.store?.chats) {
          chats = Object.keys(subBot.store.chats).filter(jid => jid.endsWith('@g.us'));
        }

        for (let jid of chats) {
          try {
            if (mime) {
              let mediaBuffer = await q.download();
              await subBot.sendMessage(jid, { 
                [mime.split('/')[0]]: mediaBuffer, 
                caption: textMsg || '' 
              });
            } else {
              await subBot.sendMessage(jid, { text: textMsg });
            }
            successCount++;
            // تأخير بسيط لمنع الحظر
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch {}
        }

        report += `🤖 *البوت:* ${botName}\n   📌 *المجموعات المستهدفة:* \`${successCount}\` مجموعة\n\n`;
        totalGroupsAll += successCount;
      } catch (err) {
        report += `🤖 *البوت:* ${botName}\n   ❌ *الحالة:* فشل الإرسال (${err.message || 'خطأ غير معروف'})\n\n`;
      }
    }

    report += `───────────────────\n📊 *إجمالي المجموعات التي وصلت لها الإذاعة:* \`${totalGroupsAll}\` مجموعة\n〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;
    
    await m.reply(report);
  }
};

handler.command = /^(قائمة_البوتات|البوتات|بوتات|bots|سب_بوتات|ايقاف_بوت|إيقاف_بوت|اذاعة_فرعي|زيع_فرعي)$/i;
export default handler;
