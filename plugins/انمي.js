// plugins/anime_smart.js
// ✧ THE JOKER & ITACHI - نظام تحميل الأنمي الذكي 🃏

import { Scrapy } from "meowsab";
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

// ═══════════════════════════════════════════════════════════════
// 🧠 الدالة الذكية - تستخرج الرابط المباشر من أي موقع
// ═══════════════════════════════════════════════════════════════

async function extractDirectUrl(url) {
    if (url.match(/\.(mp4|mkv|avi|mov|webm)(\?|$)/i)) {
        return url;
    }

    if (url.includes('mediafire.com')) {
        return await extractMediaFire(url);
    }

    if (url.includes('mp4upload.com')) {
        return await extractMP4Upload(url);
    }

    if (url.includes('uqload.com') || url.includes('uqload.is')) {
        return await extractUqload(url);
    }

    if (url.includes('vidmoly')) {
        return await extractVidMoly(url);
    }

    if (url.includes('gofile.io')) {
        return await extractGofile(url);
    }

    return await extractGeneric(url);
}

async function extractMediaFire(url) {
    try {
        let res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();
        let $ = cheerio.load(html);

        let directUrl = $('a[aria-label="Download file"]').attr('href');
        if (!directUrl) directUrl = $('#downloadButton').attr('href');
        if (!directUrl) directUrl = $('.download-link').attr('href');

        return directUrl;
    } catch {
        return null;
    }
}

async function extractMP4Upload(url) {
    try {
        let id = url.match(/embed-([^.]+)/)?.[1];
        if (!id) return null;

        let apiUrl = `https://www.mp4upload.com/api/file/info?id=${id}`;
        let res = await fetch(apiUrl);
        let data = await res.json();

        if (data.file?.url) return data.file.url;
        return null;
    } catch {
        return null;
    }
}

