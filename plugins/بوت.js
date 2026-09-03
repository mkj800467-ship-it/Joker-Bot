// plugins/bot.js
// ✧ THE JOKER & ITACHI - Bot Info 🔘

import { ButtonV2 } from '../core/NIXCODE.js'

let handler = async (m, { conn }) => {
    try {
        // تفاعل فوري تحت الرسالة
        await conn.sendMessage(m.chat, { react: { text: '🃏', key: m.key } });

        const imageUrl = 'https://i.postimg.cc/qB5ShSRL/IMG-20260829-WA0040.jpg';

        // النص البسيط والمكتوب بطابع إيتاشي البسيط
        const simpleBody = `♡ Raiden Shogun ♡\n\n♡ 〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍 ♡`;

        await new ButtonV2(conn)
            .setTitle('♡ Raiden Shogun ♡')
            .setSubtitle('♡ Raiden Shogun - Plane of Euthymia ♡')
            .setBody(simpleBody)
            .setFooter('👑 〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍')
            .setThumbnail(imageUrl)
            .addButton('📂 الـقـائـمـة', '.اوامر')
            .addButton('👑 الـمـطـور', '.المطور')
            .send(m.chat);

    } catch (e) {
        // طباعة أي خطأ يحدث في التيرمينال فورا
        console.error('[Joker-Bot Error]:', e);
    }
}

handler.help = ['بوت', 'bot']
handler.tags = ['main']
handler.command = /^(بوت|bot)$/i

export default handler;
