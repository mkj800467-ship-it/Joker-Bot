// plugins/بلوقن.js
// ✧ THE JOKER & ITACHI - إدارة البلوقنات 📦

import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, args, usedPrefix }) => {

    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    const pluginsDir = path.dirname(global.__filename(import.meta.url, true));
    const currentFile = path.basename(global.__filename(import.meta.url, true));
    const getPlugins = () => fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js") && f !== currentFile);

    const findPlugin = (name) => {
        let searchName = name.replace(/\.js$/i, "").trim().toLowerCase().replace(/\s+/g, '-');
        const allFiles = getPlugins();
        let found = allFiles.find(f => f.toLowerCase() === searchName + ".js");
        if (found) return found;
        found = allFiles.find(f => f.replace(/-/g, '_').toLowerCase() === searchName.replace(/-/g, '_') + ".js");
        if (found) return found;
        found = allFiles.find(f => f.toLowerCase().includes(searchName));
        if (found) return found;
        return null;
    };

    const action = (args[0] || "").toLowerCase();

    // ⭐ عرض الكود - بنظام Rich Message
    if (/^(عرض|show|get)$/i.test(action)) {
        const nameArg = args.slice(1).join(" ").trim();
        if (!nameArg) return m.reply(theme.build([
            { type: 'title', text: 'عـرض بـلـوقـن' },
            { type: 'divider' },
            { type: 'info', label: 'الاستخدام', value: `${usedPrefix}بلوقن عرض <اسم>` }
        ]));

        const foundFile = findPlugin(nameArg);
        if (!foundFile) {
            await react("❌");
            return m.reply(theme.build([
                { type: 'title', text: 'خـطـأ في النظام' },
                { type: 'divider' },
                { type: 'error', text: `الملف "${nameArg}" غير موجود` }
            ]));
        }

        const filePath = path.join(pluginsDir, foundFile);
        const code = fs.readFileSync(filePath, "utf-8");
        const fileSize = (code.length / 1024).toFixed(2);
        const totalLines = code.split('\n').length;

        await react("📄");

        const botMeta = {
            isForwarded: true,
            forwardingScore: 1,
            forwardedAiBotMessageInfo: {
                botJid: "867051314767696@bot"
            },
            forwardOrigin: 4
        };

        const codeLines = code.split('\n');
        const codeBlocks = [];
        let currentBlock = '';
        let blockType = 1;

        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];
            if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
                if (currentBlock) {
                    codeBlocks.push({ highlightType: blockType, codeContent: currentBlock });
                    currentBlock = '';
                }
                blockType = 3;
                currentBlock += line + '\n';
            } else if (line.includes('handler.') || line.includes('export')) {
                if (currentBlock) {
                    codeBlocks.push({ highlightType: blockType, codeContent: currentBlock });
                    currentBlock = '';
                }
                blockType = 2;
                currentBlock += line + '\n';
            } else if (line.trim() === '' || line.trim().startsWith('import') || line.trim().startsWith('const') || line.trim().startsWith('let')) {
                if (currentBlock && blockType !== 2 && blockType !== 3) {
                    blockType = 1;
                }
                currentBlock += line + '\n';
            } else {
                if (currentBlock && blockType !== 2 && blockType !== 3) {
                    blockType = 4;
                }
                currentBlock += line + '\n';
            }
        }
        if (currentBlock) {
            codeBlocks.push({ highlightType: blockType, codeContent: currentBlock });
        }

        const richMessage = {
            richResponseMessage: {
                messageType: 1,
                submessages: [
                    {
                        messageType: 2,
                        messageText: `\n📄 *${foundFile}*\n📦 ${fileSize} KB | 📝 ${totalLines} سطر\n⚡ ${global.watermark || '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍'}\n`,
                    },
                    {
                        messageType: 2,
                        messageText: `\n💻 *الكود:*\n`,
                    },
                    {
                        messageType: 5,
                        codeMetadata: {
                            codeLanguage: "javascript",
                            codeBlocks: codeBlocks
                        }
                    }
                ],
                contextInfo: botMeta
            }
        };

        try {
            const msg = await generateWAMessageFromContent(m.chat, {
                botForwardedMessage: { message: richMessage }
            }, {
                senderId: conn.user.id,
                userJid: conn.user.id,
                messageId: generateMessageIDV2(conn.user.id)
            });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (err) {
            console.error("[Joker-Plugin]", err);
            await conn.sendMessage(m.chat, {
                text: `📄 *${foundFile}*\n📦 ${fileSize} KB | 📝 ${totalLines} سطر\n\n\`\`\`javascript\n${code}\n\`\`\``
            }, { quoted: m });
        }

        return;
    }

    // ⭐ لست
    if (/^(لست|list)$/i.test(action)) {
        const plugins = getPlugins();
        if (!plugins.length) {
            await react("📦");
            return m.reply(theme.build([
                { type: 'title', text: 'قـائـمـة الـبـلـوقـنـات' },
                { type: 'divider' },
                { type: 'info', text: 'لا توجد بلوقنات حالياً.' }
            ]));
        }

        const sections = [
            { type: 'title', text: 'قـائـمـة الـبـلـوقـنـات' },
            { type: 'divider' }
        ];

        plugins.forEach((f, i) => {
            sections.push({ type: 'line', text: `${i + 1}. ${f.replace(".js", "")}` });
        });

        sections.push({ type: 'divider' });
        sections.push({ type: 'info', label: 'المجموع', value: `${plugins.length} بلوقن` });

        await react("📦");
        return m.reply(theme.build(sections));
    }

    // ⭐ حذف
    if (/^(حذف|delete|del|remove)$/i.test(action)) {
        const nameArg = args.slice(1).join(" ").trim();
        if (!nameArg) return m.reply(theme.build([
            { type: 'title', text: 'حـذف بـلـوقـن' },
            { type: 'divider' },
            { type: 'info', label: 'الاستخدام', value: `${usedPrefix}بلوقن حذف <اسم>` }
        ]));

        const foundFile = findPlugin(nameArg);
        if (!foundFile) {
            await react("❌");
            return m.reply(theme.build([
                { type: 'title', text: 'خـطـأ في النظام' },
                { type: 'divider' },
                { type: 'error', text: `الملف "${nameArg}" غير موجود` }
            ]));
        }

        const filePath = path.join(pluginsDir, foundFile);
        const code = fs.readFileSync(filePath, "utf-8");
        const fileSize = (code.length / 1024).toFixed(2);
        const lineCount = code.split('\n').length;

        fs.unlinkSync(filePath);
        if (global.plugins?.[foundFile]) delete global.plugins[foundFile];

        await react("🗑️");
        return m.reply(theme.build([
            { type: 'title', text: 'تـم الـحـذف بنجاح' },
            { type: 'divider' },
            { type: 'info', label: 'الملف', value: foundFile },
            { type: 'info', label: 'الحجم', value: `${fileSize} KB` },
            { type: 'info', label: 'الأسطر', value: `${lineCount} سطر` }
        ]));
    }

    // ⭐ إضافة
    if (/^(اضف|اضافه|اضافة|add)$/i.test(action)) {
        const quoted = m.quoted;
        if (!quoted) {
            await react("❌");
            return m.reply(theme.build([
                { type: 'title', text: 'خـطـأ في الإضافة' },
                { type: 'divider' },
                { type: 'error', text: 'يرجى الرد على رسالة تحتوي على كود أو ملف البلوقن.' }
            ]));
        }

        let code = "";
        let fileName = "";

        const docMsg = quoted.message?.documentMessage || quoted.message?.documentWithCaptionMessage?.message?.documentMessage || null;

        if (docMsg) {
            let buffer;
            try { buffer = await quoted.download(); } catch {
                try {
                    const stream = await downloadContentFromMessage(docMsg, "document");
                    const chunks = [];
                    for await (const c of stream) chunks.push(c);
                    buffer = Buffer.concat(chunks);
                } catch (e) {
                    await react("❌");
                    return m.reply(theme.build([
                        { type: 'title', text: 'خـطـأ التحميل' },
                        { type: 'divider' },
                        { type: 'error', text: `فشل تحميل الملف: ${e.message}` }
                    ]));
                }
            }
            const baseName = (docMsg.fileName || `plugin_${Date.now()}`).replace(/\.js$/i, "");
            fileName = `${baseName}.js`;
            code = buffer.toString("utf-8");
        } else {
            code = quoted.text || quoted.body || "";
            if (!code.trim()) {
                await react("❌");
                return m.reply(theme.build([
                    { type: 'title', text: 'خـطـأ في المحتوى' },
                    { type: 'divider' },
                    { type: 'error', text: 'الرسالة لا تحتوي على أي كود.' }
                ]));
            }

            let extractedName = null;

            const cmdMatch1 = code.match(/handler\.command\s*=\s*\/\^\(?([^)\/|\\s]+)/);
            if (cmdMatch1) extractedName = cmdMatch1[1].trim();

            if (!extractedName) {
                const cmdMatch2 = code.match(/handler\.command\s*=\s*\[['"`]([^'"`]+)['"`]/);
                if (cmdMatch2) extractedName = cmdMatch2[1].trim();
            }

            if (!extractedName) {
                const fileMatch = code.match(/\/\/\s*(?:plugins|commands)\/([a-zA-Z0-9_\u0600-\u06FF-]+)\.js/);
                if (fileMatch) extractedName = fileMatch[1].trim();
            }

            if (!extractedName) {
                extractedName = `plugin_${Date.now().toString(36)}`;
            }

            fileName = `${extractedName}.js`;
        }

        const savePath = path.join(pluginsDir, fileName);
        const isEdit = fs.existsSync(savePath);
        fs.writeFileSync(savePath, code, "utf-8");

        const fileSize = (code.length / 1024).toFixed(2);
        const lineCount = code.split('\n').length;

        await react("✅");
        return m.reply(theme.build([
            { type: 'title', text: isEdit ? 'تـم التعديل بنجاح' : 'تـم الإضافة بنجاح' },
            { type: 'divider' },
            { type: 'info', label: 'الملف', value: fileName },
            { type: 'info', label: 'الحجم', value: `${fileSize} KB` },
            { type: 'info', label: 'الأسطر', value: `${lineCount} سطر` }
        ]));
    }

    // القائمة الافتراضية
    await react("📦");
    return m.reply(theme.build([
        { type: 'title', text: 'إدارة الـبـلـوقـنـات' },
        { type: 'divider' },
        { type: 'info', label: 'لست', value: 'عرض قائمة البلوقنات' },
        { type: 'info', label: 'عرض', value: 'عرض كود ملف معين' },
        { type: 'info', label: 'اضف', value: 'إضافة أو تعديل بلوقن جديد' },
        { type: 'info', label: 'حذف', value: 'حذف بلوقن من البوت' }
    ]));
};

handler.help = ["بلوقن"];
handler.tags = ["owner"];
handler.command = /^(بلوقن|plugin|plugins)$/i;
handler.owner = true;

export default handler;
