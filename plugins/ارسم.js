// plugins/art.js
// ✧ THE JOKER & ITACHI - AI Art Generator 🎨

import axios from 'axios';
import { join } from 'path';
import { tmpdir } from 'os';
import { createWriteStream, unlinkSync, statSync } from 'fs';
import { pipeline } from 'stream/promises';
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import { theme } from "../core/theme.js";

const BOT_IMAGE = 'https://i.postimg.cc/jS0pZ6vg/a4b43cf24ff350a05baae227e260ecec.jpg';

const STYLES = {
    'انيمي': { suffix: 'anime style, studio ghibli, detailed anime art', emoji: '🌸' },
    'كرتون': { suffix: 'cartoon style, pixar, vibrant colors', emoji: '🎨' },
    'زيتي': { suffix: 'oil painting, classical art, rich textures', emoji: '🖼️' },
    'رسم_رصاص': { suffix: 'pencil sketch, black and white, detailed drawing', emoji: '✏️' },
    'ماء': { suffix: 'watercolor painting, soft colors, artistic', emoji: '💧' },
    'ثلاثي': { suffix: '3D render, hyperrealistic, cinema 4D, octane render', emoji: '🎭' },
    'فانتازيا': { suffix: 'fantasy art, magical, epic, concept art', emoji: '🔮' },
    'سايبر': { suffix: 'cyberpunk, neon lights, futuristic, dark atmosphere', emoji: '🌆' },
    'قديم': { suffix: 'vintage, retro, old photo style, sepia', emoji: '📷' },
    'ابيض_اسود': { suffix: 'black and white, monochrome, artistic photography', emoji: '⬛' }
};

const artSessions = new Map();

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }); } catch { }
    };

    if (!text) {
        await react('🎨');
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🎨 مـاذا تـريـد أن تـرسـم؟' },
                { type: 'divider' },
                { type: 'line', text: '🃏 *اكتب وصف الصورة التي تريد رسمها*' },
                { type: 'spacer' },
                { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} قطة لطيفة في حديقة` },
                { type: 'spacer' },
                { type: 'line', text: '⚡ بعدها ستظهر لك الأستايلات للاختيار منها' }
            ])
        }, { quoted: m });
    }

    const parts = text.trim().split(/\s+/);
    const firstWord = parts[0]?.toLowerCase();
    const style = STYLES[firstWord];

    if (!style) {
        await react('🎨');
        artSessions.set(m.sender, {
            prompt: text.trim(),
            time: Date.now()
        });

        const rows = Object.entries(STYLES).map(([key, val]) => ({
            title: `${val.emoji} ${key}`,
            description: val.suffix.slice(0, 30) + '...',
            id: `${usedPrefix}${command} ${key} _confirm`
        }));

        const media = await prepareWAMessageMedia(
            { image: { url: BOT_IMAGE } },
            { upload: conn.waUploadToServer }
        );

        const msg = generateWAMessageFromContent(m.chat, {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: {
                    text: theme.build([
                        { type: 'title', text: '🎨 اخـتـر الأسـتـايـل الـمـنـاسـب' },
                        { type: 'divider' },
                        { type: 'info', label: '📝 وصفك', value: text.trim().slice(0, 40) + (text.trim().length > 40 ? '...' : '') },
                        { type: 'spacer' },
                        { type: 'line', text: '🖌️ اختر أستايل الرسم من القائمة أدناه' }
                    ])
                },
                footer: { text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' },
                header: {
                    hasMediaAttachment: true,
                    subtitle: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍',
                    imageMessage: media.imageMessage,
                },
                nativeFlowMessage: {
                    buttons: [{
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: '🎨 اخـتـار الأسـتـايـل',
                            sections: [{ title: '🖌️ أسـتـايـلات الـرسـم', rows }]
                        })
                    }]
                }
            })
        }, { userJid: conn.user.jid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        return;
    }

    const isConfirm = parts[1] === '_confirm';
    let prompt;

    if (isConfirm) {
        const session = artSessions.get(m.sender);
        if (!session || Date.now() - session.time > 300000) {
            artSessions.delete(m.sender);
            return conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '⏰ انـتـهـت الـجـلـسـة' },
                    { type: 'divider' },
                    { type: 'line', text: `⚡ ابدأ من جديد: ${usedPrefix + command} <وصف>` }
                ])
            }, { quoted: m });
        }
        prompt = session.prompt;
        artSessions.delete(m.sender);
    } else {
        prompt = parts.slice(1).join(' ');
        if (!prompt) {
            return conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '⚠️ تـنـبـيـه' },
                    { type: 'divider' },
                    { type: 'info', label: '📝', value: 'يجب كتابة الوصف بعد الأستايل' },
                    { type: 'spacer' },
                    { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} ${firstWord} قطة لطيفة` }
                ])
            }, { quoted: m });
        }
    }

    await react('🎨');
    let statusMsg = await m.reply('🃏 *الجوكر وإيتاشي يرسومان صورتك الآن...* ⏳');

    try {
        // ترجمة النص للإنجليزي
        let englishText = prompt;
        try {
            const trRes = await axios.get(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`,
                { timeout: 8000 }
            );
            const translated = trRes.data?.[0]?.map(x => x?.[0]).filter(Boolean).join('') || prompt;
            if (translated) englishText = translated;
        } catch { }

        // بناء الـ prompt النهائي
        const fullPrompt = `${englishText}, ${style.suffix}, high quality, highly detailed`;
        const encoded = encodeURIComponent(fullPrompt);

        // Pollinations.ai - مجاني بدون مفتاح API
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&enhance=true`;

        // تحميل الصورة
        const filePath = join(tmpdir(), `art_${Date.now()}.jpg`);
        const imgRes = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            timeout: 120000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        await pipeline(imgRes.data, createWriteStream(filePath));

        const size = statSync(filePath).size;
        if (size < 5000) {
            try { unlinkSync(filePath); } catch { }
            throw new Error('فشل الرسم — جرب وصف مختلف');
        }

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        await conn.sendMessage(m.chat, {
            image: { url: filePath },
            caption: theme.build([
                { type: 'title', text: `${style.emoji} تـم الـرسـم بـنـجـاح` },
                { type: 'divider' },
                { type: 'info', label: '📝 الوصف', value: prompt.slice(0, 60) + (prompt.length > 60 ? '...' : '') },
                { type: 'info', label: '🖌️ الأستايل', value: firstWord },
                { type: 'info', label: '📁 الحجم', value: (size / 1024).toFixed(2) + ' KB' },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ])
        }, { quoted: m });

        await react('✅');
        try { unlinkSync(filePath); } catch { }

    } catch (err) {
        console.error('[Joker-Art] Error:', err.message);
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
        await react('❌');
        
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ فـشـل الـرسـم' },
                { type: 'divider' },
                { type: 'error', text: err.message || 'حدث خطأ غير متوقع أثناء توليد الصورة' },
                { type: 'spacer' },
                { type: 'warning', text: '💡 جرب وصف مختلف أو أستايل آخر' }
            ])
        }, { quoted: m });
    }
};

handler.help = ['ارسم'].map(v => v + ' *[وصف]*');
handler.tags = ['ai', 'tools'];
handler.command = /^(ارسم|فن|art|draw)$/i;

export default handler;
