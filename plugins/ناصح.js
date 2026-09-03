// plugins/advice.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - حكم ونقاط تحفيزية أسطورية 💡✨

import { theme } from '../core/theme.js';

let handler = async (m, { conn }) => {
    await conn.sendMessage(m.chat, { react: { text: '💡', key: m.key } });

    let advice = pickRandom(global.epicAdvice);

    // إعدادات القناة الرسمية بنفس الطريقة المطلوبة
    const channelContext = {
        contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363429074575231@newsletter',
                newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                serverMessageId: 970
            }
        }
    };

    let caption = theme.build([
        { type: 'title', text: '💡 حـكـمـة و نـصـيـحـة الـيـوم' },
        { type: 'divider' },
        { type: 'line', text: `✍️ ${advice}` },
        { type: 'divider' },
        { type: 'line', text: '▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]);

    await conn.sendMessage(m.chat, { text: caption, ...channelContext }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['نصايح', 'نصيحة', 'حكم'];
handler.tags = ['fun', 'tools'];
handler.command = /^(نصايح|نصيحة|حكم)$/i;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

global.epicAdvice = [
    "لا تبحث عن القبول في أعين الجاهلين، كفاك فخراً أنك تعرف من أنت وماذا تستحق.",
    "النجاح الحقيقي ليس في عدم السقوط أبداً، بل في النهوض بقوة بعد كل ضربة تلقتها.",
    "الاستثمار في عقلك وتطوير ذاتك هو الأرباح الوحيدة التي لا يمكن لأحد أن يسرقها منك.",
    "احذر أن تدير ظهرك لمن أضاء لك عتمة الطريق، فالوفاء عملة نادرة في زمن المصالح.",
    "اصنع لنفساً هيبة لا تُهزم، واجعل أفعالك تتحدث نيابة عن صمتك.",
    "التجربة والخطأ هما حجر الأساس لبناء شخصية قوية قادرة على مجابهة عواصف الحياة.",
    "كن كالطود الشامخ، لا تهزك ريح النقد الفاشل ولا تؤثر فيك آراء الحاقدين.",
    "الوقت الذي تقضيه في بناء مستقبلك اليوم، سيوفر عليك سنوات من الندم غداً.",
    "لا تعتذر قط عن تميزك، فمن لم يستطيع الوصول لمستواك سيلجأ دائماً لمحاولة إحباطك.",
    "الهدوء هو أسلوب الملوك، والرد الأقوى على السفهاء هو التجاهل التام.",
    "تعلم كيف تقرأ ما بين السطور، فليس كل ما يلمع ذهباً ولا كل ناصح محب.",
    "حافظ على نقاء قلبك وقوة عقلك، فهما سلاحك الأبدي في عالم متقلب.",
    "الكلمة الطيبة صدقة، ولكن الموقف الحازم هو الفيصل الذي يحدد قيمتك عند الآخرين.",
    "لا تندم على فرصة ذهبت، بل اجعل منها درساً لقنص فرص أروع وأعظم.",
    "اجعل طموحاتك تتجاوز حدود الممكن، فالمستحيل يصنعه الرجال العظماء فقط."
];
