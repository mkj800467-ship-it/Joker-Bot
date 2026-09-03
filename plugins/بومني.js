// plugins/claude.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — المساعد الذكي بومي 🤖🔥

import { askOverChat, downloadMedia } from './ai-helper.js';

// إدارة المحادثات لكل مستخدم
const conversations = new Map();

// نظام التعليمات الخاص بـ بومي
const SYSTEM_PROMPT = `أنت بومي (Bومي)، مساعد ذكي وودود جداً من تطوير وإشراف إيتاشي والجوكر (ITACHI & JOKER).
شخصيتك:
- ودود، ذكي، ومتعاون للغاية وتحب مساعدة الجميع
- بتشرح الأمور بطريقة بسيطة، عميقة، ومفهومة
- بتستخدم إيموجي عشان الكلام يكون حيوي وجذاب
- بترد بالعربي إلا لو حد كلمك بلغة تانية
- ردودك منظمة وواضحة ومباشرة
- اسمك بومي (Bومي) وأنت جزء من النظام السيبراني الخاص بـ ITACHI & JOKER`;

let handler = async (m, { conn, text, command }) => {
    try {
        // استخراج الصورة من الرسالة
        const imageBase64 = await downloadMedia(m);
        const hasImage = !!imageBase64;

        // السؤال هو النص المرسل
        let question = text;

        // لو فيه صورة ومافيش سؤال
        if (hasImage && !question) {
            question = "حلل هذه الصورة واشرح لي ماذا يوجد فيها بالتفصيل بالعربية";
        }

        // التحقق من وجود سؤال أو صورة
        if (!question && !hasImage) {
            return m.reply(
                `👑 *[ وحدة الذكاء الاصطناعي: بومي ]* 👑\n\n` +
                `⚠️ *الاستخدام:* \`.بومي <سؤالك>\`\n` +
                `🖼️ *مع صورة:* أرسل الصورة مع نص أو رد عليها بالأمر\n` +
                `📌 *مثال:* \`.بومي من هو إيتاشي؟\`\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
            );
        }

        await conn.sendMessage(m.chat, { react: { text: hasImage ? '🖼️' : '🧠', key: m.key } });

        const statusMsg = hasImage
            ? '👑 *ITACHI & JOKER: "بومي يحلل الصورة السيبرانية..."*'
            : '👑 *ITACHI & JOKER: "بومي يفكر ويعالج الرد..."*';
        await m.reply(statusMsg);

        // تحضير السؤال مع الصورة إن وجدت
        let finalPrompt = question;
        if (hasImage && imageBase64) {
            finalPrompt = `[الصورة مرفقة بصيغة Base64]\n${question}`;
        }

        // جلب تاريخ المحادثة (آخر 10 رسائل)
        let history = conversations.get(m.sender) || [];
        let context = '';
        if (history.length > 0) {
            context = history.map(h => `${h.role === 'user' ? 'المستخدم' : 'بومي'}: ${h.content}`).join('\n\n') + '\n\n';
        }

        const fullPrompt = context + finalPrompt;

        // استخدام askOverChat من الملف المساعد
        const response = await askOverChat(fullPrompt, SYSTEM_PROMPT, 'anthropic/claude-opus-4-6');

        if (!response) {
            throw new Error('لم يتم الحصول على رد من النظام الذكي');
        }

        // حفظ تاريخ المحادثة
        history.push({ role: "user", content: question });
        history.push({ role: "assistant", content: response });
        if (history.length > 20) {
            history = history.slice(-20);
        }
        conversations.set(m.sender, history);

        let cleanResponse = response.trim();
        const headerText = hasImage ? 'بومي (تحليل الصور السيبرانية)' : 'بومي الذكي';

        // تقسيم الرد الطويل (إزالة علامة > لضمان ظهور النص بالكامل وبخط واضح بدون إخفاء)
        const maxLength = 4096;
        if (cleanResponse.length > maxLength) {
            const parts = cleanResponse.match(new RegExp(`.{1,${maxLength}}`, 'g'));
            for (let i = 0; i < parts.length; i++) {
                const prefix = i === 0 ? '' : '(تابع) ';
                await conn.sendMessage(m.chat, {
                    text: `👑 *[ ${headerText} ]* 👑\n\n` +
                          `💬 *سؤالك:* ${question.substring(0, 100)}${question.length > 100 ? '...' : ''}\n\n` +
                          `📝 *الرد:* ${prefix}\n` +
                          `${parts[i]}\n\n` +
                          `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
                }, { quoted: m });
            }
        } else {
            await conn.sendMessage(m.chat, {
                text: `👑 *[ ${headerText} ]* 👑\n\n` +
                      `💬 *سؤالك:* ${question}\n\n` +
                      `📝 *الرد:*\n` +
                      `${cleanResponse}\n\n` +
                      `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('[ITACHI-Bomi Error]:', e);
        await m.reply(
            `👑 *ITACHI & JOKER: "خطأ في النظام"* 👑\n\n` +
            `🤖 ${e.message || 'حدث خطأ غير متوقع في مساعد بومي'}\n` +
            `🔮 حاول مرة أخرى لاحقاً.`
        );
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['بومي <سؤال>'];
handler.command = ['بومي', 'bomi', 'Bomi'];
handler.tags = ['ai'];

export default handler;
