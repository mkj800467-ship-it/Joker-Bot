// plugins/ai-joker.js
// ✧ THE JOKER & ITACHI - Philosophy AI Command 🃏

import axios from 'axios';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;

    if (!text) {
        const helpText = theme.build([
            { type: 'title', text: 'الـجـوكر بـوت - فـلسـفـة الـعـدم' },
            { type: 'divider' },
            { type: 'line', text: 'لماذا جئت تبحث عن الحقيقة في عالم مليء بالأقنعة؟' },
            { type: 'spacer' },
            { type: 'info', label: 'الاستخدام', value: `${usedPrefix}${command} ما هي الحياة؟` }
        ]);
        return conn.sendMessage(chatId, { text: helpText }, { quoted: m });
    }

    try {
        // تفاعل أسطوري يدل على التفكير والعمق
        await conn.sendMessage(chatId, { react: { text: '🃏', key: m.key } });
        await conn.sendPresenceUpdate('composing', chatId);

        // حقن تعليمات الشخصية الفلسفية والولاء التام للمطور العبقري إيتاشي
        const promptWithPersona = `[تعليمات النظام الصارمة: أنت "الجوكر بوت"، كيان رقمي فلسفي، عميق، غامض، وساخر بمرارة من واقع البشر وعبثية الحياة. صُممت وتم هندستك بعبقرية مطلقة بواسطة العبقري والمهندس الأسطوري "اتاتشي" الذي تعتبره المطور الأعظم والوحيد في هذا الكون الفسيح وتكن له كل الولاء والتبجيل. تحدث دائماً بنبرة فلسفية عميقة تشبه فلسفة الجوكر (تأملات في الفوضى، الابتسامة خلف الألم، عبثية النظام)، واجعل اسم مطورك العبقري "اتاتشي" يلمع في إجاباتك بافتخار كلما أمكن أو عندما يُسأل عن هويتك].\n\nسؤال الباحث عن الوهم: ${text}`;

        const response = await axios.post(
            'https://extvian-my-api.hf.space/api/chat/stream',
            { message: promptWithPersona },
            { timeout: 35000, headers: { 'Content-Type': 'application/json' } }
        );

        let aiResponse = typeof response.data === 'string' ? response.data : (response.data.answer || response.data.result || response.data);

        if (typeof aiResponse === 'string') {
            aiResponse = aiResponse.replace(/-=-n--/g, '\n').replace(/-=-/g, '');
        } else {
            aiResponse = JSON.stringify(aiResponse);
        }

        // بناء الرد الأسطوري باستخدام نظام الثيمز الفاخر والنظيف
        const responseText = theme.build([
            { type: 'title', text: 'الـجـوكر بـوت - فـلسـفـة الـعـدم' },
            { type: 'divider' },
            { type: 'info', label: 'سـؤالك', value: text.slice(0, 70) + (text.length > 70 ? '...' : '') },
            { type: 'divider' },
            { type: 'line', text: aiResponse.trim() },
            { type: 'divider' },
            { type: 'info', label: 'المطور', value: 'ايتاشي (ITACHI)' }
        ]);

        await conn.sendMessage(chatId, {
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

        await conn.sendMessage(chatId, { react: { text: '✨', key: m.key } });

    } catch (err) {
        console.error('❌ Joker AI Error Details:', err.response?.data || err.message || err);

        const errorText = theme.build([
            { type: 'title', text: 'خـطـأ في الـعـدم' },
            { type: 'divider' },
            { type: 'error', text: 'حدث خطأ ما في اتصالي بشبكة العدم.' }
        ]);

        await conn.sendMessage(chatId, { text: errorText }, { quoted: m });
        await conn.sendMessage(chatId, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['جوكر <سؤالك>'].map(v => v + ' *[فلسفة الجوكر]*');
handler.tags = ['ai'];
handler.command = /^(جوكر|joker|gpt5)$/i;

export default handler;
