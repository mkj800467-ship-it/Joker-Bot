// plugins/visualgpt-edit.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - محرر الصور بالذكاء الاصطناعي 🎨🤖

import axios from 'axios';
import { theme } from '../core/theme.js';

const BASE_URL = 'https://visualgpt.io';
const API_URL = `${BASE_URL}/api/v1/prediction/handle`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36';
const ANON_COOKIE = 'anonymous_user_id=f79b4c7d-5f33-40f0-8166-247f31e030fd';

// توقيع ثابت للنظام
const FIXED_SIGN = '992e1a849ccd67b087af17f365c24011444527b908dd4330f0d31f914b664bc8';
const FALLBACK_IMAGE_URL = '/temp/visualgpt/user-upload/2026-05/15/c6162a44-a071-48cf-a250-164da8c2550f.jpeg';

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // إعدادات القناة الرسمية لإرفاقها مع الردود
    const channelContext = {
        contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363429074575231@newsletter',
                newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                serverMessageId: 970
            },
            externalAdReply: {
                title: '⚜️ ITACHI & JOKER - AI PHOTO EDITOR',
                body: 'اضغط للانضمام لقناة البوت الرسمية',
                thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    };

    let imageBuffer = null;

    if (m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.msg?.imageMessage)) {
        try { imageBuffer = await m.quoted.download(); } catch (e) { console.error('Download error:', e); }
    }

    if (!imageBuffer && m.msg?.contextInfo?.quotedMessage?.imageMessage) {
        try {
            const quotedMsg = m.msg.contextInfo.quotedMessage;
            const msg = { message: { imageMessage: quotedMsg.imageMessage } };
            imageBuffer = await conn.downloadM(msg.message.imageMessage, 'image');
        } catch (e) { console.error('Download error 2:', e); }
    }

    if (!imageBuffer && m.mtype === 'imageMessage') {
        try { imageBuffer = await m.download(); } catch (e) { console.error('Download error 3:', e); }
    }                                                 

    if (!imageBuffer) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🎨 مـحـرر الـصـور بالذكاء الاصطناعي' },
                { type: 'divider' },
                { type: 'line', text: '❌ يرجى الرد على صورة واكتب معها وصف التعديل!' },
                { type: 'info', label: 'طريقة الاستخدام', value: `رد على الصورة واكتب:\n${usedPrefix + command} اجعلها كرتونية` }
            ]),
            ...channelContext
        }, { quoted: m });
    }

    if (!text || !text.trim()) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '⚠️ نـقـص في الـبـيـانـات' },
                { type: 'divider' },
                { type: 'line', text: 'أدخل وصف التعديل المطلوب بعد الأمر.' },
                { type: 'info', label: 'مثال', value: `${usedPrefix + command} تحويل إلى رسمة زيتية` }
            ]),
            ...channelContext
        }, { quoted: m });
    }

    let initialMsg = await conn.sendMessage(m.chat, {
        text: theme.build([
            { type: 'title', text: '⏳ جـاري الـمـعـالـجـة' },
            { type: 'divider' },
            { type: 'line', text: `📝 الوصف: ${text}` },
            { type: 'line', text: '⚡ يتم تعديل الصورة عبر محرك VisualGPT، قد يستغرق 10-20 ثانية...' }
        ]),
        react: { text: '⏳', key: m.key },
        ...channelContext
    }, { quoted: m });

    try {
        const imagePath = FALLBACK_IMAGE_URL;
        const timestamp = Math.floor(Date.now() / 1000);                                                    
        const requestBody = {
            input_urls: [imagePath],
            type: 61,
            user_prompt: text,
            sub_type: 2,
            aspect_ratio: 'match_input_image',
            size: '',
            resolution: '',                                       
            quality: '',
            speed: '',
            output_num: 1,
            background: '',
            sign: FIXED_SIGN,                                     
            t: timestamp,                                         
            sig_version: 'v1'
        };

        const response = await axios.post(API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': USER_AGENT,
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/ai-image-editor`,
                'Cookie': ANON_COOKIE
            },
            timeout: 60000
        });

        const { project_id } = response.data;
        if (!project_id) throw new Error('لم يتم الحصول على معرف المشروع من الخادم');

        let resultUrl = null;
        let attempts = 0;
        const maxAttempts = 40;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));

            try {
                const statusRes = await axios.get(`${BASE_URL}/api/v1/prediction/get-status?project_id=${project_id}`, {
                    headers: {
                        'User-Agent': USER_AGENT,
                        'Origin': BASE_URL,
                        'Referer': `${BASE_URL}/ai-image-editor`,
                        'Cookie': ANON_COOKIE
                    }
                });

                if (statusRes.data.status === 'success') {
                    resultUrl = statusRes.data.result_url || statusRes.data.image_url;
                    break;
                } else if (statusRes.data.status === 'failed') {
                    throw new Error('فشلت عملية التعديل من الخادم الرئيسي');
                }
            } catch (e) {
                console.error('Status check error:', e.message);
            }
            attempts++;
        }

        if (!resultUrl) throw new Error('انتهت مهلة الانتظار (40 ثانية) دون استلام الصورة الناتجة');

        const finalImage = await axios.get(resultUrl, { responseType: 'arraybuffer' });

        await conn.sendMessage(m.chat, {
            image: Buffer.from(finalImage.data),
            caption: theme.build([
                { type: 'title', text: '✅ تـم تـعـديـل الـصـورة' },
                { type: 'divider' },
                { type: 'success', text: `📝 الوصف: ${text}` },
                { type: 'divider' },
                { type: 'line', text: '▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ])
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('[VisualGPT Error]', err.response?.data || err.message);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        let errorMsg = err.message;
        if (err.response?.status === 405) {
            errorMsg = 'خطأ 405: طريقة الطلب غير مدعومة.';
        } else if (err.response?.data?.message) {
            errorMsg = err.response.data.message;
        }

        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ فـي الـتـعـديـل' },
                { type: 'error', text: errorMsg },
                { type: 'divider' },
                { type: 'info', label: '💡 الحل', value: 'قد تكون صلاحية الرابط المؤقت انتهت، حاول مرة أخرى' }
            ]),
            edit: initialMsg.key,
            ...channelContext
        }, { quoted: m });
    }
};

handler.help = ['عدل <وصف>', 'تعديل <وصف>', 'vgpt <وصف>'];
handler.tags = ['ai', 'tools'];
handler.command = /^(عدل|تعديل|vgpt)$/i;

export default handler;
