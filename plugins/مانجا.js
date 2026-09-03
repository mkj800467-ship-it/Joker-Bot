// plugins/manhwa.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام المانهوا السيبراني 📚🔥

import axios from 'axios';
import cheerio from 'cheerio';
import baileys from '@whiskeysockets/baileys';
import JSZip from 'jszip';

const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

const DEFAULT_IMAGE = 'https://i.postimg.cc/W38s8NhV/f97a4627f09b6de650f2a1d1f4e9e461.jpg';
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_IMAGES_PER_CHAPTER = 50;
const REQUEST_TIMEOUT = 30000;
const RETRY_COUNT = 3;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 Cache System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cache = new Map();

function getCached(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCached(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 Utility Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function fetchWithRetry(url, retries = RETRY_COUNT) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                timeout: REQUEST_TIMEOUT,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ar,en;q=0.9',
                    'Referer': 'https://mangatuk.com/'
                }
            });
            return response;
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}

async function createImageMessage(conn, url) {
    if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
    try {
        const media = await prepareWAMessageMedia({ image: { url } }, { upload: conn.waUploadToServer });
        return media.imageMessage || null;
    } catch {
        return null;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 البحث باستخدام API + Carousel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchManga(conn, m, query) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };
    await react('🔍');
    try {
        const searchUrl = `https://api.mangatuk.com/api/catalog/search?q=${encodeURIComponent(query)}&limit=10&mature=include`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Origin': 'https://mangatuk.com',
                'Referer': 'https://mangatuk.com/'
            }
        });

        const results = data.data || [];
        if (results.length === 0) {
            await react('❌');
            return m.reply(`> 👑 *ITACHI & JOKER: "لا توجد نتائج"*\n> \n> 🔮 لا توجد نتائج لـ: ${query}`);
        }

        const cards = [];
        for (const manga of results.slice(0, 10)) {
            const imageMsg = await createImageMessage(conn, manga.coverImage);
            if (!imageMsg) continue;
            const rating = manga.ratingAvg ? ` ⭐ ${manga.ratingAvg}/10` : '⭐ جديد';
            const status = manga.status === 'ongoing' ? '🔄 مستمرة' : '✅ مكتملة';

            cards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: `📚 *${manga.title.substring(0, 35)}*\n${status}\n${rating}\n👁️ ${manga.viewCount?.toLocaleString() || 0}`
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    hasMediaAttachment: true,
                    imageMessage: imageMsg
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [{
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📖 عرض الفصول',
                            id: `.فصول_إتاشي ${manga.slug}`
                        })
                    }]
                })
            });
        }

        if (cards.length === 0) {
            await react('⚠️');
            return m.reply('> ⚠️ *ITACHI & JOKER: "خطأ"*\n> \n> 🔮 حدث خطأ في تحميل الصور، حاول مرة أخرى.');
        }

        const carouselMsg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `🔍 *نتائج البحث عن:* ${query}\n📊 *العدد:* ${results.length} مانهوا`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ'
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
                    })
                }
            }
        }, { quoted: m });

        await conn.relayMessage(m.chat, carouselMsg.message, { messageId: carouselMsg.key.id });
        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Search error:', error);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "خطأ في البحث"*\n> \n> 🔮 ${error.message}`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📖 جلب الفصول وعرضها في قائمة منسدلة
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getChaptersFromAPI(slug) {
    const cacheKey = `chapters_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const apiUrl = `https://api.mangatuk.com/api/series/${slug}/chapters`;
        const { data } = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (data.chapters && data.chapters.length > 0) {
            setCached(cacheKey, data.chapters);
            return data.chapters;
        }
    } catch(e) {
        console.log('[ITACHI-MANHWA] API failed, falling back to scraping');
    }

    const url = `https://mangatuk.com/series/${slug}`;
    const { data } = await fetchWithRetry(url);
    const $ = cheerio.load(data);

    const chapters = [];
    $('a[href*="/series/"][href*="/"]').each((i, el) => {
        const href = $(el).attr('href');
        const match = href.match(/\/(\d+(?:-[a-f0-9]+)?)$/);
        const title = $(el).find('.chapter-title').text().trim();
        const dateText = $(el).find('.chapter-date').text().trim();
        if (match && parseInt(match[1]) < 500) {
            const chapterNum = match[1];
            if (!chapters.find(c => c.number === chapterNum)) {
                chapters.push({
                    number: chapterNum,
                    slug: match[1],
                    title: title || null,
                    url: `https://mangatuk.com${href}`,
                    date: dateText
                });
            }
        }
    });
    chapters.sort((a, b) => parseInt(b.number) - parseInt(a.number));
    setCached(cacheKey, chapters);
    return chapters;
}

