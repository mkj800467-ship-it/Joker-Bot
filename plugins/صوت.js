// plugins/sound.js
// ✧ UCHIHA - Uchiha Itachi - أمر جلب المؤثرات الصوتية 🎵

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const BASE_URL = "https://www.myinstants.com";
const SEARCH_URL = `${BASE_URL}/en/search/?name=`;

let tempResults = new Map();

async function downloadAudio(url) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
}

async function searchSounds(query) {
    const url = `${SEARCH_URL}${encodeURIComponent(query)}`;
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.instant').each((i, el) => {
        if (i >= 8) return;

        const $el = $(el);
        const title = $el.find('.instant-link').text().trim();
        const button = $el.find('.small-button');
        const onclick = button.attr('onclick') || '';
        const match = onclick.match(/play\(['"]([^'"]+)['"]/);

        if (match && match[1]) {
            let soundUrl = match[1];
            if (!soundUrl.startsWith('http')) {
                soundUrl = `${BASE_URL}${soundUrl.startsWith('/') ? '' : '/'}${soundUrl}`;
            }
            results.push({ title, url: soundUrl });
        }
    });
    return results;
}

async function sendResultsAsButtons(conn, chatId, sender, query, results, quoted) {
    const buttons = results.slice(0, 5).map((sound, index) => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: `${index + 1}. ${sound.title.substring(0, 30)}`,
            id: `sound_${index}`
        })
    }));

    // زر القناة الرسمي المحدث بالرابط المطلوب
    buttons.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
            display_text: '📢 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
            url: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A',
            merchant_url: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A'
        })
    });

    const userKey = `${chatId}_${sender}`;
    tempResults.set(userKey, {
        results: results,
        timestamp: Date.now()
    });

    const menuText = `جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ
𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃

🔍 نتائج البحث عن: *${query}*
📊 عدد الأصوات المتاحة: *${results.length}*

اختر الصوت المناسب من القائمة أدناه:`;

    const interactiveMessage = proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ text: menuText }),
        footer: proto.Message.InteractiveMessage.Footer.create({ text: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ' }),
        header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false,
            title: '🎵 مكتبة المؤثرات الصوتية'
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: buttons,
            messageParamsJson: JSON.stringify({
                bottom_sheet: {
                    in_thread_buttons_limit: 5,
                    divider_indices: [1, 2, 3, 4, 5, 999],
                    list_title: '🎵 اختر الصوت',
                    button_title: '▻ عرض الأصوات ⚡'
                }
            })
        })
    });

    const msg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: { message: { interactiveMessage } }
    }, { quoted });

    await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id });
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }); } catch {}
    };

    if (!text) {
        await react('❌');
        return m.reply(
            `جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝑇𝐴𝐂𝐇𝐼 ღ\n𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃\n\n⚠️ *الاستخدام الصحيح:* \`${usedPrefix}${command} ضحك\` أو \`مياو\` أو \`صراخ\`\n\n> يمكنك البحث عن أي صوت تريده (حيوانات، مؤثرات، ضحك، بكاء، إلخ).`
        );
    }

    await react('🔍');

    try {
        const sounds = await searchSounds(text);
        if (sounds.length === 0) {
            await react('❌');
            return m.reply(`❌ لم يتم العثور على نتائج مطابقة لـ: *${text}*\n💡 جرب استخدام الكلمات باللغة الإنجليزية أحياناً للحصول على نتائج أدق (مثل: cat, dog, laugh, scream).`);
        }

        await sendResultsAsButtons(conn, m.chat, m.sender, text, sounds, m);
        await react('✅');
    } catch (err) {
        await react('❌');
        await m.reply(`❌ حدث خطأ أثناء البحث: ${err.message}`);
    }
};

handler.all = async function (m) {
    try {
        let buttonId = null;
        if (m.message?.buttonsResponseMessage) {
            buttonId = m.message.buttonsResponseMessage.selectedButtonId;
        } else if (m.message?.templateButtonReplyMessage) {
            buttonId = m.message.templateButtonReplyMessage.selectedId;
        } else if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
            buttonId = m.message.interactiveResponseMessage.nativeFlowResponseMessage.id;
        } else if (m.text && m.text.startsWith('sound_')) {
            buttonId = m.text;
        }

        if (!buttonId || !buttonId.startsWith('sound_')) return false;

        const index = parseInt(buttonId.split('_')[1]);
        if (isNaN(index)) return false;

        const userKey = `${m.chat}_${m.sender}`;
        const userResults = tempResults.get(userKey);

        if (!userResults || !userResults.results[index]) {
            await m.reply('⚠️ انتهت صلاحية هذه القائمة، قم بطلب البحث مرة أخرى.');
            return true;
        }

        const sound = userResults.results[index];
        tempResults.delete(userKey);

        await this.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }).catch(() => {});

        try {
            const audioBuffer = await downloadAudio(sound.url);

            await this.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: false,
                fileName: `${sound.title}.mp3`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363429074575231@newsletter',
                        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                        serverMessageId: 970
                    }
                }
            }, { quoted: m });

            await this.sendMessage(m.chat, { react: { text: "✅", key: m.key } }).catch(() => {});
        } catch (err) {
            console.error(err);
            await this.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            await m.reply(`❌ فشل تحميل الصوت: ${err.message}`);
        }

        return true;

    } catch (err) {
        console.error('[SOUND BUTTON ERROR]', err);
        return false;
    }
};

handler.command = /^(صوت|مؤثر|ساوند|sound)$/i;

export default handler;
