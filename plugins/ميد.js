// plugins/mediafire_stream.js                    // ⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽ v2 - تحميل وإرسال من ميديا فاير

import fetch from 'node-fetch';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { theme } from '../core/theme.js';
import cheerio from 'cheerio';                    

// استخراج الرابط المباشر مع معالجة الأخطاء
async function getDirectUrl(mediafireUrl) {
    const res = await fetch(mediafireUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let directUrl = $('a[aria-label="Download file"]').attr('href');
    if (!directUrl) directUrl = $('#downloadButton').attr('href');
    if (!directUrl) directUrl = $('.download-link').attr('href');
    if (!directUrl) {
        // محاولة إضافية عبر الـ regex في حال تغيرت أزرار الموقع
        const match = html.match(/href="(https:\/\/download\d+\.mediafire\.com\/[^\s"]+)"/);
        if (match) directUrl = match[1];
    }

    return directUrl;
}

let handler = async (m, { conn, args }) => {
    // إعدادات القناة الرسمية لطابع إتاشي والجوكر
    const channelContext = {
        contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363429074575231@newsletter',
                newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                serverMessageId: 970
            }
        }
    };

    if (!args[0]) {
        let helpText = theme.build([
            { type: 'title', text: '📁 ميديا فاير - Itachi & Joker' },
            { type: 'line', text: '.ميديا [رابط ميديافاير]' }
        ]) + '\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ';
        
        return await conn.sendMessage(m.chat, { text: helpText, ...channelContext }, { quoted: m });
    }

    await m.react('⏳');

    let tempFile = null;
    try {
        // استخراج الرابط المباشر
        let directUrl = await getDirectUrl(args[0]);
        if (!directUrl) throw new Error('لا يوجد رابط تحميل مباشر صالح في هذه الصفحة.');

        // الحصول على معلومات الملف
        let headRes = await fetch(directUrl, { method: 'HEAD' });
        let size = headRes.headers.get('content-length');
        let sizeMB = size ? (parseInt(size) / 1024 / 1024).toFixed(2) : '???';
        
        // استخراج اسم الملف بطريقة سليمة
        let rawName = directUrl.split('/').pop().split('?')[0];
        let filename = decodeURIComponent(rawName) || 'file.bin';

        await m.reply(theme.build([
            { type: 'info', label: 'الحجم', value: `${sizeMB} MB` },
            { type: 'info', label: 'جاري التحميل', value: 'يرجى الانتظار...' }
        ]));

        // التأكد من وجود مجلد المؤقتات
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });
        tempFile = `./temp/${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        // تحميل الملف وتدفقه بلحظتها
        let fileRes = await fetch(directUrl);
        if (!fileRes.ok) throw new Error(`فشل جلب الملف من الخادم (Status: ${fileRes.status})`);
        
        let writer = createWriteStream(tempFile);
        await pipeline(fileRes.body, writer);

        // إرسال الملف مع سياق القناة
        await conn.sendMessage(m.chat, {
            document: { url: tempFile },
            fileName: filename,
            mimetype: 'application/octet-stream',
            caption: theme.build([
                { type: 'success', text: '✅ تم التحميل بنجاح' },
                { type: 'info', label: 'الحجم', value: `${sizeMB} MB` }
            ]) + '\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
            ...channelContext
        }, { quoted: m });

        await m.react('✅');

    } catch (err) {
        console.error('[MEDIAFIRE ERROR]', err);
        await m.react('❌');
        
        let errorText = `❌ فشل التحميل: ${err.message}\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
        await conn.sendMessage(m.chat, { text: errorText, ...channelContext }, { quoted: m });
        
    } finally {
        // تنظيف الملف المؤقت لضمان عدم امتلاء المساحة حتى لو حدث خطأ
        if (tempFile && fs.existsSync(tempFile)) {
            try { fs.unlinkSync(tempFile); } catch {}
        }
    }
};

handler.command = ['ميديا', 'mediafire'];
handler.tags = ['downloader'];
handler.help = ['ميديا <رابط>'];

export default handler;
