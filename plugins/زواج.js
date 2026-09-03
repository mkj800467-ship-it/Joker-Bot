// plugins/zawgny.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام الزواج الذكي والأكثر ابتكاراً 💍

import fetch from 'node-fetch';
import { theme } from '../core/theme.js';

let toM = a => '@' + a.split('@')[0];

// قائمة الأسماء الشائعة للذكور (عربي/إنجليزي) لتحديد الجندر بدقة
const maleNames = [
    'atachi', 'itachi', 'joker', 'omar', 'yousef', 'marwan', 'mohamed', 'ahmed', 'ali', 'hassan',
    'hussein', 'ibrahim', 'mahmoud', 'khaled', 'amr', 'tarek', 'ziad', 'saif', 'abdallah', 'abdelrahman',
    'mostafa', 'hamza', 'bilal', 'osama', 'rami', 'faisal', 'sultan', 'fahd', 'nasser', 'john', 'david',
    'michael', 'alex', 'carlos', 'james', 'robert', 'william', 'richard', 'jose', 'thomas', 'charles',
    'ابراهيم', 'محمد', 'احمد', 'علي', 'حسين', 'حسن', 'يوسف', 'عمر', 'مروان', 'خالد', 'محمود', 'عبدالرحمن',
    'عبدالله', 'مصطفى', 'حمزة', 'بلال', 'اسامة', 'رامي', 'فيصل', 'سلطان', 'فهد', 'نايف', 'زياد', 'سيف',
    'تامر', 'باسم', 'سعيد', 'جمال', 'سامي', 'وائل', 'أسامة', 'معاذ', 'يزيد', 'الأتاتشي', 'الجوكر'
];

// قائمة الأسماء الشائعة للإناث (عربي/إنجليزي)
const femaleNames = [
    'sahar', 'samar', 'fatma', 'fatima', 'aisha', 'khadija', 'mariam', 'maryam', 'nour', 'reem',
    'jana', 'salma', 'hala', 'yasmin', 'yasemeen', 'rana', 'dina', 'aya', 'menna', 'nada', 'sara',
    'sarah', 'asmaa', 'hagar', 'habiba', 'farida', 'malak', 'hadeer', 'shorouk', 'latifa', 'zainab',
    'jessica', 'emily', 'sarah', 'hannah', 'elizabeth', 'anna', 'emma', 'olivia', 'sophia', 'mia',
    'فاطمة', 'عائشة', 'خديجة', 'مريم', 'نور', 'ريم', 'جنا', 'سلمى', 'هالة', 'ياسمين', 'رنا', 'دينا',
    'آية', 'منة', 'ندى', 'سارة', 'أسماء', 'هاجر', 'حبيبة', 'فريدة', 'ملك', 'هدير', 'شروق', 'لطيفة',
    'زينب', 'سحر', 'سمر', 'بتول', 'دعاء', 'روان', 'شهد', 'حلا', 'لين', 'آيلا', 'الجوهرة', 'ملكة'
];

// دالة لتخمين جنس العضو بناءً على اسمه الحقيقي أو الملقب به في الواتساب
function guessGender(name = '') {
    const cleanName = name.toLowerCase().replace(/[^a-z\u0600-\u06ff]/gi, ' ').trim();
    const words = cleanName.split(/\s+/);

    let maleScore = 0;
    let femaleScore = 0;

    for (let word of words) {
        if (maleNames.some(m => word.includes(m))) maleScore++;
        if (femaleNames.some(f => word.includes(f))) femaleScore++;
    }

    if (maleScore > femaleScore) return 'male';
    if (femaleScore > maleScore) return 'female';
    return Math.random() > 0.5 ? 'male' : 'female';
}

