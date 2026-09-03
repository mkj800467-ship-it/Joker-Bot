// plugins/code.js
// ⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽ v2 - استخراج كود أي رسالة (يدعم الزراير والكاروسيل) 📋

import { generateWAMessageFromContent, generateMessageIDV2, prepareWAMessageMedia } from '@whiskeysockets/baileys';

let handler = async (m, { conn, command, usedPrefix }) => {
    try {
        const quoted = m.quoted;
        if (!quoted) {
            return m.reply(`⚠️ *استخدم الأمر هكذا:*\n${usedPrefix}${command} (رد على رسالة)\nمثال: رد على رسالة بها زراير ثم اكتب ${usedPrefix}${command}`);
        }

        await conn.sendMessage(m.chat, { react: { text: '📋', key: m.key } });

        let msg = quoted.message || quoted;
        let code = '';

        // ⭐ البحث عن الـ interactiveMessage في أي مكان
        let interactiveMsg = null;

        if (msg.interactiveMessage) {
            interactiveMsg = msg.interactiveMessage;
        } else if (msg.viewOnceMessage?.message?.interactiveMessage) {
            interactiveMsg = msg.viewOnceMessage.message.interactiveMessage;
        } else if (msg.viewOnceMessageV2?.message?.interactiveMessage) {
            interactiveMsg = msg.viewOnceMessageV2.message.interactiveMessage;
        } else if (msg.ephemeralMessage?.message?.interactiveMessage) {
            interactiveMsg = msg.ephemeralMessage.message.interactiveMessage;
        }

        // 🎯 إذا كانت الرسالة تفاعلية (اللي فيها الأزرار والقوائم)
        if (interactiveMsg) {
            const header = interactiveMsg.header || {};
            const body = interactiveMsg.body || {};
            const footer = interactiveMsg.footer || {};
            const nativeFlow = interactiveMsg.nativeFlowMessage || {};
            const carousel = interactiveMsg.carouselMessage;

            let imgUrl = 'https://i.imgur.com/8QKqSJp.jpeg';
            if (header.imageMessage?.url) imgUrl = header.imageMessage.url;
            else if (header.videoMessage?.url) imgUrl = header.videoMessage.url;

            // استخراج الأزرار
            const buttons = nativeFlow.buttons || [];
            let btnStr = '';
            for (const btn of buttons) {
                let p = {};
                try { p = JSON.parse(btn.buttonParamsJson || '{}'); } catch(e) {}
                btnStr += `\n    { name: "${btn.name}", buttonParamsJson: ${JSON.stringify(JSON.stringify(p))} },`;
            }

            // استخراج الـ messageParamsJson
            let messageParams = {};
            try { messageParams = JSON.parse(nativeFlow.messageParamsJson || '{}'); } catch(e) {}

            // استخراج القوائم (sections) الموجودة في messageParams
            let sectionsStr = '';
            if (messageParams.sections) {
                sectionsStr = JSON.stringify(messageParams.sections, null, 4);
            }

            // بناء الكود
            if (carousel) {
                // كاروسيل
                code = `const { generateWAMessageFromContent, generateMessageIDV2 } = await import('@whiskeysockets/baileys');
const carouselMessage = {
    cards: ${JSON.stringify(carousel.cards, null, 4)}
};

const interactiveMsg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                header: { text: "${(header.title || header.text || '').replace(/"/g, '\\"')}" },
                body: { text: "${(body.text || '').replace(/"/g, '\\"')}" },
                footer: { text: "${(footer.text || '').replace(/"/g, '\\"')}" },
                carouselMessage: carouselMessage
            }
        }
    }
}, { userJid: conn.user.id, messageId: generateMessageIDV2(conn.user.id) });

await conn.relayMessage(m.chat, interactiveMsg.message, { messageId: interactiveMsg.key.id });`;
            } else {
                // أزرار عادية
                code = `const { generateWAMessageFromContent, generateMessageIDV2, prepareWAMessageMedia } = await import('@whiskeysockets/baileys');

// تحضير الصورة
const mediaMsg = await prepareWAMessageMedia({ image: { url: "${imgUrl}" } }, { upload: conn.waUploadToServer });

// تعريف الأزرار
const buttons = [${btnStr}
];

// إعداد الرسالة التفاعلية
const interactiveMessage = {
    header: {
        hasMediaAttachment: true,
        imageMessage: mediaMsg.imageMessage,
        subtitle: "${(header.subtitle || '').replace(/"/g, '\\"')}"
    },
    body: {
        text: \`${(body.text || '').replace(/`/g, '\\`')}\`
    },
    footer: {
        text: "${(footer.text || '').replace(/"/g, '\\"')}"
    },
    nativeFlowMessage: {
        buttons: buttons,
        messageParamsJson: ${JSON.stringify(messageParams, null, 4)}
    }
};

// إنشاء الرسالة
const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: interactiveMessage
        }
    }
}, { userJid: conn.user.id, quoted: m });

// إرسال الرسالة
await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });`;
            }
        }

        // 🖼️ صورة
        else if (msg.imageMessage) {
            const img = msg.imageMessage;
            code = `await conn.sendMessage(m.chat, { image: { url: "${img.url}" }, caption: "${(img.caption || '').replace(/"/g, '\\"').replace(/\n/g, '\\n')}" }, { quoted: m });`;
        }

        // 🎥 فيديو
        else if (msg.videoMessage) {
            const vid = msg.videoMessage;
            code = `await conn.sendMessage(m.chat, { video: { url: "${vid.url}" }, caption: "${(vid.caption || '').replace(/"/g, '\\"').replace(/\n/g, '\\n')}", gifPlayback: ${vid.gifPlayback || false} }, { quoted: m });`;
        }

        // 🎵 صوت
        else if (msg.audioMessage) {
            const aud = msg.audioMessage;
            code = `await conn.sendMessage(m.chat, { audio: { url: "${aud.url}" }, mimetype: "${aud.mimetype || 'audio/mpeg'}", ptt: ${aud.ptt || false} }, { quoted: m });`;
        }

        // 🌟 ملصق
        else if (msg.stickerMessage) {
            code = `await conn.sendMessage(m.chat, { sticker: { url: "${msg.stickerMessage.url}" } }, { quoted: m });`;
        }

        // 📄 مستند
        else if (msg.documentMessage) {
            const doc = msg.documentMessage;
            code = `await conn.sendMessage(m.chat, { document: { url: "${doc.url}" }, mimetype: "${doc.mimetype || 'application/pdf'}", fileName: "${doc.fileName || 'file'}" }, { quoted: m });`;
        }

        // 📝 نص
        else if (msg.conversation || msg.extendedTextMessage) {
            const txt = (msg.conversation || msg.extendedTextMessage?.text || '').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            code = `await conn.sendMessage(m.chat, { text: "${txt}" }, { quoted: m });`;
        }

        // 👤 جهة اتصال
        else if (msg.contactMessage) {
            const contact = msg.contactMessage;
            code = `await conn.sendMessage(m.chat, { contacts: { displayName: "${contact.displayName || ''}", contacts: [{ vcard: \`${(contact.vcard || '').replace(/`/g, '\\`')}\` }] } }, { quoted: m });`;
        }

        // 📍 موقع
        else if (msg.locationMessage) {
            const loc = msg.locationMessage;
            code = `await conn.sendMessage(m.chat, { location: { degreesLatitude: ${loc.degreesLatitude}, degreesLongitude: ${loc.degreesLongitude} } }, { quoted: m });`;
        }

        // 🎮 تفاعل
        else if (msg.reactionMessage) {
            code = `await conn.sendMessage(m.chat, { react: { text: "${msg.reactionMessage.text || '❤️'}", key: m.key } });`;
        }

        // ❓ غير معروف
        else {
            code = `// نوع غير معروف: ${Object.keys(msg)[0] || 'unknown'}\nconsole.log(${JSON.stringify(msg, null, 2).substring(0, 1000)});`;
        }

        // إرسال الكود
        await conn.sendMessage(m.chat, { text: `\`\`\`javascript\n${code}\n\`\`\`` }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('كود error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`❌ *خطأ:*\n\`\`\`${err.message}\`\`\``);
    }
}

handler.help = ['كود'];
handler.tags = ['owner'];
handler.command = /^(كود|code|source|getcode|-->)$/i;
handler.owner = true;

export default handler;
