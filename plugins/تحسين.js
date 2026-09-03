// plugins/تحسين_صورة.js
// ✧ THE JOKER & ITACHI - تحسين جودة الصور 🖼️

import axios from 'axios';
import FormData from 'form-data';
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';

async function imageUpscaler(buffer, filename = 'image.jpg', multiplier = 2) {
    const pageRes = await fetch(
        'https://www.iloveimg.com/id/tingkatkan-gambar',
        {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }
    );

    const html = await pageRes.text();
    const token = html.match(/"token":"([^"]+)"/)?.[1];
    const taskId = html.match(/ilovepdfConfig\.taskId\s*=\s*'([^']+)'/)?.[1];

    if (!token || !taskId) {
        throw new Error('فشل الحصول على token/taskId');
    }

    const uploadForm = new FormData();
    uploadForm.append('name', filename);
    uploadForm.append('chunk', '0');
    uploadForm.append('chunks', '1');
    uploadForm.append('task', taskId);
    uploadForm.append('preview', '1');
    uploadForm.append('pdfinfo', '0');
    uploadForm.append('pdfforms', '0');
    uploadForm.append('pdfresetforms', '0');
    uploadForm.append('v', 'web.0');
    uploadForm.append('file', buffer, {
        filename,
        contentType: 'image/jpeg'
    });

    const uploadRes = await axios.post(
        'https://api1g.iloveimg.com/v1/upload',
        uploadForm,
        {
            headers: {
                ...uploadForm.getHeaders(),
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }
    );

    const serverFilename = uploadRes.data?.server_filename;
    if (!serverFilename) throw new Error('فشل الرفع');

    const processForm = new FormData();
    processForm.append('packaged_filename', 'iloveimg-upscaled');
    processForm.append('multiplier', String(multiplier));
    processForm.append('task', taskId);
    processForm.append('tool', 'upscaleimage');
    processForm.append('files[0][server_filename]', serverFilename);
    processForm.append('files[0][filename]', filename);

    const processRes = await axios.post(
        'https://api1g.iloveimg.com/v1/process',
        processForm,
        {
            headers: {
                ...processForm.getHeaders(),
                Authorization: `Bearer ${token}`,
                Origin: 'https://www.iloveimg.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }
    );

    if (processRes.data?.status !== 'TaskSuccess') {
        throw new Error('فشل المعالجة');
    }

    const downloadRes = await axios.get(
        `https://api1g.iloveimg.com/v1/download/${taskId}`,
        {
            responseType: 'arraybuffer',
            headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }
    );

    return Buffer.from(downloadRes.data);
}

const imageCache = new Map();

let handler = async (m, { usedPrefix, command, conn, text }) => {
    try {
        if (text === '4x') {
            const cachedImage = imageCache.get(m.sender);
            if (!cachedImage) {
                return m.reply('انتهت صلاحية الصورة، ارفع صورة جديدة وحاول مرة أخرى.');
            }

            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            await m.reply('جاري تحسين الصورة إلى 4x HDR...');

            const result = await imageUpscaler(cachedImage, `image_${Date.now()}.jpg`, 4);

            imageCache.delete(m.sender);

            await conn.sendMessage(m.chat, {
                image: result,
                caption: 'تم تحسين الصورة إلى 4x HDR بنجاح',
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363410276242111@newsletter',
                        newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                        serverMessageId: 970
                    }
                }
            }, { quoted: m });

            return conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }

        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/image/i.test(mime)) {
            return conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: 'تـحـسـيـن الـصـور' },
                    { type: 'divider' },
                    { type: 'line', text: 'قم بالرد على أي صورة باستخدام الأمر لتحسين جودتها.' },
                    { type: 'info', label: 'الأمر', value: '.تحسين أو .hd' }
                ])
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
        await m.reply('جاري تحسين جودة الصورة 2x...');

        const media = await quoted.download();
        const result = await imageUpscaler(media, `image_${Date.now()}.jpg`, 2);

        imageCache.set(m.sender, media);
        setTimeout(() => imageCache.delete(m.sender), 300000);

        const imgMsg = await prepareWAMessageMedia(
            { image: result },
            { upload: conn.waUploadToServer }
        );

        const messageId = `HD_${Date.now()}`;
        const interactiveMessage = {
            body: { text: 'تم تحسين الصورة 2x بنجاح!\n\nهل تريد ترقية التحسين إلى 4x HDR؟' },
            footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚫 ✧' },
            header: {
                hasMediaAttachment: true,
                imageMessage: imgMsg.imageMessage
            },
            nativeFlowMessage: {
                buttons: [{
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🌟 تحسين 4x HDR',
                        id: `${usedPrefix}${command} 4x`
                    })
                }],
                messageParamsJson: "{}"
            }
        };

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage } }
        }, { 
            userJid: conn.user.jid, 
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

        await conn.relayMessage(m.chat, msg.message, {
            messageId,
            additionalNodes: [
                {
                    tag: "biz",
                    attrs: {},
                    content: [
                        {
                            tag: "interactive",
                            attrs: { type: "native_flow", v: "1" },
                            content: [
                                { tag: "native_flow", attrs: { v: "9", name: "mixed" } }
                            ]
                        }
                    ]
                }
            ]
        });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    }	catch (e) {
        console.error('[HD-Error] Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(theme.build([
            { type: 'title', text: 'فـشـل الـتـحـسـيـن' },
            { type: 'divider' },
            { type: 'error', text: e?.message || 'حدث خطأ غير معروف أثناء معالجة الصورة.' }
        ]));
    }
};

handler.help = ['تحسين', 'hd'];
handler.tags = ['tools'];
handler.command = /^(تحسين|hd)$/i;

export default handler;
