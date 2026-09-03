// plugins/slap.js
// ✧ UCHIHA - Uchiha Itachi - أمر صفع 🎴

import { sticker } from "../Z/sticker.js";
import fetch from "node-fetch";                   
import { theme } from '../core/theme.js';
import baileys from '@whiskeysockets/baileys';

const generateWAMessageFromContent = baileys.generateWAMessageFromContent || baileys.default?.generateWAMessageFromContent;
const proto = baileys.proto || baileys.default?.proto;

let handler = async (m, { conn, args, usedPrefix, command }) => {                                       
    let who;

    if (m.isGroup) {                                      
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;                
    } else {
        who = m.chat;
    }                                                                                                   

    if (!who && m.isGroup) {
        await conn.sendMessage(m.chat, { react: { text: '✍️', key: m.key } });                             
        
        const warningText = theme.build([                          
            { type: 'title', text: '⛩️ إتاتشي: "العقاب المؤجل"' },
            { type: 'spacer' },                               
            { type: 'warning', text: 'قم بمنشن الشخص الذي تريد صفعه بالشارينگان' },
            { type: 'info', label: 'مثال', value: `${usedPrefix + command} @user` }
        ]);

        const interactiveMessage = {
            body: { text: warningText },
            footer: { text: '⛩️ Uchiha Itachi - Sharingan Slap ⛩️' },
            nativeFlowMessage: {
                buttons: [{
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                        copy_code: '120363429074575231@newsletter'
                    })
                }]
            }
        };

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
                }
            }
        }, { userJid: conn.user.jid, quoted: m });

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }                                                                                                   

    try {                                                 
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });                                                                                
        let name;                                         
        let name2 = await conn.getName(m.sender);

        if (who === m.chat) {                                 
            name = "البوت";                               
        } else {
            name = await conn.getName(who);               
        }                                                                                                   

        const imageUrl = 'https://file.garden/aauvg01sjleV_ic1/1e2aa53561775c82e3de6af8c8ffadc7.jpg';                                                                                                           
        const imgRes = await fetch(imageUrl);             
        const imgBuffer = await imgRes.buffer();                                                            
        
        let stiker = await sticker(imgBuffer, null, `${name2} صفع ${name}`, `⛩️ Uchiha Itachi - Sharingan`);

        await conn.sendMessage(m.chat, {                      
            sticker: stiker,
            contextInfo: {                                        
                forwardingScore: 200,                             
                isForwarded: true,                                
                mentionedJid: [who],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429074575231@newsletter',
                    newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                    serverMessageId: 1
                }
            }                                             
        }, { quoted: m });                        
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(theme.build([                           
            { type: 'error', text: '❌ حدث خطأ في تقنية الوهم أثناء الصفعة' },                                            
            { type: 'info', label: 'السبب', value: e.message || 'خطأ غير معروف' }
        ]));
    }
};

handler.help = ["صفع"];                           
handler.tags = ["fun"];                           
handler.command = /^(صفع|slap)$/i;                

export default handler;