async function extractUqload(url) {
    try {
        let res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();
        let match = html.match(/file\s*:\s*["']([^"']+\.mp4[^"']*)["']/i);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

async function extractVidMoly(url) {
    try {
        let res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();
        let match = html.match(/file:\s*["']([^"']+)["']/i);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

async function extractGofile(url) {
    try {
        let code = url.split('/').pop();
        let apiUrl = `https://api.gofile.io/contents/${code}`;
        let res = await fetch(apiUrl);
        let data = await res.json();

        if (data.status === 'ok' && data.data?.contents) {
            let firstFile = Object.values(data.data.contents)[0];
            return firstFile?.link || null;
        }
        return null;
    } catch {
        return null;
    }
}

async function extractGeneric(url) {
    try {
        let res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();
        let match = html.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/i);
        return match ? match[0] : null;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📥 دالة تحميل وإرسال الفيديو مع آلية المحاولات المتكررة (Retry System)
// ═══════════════════════════════════════════════════════════════

async function fetchWithRetry(url, options = {}, retries = 3, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            let res = await fetch(url, options);
            if (res.ok) return res;
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('فشل الاتصال بعد عدة محاولات.');
}

async function downloadAndSend(m, conn, videoUrl, animeTitle, episodeTitle) {
    await m.react('⏳');

    try {
        let directUrl = await extractDirectUrl(videoUrl);
        if (!directUrl) {
            throw new Error('تعذر استخراج رابط التحميل المباشر.');
        }

        let res = await fetchWithRetry(directUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': videoUrl,
                'Accept': '*/*'
            }
        }, 3, 4000);

        let buffer = await res.buffer();
        let sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

        const videoCaption = theme.build([
            { type: 'title', text: `🃏 ${animeTitle}` },
            { type: 'subtitle', text: episodeTitle },
            { type: 'divider' },
            { type: 'info', label: '📁 حجم الملف', value: `${sizeMB} MB` },
            { type: 'success', text: '✅ تم التحميل والإرسال بنجاح' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        await conn.sendMessage(m.chat, {
            video: buffer,
            caption: videoCaption,
            mimetype: 'video/mp4'
        }, {
            quoted: m,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429074575231@newsletter',
                    newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                    serverMessageId: 970
                }
            }
        });

        await m.react('✅');

    } catch (err) {
        console.error('[JOKER-ANIME-ERROR]:', err.message);
        await m.react('❌');
        
        const errorText = theme.build([
            { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
            { type: 'divider' },
            { type: 'error', text: 'حدث خطأ أو انقطع الاتصال أثناء تحميل الفيديو. تم توفير الرابط المباشر أدناه لفتحه في متصفحك:' },
            { type: 'info', label: '🔗 الرابط', value: videoUrl },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        await conn.sendMessage(m.chat, { text: errorText }, { quoted: m });
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎬 الأمر الرئيسي
// ═══════════════════════════════════════════════════════════════

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // معالج التحميل المباشر للروابط
    if (text && (text.includes('http') || text.includes('mediafire') || text.includes('mp4upload'))) {
        await m.react('⏳');

        try {
            let directUrl = await extractDirectUrl(text);
            if (!directUrl) throw new Error('لا يمكن استخراج رابط التحميل من هذا الرابط.');

            let res = await fetchWithRetry(directUrl, {}, 3, 3000);
            let buffer = await res.buffer();
            let sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

            const directCaption = theme.build([
                { type: 'title', text: '✅ تـم الـتـحـمـيـل بـنـجـاح' },
                { type: 'divider' },
                { type: 'info', label: '📁 حجم الملف', value: `${sizeMB} MB` },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);

            await conn.sendMessage(m.chat, {
                video: buffer,
                caption: directCaption,
                mimetype: 'video/mp4'
            }, {
                quoted: m,
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

            await m.react('✅');

        } catch (err) {
            await m.react('❌');
            const errText = theme.build([
                { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
                { type: 'divider' },
                { type: 'error', text: err.message },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            await conn.reply(m.chat, errText, m);
        }
        return;
    }

    // معالج اختيار الحلقة
    if (text && text.startsWith('ep_')) {
        let parts = text.split('_');
        let animeId = parts[1];
        let animeTitle = decodeURIComponent(parts[2]);
        let episodeNum = parts[3];
        let episodeName = decodeURIComponent(parts.slice(4).join('_'));

        await m.react('⏳');

        try {
            const anime = await Scrapy.Witanime({ query: animeId, choose: "id" });
            const episode = anime.data.episodes.find(ep => ep.episode_number == episodeNum);

            if (!episode || !episode.download_links || episode.download_links.length === 0) {
                throw new Error('لا توجد روابط تحميل متاحة لهذه الحلقة في الوقت الحالي.');
            }

            let bestLink = episode.download_links.find(l =>
                l.quality?.toLowerCase().includes('480') ||
                l.quality?.toLowerCase().includes('sd')
            );
            if (!bestLink) bestLink = episode.download_links[0];

            await downloadAndSend(m, conn, bestLink.url, animeTitle, episode.name);

        } catch (err) {
            await m.react('❌');
            const epErrText = theme.build([
                { type: 'title', text: '❌ خـطـأ في جلب الحلقة' },
                { type: 'divider' },
                { type: 'error', text: err.message },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            await conn.reply(m.chat, epErrText, m);
        }
        return;
    }

    // معالج اختيار الأنمي وعرض الحلقات
    if (text && text.startsWith('anime_')) {
        let parts = text.split('_');
        let animeId = parts[1];
        let animeTitle = decodeURIComponent(parts[2]);

        await m.react('⏳');

        try {
            const anime = await Scrapy.Witanime({ query: animeId, choose: "id" });
            const data = anime.data;

            if (!data || !data.episodes) {
                throw new Error('لا توجد حلقات مسجلة لهذا الأنمي.');
            }

            let imgMsg = null;
            if (data.poster) {
                try {
                    imgMsg = await prepareWAMessageMedia(
                        { image: { url: data.poster } },
                        { upload: conn.waUploadToServer }
                    );
                } catch (err) {}
            }

            let rows = [];
            for (let ep of data.episodes.slice(0, 20)) {
                if (ep.download_links && ep.download_links.length > 0) {
                    rows.push({
                        title: `${ep.episode_number}. ${ep.name.substring(0, 40)}`,
                        description: `📅 ${ep.air_date || 'متوفرة'}`,
                        id: `${usedPrefix}${command} ep_${animeId}_${encodeURIComponent(animeTitle)}_${ep.episode_number}_${encodeURIComponent(ep.name)}`
                    });
                }
            }

            if (rows.length === 0) {
                throw new Error('لا توجد روابط تحميل متاحة للحلقات.');
            }

            const menuText = theme.build([
                { type: 'title', text: `🃏 ${data.name}` },
                { type: 'divider' },
                { type: 'info', label: '⭐ التقييم', value: data.rating || 'غير متاح' },
                { type: 'info', label: '👁️ المشاهدات', value: data.views?.toLocaleString() || '0' },
                { type: 'info', label: '📅 العرض', value: data.first_air_date || 'غير محدد' },
                { type: 'info', label: '🎭 التصنيف', value: data.genres?.join(", ") || "غير محدد" },
                { type: 'divider' },
                { type: 'line', text: (data.overview || 'لا توجد نبذة مختصرة.').slice(0, 200) + '...' },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);

            const interactiveMessage = {
                body: { text: menuText },
                footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧' },
                header: {
                    hasMediaAttachment: !!imgMsg?.imageMessage,
                    imageMessage: imgMsg?.imageMessage || null
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: "🎬 اختر الحلقة",
                                sections: [{ title: `📺 حلقة من ${data.name} (${data.episodes.length} حلقة)`, rows }]
                            })
                        }
                    ],
                    messageParamsJson: ""
                }
            };

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: { message: { interactiveMessage } }
            }, { userJid: conn.user.jid, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (err) {
            await m.react('❌');
            const animeErrText = theme.build([
                { type: 'title', text: '❌ خـطـأ في جلب بيانات الأنمي' },
                { type: 'divider' },
                { type: 'error', text: err.message },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            await conn.reply(m.chat, animeErrText, m);
        }
        return;
    }

    // واجهة البحث الأساسية
    if (!text) {
        const helpText = theme.build([
            { type: 'title', text: '🃏 نِـظـام تـحـمـيـل الـأنـمـي' },
            { type: 'subtitle', text: 'ابحث عن أي أنمي أو الصق رابط التحميل مباشرة' },
            { type: 'divider' },
            { type: 'info', label: '🔍 للبحث', value: `${usedPrefix}${command} <اسم الأنمي>` },
            { type: 'info', label: '📥 تحميل مباشر', value: `${usedPrefix}${command} <رابط الفيديو>` },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        return conn.reply(m.chat, helpText, m);
    }

    await m.react('⏳');

    try {
        const searchResult = await Scrapy.Witanime({ query: text, choose: "search" });
        const results = searchResult.data;

        if (!results || results.length === 0) {
            await m.react('❌');
            const notFoundText = theme.build([
                { type: 'title', text: '🃏 لَم تـُعـثـر نـَتـيـجـة' },
                { type: 'divider' },
                { type: 'error', text: `لم يتم العثور على أي نتائج مطابقة لـ: "${text}"` },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            return conn.reply(m.chat, notFoundText, m);
        }

        let imgMsg = null;
        if (results[0]?.poster) {
            try {
                imgMsg = await prepareWAMessageMedia(
                    { image: { url: results[0].poster } },
                    { upload: conn.waUploadToServer }
                );
            } catch (err) {}
        }

        let rows = results.slice(0, 10).map(anime => ({
            title: anime.name.substring(0, 45),
            description: `⭐ ${anime.rating || 'N/A'} | 👁️ ${anime.views?.toLocaleString() || '0'} | 📅 ${anime.release_date || '?'}`,
            id: `${usedPrefix}${command} anime_${anime.id}_${encodeURIComponent(anime.name)}`
        }));

        const searchMenuText = theme.build([
            { type: 'title', text: '🃏 نِـتـائـج بـَحـث الـأنـمـي' },
            { type: 'divider' },
            { type: 'info', label: '🔍 البحث', value: text },
            { type: 'info', label: '📋 الإرشاد', value: 'اختر العمل المطلوب من القائمة أدناه' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        const interactiveMessage = {
            body: { text: searchMenuText },
            footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧' },
            header: {
                hasMediaAttachment: !!imgMsg?.imageMessage,
                imageMessage: imgMsg?.imageMessage || null
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: "🎬 اختر الأنمي",
                            sections: [{ title: "📺 نتائج البحث في قواعد العدم", rows }]
                        })
                    }
                ],
                messageParamsJson: ""
            }
        };

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage } }
        }, { userJid: conn.user.jid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await m.react('✅');

    } catch (err) {
        await m.react('❌');
        const searchErrText = theme.build([
            { type: 'title', text: '❌ خـطـأ في البحث' },
            { type: 'divider' },
            { type: 'error', text: err.message },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        await conn.reply(m.chat, searchErrText, m);
    }
};

handler.help = ['انمي <اسم>'];
handler.tags = ['anime'];
handler.command = /^(انمي)$/i;

export default handler;
