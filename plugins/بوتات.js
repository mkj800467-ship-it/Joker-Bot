// plugins/bots.js
// ✧ THE JOKER & ITACHI - قائمة البوتات الفرعية 🤖

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import ws from 'ws';
import { theme } from '../core/theme.js';

const YORU_IMAGE = 'https://file.garden/aauvg01sjleV_ic1/nier%20automata%20by%20GoddessMechanic.jpg';

async function handler(m, { conn }) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // مسار جلسات السب بوت
  const carpetaBase = path.resolve(__dirname, '..', 'MB-2BSubBot');
  let cantidadCarpetas = 0;

  try {
    cantidadCarpetas = fs.readdirSync(carpetaBase, { withFileTypes: true })
      .filter(dir => dir.isDirectory()).length;
  } catch {}

  // حساب وقت تشغيل السيرفر
  const uptime = convertirMs(process.uptime() * 1000);

  // تأمين مصفوفة الاتصالات
  const conns = Array.isArray(global.conns) ? global.conns : [];

  const users = conns.filter(
    c =>
      c?.user &&
      c?.ws?.socket &&
      c.ws.socket.readyState !== ws.CLOSED
  );

  // بناء قائمة البوتات الفرعية المتصلة
  const message = users.map((v, index) => {
    const userDB = global.db?.data?.users?.[v.user.jid] || {};
    const hidden = userDB.privacy === true;

    const botNumber = hidden
      ? '[ مـخـفـي بـسـبـب الـخـصـوصـيـة ]'
      : `wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=.تنصيب`;

    const prestarStatus =
      !hidden && userDB.prestar
        ? '✅ يمكن استعارة البوت لإدخاله جروبات'
        : '';

    return `*الرقم:* [${index + 1}]\n*الاسم:* ${v.user.name || userDB.name || 'مجهول'}\n*التشغيل:* \`\`\`${v.uptime ? convertirMs(Date.now() - v.uptime) : 'غير معروف'}\`\`\`\n*الرابط:* ${botNumber}\n${prestarStatus}`;
  }).join('\n\n-------------------\n\n');

  const replyMessage = message.length
    ? message
    : '❌ لا يوجد سب بوت متصل حالياً\nجرب لاحقاَ أو قم بإنشاء سب بوت خاص بك';

  // تجميع الإحصائيات العامة باستخدام ستايل الـ theme النظيف
  const responseText = theme.build([
    { type: 'title', text: 'قـائـمـة الـبـوتـات الـفـرعـيـة' },
    { type: 'divider' },
    { type: 'info', label: 'البوتات المتصلة', value: `${users.length}` },
    { type: 'info', label: 'الجلسات المنشأة', value: `${cantidadCarpetas}` },
    { type: 'info', label: 'الجلسات النشطة', value: `${users.length}` },
    { type: 'info', label: 'سيرفر التشغيل', value: `${uptime}` },
    { type: 'divider' },
    { type: 'line', text: replyMessage }
  ]);

  try {
    await conn.sendMessage(
      m.chat,
      {
        image: { url: YORU_IMAGE },
        caption: responseText,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363410276242111@newsletter',
            newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
            serverMessageId: 970
          }
        }
      },
      { quoted: m }
    );
  } catch {
    await conn.sendMessage(m.chat, { 
      text: responseText,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363410276242111@newsletter',
          newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
          serverMessageId: 970
        }
      }
    }, { quoted: m });
  }
}

handler.command = /^(قائمة_البوتات|البوتات|بوتات|bots|سب_بوتات)$/i;
export default handler;

function convertirMs(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  return [d ? `${d}d` : '', `${h}h`, `${m}m`, `${s}s`]
    .filter(Boolean)
    .join(' ');
}

