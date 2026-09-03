// plugins/getbot.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - النسخة الاحتياطية الخارقة للبوت 📦⚡

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import archiver from 'archiver';
import { theme } from '../core/theme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handler = async (m, { conn, isOwner }) => {
    // التحقق من الصلاحية (المطور فقط)
    if (!isOwner) {
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🔒 صـلاحـيـة مـرفـوضـة' },
                { type: 'subtitle', text: '⚡ هذا الأمر مخصص للمطور الأسطوري 𝐈𝐭𝐚𝐜𝐡𝐢 فقط' }
            ])
        }, { quoted: m });
        return;
    }

    // معلومات القناة الرسمية لإرفاقها مع الردود
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

    try {
        const botFolderPath = path.join(__dirname, '../');
        const zipFilePath = path.join(__dirname, '../Itachi_Joker_Script.zip');

        if (!fs.existsSync(botFolderPath)) {
            await conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '❌ خـطـأ فـادح' },
                    { type: 'error', text: 'مجلد البوت الأساسي غير موجود!' },
                    { type: 'divider' },
                    { type: 'info', label: 'المسار', value: botFolderPath }
                ]),
                ...channelContext
            }, { quoted: m });
            return;
        }

        let initialMessage = await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '📦 سـكـريـبـت 𝐈𝐭𝐚𝐜𝐡𝐢 | 𝑱𝑶𝑲𝑬𝑹' },
                { type: 'divider' },
                { type: 'line', text: '⚡ جاري ضغط ملفات السكربت بسرعة البرق...' }
            ]),
            ...channelContext
        }, { quoted: m });

        // حذف أي أرشيف قديم لو وجد
        if (fs.existsSync(zipFilePath)) {
            try { fs.unlinkSync(zipFilePath); } catch {}
        }

        // إنشاء ملف الـ ZIP بأقصى سرعة ضغط
        const sizeMB = await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', { zlib: { level: 6 } }); // مستوى متوازن للسرعة والكفاءة

            output.on('close', () => {
                const calculatedSize = (archive.pointer() / 1024 / 1024).toFixed(2);
                resolve(calculatedSize);
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);

            // ضغط السكربت كاملاً مع استثناء الملفات الكبيرة غير الضرورية
            archive.glob('**/*', {
                cwd: botFolderPath,
                ignore: [
                    'node_modules/**',
                    '.npm/**',
                    'JadiBots/**',
                    'GataJadiBot/**',
                    'tmp/**',
                    '*.zip',
                    '.git/**',
                    'auth_info_baileys/**',
                    'session/**'
                ]
            });

            archive.finalize();
        });

        // تحديث الرسالة بعد انتهاء الضغط السريع
        let sendingMessage = await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '📤 جـاري تـسـلـيـم الـسـكـريـبـت' },
                { type: 'success', text: 'تم ضغط السكربت بنجاح خارق' },
                { type: 'info', label: '📁 حجم الملف', value: `${sizeMB} MB` },
                { type: 'divider' },
                { type: 'line', text: '⏳ جاري إرسال الملف إليك الآن...' }
            ]),
            edit: initialMessage.key,
            ...channelContext
        }, { quoted: m });

        try {
            // إرسال الملف للمطور بصيغة مستند جاهز للتحميل
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(zipFilePath),
                mimetype: 'application/zip',
                fileName: '⚡ 𝐈𝐭𝐚𝐜𝐡𝐢♞ 𝑱𝑶𝑲𝑬𝑹 - Full Script.zip',
                caption: `> ⚡ *[ 𝐈𝐭𝐚𝐜𝐡𝐢 | 𝑱𝑶𝑲𝑬𝑹 - SYSTEM BACKUP ]*
> 
> ✅ تم سحب سكربت البوت كاملاً بنجاح!
> 📊 الحجم الكلي: ${sizeMB} MB
> 
> ▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
            }, { quoted: m });

            // حذف الملف من الخادم بعد الإرسال للحفاظ على المساحة
            fs.unlink(zipFilePath, async (err) => {
                if (!err) {
                    await conn.sendMessage(m.chat, {
                        text: theme.build([
                            { type: 'title', text: '✅ تـم الـتـنـفـيـذ بـنـجـاح' },
                            { type: 'success', text: 'تم إرسال السكربت وحذف النسخة المؤقتة من السيرفر بأمان' },
                            { type: 'divider' },
                            { type: 'line', text: '▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                        ]),
                        edit: sendingMessage.key,
                        ...channelContext
                    }, { quoted: m });
                }
            });

        } catch (sendErr) {
            await conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '❌ فـشـل الإرسـال' },
                    { type: 'error', text: sendErr.message },
                    { type: 'divider' },
                    { type: 'info', label: '💡 السبب المحتمل', value: 'الملف كبير جداً على قيود واتساب' }
                ]),
                edit: sendingMessage.key,
                ...channelContext
            }, { quoted: m });

            try { fs.unlinkSync(zipFilePath); } catch {}
        }

    } catch (err) {
        console.error('Itachi Script Backup Error:', err);
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ غـيـر مـتـوقـع' },
                { type: 'error', text: err.message }
            ]),
            ...channelContext
        }, { quoted: m });
    }
};

handler.help = ['سكربتي'];
handler.tags = ['owner'];
handler.command = /^(سكربتي|getbot|نسخه|سكربت)$/i;
handler.owner = true;

export default handler;