async function showChapters(conn, m, slug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('⏳');

    try {
        const url = `https://mangatuk.com/series/${slug}`;
        const { data } = await fetchWithRetry(url);
        const $ = cheerio.load(data);

        const title = $('h1').first().text().trim() || slug;
        const coverImg = $('img[src*="content.mangatuk.com/covers"]').first().attr('src') || DEFAULT_IMAGE;

        const chapters = await getChaptersFromAPI(slug);

        if (chapters.length === 0) {
            await react('❌');
            return m.reply(`> 👑 *ITACHI & JOKER: "لا توجد فصول"*\n> \n> 🔮 لا توجد فصول لـ: ${slug}`);
        }

        const rows = chapters.slice(0, 30).map((ch) => ({
            title: ch.title ? `📖 الفصل ${ch.number} - ${ch.title}` : `📖 الفصل ${ch.number}`,
            description: ch.date ? `📅 ${ch.date}` : `اضغط لعرض الصور`,
            id: `.فصل_إتاشي ${slug}/${ch.slug || ch.number}`
        }));

        const imageMsg = await createImageMessage(conn, coverImg);
        const interactiveMessage = proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
                text: `👑 *[ ${title.substring(0, 40)} ]* 👑\n📖 *عدد الفصول:* ${chapters.length}\n👇 اختر الفصل من القائمة السيبرانية`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
                text: `👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
            }),
            header: imageMsg ? proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: true,
                imageMessage: imageMsg
            }) : proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '📖 اختر الفصل',
                        sections: [{ title: 'الفصول المتاحة', rows }]
                    })
                }]
            })
        });

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage } }
        }, { quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Chapters error:', error);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "خطأ في جلب الفصول"*\n> \n> 📌 تأكد من صحة slug\n> مثال: solo-leveling-ragnarok`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 عرض صفحات الفصل
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getChapterImages(slug, chapterSlug) {
    const cacheKey = `chapter_${slug}_${chapterSlug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const apiUrl = `https://api.mangatuk.com/api/chapter/${slug}/${chapterSlug}`;
        const { data } = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        if (data.pages && Array.isArray(data.pages)) {
            const images = data.pages.map(p => p.imageUrl || p.url).filter(Boolean);
            if (images.length > 0) {
                setCached(cacheKey, images);
                return images;
            }
        }
    } catch(e) {
        console.log('[ITACHI-MANHWA] API fetch failed, scraping fallback');
    }

    const url = `https://mangatuk.com/series/${slug}/${chapterSlug}`;
    const { data } = await fetchWithRetry(url);
    const $ = cheerio.load(data);

    const images = new Set();
    $('figure.app-reader-page img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('/WP-manga/') && !src.includes('avatar') && !src.includes('cover')) {
            images.add(src);
        }
    });

    if (images.size === 0) {
        $('img[src*="/WP-manga/"]').each((i, el) => {
            const src = $(el).attr('src');
            if (src && !src.includes('avatar') && !src.includes('cover')) {
                images.add(src);
            }
        });
    }

    const imageList = Array.from(images);
    setCached(cacheKey, imageList);
    return imageList;
}

async function getChapterNavigation(slug, currentSlug) {
    const cacheKey = `nav_${slug}`;
    let chapters = getCached(cacheKey);
    if (!chapters) {
        chapters = await getChaptersFromAPI(slug);
        setCached(cacheKey, chapters);
    }

    const currentIndex = chapters.findIndex(ch => ch.slug === currentSlug || ch.number === currentSlug);

    return {
        prev: currentIndex > 0 ? chapters[currentIndex - 1] : null,
        next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
        current: chapters[currentIndex],
        chapters
    };
}

