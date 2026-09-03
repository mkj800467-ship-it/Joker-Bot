// plugins/يوتيوب.js
// ♡ Raiden Shogun - Plane of Euthymia - YouTube Audio Downloader 🎵

import { theme } from '../core/theme.js'
import axios from 'axios'
import crypto from 'crypto'
import { createWriteStream, existsSync, promises as fsPromises } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pipeline } from 'stream/promises'

const DOWNLOAD_TIMEOUT_MS = 180000

class SaveTube {
  constructor() {
    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
    this.m = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/
    this.is = axios.create({
      headers: {
        'content-type': 'application/json',
        'origin': 'https://yt.savetube.me',
        'user-agent': 'Mozilla/5.0 (Android 15; Mobile)'
      },
      timeout: DOWNLOAD_TIMEOUT_MS
    })
  }

  async decrypt(enc) {
    const buf = Buffer.from(enc, 'base64')
    const key = Buffer.from(this.ky, 'hex')
    const iv = buf.slice(0, 16)
    const data = buf.slice(16)
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
    return JSON.parse(decrypted.toString())
  }

  async getCdn() {
    const res = await this.is.get("https://media.savetube.vip/api/random-cdn")
    return { status: true, data: res.data.cdn }
  }

  async download(url, type = 'audio', quality = '128') {
    const id = url.match(this.m)?.[3]
    if (!id) throw "Invalid YouTube URL"
    const cdn = await this.getCdn()
    const info = await this.is.post(`https://${cdn.data}/v2/info`, { url: `https://www.youtube.com/watch?v=${id}` })
    const dec = await this.decrypt(info.data.data)
    const dl = await this.is.post(`https://${cdn.data}/download`, { id, downloadType: type, quality: quality, key: dec.key })
    return { title: dec.title, duration: dec.duration, thumb: dec.thumbnail, download: dl.data.data.downloadUrl }
  }

  async downloadToFile(url, filePath) {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: DOWNLOAD_TIMEOUT_MS,
      maxContentLength: Infinity
    })
    const writer = createWriteStream(filePath)
    await pipeline(response.data, writer)
    return filePath
  }
}

const apiHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  "user-agent": "Mozilla/5.0 (Android)",
  referer: "https://ytmp3.gg/"
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function poll(statusUrl) {
  const { data } = await axios.get(statusUrl, { headers: apiHeaders, timeout: DOWNLOAD_TIMEOUT_MS })
  if (data.status === "completed") return data
  if (data.status === "failed") throw new Error(data.message || "Conversion failed")
  await sleep(2000)
  return poll(statusUrl)
}

async function convertAudio(url, quality = "128") {
  const { data: meta } = await axios.get("https://www.youtube.com/oembed", { params: { url, format: "json" }, timeout: DOWNLOAD_TIMEOUT_MS })
  const payload = { url, os: "android", output: { type: "audio", format: "mp3", quality } }
  
  let downloadInit
  try {
    downloadInit = await axios.post("https://hub.ytconvert.org/api/download", payload, { headers: apiHeaders, timeout: DOWNLOAD_TIMEOUT_MS })
  } catch {
    downloadInit = await axios.post("https://api.ytconvert.org/api/download", payload, { headers: apiHeaders, timeout: DOWNLOAD_TIMEOUT_MS })
  }
  
  if (!downloadInit?.data?.statusUrl) throw new Error("Converter failed to respond")
  const result = await poll(downloadInit.data.statusUrl)
  return { title: meta.title, author: meta.author_name, downloadUrl: result.downloadUrl, filename: `${meta.title.replace(/[^\w\s-]/gi, '')}.mp3` }
}

async function downloadAudioWithFallback(url) {
  const errors = []
  let tempFilePath = join(tmpdir(), `${Date.now()}.mp3`)

  try {
    const st = new SaveTube()
    const result = await st.download(url, 'audio', '128')
    await st.downloadToFile(result.download, tempFilePath)
    
    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size < 1000) throw new Error('ملف صغير جداً')
    
    return { ...result, filePath: tempFilePath, filename: `${result.title.replace(/[^\w\s-]/gi, '')}.mp3` }
  } catch (e) {
    errors.push(`SaveTube: ${e.message}`)
    if (existsSync(tempFilePath)) await fsPromises.unlink(tempFilePath)
    tempFilePath = join(tmpdir(), `${Date.now()}.mp3`)
  }

  try {
    let result = await convertAudio(url)
    
    const response = await axios.get(result.downloadUrl, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: DOWNLOAD_TIMEOUT_MS,
      maxContentLength: Infinity
    })
    
    const writer = createWriteStream(tempFilePath)
    await pipeline(response.data, writer)
    
    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size < 1000) throw new Error('ملف صغير جداً')
    
    return { ...result, filePath: tempFilePath }
  } catch (e) {
    errors.push(`Converter: ${e.message}`)
    if (existsSync(tempFilePath)) await fsPromises.unlink(tempFilePath)
  }

  throw new Error(`فشل التحميل: ${errors.join('; ')}`)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(theme.build([
            { type: 'title', text: '🎵 يـوتـيـوب صـوت' },
            { type: 'divider' },
            { type: 'info', label: '🔗 تحميل', value: `${usedPrefix + command} <رابط يوتيوب>` },
            { type: 'info', label: '🔍 بحث', value: `${usedPrefix + command} <اسم الاغنية>` }
        ]))
    }

    if (text.includes('youtu.be') || text.includes('youtube.com')) {
        await downloadAndSend(m, conn, text)
        return
    }

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    try {
        const yts = (await import('yt-search')).default
        let searchResults = await yts(text)
        let video = searchResults.videos[0]

        if (!video) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return m.reply(theme.build([{ type: 'title', text: '❌ لا توجد نتائج' }]))
        }

        await downloadAndSend(m, conn, video.url)

    } catch (error) {
        console.error('[YT]', error)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(theme.build([{ type: 'title', text: '❌ خطأ' }, { type: 'line', text: error.message || 'جرب مرة تانية' }]))
    }
}

async function downloadAndSend(m, conn, url) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let statusMsg = await m.reply(`⏳ *جاري تحميل الصوت...*`)
    let downloadedFilePath = null

    try {
        const result = await downloadAudioWithFallback(url)
        downloadedFilePath = result.filePath

        const stats = await fsPromises.stat(downloadedFilePath)
        if (stats.size < 1000) throw new Error('الملف فارغ أو تالف')

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        await conn.sendMessage(m.chat, {
            audio: { url: downloadedFilePath },
            mimetype: 'audio/mpeg',
            fileName: result.filename || 'audio.mp3',
            ptt: false
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error('[YT]', e)
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(`❌ *فـشـل الـتـحـمـيـل*\n\n${e.message?.substring(0, 200)}`)
    } finally {
        if (downloadedFilePath && existsSync(downloadedFilePath)) {
            await fsPromises.unlink(downloadedFilePath).catch(() => {})
        }
    }
}

handler.help = ['يوتيوب']
handler.tags = ['downloader']
handler.command = /^(يوتيوب|yt|youtube)$/i

export default handler