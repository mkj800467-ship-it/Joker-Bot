// plugins/qaweni.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - أمر ترقية وحش النظام للمطور 👑🔥

let handler = async (m, { conn }) => {
    // تحديد المطورين المعتمدين (JID و LID الخاص بك)
    const allowedOwners = [
        '249916221538@s.whatsapp.net',
        '14904274759837@lid'
    ];

    // استخراج رقم/معرف المرسل الحقيقي مع تحويل LID إن وجد
    let senderJid = m.sender;
    try {
        if (conn.convertLidToRealJid) {
            senderJid = await conn.convertLidToRealJid(m.sender, m.chat);
        }
    } catch (e) {}

    const isOwner = allowedOwners.includes(m.sender) || allowedOwners.includes(senderJid) || allowedOwners.some(owner => m.sender.includes(owner.split('@')[0]));

    // التحقق من هوية المطور
    if (!isOwner) {
        return m.reply(
            `> 👑 *ITACHI & JOKER: "منطقة المحظورين"*\n> \n> ❌ هذا الأمر مخصص للمطور السيبراني المطلق فقط!`
        );
    }

    // التأكد من وجود قاعدة بيانات المستخدم
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};

    let user = global.db.data.users[m.sender];

    // منح قيم المطور المطلقة
    user.money = 999999999999;
    user.exp = 999999999;
    user.level = 9999;
    user.limit = Infinity;
    user.premium = true;
    user.role = '👑 الـمـطـوّر الـمـطـلـق ⧼ 𝐈𝐭𝐚𝐜𝐡𝐢 & 𝑱𝑶𝑲𝑬𝑹 ⧽';

    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });

    // رسالة التأكيد السيبرانية
    m.reply(
        `👑 *[ النظام السيبراني: تـم الـتـرقـيـة ]* 👑\n\n` +
        `> ✅ تم تفعيل وضع الهيمنة المطلقة على حسابك!\n\n` +
        `💰 *النقود:* غير محدود\n` +
        `🧪 *الخبرة:* أقصى حد\n` +
        `📈 *المستوى:* 9999\n` +
        `⭐ *الرتبة:* المطور المطلق\n\n` +
        `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
    );
};

handler.help = ['قويني'];
handler.tags = ['owner'];
handler.command = /^(قويني|لفل_اب|powerup|ترقية|تطوير)$/i;
handler.owner = true;

export default handler;
