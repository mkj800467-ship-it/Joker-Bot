// plugins/لكرتون.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - وحدة تحويل الصور إلى أنمي/كرتون 🎨🔥

import axios from 'axios';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

function randomIP() {
    return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
}

function randomUserAgent() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getBaseHeaders() {
    const sessionIP = randomIP();
    return {
        'fp': 'c74f54010942b009eaa50cd58a1f4419',
        'fp1': '3LXezMA2LSO2kESzl2EYNEQBUWOCDQ/oQMQaeP5kWWHbtCWoiTptGi2EUCOLjkdD',
        'origin': 'https://pixnova.ai',
        'referer': 'https://pixnova.ai/',
        'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
        'x-code': String(Date.now()),
        'x-guide': 'SjwMWX+LcTqkoPt48PIOgZzt3eQ93zxCGvzs1VpdikRR9b9+HvKM0Qiceq6Zusjrv8bUEtDGZdVqjQf/bdOXBb0vEaUUDRZ29EXYW0kt047grMMceXzd3zppZoHZj9DeXZOTGaG50PpTHxTjX3gb0D1wmfjol2oh7d5jJFSIsY0=',
        'accept-language': 'ar,en-US;q=0.9,en;q=0.8',
        'accept': 'application/json, text/plain, */*',
        'user-agent': randomUserAgent(),
        'X-Forwarded-For': sessionIP,
        'Client-IP': sessionIP
    };
}

async function uploadImageFromBuffer(buffer) {
    const stream = Readable.from(buffer);
    const form = new FormData();
    form.append('file', stream, { filename: 'image.jpg', contentType: 'image/jpeg' });
    form.append('fn_name', 'demo-photo2anime');
    form.append('request_from', '2');
    form.append('origin_from', '111977c0d5def647');

    const headers = {
        ...getBaseHeaders(),
        ...form.getHeaders()
    };

    const upload = await axios.post('https://api.pixnova.ai/aitools/upload-img', form, { headers });
    
    if (!upload.data || !upload.data.data || !upload.data.data.path) {
        throw new Error(upload.data?.msg || "فشل رفع الصورة إلى خوادم المعالجة السيبرانية");
    }
    return upload.data.data.path;
}

async function createTask(sourceImage) {
    const payload = {
        fn_name: 'demo-photo2anime',
        call_type: 3,
        input: {
            source_image: sourceImage,
            strength: 0.6,
            prompt: 'masterpiece, best quality, anime style, highly detailed, 4k, smooth, aesthetic',
            negative_prompt: '(worst quality, low quality:1.4), cropped, blurry, text, watermark, deformed',
            request_from: 2
        },
        request_from: 2,
        origin_from: '111977c0d5def647'
    };

    const headers = {
        ...getBaseHeaders(),
        'content-type': 'application/json'
    };

    const res = await axios.post('https://api.pixnova.ai/aitools/of/create', payload, { headers });
    
    if (!res.data || !res.data.data || !res.data.data.task_id) {
        throw new Error(res.data?.msg || "فشل إنشاء مهمة تحويل الكرتون");
    }
    return res.data.data.task_id;
}

async function waitForResult(taskId) {
    const payload = {
        task_id: taskId,
        fn_name: 'demo-photo2anime',
        call_type: 3,
        request_from: 2,
        origin_from: '111977c0d5def647'
    };

    const delay = ms => new RegExp().test('') || new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 1; i <= 40; i++) {
        try {
            const headers = {
                ...getBaseHeaders(),
                'content-type': 'application/json'
            };

            const check = await axios.post('https://api.pixnova.ai/aitools/of/check-status', payload, { headers });
            const data = check.data?.data;

            if (data?.status === 2 && data?.result_image) {
                const url = data.result_image.startsWith('http')
                    ? data.result_image
                    : `https://oss-global.pixnova.ai/${data.result_image}`;
                return url;
            } else if (data?.status === 3 || data?.status < 0) {
                throw new Error("فشلت عملية المعالجة داخل خوادم الذكاء الاصطناعي");
            }
        } catch (err) {
            if (i === 40) throw err;
        }
        await delay(3000);
    }
    return null;
}

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await m.react("⏳");

        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || '';

        if (!/image\/(jpe?g|png|webp)/.test(mime)) {
            return conn.reply(m.chat, `👑 *[ ITACHI & JOKER - تحويل الكرتون ]* 👑\n\n> ⚠️ *الاستخدام الصحيح:* قم بالرد على أي صورة بهذه الطريقة:\n> \`${usedPrefix + command}\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m);
        }

        const buffer = await q.download();

        if (!buffer || buffer.length < 100) {
            throw new Error("الصورة المستلمة تالفة أو فارغة، حاول استخدام صورة أخرى");
        }

        await m.reply('> 👑 *ITACHI & جاري تحويل صورتك إلى نمط الأنمي والكرتون السيبراني...*');

        const sourceImage = await uploadImageFromBuffer(buffer);
        const taskId = await createTask(sourceImage);
        const resultUrl = await waitForResult(taskId);

        if (!resultUrl) {
            throw new Error("انتهت مهلة الانتظار ولم يتم استلام الصورة الناتجة");
        }

        const res = await fetch(resultUrl);
        if (!res.ok) throw new Error("فشل تحميل الصورة الناتجة من السيرفر");
        
        const imgBuffer = Buffer.from(await res.arrayBuffer());

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const out = path.join(tmpDir, `itachi_anime_${Date.now()}.jpg`);
        fs.writeFileSync(out, imgBuffer);

        await m.react("✅");
        await conn.sendMessage(m.chat, {
            image: { url: out },
            caption: `👑 *[ تم تحويل الصورة بنجاح ]* 👑\n\n🎨 *النمط:* كرتون / أنمي سيبراني\n📁 *الحجم:* ${(imgBuffer.length / 1024).toFixed(2)} KB\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
        }, { quoted: m });

        setTimeout(() => {
            if (fs.existsSync(out)) fs.unlinkSync(out);
        }, 15000);

    } catch (err) {
        await m.react("❌");
        console.error('[ITACHI-ToAnime Error]:', err);
        conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "فشل التحويل"*\n> \n> ⚠️ ${err.message || 'حدث خطأ غير متوقع أثناء معالجة الصورة'}`, m);
    }
};

handler.help = ["لكرتون", "photo2anime", "أنمي"];
handler.tags = ["ai"];
handler.command = /^(لكرتون|photo2anime|أنمي)$/i;

export default handler;
