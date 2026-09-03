// plugins/لصورة.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - وحدة تحويل الاستيكر إلى صورة السيبرانية 🖼️🔥

import axios from 'axios';

const BASE_URL = 'https://elysiatools.com';

let handler = async (m, { conn, usedPrefix, command }) => {
    // التأكد أن المستخدم رد على استيكر
    if (!m.quoted || !/(webp|sticker)/.test(m.quoted.mimetype || "")) {
        return conn.reply(m.chat, `👑 *[ وحدة تحويل الاستيكر السيبرانية ]* 👑\n\n> ⚠️ *الاستخدام الصحيح:* رد على أي استيكر بالأمر:\n> \`${usedPrefix + command}\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        // تحميل الاستيكر
        let stickerBuffer = await m.quoted.download();

        if (!stickerBuffer || stickerBuffer.length < 100) {
            throw new Error('الاستيكر تالف أو فارغ');
        }

        await m.reply('> 👑 *ITACHI & JOKER: "جاري استخراج الصورة من الاستيكر السيبراني..."*');

        let resultBuffer = null;

        // محاولة 1: استخدام API خارجي
        try {
            const formData = new FormData();
            const blob = new Blob([stickerBuffer], { type: 'image/webp' });
            formData.append('file', blob, 'image.webp');

            const uploadRes = await axios.post(`${BASE_URL}/upload/animated-webp-apng-to-mp4`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000
            });

            const filePath = uploadRes.data.filePath || uploadRes.data.url;

            if (filePath) {
                const convertRes = await axios.post(`${BASE_URL}/en/api/tools/webp-to-png`, {
                    imageFile: filePath
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                });

                let resultUrl = convertRes.data.data?.filePath || convertRes.data.filePath;
                if (resultUrl) {
                    if (resultUrl.startsWith('/')) resultUrl = BASE_URL + resultUrl;
                    const imageRes = await axios.get(resultUrl, { responseType: 'arraybuffer', timeout: 30000 });
                    resultBuffer = Buffer.from(imageRes.data);
                }
            }
        } catch (apiError) {
            console.log("[ITACHI-ToImg] API failed, falling back to FFmpeg...");
        }

        // محاولة 2: استخدام FFmpeg مباشرة (طريقة احتياطية قوية)
        if (!resultBuffer) {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const { promises: fs } = await import('fs');
            const { join } = await import('path');

            const execAsync = promisify(exec);
            const tmpDir = join(process.cwd(), 'tmp');
            await fs.mkdir(tmpDir, { recursive: true });

            const inputFile = join(tmpDir, `itachi_${Date.now()}.webp`);
            const outputFile = inputFile.replace('.webp', '.png');

            await fs.writeFile(inputFile, stickerBuffer);

            try {
                await execAsync(`ffmpeg -i "${inputFile}" -c:v png "${outputFile}" -y`);
                resultBuffer = await fs.readFile(outputFile);
                await fs.unlink(inputFile).catch(() => {});
                await fs.unlink(outputFile).catch(() => {});
            } catch (ffmpegError) {
                await fs.unlink(inputFile).catch(() => {});
                await fs.unlink(outputFile).catch(() => {});
                throw new Error("فشل تحويل الاستيكر عبر محرك المعالجة FFmpeg");
            }
        }

        if (!resultBuffer || resultBuffer.length < 1000) {
            throw new Error("الملف الناتج تالف وغير صالح");
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // إرسال الصورة النهائية
        await conn.sendMessage(m.chat, {
            image: resultBuffer,
            caption: `👑 *[ تم استخراج الصورة بنجاح ]* 👑\n\n🖼️ *النوع:* تحويل استيكر إلى صورة\n📁 *الحجم:* ${(resultBuffer.length / 1024).toFixed(2)} KB\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            mentions: [m.sender]
        }, { quoted: m });

    } catch (e) {
        console.log("[ITACHI-ToImg Error]:", e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "فشل التحويل"*\n> \n> 📌 *السبب:* ${e.message || 'الاستيكر غير مدعوم'}\n> 💡 *الحل:* تأكد من إرسال استيكر ثابت غير متحرك أو جرب استيكر آخر.`, m);
    }
};

handler.command = ["لصوره", "لصورة", "تحويل-صوره", "toimg", "sticker2img"];
handler.tags = ['sticker'];
handler.help = ['لصورة'];

export default handler;
