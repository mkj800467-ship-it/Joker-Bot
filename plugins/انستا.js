// plugins/instagram.js
// ✧ THE JOKER & ITACHI - Instagram Downloader 🃏

import { theme } from '../core/theme.js';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync, unlinkSync, statSync, chmodSync } from 'fs';
import os from 'os';

const execAsync = promisify(exec);

let ytDlpPath = null;
let isInstalling = false;
let installPromise = null;

function getPlatform() {
    const arch = os.arch();
    const platform = os.platform();

    const archMap = {
        'x64': 'amd64', 'x86_64': 'amd64', 'amd64': 'amd64',
        'arm64': 'arm64', 'aarch64': 'arm64',
        'armv7l': 'armv7l', 'armv6l': 'armv6l',
        'i386': 'i386', 'i686': 'i386', 'x86': 'i386'
    };

    return {
        arch: archMap[arch] || 'amd64',
        platform: platform === 'win32' ? 'windows' : platform === 'darwin' ? 'macos' : 'linux'
    };
}

async function autoInstallYTDLP(conn, chat) {
    if (isInstalling && installPromise) return installPromise;

    const { arch, platform } = getPlatform();
    const outputPath = join(process.cwd(), 'yt-dlp');

    if (existsSync(outputPath)) {
        try {
            await execAsync(`"${outputPath}" --version`, { timeout: 5000 });
            return outputPath;
        } catch {}
    }

    isInstalling = true;

    installPromise = (async () => {
        try {
            const installMsg = theme.build([
                { type: 'title', text: '🃏 تـحـمـيـل الـمـكـتـبـة' },
                { type: 'divider' },
                { type: 'line', text: 'المكتبة غير موجودة في الذاكرة، جاري التحميل من العدم...' },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            await conn.sendMessage(chat, { text: installMsg });

            try {
                const infoMsg = theme.build([
                    { type: 'title', text: '📥 جَـاري الـتـحـمـيـل' },
                    { type: 'divider' },
                    { type: 'info', label: '🖥️ النظام', value: platform },
                    { type: 'info', label: '🔧 المعالج', value: arch },
                    { type: 'divider' },
                    { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
                ]);
                await conn.sendMessage(chat, { text: infoMsg });

                const urls = {
                    linux: {
                        amd64: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux',
                        arm64: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_aarch64',
                        armv7l: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_armv7l'
                    },
                    macos: { default: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos' },
                    windows: { default: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' }
                };

                const url = urls[platform]?.[arch] || urls[platform]?.default ||
                           `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${platform === 'windows' ? '.exe' : ''}`;

                try { await execAsync(`rm -f "${outputPath}"`); } catch {}

                try {
                    await execAsync(`wget -q -O "${outputPath}" "${url}"`, { timeout: 120000 });
                } catch {
                    await execAsync(`curl -L -o "${outputPath}" "${url}"`, { timeout: 120000 });
                }

                if (existsSync(outputPath)) {
                    if (platform !== 'windows') chmodSync(outputPath, 0o755);
                    const size = (statSync(outputPath).size / 1048576).toFixed(2);

                    const successMsg = theme.build([
                        { type: 'title', text: '✅ تـم تـحـمـيـل الـمـكـتـبـة' },
                        { type: 'divider' },
                        { type: 'info', label: '📦 الحجم', value: `${size} MB` },
                        { type: 'info', label: '🔧 المعالج', value: arch },
                        { type: 'divider' },
                        { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
                    ]);
                    await conn.sendMessage(chat, { text: successMsg });
                    return outputPath;
                }
            } catch {}
        } catch {}

        return null;
    })().finally(() => {
        isInstalling = false;
    });

    return installPromise;
}

async function downloadInstagram(url, outputPath, conn, chat) {
    let bin = ytDlpPath;

    if (!bin) {
        bin = await autoInstallYTDLP(conn, chat);
        if (!bin) throw new Error('فشل تحميل المكتبة - جرب:\npip install yt-dlp');
        ytDlpPath = bin;
    }

    const cmd = `"${bin}" "${url}" -o "${outputPath}" -f "bestvideo+bestaudio/best" --merge-output-format mp4 --no-playlist --no-warnings`;

    await execAsync(cmd, { timeout: 180000 });

    if (!existsSync(outputPath)) throw new Error('الملف غير موجود');
    return outputPath;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }); } catch {}
    };

    if (!text) {
        await react('❌');
        const usageText = theme.build([
            { type: 'title', text: '🃏 تـحـمـيـل إنـسـتـقـرام' },
            { type: 'divider' },
            { type: 'info', label: 'الاستخدام', value: `${usedPrefix}${command} <رابط الفيديو>` },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        return conn.reply(m.chat, usageText, m);
    }

    if (!text.includes('instagram.com') && !text.includes('instagr.am')) {
        await react('❌');
        const errorText = theme.build([
            { type: 'title', text: '🃏 خـطـأ في الرابط' },
            { type: 'divider' },
            { type: 'error', text: 'الرابط المرسل ليس من إنستقرام.. الأقنعة لا تخدع العدم.' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        return conn.reply(m.chat, errorText, m);
    }

    await react('⏳');
    
    const loadingText = theme.build([
        { type: 'title', text: '🃏 جَـاري الـسـحـب' },
        { type: 'divider' },
        { type: 'line', text: 'جاري استخراج الفيديو من خيوط الإنستقرام...' },
        { type: 'divider' },
        { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
    ]);
    let statusMsg = await conn.reply(m.chat, loadingText, m);

    try {
        const outputPath = join(tmpdir(), `ig_${Date.now()}.mp4`);

        await downloadInstagram(text, outputPath, conn, m.chat);

        const fileSize = (statSync(outputPath).size / 1048576).toFixed(2);

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }); } catch {}

        const captionText = theme.build([
            { type: 'title', text: '✅ تـم الـتـحـمـيـل بـنـجـاح' },
            { type: 'divider' },
            { type: 'info', label: '📦 الحجم', value: `${fileSize} MB` },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        if (statSync(outputPath).size < 100 * 1048576) {
            await conn.sendMessage(m.chat, {
                video: { url: outputPath },
                caption: captionText
            }, { 
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
        } else {
            await conn.sendMessage(m.chat, {
                document: { url: outputPath },
                mimetype: 'video/mp4',
                fileName: `instagram_${Date.now()}.mp4`,
                caption: captionText
            }, { 
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
        }

        await react('✅');
        setTimeout(() => { try { unlinkSync(outputPath); } catch {} }, 5000);

    } catch (e) {
        console.error('[JOKER-IG]', e.message);
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }); } catch {}
        await react('❌');
        
        const failText = theme.build([
            { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
            { type: 'divider' },
            { type: 'error', text: e.message?.substring(0, 200) || 'حدث خطأ غير متوقع' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        await conn.reply(m.chat, failText, m);
    }
};

handler.command = /^(انستا|انستقرام|ig|instagram)$/i;
handler.help = ['انستا <رابط>'];
handler.tags = ['downloader'];

export default handler;
