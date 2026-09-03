// plugins/لصوت.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - وحدة تحويل الفيديو إلى صوت السيبرانية 🎵🔥

import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// دالة تحويل الفيديو إلى صوت باستخدام FFmpeg
async function convertToAudio(buffer, inputExt = 'mp4') {
    const tmpDir = join(process.cwd(), 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });

    const timestamp = Date.now();
    const inputFile = join(tmpDir, `itachi_${timestamp}.${inputExt}`);
    const outputFile = join(tmpDir, `itachi_${timestamp}.mp3`);

    await fs.writeFile(inputFile, buffer);

    // تحويل الفيديو إلى MP3 عالي الجودة
    const cmd = `ffmpeg -i "${inputFile}" -vn -acodec libmp3lame -b:a 128k "${outputFile}" -y`;
    try {
        await execAsync(cmd, { timeout: 30000 });
    } catch (err) {
        console.log("[ITACHI-ToAudio] FFmpeg warning:", err.message);
    }

    const resultBuffer = await fs.readFile(outputFile);

    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});

    return resultBuffer;
}

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await m.react("⏳");

        // ✅ التحقق من وجود رد
        if (!m.quoted) {
            return conn.reply(m.chat, `👑 *[ وحدة تحويل الصوت السيبرانية ]* 👑\n\n> ⚠️ *الاستخدام الصحيح:* رد على أي فيديو بالأمر:\n> \`${usedPrefix + command}\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m);
        }

        let quoted = m.quoted;

        // ✅ الحصول على المايم تايب بأمان
        let mime = '';
        try {
            if (quoted.mimetype) {
                mime = quoted.mimetype;
            } else if (quoted.msg && quoted.msg.mimetype) {
                mime = quoted.msg.mimetype;
            } else if (quoted.message?.videoMessage?.mimetype) {
                mime = quoted.message.videoMessage.mimetype;
            } else if (quoted.message?.audioMessage?.mimetype) {
                mime = quoted.message.audioMessage.mimetype;
            }
        } catch (err) {
            console.log("[ITACHI-ToAudio] Error getting mimetype:", err);
        }

        if (!mime || !/video|audio/.test(mime)) {
            return conn.reply(m.chat, `👑 *[ وحدة تحويل الصوت السيبرانية ]* 👑\n\n> ❌ الملف المُحدد ليس فيديو أو صوت صالح!\n> 📌 يرجى الرد على ملف فيديو لتحويله إلى مقطع صوتي MP3.\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m);
        }

        // ✅ تحميل الميديا بأمان
        let media = null;
        try {
            if (quoted.download && typeof quoted.download === 'function') {
                media = await quoted.download();
            } else if (quoted.message?.videoMessage?.url) {
                const response = await fetch(quoted.message.videoMessage.url);
                media = Buffer.from(await response.arrayBuffer());
            } else if (quoted.message?.audioMessage?.url) {
                const response = await fetch(quoted.message.audioMessage.url);
                media = Buffer.from(await response.arrayBuffer());
            }
        } catch (err) {
            console.log("[ITACHI-ToAudio] Error downloading media:", err);
        }

        if (!media || media.length < 100) {
            throw new Error('فشل تحميل الوسائط - الملف تالف أو غير مدعوم');
        }

        await m.reply('> 👑 *ITACHI & JOKER: "جاري استخراج وتحويل الصوت عبر محرك FFmpeg السيبراني..."*');

        // ✅ التحويل باستخدام الدالة المدمجة
        let audioBuffer = await convertToAudio(media, 'mp4');

        if (!audioBuffer || audioBuffer.length < 1000) {
            throw new Error('حدث خطأ أثناء معالجة التحويل - الملف الناتج تالف');
        }

        await m.react("✅");

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: 'itachi_audio.mp3',
            caption: `👑 *[ تم تحويل الفيديو إلى صوت بنجاح ]* 👑\n\n🎵 *النوع:* MP3 Audio\n📁 *الحجم:* ${(audioBuffer.length / 1024).toFixed(2)} KB\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
        }, { quoted: m });

    } catch (err) {
        await m.react("❌");
        console.error("[ITACHI-ToAudio Error]:", err);

        let errorMsg = err.message || 'حدث خطأ غير متوقع';
        conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "فشل التحويل"*\n> \n> ⚠️ ${errorMsg}\n> 💡 تأكد من الرد على فيديو صالح ومتوافق.`, m);
    }
};

handler.help = ['لصوت', 'tomp3', 'لفويس'];
handler.tags = ['fun', 'tools'];
handler.command = /^(لصوت|لفويس|tomp3)$/i;

export default handler;
