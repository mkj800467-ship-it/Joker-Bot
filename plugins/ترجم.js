// plugins/translate.js
// ✧ THE JOKER & ITACHI - ترجمة النصوص 🌐

import axios from 'axios';
import { theme } from "../core/theme.js";

const LANGUAGES = {
    'ar': 'العربية',
    'en': 'الإنجليزية',
    'fr': 'الفرنسية',
    'es': 'الإسبانية',
    'de': 'الألمانية',
    'it': 'الإيطالية',
    'pt': 'البرتغالية',
    'ru': 'الروسية',
    'zh': 'الصينية',
    'ja': 'اليابانية',
    'ko': 'الكورية',
    'tr': 'التركية',
    'fa': 'الفارسية',
    'ur': 'الأردية',
    'hi': 'الهندية'
};

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        const langList = Object.entries(LANGUAGES)
            .map(([code, name]) => `▸ ${code} : ${name}`)
            .join('\n');

        return conn.reply(m.chat, theme.build([
            { type: 'title', text: 'تـرجـمـة الـنـصـوص' },
            { type: 'divider' },
            { type: 'info', label: 'الاستخدام', value: `${usedPrefix + command} [لغة] [النص]` },
            { type: 'line', text: 'اللغات المتاحة:' },
            { type: 'line', text: langList },
            { type: 'divider' },
            { type: 'info', label: 'مثال 1', value: `${usedPrefix + command} en السلام عليكم` },
            { type: 'info', label: 'مثال 2', value: `${usedPrefix + command} ar Hello world` }
        ]), m);
    }

    try {
        await m.react("⏳");

        const parts = text.trim().split(/\s+/);
        let targetLang = parts[0]?.toLowerCase();
        let translateText = parts.slice(1).join(' ');

        if (!LANGUAGES[targetLang] || !translateText) {
            targetLang = 'ar';
            translateText = text;
        }

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(translateText)}`;
        const res = await axios.get(url, { timeout: 10000 });

        let translated = '';
        if (res.data && res.data[0]) {
            translated = res.data[0].map(item => item[0]).join('');
        }

        if (!translated) throw new Error('فشلت الترجمة');

        await m.react("✅");

        let sourceLang = 'auto';
        if (res.data[2] && res.data[2] !== targetLang) {
            sourceLang = res.data[2];
        }

        const sourceLangName = LANGUAGES[sourceLang] || sourceLang;
        const targetLangName = LANGUAGES[targetLang];

        conn.reply(m.chat, theme.build([
            { type: 'title', text: 'نـتـيـجـة الـتـرجـمـة' },
            { type: 'divider' },
            { type: 'info', label: 'النص الأصلي', value: translateText.slice(0, 100) + (translateText.length > 100 ? '...' : '') },
            { type: 'info', label: `من ${sourceLangName}`, value: `إلى ${targetLangName}` },
            { type: 'divider' },
            { type: 'line', text: 'الترجمة:' },
            { type: 'line', text: translated.slice(0, 500) + (translated.length > 500 ? '...' : '') }
        ]), m, {
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363410276242111@newsletter',
                    newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                    serverMessageId: 970
                }
            }
        });

    } catch (err) {
        await m.react("❌");
        console.error("Translation error:", err);

        conn.reply(m.chat, theme.build([
            { type: 'title', text: 'فـشـل الـتـرجـمـة' },
            { type: 'divider' },
            { type: 'error', text: err.message || 'حدث خطأ أثناء الترجمة' },
            { type: 'divider' },
            { type: 'line', text: 'تأكد من اتصال الإنترنت وجرب مرة أخرى.' }
        ]), m);
    }
};

handler.help = ['ترجم [لغة] [نص]'];
handler.tags = ['tools'];
handler.command = /^(ترجم|ترجمة|translate)$/i;

export default handler;

