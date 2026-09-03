// plugins/game-capitals.js                    
// ✧ UCHIHA - Uchiha Itachi - لعبة العواصم 🏙️

import { theme } from '../core/theme.js';
import fs from 'fs';                           
import { join } from 'path';                   
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';                                                               

// جلب أسئلة العواصم                           
const capitalsPath = join(process.cwd(), 'src', 'game', 'عواصم.json');                        
let capitals = [];

try {                                              
    const data = fs.readFileSync(capitalsPath, 'utf8');
    capitals = JSON.parse(data);
} catch (err) {                                    
    console.error('[Itachi-Capitals] خطأ في تحميل الأسئلة:', err);
    capitals = [];                             
}

function getRandomQuestion() {                     
    return capitals[Math.floor(Math.random() * capitals.length)];                             
}                                              

function getWrongAnswers(correctAnswer, count = 3) {                                              
    const wrong = [];
    const used = new Set();
    used.add(correctAnswer.toLowerCase());

    for (let q of capitals) {                          
        const ans = q.response;                        
        if (!used.has(ans.toLowerCase()) && ans !== correctAnswer && wrong.length < count) {              
            wrong.push(ans);                               
            used.add(ans.toLowerCase());               
        }                                          
    }

    const fallback = ['القاهرة', 'الرياض', 'دبي', 'بيروت', 'دمشق', 'بغداد', 'عمان', 'القدس'];     
    while (wrong.length < count) {                     
        const fb = fallback[Math.floor(Math.random() * fallback.length)];                             
        if (!used.has(fb.toLowerCase()) && fb !== correctAnswer) {                                        
            wrong.push(fb);
            used.add(fb.toLowerCase());
        }                                          
    }                                                                                             
    return wrong;                              
}

function shuffle(arr) {                            
    for (let i = arr.length - 1; i > 0; i--) {         
        const j = Math.floor(Math.random() * (i + 1));                                                
        [arr[i], arr[j]] = [arr[j], arr[i]];       
    }                                              
    return arr;                                
}                                                                                             

let handler = async (m, { conn }) => {                                                            
    if (!capitals.length) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '⛩️ إتاتشي: "قاعدة بيانات فارغة"' },                                        
            { type: 'warning', text: 'لا توجد أسئلة في قاعدة بيانات العواصم' }                        
        ]), m);                                    
    }                                          

    const q = getRandomQuestion();                 
    const correctAnswer = q.response;              
    const wrongAnswers = getWrongAnswers(correctAnswer, 3);                                       
    const allAnswers = [correctAnswer, ...wrongAnswers];                                          
    const shuffled = shuffle([...allAnswers]); 

    const timestamp = Date.now();                  
    const userId = m.sender.split('@')[0];     
    
    // 🔥 الـ ID بتاع الزر الصحيح
    const correctCmd = `عاصمه_صحيح_${userId}_${timestamp}`;                                   

    // حفظ السؤال                                  
    if (!global.db.data.users) global.db.data.users = {};                                         
    if (!global.db.data.users[m.sender]) {             
        global.db.data.users[m.sender] = {};
    }

    global.db.data.users[m.sender].currentCapital = {                                                 
        question: q.question,
        correctAnswer: correctAnswer,                  
        correctCmd: correctCmd,                        
        askedAt: timestamp                         
    };

    // بناء الأزرار الخاصة بالخيارات
    const buttons = shuffled.map(answer => {
        const isCorrect = answer === correctAnswer;
        const buttonCmd = isCorrect ? correctCmd : `عاصمه_خطأ_${userId}_${timestamp}_${answer.substring(0, 5)}`;
        return {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: answer.length > 35 ? answer.substring(0, 32) + '...' : answer,
                id: `.${buttonCmd}`
            })
        };
    });

    // إضافة زر القناة باستخدام الـ Jid والاسم المخصص
    buttons.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
            display_text: '📢 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
            url: 'https://whatsapp.com/channel/120363429074575231',
            merchant_url: 'https://whatsapp.com/channel/120363429074575231'
        })
    });

    const menuText = theme.build([                     
        { type: 'title', text: '🏙️ إتاتشي: "مهمة العواصم والوهم"' },                                              
        { type: 'spacer' },
        { type: 'line', text: `🔮 *${q.question}*` },                                                 
        { type: 'divider' },
        { type: 'info', label: '⏰ الوقت', value: '30 ثانية' },
        { type: 'info', label: '⭐ الجائزة', value: '100 نقطة' },                                     
        { type: 'spacer' },
        { type: 'line', text: '👁️ استعن بالشارينگان واختر العاصمة الصحيحة من أدناه' },
        { type: 'line', text: '📢 *زوروا قناتنا الرسمية للاطلاع على جديد التحديثات*' }
    ]);                                                                                           

    const interactiveMessage = {                       
        body: { text: menuText },                      
        footer: { text: '⛩️ Uchiha Itachi - Sharingan Capitals ⛩️' },                                          
        nativeFlowMessage: {                               
            buttons: buttons,                              
            messageParamsJson: JSON.stringify({                
                bottom_sheet: {
                    list_title: "🏙️ اختر العاصمة الصحيحة",
                    button_title: "▻ الخيارات ⚡"
                }
            })
        }                                          
    };

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {                                 
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)                                                      
            }
        }                                          }, { userJid: conn.user.jid, quoted: m });                                                    

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });                  

    // حذف السؤال بعد 30 ثانية
    setTimeout(async () => {                           
        const userData = global.db.data.users[m.sender];
        if (userData?.currentCapital && userData.currentCapital.askedAt === timestamp) {                  
            delete global.db.data.users[m.sender].currentCapital;                                         
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '⏰ إتاتشي: "انتهى وقت المهمة"' },                                         
                { type: 'line', text: 'استخدم .عاصمه لمهمة جديدة' }
            ]), m);                                    
        }
    }, 30000);                                 
};

