// plugins/حلل.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - وحدة فحص وتحليل الروابط السيبرانية 🛡️

import axios from 'axios';
import { theme } from "../core/theme.js";

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        await m.react('✍️');
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '🛡️ 𝐈𝐭𝐚𝐜𝐡𝐢: وحدة فحص الروابط الذكية' },
            { type: 'subtitle', text: 'تحليل البصمات السيبرانية واكتشاف روابط التصيد' },
            { type: 'divider' },
            { type: 'info', label: '📌 الاستخدام', value: `${usedPrefix + command} <الرابط>` },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]), m);
    }

    // تنقية الرابط للتأكد من صحته
    let targetUrl = text.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        const parsedUrl = new URL(targetUrl);
        const domain = parsedUrl.hostname;

        await m.react('⏳');
        await m.reply(theme.build([
            { type: 'title', text: '🔍 𝐈𝐭𝐚𝐜𝐡𝐢: جاري تحليل الرابط' },
            { type: 'subtitle', text: `فحص النطاق البصري وسجلات البصمة السيبرانية...` },
            { type: 'divider' },
            { type: 'info', label: '🌐 الهدف', value: domain },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]));

        let isThreat = false;
        let threatReport = [];
        let securityScore = 100;

        // 1. فحص امتدادات الخطر الخفية (مثل .an إن وجدت كنوع من التمويه أو الامتدادات الشاذة)
        if (domain.endsWith('.an') || targetUrl.includes('.an/') || targetUrl.endsWith('.an')) {
            isThreat = true;
            securityScore -= 50;
            threatReport.push("⚠️ تحذير خطير: الهدف ينتهي بامتداد مشبوه (.an) قد يشير إلى ملفات تنفيذية خفية أو بصمات هجومية.");
        }

        // 2. قائمة الكلمات المفتاحية للتصيد والصفقات الوهمية والهجمات
        const phishingKeywords = [
            "login", "verify", "account", "bank", "secure", "update", "free", "gift", 
            "bonus", "earn", "crypto", "bitcoin", "pubg", "whatsapp", "instagram", 
            "facebook", "password", "username", "confirm", "alert", "security", 
            "unlock", "claim", "win", "reward", "admin", "panel", "support"
        ];

        let matchedKeywords = [];
        for (let word of phishingKeywords) {
            if (targetUrl.toLowerCase().includes(word)) {
                matchedKeywords.push(word);
            }
        }

        if (matchedKeywords.length > 0) {
            isThreat = true;
            securityScore -= (matchedKeywords.length * 15);
            threatReport.push(`كلمات تصيد مكتشفة: (${matchedKeywords.join(', ')})`);
        }

        // 3. فحص الروابط المختصرة (تمويه المخترقين)
        const shorteners = [
            "bit.ly", "tinyurl", "cutt.ly", "t.co", "goo.gl", "shorturl", 
            "is.gd", "ow.ly", "buff.ly", "adf.ly", "shorte.st", "bc.vc", "u.to"
        ];

        if (shorteners.some(s => domain.includes(s))) {
            isThreat = true;
            securityScore -= 25;
            threatReport.push("رابط مختصر (يخفي الوجهة الأصلية الحقيقية - نمط هندسة اجتماعية).");
        }

        // 4. فحص عناوين IP المباشرة بدلاً من النطاقات
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
            isThreat = true;
            securityScore -= 40;
            threatReport.push("يستخدم عنوان IP مباشر (تجنب لشراء نطاق رسمي واستضافة هجومية خفية).");
        }

        // 5. فحص النطاقات الفرعية المتعددة (Sub-domain Hijacking / Phishing)
        if (domain.split('.').length > 3) {
            isThreat = true;
            securityScore -= 20;
            threatReport.push(`نطاق فرعي متعدد معقد (${domain}) - مؤشر تصيد محتمل.`);
        }

        // 6. فحص الاستجابة الحية للهدف عبر Axios مع محاكاة متصفح أمان حقيقي
        let targetStatus = "غير متاح";
        let serverInfo = "غير معروف";
        let finalRedirectUrl = targetUrl;

        try {
            const res = await axios.get(targetUrl, {
                timeout: 8000,
                maxRedirects: 5,
                validateStatus: () => true,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            targetStatus = `${res.status} ${res.statusText || 'OK'}`;
            serverInfo = res.headers['server'] || 'خادم غير مصرح بالإفصاح عن هويته';
            finalRedirectUrl = res.request?.res?.responseUrl || targetUrl;

            // إذا تم توجيه الرابط لموقع آخر مختلف جذرياً
            if (finalRedirectUrl !== targetUrl) {
                isThreat = true;
                securityScore -= 20;
                threatReport.push(`إعادة توجيه مخفية إلى وجهة مغايرة (${new URL(finalRedirectUrl).hostname})`);
            }

            if (res.status >= 400) {
                isThreat = true;
                securityScore -= 10;
                threatReport.push(`الهدف لا يستجيب ببروتوكول سليم (HTTP ${res.status})`);
            }
        } catch (e) {
            targetStatus = "محظور / مغلق / خادم وهمي";
            serverInfo = "غير متاح (جدار حماية مفعّل أو الهدف غير متصل)";
            isThreat = true;
            securityScore -= 15;
            threatReport.push("فشل الاتصال المباشر بالهدف - قد يحتوي على دروع حماية مخفية أو خادم وهمي.");
        }

        if (securityScore < 0) securityScore = 0;

        await m.react(isThreat ? '⚠️' : '✅');

        const verdictTitle = isThreat ? '⚠️ 𝐈𝐭𝐚𝐜𝐡𝐢: تم اكتشاف تهديد سيبراني!' : '✅ 𝐈𝐭𝐚𝐜𝐡𝐢: الرابط يبدو آمناً ونظيفاً';

        let reportMessage = theme.build([
            { type: 'title', text: verdictTitle },
            { type: 'subtitle', text: isThreat ? 'الرابط يحتوي على بصمات مريبة أو أدوات اختراق خفية' : 'المسار الرقمي مستقر ولا توجد مؤشرات خطر' },
            { type: 'divider' },
            { type: 'info', label: '🌐 النطاق المفحوص', value: domain },
            { type: 'info', label: '📶 حالة الخادم', value: targetStatus },
            { type: 'info', label: '⚙️ نوع السيرفر', value: serverInfo },
            { type: 'info', label: '🛡️ مؤشر الأمان', value: `${securityScore}% / 100%` },
            { type: 'divider' },
            { type: 'info', label: '🚨 التقرير التحليلي', value: isThreat ? threatReport.join(' | ') : 'لا توجد أي بصمات هجومية أو روابط مختصرة مشبوهة.' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]);

        conn.reply(m.chat, reportMessage, m);

    } catch (err) {
        await m.react('❌');
        console.error("[2B-LINKSCAN] فشل الفحص الشامل:", err);
        conn.reply(m.chat, theme.build([
            { type: 'title', text: '❌ خطأ في النظام السيبراني' },
            { type: 'subtitle', text: 'حدث خطأ أثناء إجراء التحليلات البرمجية للرابط' },
            { type: 'divider' },
            { type: 'line', text: '💡 تأكد من كتابة الرابط بشكل صحيح مع بروتوكول http أو https' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]), m);
    }
};

handler.help = ['فحص <رابط>'];
handler.tags = ['tools'];
handler.command = /^(حلل|فحص_رابط|تحليل|checklink|scan|فحص)$/i;

export default handler;