let handler = async (m, { conn, text, usedPrefix, command, groupMetadata }) => {
    try {
        let ps = [];
        let cleanJid = (jid) => {
            if (!jid) return '';
            return jid.includes('@') ? jid : jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        };

        if (groupMetadata?.participants) {
            ps = groupMetadata.participants.map(v => v.id || v.phoneNumber).filter(Boolean);
        } else {
            try {
                const meta = await conn.groupMetadata(m.chat);
                ps = meta.participants.map(v => v.id || v.phoneNumber).filter(Boolean);
            } catch (e) {
                return m.reply(theme.build([
                    { type: 'title', text: '❄️ 𝐈𝐭𝐚𝐜𝐡𝐢: "خطأ في جلب بيانات المجموعة"' },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                ]));
            }
        }

        ps = [...new Set(ps.map(cleanJid))].filter(jid => jid.endsWith('@s.whatsapp.net'));

        if (ps.length < 2) {
            return m.reply(theme.build([
                { type: 'title', text: '❄️ 𝐈𝐭𝐚𝐜𝐡𝐢: "عدد غير كافٍ"' },
                { type: 'warning', text: 'المجموعة تحتاج إلى عضوين على الأقل لإتمام المراسم' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]));
        }

        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerNumbers = global.owner ? global.owner.map(o => o[0] + '@s.whatsapp.net') : [botNumber];
        const isOwnerTrigger = ownerNumbers.includes(m.sender);

        let groom, bride;
        let isDeveloperWedding = false;
        let imageUrl = 'https://i.postimg.cc/65BvqxY4/c8896314f29c6ae8d3c47a536f528116.jpg';

        if (command === 'زواج') {
            if (isOwnerTrigger) {
                isDeveloperWedding = true;
                imageUrl = 'https://i.postimg.cc/QCmV1V0T/51b2b26347f062abd2eee5a4a6a6089b.jpg';
                groom = m.sender;

                let femaleCandidates = [];
                for (let jid of ps) {
                    if (jid === groom) continue;
                    let memberName = '';
                    try { memberName = await conn.getName(jid); } catch (e) {}
                    if (guessGender(memberName) === 'female') {
                        femaleCandidates.push(jid);
                    }
                }

                if (femaleCandidates.length > 0) {
                    bride = femaleCandidates[Math.floor(Math.random() * femaleCandidates.length)];
                } else {
                    let others = ps.filter(j => j !== groom);
                    bride = others[Math.floor(Math.random() * others.length)];
                }
            } else {
                let males = [];
                let females = [];

                for (let jid of ps) {
                    let memberName = '';
                    try { memberName = await conn.getName(jid); } catch (e) {}
                    if (guessGender(memberName) === 'male') {
                        males.push(jid);
                    } else {
                        females.push(jid);
                    }
                }

                if (males.length > 0 && females.length > 0) {
                    groom = males[Math.floor(Math.random() * males.length)];
                    do {
                        bride = females[Math.floor(Math.random() * females.length)];
                    } while (bride === groom && females.length > 1);
                } else {
                    groom = ps[Math.floor(Math.random() * ps.length)];
                    do {
                        bride = ps[Math.floor(Math.random() * ps.length)];
                    } while (bride === groom);
                }
            }
        } else if (command === 'زوجني' || command === 'تزوج') {
            groom = m.sender;

            if (isOwnerTrigger) {
                isDeveloperWedding = true;
                imageUrl = 'https://i.postimg.cc/QCmV1V0T/51b2b26347f062abd2eee5a4a6a6089b.jpg';

                let femaleCandidates = [];
                for (let jid of ps) {
                    if (jid === groom) continue;
                    let memberName = '';
                    try { memberName = await conn.getName(jid); } catch (e) {}
                    if (guessGender(memberName) === 'female') {
                        femaleCandidates.push(jid);
                    }
                }

                if (femaleCandidates.length > 0) {
                    bride = femaleCandidates[Math.floor(Math.random() * femaleCandidates.length)];
                } else {
                    let others = ps.filter(j => j !== groom);
                    bride = others[Math.floor(Math.random() * others.length)];
                }
            } else {
                let candidatePool = ps.filter(jid => jid !== groom);
                let females = [];

                for (let jid of candidatePool) {
                    let memberName = '';
                    try { memberName = await conn.getName(jid); } catch (e) {}
                    if (guessGender(memberName) === 'female') {
                        females.push(jid);
                    }
                }

                if (females.length > 0) {
                    bride = females[Math.floor(Math.random() * females.length)];
                } else {
                    bride = candidatePool[Math.floor(Math.random() * candidatePool.length)];
                }
            }
        }

        let imageBuffer;
        try {
            const imageRes = await fetch(imageUrl);
            imageBuffer = Buffer.from(await imageRes.arrayBuffer());
        } catch {
            const fallbackRes = await fetch('https://i.postimg.cc/65BvqxY4/c8896314f29c6ae8d3c47a536f528116.jpg');
            imageBuffer = Buffer.from(await fallbackRes.arrayBuffer());
        }

        let captionText = '';
        if (isDeveloperWedding) {
            captionText = theme.build([
                { type: 'title', text: '💍 𝐈𝐭𝐚𝐜𝐡𝐢: "مراسم الزواج الملكي الإمبراطوري"' },
                { type: 'divider' },
                { type: 'info', label: '👑 العريس (المطور)', value: toM(groom) },
                { type: 'info', label: '👩‍💼 العروس المحظوظة', value: toM(bride) },
                { type: 'divider' },
                { type: 'line', text: '🍀 أنت محظوظة لأن مطوري اختارك زوجةً له!' },
                { type: 'line', text: '🎉 ألف مبروك لعروسة الإمبراطورية!' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]);
        } else {
            captionText = theme.build([
                { type: 'title', text: '💍 𝐈𝐭𝐚𝐜𝐡𝐢: "إعلان ارتباط رسمي"' },
                { type: 'divider' },
                { type: 'info', label: '👨‍💼 العريس', value: toM(groom) },
                { type: 'info', label: '👩‍💼 العروس', value: toM(bride) },
                { type: 'divider' },
                { type: 'line', text: '🎉 ألف مبروك للمحاربين العرسان!' },
                { type: 'line', text: '⚔️ كل واحد يجهز عتاده لحفلة الزفاف' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]);
        }

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: captionText,
            mentions: [groom, bride]
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '💍', key: m.key } });

    } catch (err) {
        console.error('[Itachi-Zawgny] error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(theme.build([
            { type: 'title', text: '❄️ 𝐈𝐭𝐚𝐜𝐡𝐢: "فشلت مهمة الارتباط"' },
            { type: 'subtitle', text: err.message || 'خطأ غير معروف في معالجة الزواج' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));
    }
};

handler.help = ['زوجني', 'زواج'];
handler.tags = ['entertainment'];
handler.command = /^(زوجني|زواج|تزوج)$/i;
handler.group = true;

export default handler;
