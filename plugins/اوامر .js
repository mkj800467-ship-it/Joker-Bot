// plugins/menu.js
// ✧ THE JOKER & ITACHI - القائمة الرئيسية 🃏                                           
import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'                                                                            
import { performance } from 'perf_hooks'
import fetch from 'node-fetch'
import { theme } from '../core/theme.js';

const menuCooldown = {}

let handler = async (m, { conn, usedPrefix: _p, isROwner, isOwner }) => {                   
    try {
        let old = performance.now()                                                             
        let neww = performance.now()
        let speed = (neww - old).toFixed(4)

        const user = await conn.getName(m.sender)
        const fecha = new Date().toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'                   
        })
        const hora = new Date().toLocaleTimeString('en-US', { hour12: true })           
        
        await conn.sendMessage(m.chat, { react: { text: '⛓️', key: m.key } });
                                                                                                
        const imageUrl = 'https://i.postimg.cc/63rHT1WC/b5da44e5fe5cc53d59a77ad99fb205a8.jpg';
        const imageRes = await fetch(imageUrl);                                                 
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
        const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });
                                                                                                
        let menuText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤                                                        
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 👤 ╎ الاسـم: ${user}
 ┠ 📱 ╎ الـرقـم: ${m.sender.split('@')[0]}                                               
 ┠ ⚡ ╎ البينج: ${speed}ms                                                               
 ┠ ⏱️ ╎ التشغيل: ${await getUptime()}
 ┠ 📅 ╎ التاريخ: ${fecha}                                                                
 ┠ ⏰ ╎ الوقت: ${hora}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`;                                                                                                                                                                 
        
        let sectionRows = [
            { "title": "📂 الأقـسـام الـعـامـة", "description": "📂 عـرض الاقـسـام والـخـدْمـات الـعـامـة", "id": ".الاقسام" },
            { "title": "👮‍♂️ قـسـم الأدْمـن", "description": "🔱 عـرض اوامـر الادارة والـتـحـكـم فـي الـجـروب🔱", "id": ".ق1" },                                                                                 
            { "title": "🎨 قـسـم الاسـتـيـكـر", "description": "🎨 عـرض اوامـر صـنـع وتـصـمـيـم الـاسـتـيـكـرات🎨", "id": ".ق2" },                                                                             
            { "title": "🎮 قـسـم الألـعـاب", "description": "🎮 عـرض اوامـر الـعـلـاب والـمـسـابـقـات والـتـسـلـيـه🎮", "id": ".ق3" },
            { "title": "📥 قـسـم الـتـحـمـيـل", "description": "📥 عـرض اوامـر تـحـمـيـل الـفـيـديـوهـات والـصـوتـيـات📥", "id": ".ق4" },                                                                             
            { "title": "🧰 قـسـم الأدوات", "description": "🧰 عـرض الادوات والـمـسـاعـدات الـذكـيـه لـلـبـوت🧰", "id": ".ق5" },                                                                                 
            { "title": "📚 قـسـم الـمـانـجـا", "description": "📚 عـرض اوامـر وبـحـث فـصـول الـمـانـجـا والـأنـيـمـي📚", "id": ".ق6" },
            { "title": "🤖 الـذكـاء الاصـطـنـاعـي", "description": "🤖 عـرض اوامـر الـذكـاء الاصـطـنـاعـي والـمـحـادثـات🤖", "id": ".ق7" },                                                                         
            { "title": "🎌 قـسـم الـنـقـابـات", "description": "🎌 عـرض اوامـر وانـظـمـة الـنـقـابـات والـعـشـائـر🎌", "id": ".ق8" },
            { "title": "🖼️ قـسـم الـصـور", "description": "🖼️ عـرض اوامـر الـصـور والـخـلـفـيـات والـتـصـامـيـم🖼️", "id": ".ق9" },
            { "title": "⛄ قـسـم الـتـسـلـيـة", "description": "🥳 عـرض اوامـر التــسلـيـه والتــرفيــه 🥳", "id": ".ق10" },
            { "title": "🏦 قـسـم الـبـنـك والـقـلاع", "description": "💰 عـرض اوامـر الـبـنـك والـقـلاع والـرصـيـد (ق12) 💰", "id": ".ق12" }
        ];                                                                              
        
        if (isROwner || isOwner) {                                                                  
            sectionRows.push({ "title": "👑 قـسـم الـمـطـور", "description": "👑 عـرض اوامـر والـصـلاحـيـات الخاصه بـالـمـطـور👑", "id": ".ق11" });                                                                
        }                                                                                                                                                                               
        
        const channel = "https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A"
        const developerNumber = "249916221538"                                                  
        const developerContact = `https://wa.me/${developerNumber}`

        const nativeFlowPayload = {                                                                 
            body: {                                                                                     
                text: menuText,
                contextInfo: {
                    mentionedJid: [m.sender]
                }
            },
            footer: { text: '👑 THE JOKER & ITACHI ♞' },                                            
            header: {
                hasMediaAttachment: true,
                subtitle: '🃏 القائمة الرئيسية',
                imageMessage: media.imageMessage
            },                                                                                      
            nativeFlowMessage: {                                                                        
                buttons: [
                    {                                                                                           
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: "📂 عــرض الاقــســام الـرئـيـسـيـة",                                            
                            sections: [                                                                                 
                                {
                                    title: "اخــتــر الــقــســم الـمـطـلـوب",                                              
                                    rows: sectionRows
                                }
                            ]
                        })                                                                                  
                    },
                    {                                                                                           
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: "🤖 مـعـلـومـات المـطـور",                                                
                            id: ".المطور"                                                                       
                        })                                                                                  
                    },                                                                                      
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({                                                          
                            display_text: "📢 الــقــنــاة الــرَّســمــيــة",                                        
                            url: channel
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({                                                          
                            display_text: "👑 تــواصــل مــع الــمــطــور",
                            url: developerContact
                        })
                    }
                ],                                                                                      
                messageParamsJson: JSON.stringify({                                                         
                    limited_time_offer: {
                        text: `⚡ ${speed}ms`,                                                                  
                        url: developerContact,
                        copy_code: `المطور: +${developerNumber}`,
                        expiration_time: Date.now() + 86400000                                              
                    },                                                                                      
                    bottom_sheet: {
                        in_thread_buttons_limit: 1,                                                             
                        divider_indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 999],
                        list_title: "🔱 إخـتـار مــن الاتـي 🔱",
                        button_title: "▻ عــرض جــمــيــع الأقــســام  ⚡"
                    },                                                                                      
                    tap_target_configuration: {
                        description: "Powered by THE JOKER & ITACHI",                                           
                        canonical_url: developerContact,
                        domain: "https://ryzobot.vercel.app",
                        button_index: 0                                                                     
                    }                                                                                   
                })
            }                                                                                   
        };

        const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload);                                                                                      
        const fkontak = await makeFkontak();
        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: interactiveMessage
                }                                                                                   
            }
        }, {
            userJid: conn.user.jid,
            quoted: fkontak
        });                                                                                                                                                                             
        
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                                                                                                
        const now = Date.now()
        if (!menuCooldown[m.chat] || (now - menuCooldown[m.chat]) > 10 * 60 * 1000) {
            menuCooldown[m.chat] = now                                                              
            try {                                                                                       
                await conn.sendMessage(m.chat, {
                    video: { url: 'https://videotourl.com/videos/1787940461838-8d920852-a9ce-4914-8cd4-d4191d730c7a.mp4' },
                    mimetype: 'video/mp4',
                    ptv: true
                }, { quoted: m });                                                                  
            } catch (videoErr) {}
        }                                                                               
    } catch (e) {
        console.error('[Joker-Menu] Error:', e);                                            
    }                                                                                   
}

async function getUptime() {
    let totalSeconds = process.uptime()
    let hours = Math.floor(totalSeconds / 3600)                                             
    let minutes = Math.floor((totalSeconds % 3600) / 60)                                    
    let seconds = Math.floor(totalSeconds % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

async function makeFkontak() {                                                              
    try {
        const res = await fetch('https://i.postimg.cc/44LYbcgP/c702752d7ac05584bc0c40e923c7b07d.jpg');
        const thumb2 = Buffer.from(await res.arrayBuffer());
        return {                                                                                    
            key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'JOKER' },
            message: { locationMessage: { name: '🃏 THE JOKER & ITACHI ♞', jpegThumbnail: thumb2 } },
            participant: '0@s.whatsapp.net'                                                     
        };                                                                                  
    } catch {                                                                                   
        return undefined;
    }                                                                                   
}

handler.help = ['menu']
handler.tags = ['main']                                                                 
handler.command = ['الاوامر', 'menu', 'اوامر', 'القائمة', 'منيو']

export default handler;
