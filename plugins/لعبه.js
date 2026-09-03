// plugins/game-rps-simple.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - لعبة حجر/ورق/مقص التفاعلية 🪨📄✂️🔥

let cooldowns = {};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '🎮', key: m.key } });

        // التحقق من فترة الانتظار (Cooldown) لمدة 3 ثواني
        if (cooldowns[m.sender] && cooldowns[m.sender] > Date.now()) {
            let remainingTime = Math.ceil((cooldowns[m.sender] - Date.now()) / 1000);
            return m.reply(`> 👑 *ITACHI & JOKER: "مهلة وقت"*\n> \n> ⏳ انتظر ${remainingTime} ثانية قبل اللعب مرة أخرى.`);
        }

        // تنظيف الاختيار أو النص المدخل
        let userChoice = text ? text.trim().toLowerCase() : '';

        // إذا لم يختار المستخدم شيء، قم بإرسال رسالة ترحيبية مع الأزرار التفاعلية
        const validChoices = ['حجر', 'ورق', 'مقص'];
        if (!validChoices.includes(userChoice)) {
            // فحص إذا كان هناك زر تم الضغط عليه عبر الـ Button Response
            if (m.msg && m.msg.selectedButtonId) {
                userChoice = m.msg.selectedButtonId.toLowerCase();
            } else if (m.msg && m.msg.nativeFlowResponseMessage) {
                try {
                    const data = JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson);
                    userChoice = (data.id || '').toLowerCase();
                } catch (e) {}
            }
        }

        if (!validChoices.includes(userChoice)) {
            // إرسال قائمة أزرار تفاعلية للمستخدم
            const buttons = [
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🪨 حجر', id: 'حجر' }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📄 ورق', id: 'ورق' }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✂️ مقص', id: 'مقص' }) }
            ];

            const messageContent = {
                text: `👑 *[ ساحة التحدي السيبراني: حجر 🪨 ورق 📄 مقص ✂️ ]* 👑\n\n> 🎯 أهلاً بك في لعبة التحدي الكبرى!\n> 👇 اختر أحد العناصر أدناه أو اكتبه مباشرة:\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
                footer: 'ITACHI & JOKER AI System',
                buttons: buttons,
                headerType: 1
            };

            return await conn.sendMessage(m.chat, messageContent, { quoted: m });
        }

        // اختيار البوت العشوائي
        const choices = ['حجر', 'ورق', 'مقص'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        let result = '';
        if (userChoice === botChoice) {
            result = 'تعادل 🤝';
        } else if (
            (userChoice === 'حجر' && botChoice === 'مقص') ||
            (userChoice === 'مقص' && botChoice === 'ورق') ||
            (userChoice === 'ورق' && botChoice === 'حجر')
        ) {
            result = 'فوز 🎉';
        } else {
            result = 'خسارة 😢';
        }

        let title = result === 'فوز 🎉' ? 'انتصار ساحق!' : (result === 'خسارة 😢' ? 'هزيمة منسحقة!' : 'تعادل بطولي!');

        let msg = `👑 *[ نتيجة المعركة: ${title} ]* 👑\n\n` +
                  `👤 *اختيارك:* ${userChoice}\n` +
                  `🤖 *اختيار إيتاشي:* ${botChoice}\n\n` +
                  `🏁 *النتيجة النهائية:* ${result}\n\n` +
                  `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

        await conn.sendMessage(m.chat, { text: msg }, { quoted: m });

        // تعيين وقت التبريد (3 ثواني)
        cooldowns[m.sender] = Date.now() + 3000;

    } catch (err) {
        console.error('[ITACHI-Game Error]:', err);
        m.reply(`> 👑 *ITACHI & JOKER: "خطأ في اللعبة"*\n> \n> ⚠️ حدث خطأ أثناء تشغيل اللعبة.`);
    }
};

handler.help = ['لعبه', 'حجر', 'ورق', 'مقص'];
handler.tags = ['game'];
handler.command = /^(لعبه|لعبة|حجر|ورق|مقص|rps)$/i;

export default handler;
