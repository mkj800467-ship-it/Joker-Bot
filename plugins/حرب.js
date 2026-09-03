// plugins/gaza-war.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - مهمة غزة 🇵🇸

import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function msToTime(duration) {
        let minutes = Math.floor((duration / (1000 * 60)) % 60);
        let seconds = Math.floor((duration / 1000) % 60);
        return `${minutes} دقيقة و ${seconds} ثانية`;
    }

    const PalestineAchievements = [
        'أنت محارب شجاع لقد قتلت 10 من الجنود الصهاينة',
        'أنت بطل فلسطيني تاريخي لقد أنقذت 100 فلسطيني من الموت',
        'أنت تدير شركة للطعام الصحي، وتحول الطعام إلى أهل غزة',
        'أنت جاسوس على الصهاينة، استمر في التجسس من أجل غزة',
        'أنت تعمل كجندي في حرب غزة، وتواجه التحديات بشجاعتك',
        'أنت محقق خوارق، تكتشف الأسرار التي يخفيها الصهاينة',
        'أنت تقوم بتدريب أهل غزة لمقاومة الجنود الإسرائيليين',
        'ستصبح أفضل حداد في غزة، تصنع الأسلحة القوية للمقاومة',
        'أنت طبيب رائع في غزة تعالج المصابين دون خوف',
        'أنت مزارع شجاع في غزة لأنك تطعم أهلها الصامدين',
        'أنت الآن مجند في كتائب القسام للدفاع عن أرضك',
        'أنت تقوم بتطوير الأسلحة لكتائب القسام بشجاعة فائقة',
        'أنت فنان أسطوري تبهر أهل غزة لتخفف عنهم آلامهم',
        'أنت شجاع لأنك حميت طفلاً فلسطينياً من الغارات',
        'أنت تدير مستشفى ميداني في غزة بكل بسالة',
        'أنت جاسوس دولي، تتسلل لجمع معلومات حساسة لصالح المقاومة',
        'أنت عالم قوي، تبتكر اختراعات دفاعية لكتائب القسام',
        'أنت تدافع عن الشعب الفلسطيني وتقود العمليات الميدانية بشجاعة',
        'أنت محترف في فن التخفي وتنفيذ المهام السرية خلف خطوط العدو',
        'أنت طاهٍ مشهور، تُعد أطباقاً تُسعد العائلات النازحة في غزة'
    ];

    // تأمين البيانات
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
    let user = global.db.data.users[m.sender];
    if (!user.lastPalestine) user.lastPalestine = 0;
    if (!user.doller) user.doller = 0;

    const cooldown = 600000; // 10 دقائق
    const time = user.lastPalestine + cooldown;

    // فحص وقت الانتظار
    if (Date.now() < time) {
        const remainingTime = msToTime(time - Date.now());
        return m.reply(theme.build([
            { type: 'title', text: '🇵🇸 تنبيه: الاستشفاء جارٍ' },
            { type: 'subtitle', text: 'لا زلت في فترة الاستشفاء أيها المحارب' },
            { type: 'divider' },
            { type: 'info', label: '⚔️ العودة للميدان بعد', value: remainingTime },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));
    }

    const reward = Math.floor(Math.random() * 5000) + 1000;
    const achievement = pickRandom(PalestineAchievements);

    user.doller += reward;
    user.lastPalestine = Date.now();

    // بناء الرسالة التفاعلية
    const interactiveMessage = {
        body: proto.Message.InteractiveMessage.Body.create({
            text: theme.build([
                { type: 'title', text: '🇵🇸 تقرير مهمة غزة' },
                { type: 'divider' },
                { type: 'line', text: `🏹 ${achievement}` },
                { type: 'divider' },
                { type: 'info', label: '🎖️ تعويض المهمة', value: `${reward} دولار` },
                { type: 'info', label: '💰 الخزينة الإجمالية', value: `${user.doller} دولار` },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ])
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
            text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ'
        }),
        header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🛡️ مواصلة المهمة",
                        id: `${usedPrefix + command}`
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "💰 فحص الخزينة",
                        id: `${usedPrefix}رصيدي`
                    })
                }
            ]
        })
    };

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: { interactiveMessage }
        }
    }, { userJid: conn.user.id, quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '🇵🇸', key: m.key } });
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ['غزة'];
handler.tags = ['economy'];
handler.command = /^(غزة|حرب|العدوان|فلسطين|المقاومة)$/i;

export default handler;

