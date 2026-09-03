// plugins/ping.js
// ✧ THE JOKER & ITACHI - قياس سرعة البوت ⚡

import { performance } from 'perf_hooks';
import { theme } from '../core/theme.js';

let handler = async (m, { conn }) => {

    // قياس سرعة الرياكشن
    let reactStart = Date.now();
    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
    let reactEnd = Date.now();
    let reactSpeed = reactEnd - reactStart;

    // تحديد سرعة الرياكشن
    let reactStatus;
    if (reactSpeed < 80) reactStatus = '⚡ ممتازة جداً';
    else if (reactSpeed < 150) reactStatus = '✅ ممتازة';
    else if (reactSpeed < 300) reactStatus = '🟡 جيدة';
    else reactStatus = '🔴 بطيئة';

    // بناء الرد باستخدام نظام الـ theme الملكي وتضمين معرف القناة الموحد
    const responseText = theme.build([
        { type: 'title', text: '⚡ قـيـاس سـرعـة الـبـوت' },
        { type: 'divider' },
        { type: 'info', label: 'سرعة الرياكشن', value: `${reactSpeed} ms (${reactStatus})` },
        { type: 'divider' },
        { type: 'line', text: `🟢 البوت يعمل بسرعة ${reactSpeed < 150 ? 'ممتازة' : reactSpeed < 300 ? 'جيدة' : 'بطيئة'}` }
    ]);

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
};

handler.help = ['قيس', 'بنج', 'سرعة'];
handler.tags = ['tools'];
handler.command = /^(قيس|سرعة|بنج|ping|speed)$/i;

export default handler;
