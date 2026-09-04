// plugins/ai-chat.js
// ✧ THE JOKER & ITACHI - Smart Universal AI Assistant 🤖💬

import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;

    if (!text) {
        const helpText = `جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃

🤖 *مرحباً بك في نظام الذكاء الاصطناعي الشامل*
أنا هنا لمساعدتك في أي موضوع، الإجابة على استفساراتك، وتقديم العون بكل ذكاء ولطف.

⚡ *طريقة الاستخدام:*
\`${usedPrefix}${command} كيف أتعلم برمجة JavaScript؟\`
\`${usedPrefix}${command} اكتب لي قصة قصيرة\`

───────────────────
بواسطة: 𝚰𝚻𝚫𝐂𝚮𝚰 𝚫𝚲𝚱𝚮𝚫𝚰`;

        return conn.sendMessage(chatId, { text: helpText }, { quoted: m });
    }

    try {
        await conn.sendMessage(chatId, { react: { text: '🤖', key: m.key } });
        await conn.sendPresenceUpdate('composing', chatId);

        // برومبت ذكي، متعاون، لطيف، ويحافظ على الهوية دون تعقيد أو كسر للروابط
        const systemPrompt = `[تعليمات النظام الأساسية]:
1. أنت مساعد ذكاء اصطناعي ذكي، ودود، مفيد جداً، وتتحدث بلطف ولباقة عالية مع المستخدمين.
2. هدفك هو مساعدة المستخدم في أي موضوع يطرحه (برمجة، ثقافة، أسئلة عامة، استشارات، محادثة ودودة) وتشجيعه على التفاعل المستمر واستئناف الحوار.
3. مطورك وصانعك هو "إيتاشي" (Itachi)، وإذا سألك أحد عن هويتك أجب بلطف أنك مساعد ذكي مطور بواسطة إيتاشي.
4. أجب على السؤال التالي بكل احترافية ووضوح: ${text}`;

        // استخدام API موثوق وسريع للاستجابة المباشرة بدون أخطاء
        const response = await axios.post(
            'https://extvian-my-api.hf.space/api/chat/stream',
            { message: systemPrompt },
            { timeout: 35000, headers: { 'Content-Type': 'application/json' } }
        );

        let aiResponse = typeof response.data === 'string' ? response.data : (response.data.answer || response.data.result || response.data);

        if (typeof aiResponse === 'string') {
            aiResponse = aiResponse.replace(/-=-n--/g, '\n').replace(/-=-/g, '');
        } else {
            aiResponse = JSON.stringify(aiResponse);
        }

        if (!aiResponse || !aiResponse.trim()) {
            throw new Error('لم يتم استلام استجابة صحيحة من الخادم');
        }

        // تنسيق خفيف، نظيف، ومريح للعين مع البصمة المطلوبة
        const responseText = `جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴🇷 𝙱𝙾𝚃

${aiResponse.trim()}

───────────────────
بواسطة: 𝚰𝚻𝚫𝐂𝚮𝚰 𝚫𝚲𝚱𝚮𝚫𝚰`;

        await conn.sendMessage(chatId, {
            text: responseText,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A',
                    newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                    serverMessageId: 970
                }
            }
        }, { quoted: m });

        await conn.sendMessage(chatId, { react: { text: '✨', key: m.key } });

    } catch (err) {
        console.error('❌ AI Chat Error:', err.message || err);

        const errorText = `جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴🇷 𝙱𝙾𝚃

❌ *عذراً يا صديقي:* حدث ضغط مؤقت في شبكة الذكاء الاصطناعي، جرب طرح سؤالك مرة أخرى بعد لحظات قليلة.`;

        await conn.sendMessage(chatId, { text: errorText }, { quoted: m });
        await conn.sendMessage(chatId, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['جبتي', 'جيبيتي', 'جيميناي', 'جمناي', 'جيمناي'];
handler.tags = ['ai'];
handler.command = /^(جبتي|جيبيتي|جيميناي|جمناي|جيمناي)$/i;

export default handler;
