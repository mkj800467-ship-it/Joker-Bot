// config.js                                                                  
// ✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ - Configuration ✧                                                                                                          

import { unwatchFile, watchFile } from 'fs'                                   
import chalk from 'chalk'                                                     
import { fileURLToPath } from 'url'
import fs from 'fs'                                                           
import fetch from 'node-fetch'                                                
import axios from 'axios'                                                     
import moment from 'moment-timezone'                                                                                                                        

//حط lid بتاعك من امر lid                                                     
global.owner = ['14904274759837',  '249916221538']                                                                                                          

// ========== المطورين ==========                                             
global.mods = []                                                              
global.prems = []                                                                                                                                           

// ========== إعدادات البوت ==========                                        
global.baileys = '@whiskeysockets/baileys'                                    
global.botName = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'                                                
global.botNameShort = '𝐉𝐊ᜰ'                                                   
global.watermark = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'                                                                                                                            

// ========== المكتبات العامة ==========                                      
global.fetch = fetch                                                          
global.axios = axios                                                          
global.moment = moment                                                        
global.fs = fs                                                                                                                                              

// ========== إعدادات البوت ==========                                        
global.packname = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'                                               
global.author = '𝐈𝐭𝐚𝐜𝐡𝐢♞'                                                     

global.multiplier = 85                                                                                                                                      

// اكتب رقمك هنا الي عايز تربط بي البوت من دون + او فواصل                     
global.botNumberCode = "249916221538"

// ========== القنوات ==========                                              
global.ch = {                                                                   
    ch1: '120363429074575231@newsletter',                                         
    ch2: '120363429074575231@newsletter'                                        
}                                                                                                                                                           

// روابط السوشيال ميديا بتاعتي                                               
global.yt = 'https://youtube.com/@youssf-f8i?si=WUZBmyryEpziKXS_'             
global.ig = 'https://www.instagram.com/go24.q?igsh=MWdoYWtjZWNnMGhncQ=='      
global.md = 'https://github.com/PROTOTYPE/PROTOTYPE-MD'                       
global.fb = 'https://www.facebook.com/groups/prototype'                       
global.tk = 'https://www.tiktok.com/@5trua5?_r=1&_t=ZS-97C5LgOJgX6'           
global.paypal = 'https://paypal.me/Prototype'                                 
global.soporteGB = 'https://whatsapp.com/channel/0029Vb8We2VKrWR2Z9E5KQ1P'                                                                                  

// صور الخطأ                                                                        
global.dfailPool = [                                                              
    'https://file.garden/aauvg01sjleV_ic1/1199e9965d7836cf5f5ff6ab0463e451.jpg',
    'https://file.garden/aauvg01sjleV_ic1/7b0ed3c48e859d22e73b62093148b22b.jpg',
    'https://file.garden/aauvg01sjleV_ic1/6c936c420d5d23007ac874f498219280.jpg',                                                                                
    'https://file.garden/aauvg01sjleV_ic1/9e5af83aa668643f0bbef190f4786686.jpg',                                                                                
    'https://file.garden/aauvg01sjleV_ic1/9b893fe97b907333aa4e7e285e424768.jpg',                                                                                
    'https://file.garden/aauvg01sjleV_ic1/180da285198e9226b2eb8adec0e670b1.jpg',                                                                                
    'https://file.garden/aauvg01sjleV_ic1/0bc2d63e8467867b9a56a31ce1077b10.jpg',                                                                                
    'https://file.garden/aauvg01sjleV_ic1/ecca80ffa8c0081f4f117a28f3c5b009.jpg',                                                                                
    'https://file.garden/aauvg01sjleV_ic1/c5384b18150e07c58ca969282dafcfb2.jpg'                                                                             
]                                                                             

// ========== رسائل dfail ==========                                          
global.dfailMessages = {                                                          
    rowner: '🚫 *الامر دا لمطوري اتاتشي فقط*',
    owner: '🚫 *الامر دا لمطوري اتاتشي فقط*',                                                     
    mods: '☠️ *الامر دا للذين يملكون صلاحيه فقط*',                                                      
    premium: '⭐ *الامر دا للمشتركين فقط*',                                                  
    group: '👥 *الامر دا للجروبات*',                                                     
    private: '📱 *الامر دا يعمل في الخاص*',                                                      
    admin: '👑 *الامر دا للادمنز فقط*',
    botAdmin: '🤖 *لازم اكون ادمن عشان انفذ الامر دا*',                                               
    unreg: '📝 *غير مسجل*',                                                       
    restrict: '⚠️ *الامر دا اتاتشي معطلو حاليا*'                                               
}                                                                             

// ========== زخرفة dfail ==========                                          
global.dfailTitle = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'                                              
global.dfailDesc = '⧼ 𝐈𝐭𝐚𝐜𝐡𝐢♞ ⧽'
global.dfailUrl = 'https://github.com/mkj800467-ship-it'                                                                                                            

// ========== مراقبة الملف ==========                                         
let file = fileURLToPath(import.meta.url)                                     
watchFile(file, () => {                                                         
    unwatchFile(file)                                                             
    console.log(chalk.redBright("Update 'settings.js'"))
    import(`${file}?update=${Date.now()}`)                                      
})