async function showChapterPages(conn, m, slug, chapterSlug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    const startTime = Date.now();
    await react('⏳');
    await m.reply('> 👑 *ITACHI & JOKER: "جاري تحميل الصور عبر النظام السيبراني..."*');

    try {
        const images = await getChapterImages(slug, chapterSlug);

        if (images.length === 0) {
            await react('❌');
            return m.reply(`> 👑 *ITACHI & JOKER: "لا توجد صور"*\n> \n> 🔮 لم يتم العثور على صور في الفصل ${chapterSlug}`);
        }

        let imagesToSend = images;
        if (images.length > MAX_IMAGES_PER_CHAPTER) {
            await m.reply(`> ⚠️ *ITACHI & JOKER: "فصل ضخم"*\n> \n> هذا الفصل كبير جداً (${images.length} صفحة)\n> سيتم إرسال أول ${MAX_IMAGES_PER_CHAPTER} صفحة فقط`);
            imagesToSend = images.slice(0, MAX_IMAGES_PER_CHAPTER);
        }

        await m.reply(`> 📸 *ITACHI & JOKER: "جاري إرسال ${imagesToSend.length} صفحة..."*`);

        for (let i = 0; i < imagesToSend.length; i++) {
            try {
                await conn.sendMessage(m.chat, {
                    image: { url: imagesToSend[i] },
                    caption: `👑 *الصفحة ${i+1} من ${imagesToSend.length}*\n📚 *الفصل ${chapterSlug}*`
                }, { quoted: m });
                if (i < imagesToSend.length - 1) await new Promise(r => setTimeout(r, 500));
            } catch (err) {
                console.error(`[ITACHI-MANHWA] Page ${i + 1} failed:`, err.message);
                await m.reply(`⚠️ فشل إرسال الصفحة ${i + 1}`);
            }
        }

        const nav = await getChapterNavigation(slug, chapterSlug);
        let navText = `> ✅ *ITACHI & JOKER: "تم إرسال ${imagesToSend.length} صفحة بنجاح!"*\n> ⏱️ *الوقت المستغرق:* ${((Date.now() - startTime) / 1000).toFixed(1)} ثانية\n`;

        if (nav.prev) {
            navText += `> ⬅️ *الفصل السابق:* .فصل_إتاشي ${slug}/${nav.prev.slug || nav.prev.number}\n`;
        }
        if (nav.next) {
            navText += `> ➡️ *الفصل التالي:* .فصل_إتاشي ${slug}/${nav.next.slug || nav.next.number}\n`;
        }

        await m.reply(navText);
        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Chapter error:', error);
        await react('❌');

        if (error.response?.status === 404) {
            await m.reply(`> 👑 *ITACHI & JOKER: "غير موجود"*\n> \n> 🔮 الفصل ${chapterSlug} غير موجود\n> 📌 استخدم .فصول_إتاشي ${slug} لاستعراض الفصول المتاحة`);
        } else {
            await m.reply(`> 👑 *ITACHI & JOKER: "خطأ"*\n> \n> 🔮 ${error.message}`);
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 تحميل الفصل كاملاً كملف ZIP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function downloadFullChapter(conn, m, slug, chapterSlug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('⏳');
    await m.reply('> 👑 *ITACHI & JOKER: "جاري تجهيز الأرشيف السيبراني (ZIP)..."*');

    try {
        const images = await getChapterImages(slug, chapterSlug);
        if (images.length === 0) {
            throw new Error('لم يتم العثور على صور');
        }

        await m.reply(`> 📸 *تم العثور على ${images.length} صفحة*\n> 🔄 *جاري الضغط السيبراني...*`);

        const zip = new JSZip();
        for (let i = 0; i < images.length; i++) {
            try {
                const imgRes = await axios.get(images[i], {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                zip.file(`page_${String(i + 1).padStart(3, '0')}.jpg`, imgRes.data);
            } catch (err) {
                console.error(`[ITACHI-MANHWA] Failed to download page ${i + 1}:`, err.message);
                await m.reply(`⚠️ فشل تحميل الصفحة ${i + 1}`);
            }
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const fileName = `ITACHI_JOKER_${slug}_chapter_${chapterSlug}.zip`;
        const fileSizeMB = (zipBuffer.length / 1024 / 1024).toFixed(2);

        await conn.sendMessage(m.chat, {
            document: zipBuffer,
            mimetype: 'application/zip',
            fileName: fileName,
            caption: `👑 *[ أرشيف الفصل السيبراني ]* 👑\n\n📦 *الفصل:* ${chapterSlug}\n📄 *الصفحات:* ${images.length}\n📁 *الحجم:* ${fileSizeMB} MB\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
        }, { quoted: m });

        await react('✅');
        await m.reply(`> ✅ *ITACHI & JOKER: "تم رفع الملف بنجاح!"*\n> \n> 📁 *الملف:* ${fileName}`);
    } catch (err) {
        console.error('[ITACHI-MANHWA] Download error:', err);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "فشل التحميل"*\n> \n> 🔮 ${err.message}`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ℹ️ معلومات المانجا
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function mangaInfo(conn, m, slug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('ℹ️');

    try {
        const url = `https://mangatuk.com/series/${slug}`;
        const { data } = await fetchWithRetry(url);
        const $ = cheerio.load(data);

        const title = $('h1').first().text().trim();
        const coverImg = $('img[src*="content.mangatuk.com/covers"]').first().attr('src');
        const description = $('.app-series-hero-description p').first().text().trim();
        const status = $('.app-inline-chip').filter((i, el) => $(el).text().includes('مستمرة') || $(el).text().includes('مكتملة')).text().trim();

        let viewCount = '?', rating = '?';
        $('.app-series-hero-stats .min-w-0').each((i, el) => {
            const text = $(el).find('p').text().trim();
            const label = $(el).find('.truncate').last().text().trim();
            if (label === 'المشاهدات') viewCount = text;
            if (label === 'التقييم') rating = text;
        });

        const genres = [];
        $('.app-route-hero-genre-list a').each((i, el) => {
            genres.push($(el).text().trim());
        });

        const chapters = await getChaptersFromAPI(slug);

        let infoText = `👑 *[ معلومات المانجا السيبرانية ]* 👑\n\n📚 *${title}*\n\n📝 *الوصف:* ${description.substring(0, 150)}${description.length > 150 ? '...' : ''}\n\n📊 *الحالة:* ${status || 'غير معروف'}\n👁️ *المشاهدات:* ${viewCount}\n⭐ *التقييم:* ${rating}\n📖 *عدد الفصول:* ${chapters.length}\n\n🏷️ *التصنيفات:* ${genres.join(' • ')}\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

        if (coverImg) {
            await conn.sendMessage(m.chat, {
                image: { url: coverImg },
                caption: infoText
            }, { quoted: m });
        } else {
            await m.reply(infoText);
        }

        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Info error:', error);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "خطأ"* \n> 📌 تأكد من صحة slug`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 الأمر الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let handler = async (m, { conn, text, command, usedPrefix }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    if ((command === 'مانهوا' && !text) || command === 'مساعدة' || command === 'help') {
        await react('📚');
        return conn.sendMessage(m.chat, {
            image: { url: DEFAULT_IMAGE },
            caption: `👑 *[ أوامر المانهوا السيبرانية - ITACHI & JOKER ]* 👑\n\n` +
                `🔍 *${usedPrefix}مانهوا <الاسم>*\n▸ البحث عن مانهوا\n\n` +
                `📖 *${usedPrefix}فصول_إتاشي <slug>*\n▸ عرض الفصول\n\n` +
                `📸 *${usedPrefix}فصل_إتاشي <slug/رقم>*\n▸ عرض صور الفصل\n\n` +
                `📦 *${usedPrefix}تحميل_فصل_إتاشي <slug/رقم>*\n▸ تحميل الفصل كملف ZIP\n\n` +
                `ℹ️ *${usedPrefix}معلومات_إتاشي <slug>*\n▸ معلومات المانهوا\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
        }, { quoted: m });
    }

    if (command === 'مانهوا' && text) return searchManga(conn, m, text);

    if (command === 'معلومات_إتاشي' || command === 'info_itachi') {
        if (!text) return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}معلومات_إتاشي <slug>\`\n\n📌 *مثال:* \`${usedPrefix}معلومات_إتاشي solo-leveling-ragnarok\``);
        return mangaInfo(conn, m, text);
    }

    if (command === 'فصول_إتاشي') {
        if (!text) return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}فصول_إتاشي <slug>\`\n\n📌 *مثال:* \`${usedPrefix}فصول_إتاشي solo-leveling-ragnarok\``);
        return showChapters(conn, m, text);
    }

    if (command === 'فصل_إتاشي') {
        const parts = text.split('/');
        const slug = parts[0];
        const chapterNum = parts[1];
        if (!slug || !chapterNum) {
            return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}فصل_إتاشي <slug/رقم_الفصل>\`\n\n📌 *مثال:* \`${usedPrefix}فصل_إتاشي solo-leveling-ragnarok/1\``);
        }
        return showChapterPages(conn, m, slug, chapterNum);
    }

    if (command === 'تحميل_فصل_إتاشي' || command === 'zip_itachi') {
        const parts = text.split('/');
        const slug = parts[0];
        const chapterNum = parts[1];
        if (!slug || !chapterNum) {
            return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}تحميل_فصل_إتاشي <slug/رقم_الفصل>\`\n\n📌 *مثال:* \`${usedPrefix}تحميل_فصل_إتاشي solo-leveling-ragnarok/1\``);
        }
        return downloadFullChapter(conn, m, slug, chapterNum);
    }
};

handler.command = ['مانهوا', 'فصول_إتاشي', 'فصل_إتاشي', 'تحميل_فصل_إتاشي', 'zip_itachi', 'معلومات_إتاشي', 'info_itachi', 'مساعدة', 'help'];
handler.tags = ['manhwa'];
handler.help = ['مانهوا <اسم>', 'فصول_إتاشي <slug>', 'فصل_إتاشي <slug/رقم>', 'تحميل_فصل_إتاشي <slug/رقم>', 'معلومات_إتاشي <slug>'];

export default handler;
