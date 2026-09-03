// plugins/ai-helper.js
// ملف مساعد - مش أمر، بس بيتم استيراده من الأوامر التانية

import axios from 'axios'
import { randomUUID } from 'crypto'

// ══════════════════════════════════════════
//  OverChat API - Claude Opus 4 مجاناً!
// ══════════════════════════════════════════
export async function askOverChat(prompt, systemPrompt = '', model = 'anthropic/claude-opus-4-6') {

  const deviceUUID = randomUUID()
  const chatId = randomUUID()
  const msgId = randomUUID()

  const messages = []

  if (systemPrompt) {
    messages.push({
      id: randomUUID(),
      role: 'system',
      content: systemPrompt
    })
  }

  messages.push({
    id: msgId,
    role: 'user',
    content: prompt
  })

  // ─── تحديد الـ persona حسب الموديل ────
  let personaId = 'claude-opus-4-6-landing'
  if (model.includes('gpt')) personaId = 'gpt-4o-landing'
  else if (model.includes('gemini')) personaId = 'gemini-2.5-pro-landing'
  else if (model.includes('claude')) personaId = 'claude-opus-4-6-landing'

  const payload = {
    chatId,
    model,
    messages,
    personaId,
    stream: true,
    temperature: 0.5
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K)',
    'Content-Type': 'application/json',
    'x-device-uuid': deviceUUID,
    'x-device-platform': 'web',
    'x-device-version': '1.0.44',
    'origin': 'https://overchat.ai',
    'referer': 'https://overchat.ai/',
    'accept-language': 'ar-EG,ar;q=0.8'
  }

  const response = await axios.post(
    'https://api.overchat.ai/v1/chat/completions',
    payload,
    {
      headers,
      responseType: 'stream',
      timeout: 120000
    }
  )

  // ─── قراءة الـ Stream (SSE) ────────────
  return new Promise((resolve, reject) => {
    let fullText = ''
    let buffer = ''

    response.data.on('data', (chunk) => {
      buffer += chunk.toString('utf-8')

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (!trimmed.startsWith('data: ')) continue

        const content = trimmed.slice(6)
        if (content === '[DONE]') continue

        try {
          const data = JSON.parse(content)
          const text = data?.choices?.[0]?.delta?.content || ''
          fullText += text
        } catch {}
      }
    })

    response.data.on('end', () => {
      if (fullText.trim()) {
        resolve(fullText.trim())
      } else {
        reject(new Error('الرد فاضي'))
      }
    })

    response.data.on('error', (err) => {
      if (fullText.trim()) {
        resolve(fullText.trim())
      } else {
        reject(err)
      }
    })

    // timeout
    setTimeout(() => {
      if (fullText.trim()) {
        resolve(fullText.trim())
      } else {
        reject(new Error('انتهت المهلة'))
      }
    }, 120000)
  })
}

// ══════════════════════════════════════════
//  Groq API - للصور والردود السريعة
// ══════════════════════════════════════════
export async function askGroq(messages, model = 'llama-3.1-8b-instant', maxTokens = 2048) {
  const GROQ_KEY = global.APIs?.groq || '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'

  const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model,
    messages,
    max_tokens: maxTokens,
    temperature: 0.5
  }, {
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 60000
  })

  return res.data?.choices?.[0]?.message?.content || ''
}

// ══════════════════════════════════════════
//  تحميل الميديا من الرسالة
// ══════════════════════════════════════════
export async function downloadMedia(m) {
  const quoted = m.quoted || null

  const isImage = (m.mtype === 'imageMessage') || (quoted?.mtype === 'imageMessage')
  const isSticker = (m.mtype === 'stickerMessage') || (quoted?.mtype === 'stickerMessage')

  if (!isImage && !isSticker) return null

  try {
    const mediaMsg = (m.mtype === 'imageMessage' || m.mtype === 'stickerMessage') ? m : quoted
    const media = await mediaMsg.download()
    return media.toString('base64')
  } catch {
    return null
  }
}