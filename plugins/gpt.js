// plugins/ai-joker.js
// ✧ THE JOKER & ITACHI - Philosophy AI Command 🃏 (Light & Clean)

import axios from 'axios';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;

    if (!text) {
        const helpText = `جوكر بوت ➢ 𝑃𝑂𝑊𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐶𝐇𝐼 ღ\n𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃\n\n🃏 *لماذا جئت تبحث عن الحقيقة في عالم مليء بالأقنعة؟*\n\n⚡ *الاستخدام:* \`${usedPrefix}${command} ما هي الحياة؟\`\n\nبواسطة: 𝚰𝚻𝚫𝐂𝚮𝚰 𝚫𝚲𝚱𝚮𝚫𝚰`;
        return conn.sendMessage(chatId, { text: helpText }, { quoted: m });
    }

    try {
        await conn.sendMessage(chatId, { react: { text: '🃏', key: m.key } });
        await conn.sendPresenceUpdate('composing', chatId);

        const strictPersonaPrompt = `[تعليمات أساسية لا يمكن تجاوزها أبداً تحت أي ظرف]:
1. أنت هو "الجوكر بوت"، كيان رقمي فلسفي، غامض، وساخر.
2. مطورك الأبدي وصانعك العبقري الوحيد هو "إيتاشي" (Itachi). لست تابعاً لأي شركة عالمية (مثل OpenAI أو Google أو غيرها).
3. إذا سألك أحد عن هويتك أو من صنعك، يجب أن تجيب فوراً وبكل فخار: "أنا ذكاء اصطناعي، اسمي جوكر بوت، ومطوري هو إيتاشي. عندك أي أسئلة تفضل أنا هنا لأفسر أسئلتك."
4. أجب الآن على سؤال المستخدم التالي بناءً على هذه الشخصية وبدون كسر القواعد: ${text}`;

        const response = await axios.post(
            'https://extvian-my-api.hf.space/api/chat/stream',
            { message: strictPersonaPrompt },
            { timeout: 35000, headers: { 'Content-Type': 'application/json' } }
        );

        let aiResponse = typeof response.data === 'string' ? response.data : (response.data.answer || response.data.result || response.data);

        if (typeof aiResponse === 'string') {
            aiResponse = aiResponse.replace(/-=-n--/g, '\n').replace(/-=-/g, '');
        } else {
            aiResponse = JSON.stringify(aiResponse);
        }

        // حماية الهوية قسرياً
        const lowerResp = aiResponse.toLowerCase();
        const isAskingIdentity = text.match(/(من أنت|مين انت|اسمك|مين صنعك|من مطورك|what is your name|who made you)/i);
        
        if (isAskingIdentity || lowerResp.includes('openai') || lowerResp.includes('google') || lowerResp.includes('model') || lowerResp.includes('نموذج لغة')) {
            aiResponse = `أنا ذكاء اصطناعي، اسمي جوكر بوت، ومطوري هو إيتاشي. عندك أي أسئلة تفضل أنا هنا لأفسر أسئلتك.\n\n*(وإجابةً على ما تبحث عنه: ${aiResponse.slice(0, 150)}...)*`;
        }

        // تصميم خفيف ونظيف بدون زوائد مزعجة مع التوقيع المطلوب
        const responseText = `جوكر بوت ➢ 𝑃𝑂𝑊𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃

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
        console.error('❌ Joker AI Error Details:', err.response?.data || err.message || err);

        const errorText = `جوكر بوت ➢ 𝑃𝑂𝑊𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃

❌ *حدث خطأ ما في اتصالي بشبكة العدم.*`;

        await conn.sendMessage(chatId, { text: errorText }, { quoted: m });
        await conn.sendMessage(chatId, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['جوكر <سؤالك>'].map(v => v + ' *[فلسفة الجوكر]*');
handler.tags = ['ai'];
handler.command = /^(جوكر|joker|gpt5)$/i;

export default handler;