// 🔥 معالج الأزرار
handler.before = async (m, { conn }) => {          
    if (!m.isCommand) return false;                
    if (!m.text) return false;

    const cmd = m.text.toLowerCase();                                                             

    if (cmd.startsWith('.عاصمه_صحيح_') || cmd.startsWith('.عاصمه_خطأ_')) {
        const userCapital = global.db.data.users[m.sender]?.currentCapital;                           
        if (!userCapital) {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '⛩️ إتاتشي: "لا توجد مهمة نشطة"' },                                         
                { type: 'line', text: 'استخدم .عاصمه لبدء مهمة جديدة' }                                   
            ]), m);                                        
            return true;
        }

        const isCorrect = cmd === `.${userCapital.correctCmd}`;                                                                                      

        if (isCorrect) {
            if (!global.db.data.users[m.sender].points) {
                global.db.data.users[m.sender].points = 0;
            }
            global.db.data.users[m.sender].points += 100;

            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '✅ إتاتشي: "إجابة صحيحة"' },
                { type: 'line', text: '🎉 لقد اخترقت الوهم بنجاح وأثبت بصيرتك! +100 نقطة' },
                { type: 'divider' },
                { type: 'info', label: 'العاصمة الصحيحة', value: userCapital.correctAnswer },
                { type: 'info', label: 'نقاطك', value: `${global.db.data.users[m.sender].points} نقطة` }                                                 
            ]), m);
        } else {
            await conn.reply(m.chat, theme.build([
                { type: 'title', text: '❌ إتاتشي: "إجابة خاطئة"' },
                { type: 'line', text: '👁️ لقد وقعت في الوهم، إجابتك غير صحيحة' },                                             
                { type: 'divider' },                           
                { type: 'info', label: 'العاصمة الصحيحة', value: userCapital.correctAnswer }              
            ]), m);                                    
        }

        delete global.db.data.users[m.sender].currentCapital;                                         
        return true;
    }                                                                                             
    return false;
};                                             

handler.command = ['عاصمه', 'عاصمة', 'capital'];                                              
handler.tags = ['game'];
handler.help = ['عاصمه'];

export default handler;
