// plugins/hidetag.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام المنشن المخفي السيبراني 👥🔥

import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, '> 👑 *ITACHI & JOKER: "تنبيه"* \n> 🔮 هذا الأمر يعمل حصرياً داخل المجموعات السيبرانية!');
    }

    // تحديد المطورين المعتمدين (JID و LID الخاص بك)
    const allowedOwners = [
        '249916221538@s.whatsapp.net',
        '14904274759837@lid'
    ];

    const senderJid = m.sender;
    const isAuthorizedOwner = allowedOwners.includes(senderJid) || isOwner;

    if (!isAdmin && !isAuthorizedOwner) {
        return conn.reply(m.chat, '> 👑 *ITACHI & JOKER: "صلاحيات سيادية"* \n> 🔮 هذا الأمر مخصص للمشرفين والمطورين فقط!');
    }

    let fakegif = {
        key: { participant: `0@s.whatsapp.net`, remoteJid: m.chat },
        message: { 
            videoMessage: { 
                title: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ', 
                h: 'Hmm', 
                seconds: '99999', 
                gifPlayback: 'true', 
                caption: '👑 ITACHI & JOKER - النظام السيبراني 👑', 
                jpegThumbnail: true 
            } 
        }
    }

    let users = participants.map(u => conn.decodeJid(u.id))                                       
    let q = m.quoted ? m.quoted : m || m.text      
    let c = m.quoted ? await m.getQuotedObj() : m.msg || m.text
    
    let msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' || c }}, { quoted: fakegif, userJid: conn.user.id }), text || q.text, conn.user.jid, { mentions: users })
    
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })                   
}

handler.help = ['hidetag', 'مخفي']
handler.tags = ['group', 'owner']                       
handler.command = /^(hidetag|notificar|مخفي)$/i
handler.group = true
handler.admin = true

export default handler;
