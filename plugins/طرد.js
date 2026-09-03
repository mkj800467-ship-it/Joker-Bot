// plugins/kick.js
// ✧ UCHIHA - Uchiha Itachi - أمر الطرد 🚫

import { theme } from '../core/theme.js';      
import baileys from '@whiskeysockets/baileys';

const generateWAMessageFromContent = baileys.generateWAMessageFromContent || baileys.default?.generateWAMessageFromContent;
const proto = baileys.proto || baileys.default?.proto;

let handler = async (m, { conn }) => {         
  const allowedOwners = [
      '249916221538@s.whatsapp.net',
      '14904274759837@lid'
  ];

  let user = m.mentionedJid?.[0] || m.quoted?.sender;                                                                                          

  if (!user) {                                     
      const menuText = theme.build([          
          { type: 'title', text: '🚫 إتاتشي: "وحدة الطرد والعدالة"' },
          { type: 'subtitle', text: 'قم بمنشن الهدف المراد طرده من عالم الوهم' },
          { type: 'divider' },
          { type: 'line', text: '⚔️ مثال: .طرد @user' },                                                 
          { type: 'line', text: '⚔️ أو قم بالرد على رسالة الهدف لتسليط الشارينگان عليه' }                                     
      ]);

      const interactiveMessage = {
          body: { text: menuText },
          footer: { text: '⛩️ Uchiha Itachi - Sharingan Kick ⛩️' },
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

  // فحص حماية المطور بدقة تامة (JID أو LID)
  const isDeveloper = allowedOwners.some(dev => {               
      let devClean = dev.replace(/[^0-9]/g, '');     
      let userClean = user.replace(/[^0-9]/g, '');
      return userClean === devClean;               
  });

  if (isDeveloper) {                            
      const warningText = theme.build([
          { type: 'title', text: '⚠️ إتاتشي: "العقاب الإلهي"' },      
          { type: 'subtitle', text: 'أيها الأحمق.. أتحاول طرد مهندسي الأسطوري ومبتكر هذا الوجود "إتاتشي"؟' },
          { type: 'line', text: '⚡ سيعاقبك التسوكيومي فوراً ويطردك أنت من الواقع!' },
          { type: 'divider' },
          { type: 'line', text: '📢 *زوروا قناتنا الرسمية لتعرفوا حجم خطيئتكم*' }
      ]);

      const interactiveMessage = {
          body: { text: warningText },
          footer: { text: '⛩️ Uchiha Itachi - Ultimate Protection ⛩️' },
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

  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

  const successText = theme.build([
      { type: 'title', text: '✅ إتاتشي: "تم تنفيذ العدالة المطلقة"' },                                      
      { type: 'divider' },                           
      { type: 'info', label: '🎯 الهدف المنفي', value: '@' + user.split('@')[0] },
      { type: 'info', label: '👤 المنفذ', value: '@' + m.sender.split('@')[0] },                    
      { type: 'divider' },                           
      { type: 'line', text: '🚫 تم إبعاد الهدف إلى عالم النسيان بنجاح' }                                     
  ]);

  const interactiveMessage = {
      body: { text: successText },
      footer: { text: '⛩️ Uchiha Itachi - Sharingan Kick ⛩️' },
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

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });      
};

handler.help = ['kick @user'];
handler.tags = ['group'];                       
handler.command = ['kick', 'طرد'];              
handler.admin = true;                           
handler.group = true;
handler.botAdmin = true;

export default handler;
