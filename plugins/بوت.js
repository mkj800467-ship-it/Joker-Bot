// plugins/bot.js
// ✧ THE JOKER & ITACHI - Bot Info 🔘

import { ButtonV2 } from '../core/NIXCODE.js'

let handler = async (m, { conn }) => {
    try {
        // تفاعل فوري تحت الرسالة
        await conn.sendMessage(m.chat, { react: { text: '👻', key: m.key } });

        const imageUrl = 'https://i.postimg.cc/PxLDwHZq/c02c0c5900a754b9ea09775d85254d9b.jpg';

        // النص البسيط والمكتوب بطابع إيتاشي البسيط
        const simpleBody = `♡ 亗𝒲𝐸𝐿𝒞𝒪𝑀𝐸 𝐹𝒪𝑅 𝒴𝒪𝒰 ツ ♡`;

        await new ButtonV2(conn)
            .setTitle('♡ 𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♡')
            .setSubtitle('♧ 𝒯𝐻𝐸 𝒥𝒪𝒦𝐸𝑅 𝐵𝒪𝒯 𝒲𝒪𝑅𝒦𝐼𝒩𝒢 𝒩𝑜𝓌 ♧')
            .setBody(simpleBody)
            .setFooter('👑 ➢ 𝑃𝑂𝑊𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐶𝐻𝐼 ღ')
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
