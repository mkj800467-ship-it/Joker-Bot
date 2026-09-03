// plugins/anime-edit.js
// ✧ THE JOKER & ITACHI - فيديوهات أنمي عشوائية 🎬

import fetch from 'node-fetch';
import { theme } from '../core/theme.js';

const SEARCH_KEYWORDS = [
    'anime edit',
    'naruto edit',
    'jjk edit',
    'demon slayer edit',
    'nikola tesla edit',
    'chainsaw man edit',
    'solo leveling edit',
    'bleach edit',
    'red dead 2 edit',
    'guts edit'
];

// القنوات المحدثة بالمعرف والاسم الجديد المطلوب
const CHANNELS = [
    {
        jid: '120363429074575231@newsletter',
        name: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'
    }
];

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // التأكد من أن الأمر كُتب بالبداية مع النقطة حصراً (.تست أو .anime أو .انمي)
    if (!m.text.startsWith(usedPrefix)) return;

    await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

    const randomChannel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
    let searchQuery = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];

    try {
        const apiUrl = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(searchQuery)}&count=20`;

        const res = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (!data?.data?.videos || data.data.videos.length === 0) {
            throw new Error('لا توجد فيديوهات');
        }

        const validVideos = data.data.videos.filter(v => v.play || v.hdplay);
        if (validVideos.length === 0) throw new Error('لا توجد فيديوهات صالحة');

        const randomIndex = Math.floor(Math.random() * validVideos.length);
        const video = validVideos[randomIndex];

        const videoUrl = video.hdplay || video.play;
        if (!videoUrl) throw new Error('رابط الفيديو غير موجود');

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            ptv: true,
            caption: theme.build([
                { type: 'title', text: 'فـيـديـو أنـمـي 🎬' },
                { type: 'divider' },
                { type: 'info', label: 'المطور', value: '𝐈𝐭𝐚𝐜𝐡𝐢♞' }
            ]),
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: randomChannel.jid,
                    newsletterName: randomChannel.name,
                    serverMessageId: '970'
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Anime Edit Error:", e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.reply(m.chat, theme.build([
            { type: 'title', text: 'فـشـل الـتـحـمـيـل' },
            { type: 'divider' },
            { type: 'error', text: 'حدث خطأ أثناء جلب الفيديو، حاول مرة أخرى.' }
        ]), m);
    }
};

handler.help = ['انمي'];
handler.tags = ['anime'];
handler.command = /^(تست|anime|انمي)$/i;

export default handler;
