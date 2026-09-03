// plugins/q4-facebook.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ — وحدة تحميل فيديوهات فيسبوك 📘🔥

import axios from "axios";

// دالة استخراج البيانات
function parseString(string) {
    try {
        return JSON.parse(`{"text": "${string}"}`).text;
    } catch (e) {
        return string;
    }
}

function match(data, ...patterns) {
    for (const pattern of patterns) {
        const result = data.match(pattern);
        if (result) return result;
    }
    return null;
}

async function fesnuk(postUrl, cookie = "", userAgent = "") {
    if (!postUrl || !postUrl.trim()) throw new Error("يرجى تحديد رابط فيسبوك صالح.");
    if (!/(facebook.com|fb.watch)/.test(postUrl)) throw new Error("رابط فيسبوك غير صالح.");

    const headers = {
        "sec-fetch-user": "?1",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-site": "none",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "cache-control": "max-age=0",
        authority: "www.facebook.com",
        "upgrade-insecure-requests": "1",
        "accept-language": "en-GB,en;q=0.9",
        "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
        "user-agent": userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        cookie: cookie || "",
    };

    try {
        const { data } = await axios.get(postUrl, { headers });
        const extractData = data.replace(/"/g, '"').replace(/&/g, "&");

        const sdUrl = match(extractData, /"browser_native_sd_url":"(.*?)"/, /sd_src\s*:\s*"([^"]*)"/)?.[1];
        const hdUrl = match(extractData, /"browser_native_hd_url":"(.*?)"/, /hd_src\s*:\s*"([^"]*)"/)?.[1];
        const title = match(extractData, /<meta\sname="description"\scontent="(.*?)"/)?.[1] || "";

        if (sdUrl) {
            return {
                url: postUrl,
                title: parseString(title),
                quality: {
                    sd: parseString(sdUrl),
                    hd: parseString(hdUrl || ""),
                },
            };
        } else {
            throw new Error("تعذر جلب الوسائط في هذا الوقت. حاول مرة أخرى.");
        }
    } catch (error) {
        console.error("Error:", error);
        throw new Error("تعذر جلب الوسائط في هذا الوقت. حاول مرة أخرى.");
    }
}

let handler = async (m, { args, conn, usedPrefix, command }) => {

    // التحقق من وجود رابط
    if (!args[0]) {
        return conn.reply(
            m.chat,
            `👑 *[ وحدة تحميل فيسبوك السيبرانية ]* 👑\n\n` +
            `⚠️ *طريقة الاستخدام:* قم بكتابة الأمر بجانب رابط فيسبوك.\n` +
            `📌 *مثال:* \`${usedPrefix + command} https://fb.watch/xyz\`\n\n` +
            `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            m
        );
    }

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

    await conn.reply(
        m.chat,
        `👑 *[ جاري سحب وتحميل الفيديو ]* 👑\n\n` +
        `⏳ يرجى الانتظار قليلاً، يتم معالجة الرابط عبر السيرفر...\n\n` +
        `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
        m
    );

    try {
        let result = await fesnuk(args[0]);

        // التحميل بأعلى جودة متاحة (HD وإلا SD)
        let videoUrl = result.quality.hd || result.quality.sd;
        let qualityLabel = result.quality.hd ? 'HD' : 'SD';

        if (videoUrl) {
            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                caption: `👑 *[ تم التحميل بنجاح ]* 👑\n\n` +
                         `💬 *العنوان:* ${result.title.substring(0, 60) || 'فيديو فيسبوك'}\n` +
                         `📊 *الجودة:* ${qualityLabel}\n` +
                         `📘 *المصدر:* فيسبوك\n\n` +
                         `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } else {
            await conn.reply(
                m.chat,
                `👑 *[ فشل التحميل ]* 👑\n\n` +
                `❌ تعذر جلب رابط الفيديو بدقة.\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                m
            );
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    } catch (e) {
        console.error('[ITACHI-FB Error]:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(
            m.chat,
            `👑 *ITACHI & JOKER: "فشلت المهمة"* 👑\n\n` +
            `⚠️ ${e.message || 'حدث خطأ أثناء تحميل الفيديو'}\n` +
            `📌 تأكد من صحة الرابط وأن المنشور عام (Public).\n\n` +
            `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            m
        );
    }
};

handler.help = ['فيسبوك', 'فيس', 'fb'];
handler.tags = ['downloader'];
handler.command = /^(فيس|fb|face|فيسبوك)$/i;

export default handler;
