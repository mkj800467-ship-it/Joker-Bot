// plugins/ai-analyze.js
// ✧ 2B - YoRHa Unit No.2 Type B - تحليل الكود بالذكاء الاصطناعي 🤖                           
import fs from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import axios from 'axios'
import { theme } from '../core/theme.js'

// مفتاح API الخاص بك (تأكد من صحته أو استبداله بمتغير بيئي آمن)
const GEMINI_API_KEY = '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'             
// تم تحديث الرابط ليتوافق مع الموديل المعتمد والمستقر
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

let handler = async (m, { conn, usedPrefix, command }) => {
    const react = async (emoji) => {
        try { 
            await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) 
        } catch {}
    }

    if (!m.quoted) {
        await react('❌')
        return m.reply(theme.build([
            { type: 'title', text: '🤖 2B: "وحدة تحليل الكود"' },
            { type: 'divider' },
            { type: 'line', text: '🔮 *تحليل الكود بالذكاء الاصطناعي*' },
            { type: 'divider' },
            { type: 'info', label: '⚔️ الاستخدام', value: '' },
            { type: 'line', text: '• رد على رسالة فيها كود JavaScript' },
            { type: 'line', text: `• اكتب: ${usedPrefix + command}` },
            { type: 'divider' },
            { type: 'info', label: '🛡️ المميزات', value: '' },
            { type: 'line', text: '• تحليل ذكي للأخطاء' },
            { type: 'line', text: '• اقتراحات للإصلاح' },
            { type: 'line', text: '• شرح المشاكل بالعربية' }
        ]))
    }

    let code = m.quoted.text || ''
    if (!code) {
        await react('❌')
        return m.reply(theme.build([
            { type: 'title', text: '❄️ 2B: "خطأ"' },
            { type: 'warning', text: 'لا يوجد كود في الرسالة المقتبسة' }
        ]))
    }

    // تنظيف الكود بشكل دقيق ومنظم
    code = code.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim()

    if (code.length < 5) {
        await react('❌')
        return m.reply(theme.build([
            { type: 'title', text: '❄️ 2B: "خطأ"' },
            { type: 'warning', text: 'الكود قصير جداً أو غير صالح' }
        ]))
    }

    await react('🤖')
    
    // إرسال إشعار للمستخدم بأن العملية قيد التنفيذ
    await m.reply(theme.build([
        { type: 'title', text: '🤖 2B: "جاري تحليل الكود"' },
        { type: 'line', text: '⏳ يرجى الانتظار، جاري فحص الأكواد...' }
    ]))

    try {
        // تجهيز البرومبت الاحترافي للذكاء الاصطناعي
        const prompt = `أنت خبير مبرمج في لغة JavaScript ونظام بوتات واتساب. قم بتحليل الكود التالي وأجب عن الآتي بدقة واحترافية:
1. هل يوجد أخطاء نحوية (Syntax Errors) أو أخطاء في الـ Import/Export؟ إذا وجد، اوضحها وكيفية إصلاحها.
2. هل يوجد أخطاء منطقية أو ثغرات أمنية محتملة أثناء التشغيل (Runtime Errors)؟
3. اقتراحات لتحسين الأداء أو هيكل الكود (إن وجدت).
4. شرح مبسط ومختصر لما يفعله الكود.

الكود المراد تحليله:
\`\`\`javascript
${code}
\`\`\`
أجب باللغة العربية، وكن منظماً.`

        // إرسال الطلب عبر Axios مع ضبط الرابط والمفتاح بالشكل الصحيح
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            },
            { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000 
            }
        )

        const analysis = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم الحصول على تحليل'

        await react('✅')

        // بناء تقرير النتيجة بطريقة آمنة بدون استخدام أساليب تجمع النصوص العشوائية بشكل خاطئ
        let displayCode = code.length > 200 ? code.slice(0, 200) + '\n... (تم الاختصار)' : code;
        
        let resultMsg = theme.build([
            { type: 'title', text: '🤖 2B: "تقرير تحليل الكود"' },
            { type: 'divider' },
            { type: 'info', label: '📝 الكود المختصر', value: '' },
            { type: 'line', text: '```js\n' + displayCode + '\n```' },
            { type: 'divider' },
            { type: 'info', label: '🔍 نتيجة التحليل والشرح', value: '' },
            { type: 'line', text: analysis }
        ]);

        // التحقق من طول الرسالة لكي لا تتجاوز الحد الأقصى المسموح به في واتساب (4096 حرف)
        if (resultMsg.length > 4096) {
            resultMsg = resultMsg.slice(0, 4000) + '\n\n... (تم قطع النص لطوله الزائد)';
        }

        await m.reply(resultMsg)

    } catch (err) {
        await react('❌')
        console.error('[2B-AI] Error details:', err.response?.data || err.message)
        
        // استخراج رسالة الخطأ بدقة للمستخدم
        let errorMsg = err.response?.data?.error?.message || err.message || 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي';
        
        m.reply(theme.build([
            { type: 'title', text: '❄️ 2B: "فشل تحليل AI"' },
            { type: 'warning', text: errorMsg },
            { type: 'divider' },
            { type: 'line', text: '💡 تأكد من صحة مفتاح الـ API أو جرب مرة أخرى لاحقاً.' }
        ]))
    }
}

handler.help = ['تحليل']
handler.tags = ['ai']
handler.command = /^(تحليل|ai|حلل|analyze)$/i

export default handler
