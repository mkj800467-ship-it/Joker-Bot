// plugins/terabox.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - تحميل من تيرابوكس ☁️

import axios from 'axios';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '☁️ تـحـمـيـل مـن تـيـرابـوكـس' },
            { type: 'subtitle', text: 'يرجى إرسال رابط تيرابوكس للتحميل' },
            { type: 'divider' },
            { type: 'info', label: '📌 مثال', value: `${usedPrefix}${command} https://www.terabox.com/...` },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]), m);
    }

    if (!text.includes("terabox") && !text.includes("teraboxapp")) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '❌ خـطـأ' },
            { type: 'subtitle', text: 'الرابط غير صالح، يرجى إرسال رابط تيرابوكس صحيح' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]), m);
    }

    await conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } });

    await conn.reply(m.chat, theme.build([
        { type: 'title', text: '📥 جـاري الـتـحـمـيـل' },
        { type: 'subtitle', text: '⏳ جاري جلب الملف من تيرابوكس...' }
    ]), m);

    try {
        const { data } = await axios.get(
            `https://api.teradl.xyz/api/terabox?url=${encodeURIComponent(text)}`
        );

        if (!data || !data.download) {
            throw new Error("فشل استخراج رابط التحميل");
        }

        const downloadUrl = data.download;
        const fileName = data.filename || "terabox-file";
        const fileSize = data.size || "غير معروف";

        await conn.sendMessage(m.chat, {
            document: { url: downloadUrl },
            fileName: fileName,
            mimetype: "application/octet-stream",
            caption: theme.build([
                { type: 'title', text: '✅ تـم الـتـحـمـيـل بـنـجـاح' },
                { type: 'subtitle', text: fileName.substring(0, 50) },
                { type: 'divider' },
                { type: 'info', label: '📦 الـحـجـم', value: fileSize },
                { type: 'info', label: '☁️ الـمـصـدر', value: 'تيرابوكس' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ])
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } (err) {
        console.error(err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.reply(m.chat, theme.build([
            { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
            { type: 'subtitle', text: 'تأكد من صحة الرابط أو أن الملف عام' },
            { type: 'divider' },
            { type: 'line', text: '⚔️ قد يكون الرابط خاصاً أو منتهي الصلاحية' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]), m);
    }
};

handler.help = ['تيرابوكس <رابط>'];
handler.tags = ['downloader'];
handler.command = /^(تيرابوكس|terabox)$/i;

export default handler;
