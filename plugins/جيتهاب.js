// plugins/github.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - البحث عن مستودعات جيتهاب وتحميلها 💻

import axios from 'axios';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // 🔍 البحث في جيتهاب
    if (command === 'جيتهاب' || command === 'github') {
        if (!text) {
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '💻 بـحـث جـيـتـهـاب' },
                { type: 'subtitle', text: 'البحث عن مستودعات في جيتهاب' },
                { type: 'divider' },
                { type: 'info', label: '📌 مثال', value: `${usedPrefix}${command} whatsapp-bot` },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]), m);
        }

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&per_page=20`;
            const { data } = await axios.get(url, {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });

            if (!data.items.length) {
                throw new Error("❌ لم يتم العثور على نتائج.");
            }

            // بناء قائمة المستودعات
            const sections = data.items.map((repo) => ({
                title: `📂 ${repo.name}`,
                rows: [{
                    title: `📥 تـحـمـيـل الـمـسـتـودع`,
                    description: `⭐ ${repo.stargazers_count} نجم | 🍴 ${repo.forks_count} فرع | 👤 ${repo.owner.login}`,
                    id: `${usedPrefix}تحميل ${repo.html_url}`
                }]
            }));

            const interactiveMessage = {
                body: {
                    text: theme.build([
                        { type: 'title', text: `🔍 نـتـائـج الـبـحـث عـن: ${text}` },
                        { type: 'divider' },
                        { type: 'info', label: '📊 عدد النتائج', value: data.items.length.toString() },
                        { type: 'divider' },
                        { type: 'line', text: '⚔️ اختر المستودع المطلوب' }
                    ])
                },
                footer: { text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' },
                header: { hasMediaAttachment: false },
                nativeFlowMessage: {
                    buttons: [{
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: '📋 قـائـمـة الـمـسـتـودعـات',
                            sections
                        })
                    }]
                }
            };

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
                    }
                }
            }, { userJid: conn.user.jid, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'subtitle', text: e.message || 'حدث خطأ أثناء البحث' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]), m);
        }
    }

    // 📥 تحميل المستودع
    if (command === 'تحميل') {
        if (!text) {
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '📥 تـحـمـيـل مـسـتـودع' },
                { type: 'subtitle', text: 'تحميل مستودع من جيتهاب' },
                { type: 'divider' },
                { type: 'info', label: '📌 مثال', value: `${usedPrefix}${command} https://github.com/user/repo` },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]), m);
        }

        if (!regex.test(text)) {
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'subtitle', text: 'الرابط غير صالح، يرجى إدخال رابط جيتهاب صحيح' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]), m);
        }

        let [_, user, repo] = text.match(regex) || [];
        repo = repo.replace(/.git$/, '');
        const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`;

        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        try {
            await conn.sendMessage(m.chat, {
                document: { url: zipUrl },
                mimetype: 'application/zip',
                fileName: `${repo}.zip`,
                caption: theme.build([
                    { type: 'title', text: '✅ تـم الـتـحـمـيـل بـنـجـاح' },
                    { type: 'subtitle', text: `تم تجهيز المستودع` },
                    { type: 'divider' },
                    { type: 'info', label: '📂 الـمـسـتـودع', value: repo },
                    { type: 'info', label: '👤 الـمـالـك', value: user },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ])
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'subtitle', text: 'فشل تحميل المستودع، حاول مرة أخرى' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]), m);
        }
    }
};

handler.help = ['جيتهاب <اسم>', 'تحميل <رابط>'];
handler.tags = ['downloader'];
handler.command = /^(جيتهاب|github|تحميل)$/i;

export default handler;

