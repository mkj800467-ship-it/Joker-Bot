// plugins/apk.js
// ✧ THE JOKER & ITACHI - APK Downloader 📱

import fetch from 'node-fetch'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    // رسالة المساعدة
    return conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '📱 تـحـمـيـل تـطـبـيـقـات APK' },
        { type: 'divider' },
        { type: 'line', text: '🃏 *تحميل تطبيقات APK مع ملفات OBB*' },
        { type: 'spacer' },
        { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix}apk <اسم التطبيق>` },
        { type: 'spacer' },
        { type: 'info', label: '📌 مثال', value: `${usedPrefix}apk free fire` }
      ]),
      contextInfo: {
        externalAdReply: {
          title: "✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 & 𝐈𝐭𝐚𝐜𝐡𝐢♞ ✧",
          body: "👑⚔️ JOKER CORE ACTIVATED",
          mediaType: 1,
          thumbnail: await getThumbnail(),
          mediaUrl: "https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A",
          sourceUrl: "https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A"
        }
      }
    }, { quoted: m })
  }

  // لو المدخلة اسم حزمة (com.xxx) يعني تم اختيارها من القائمة
  if (/^com\./i.test(text.trim())) {
    await conn.sendMessage(m.chat, { react: { text: '⏬', key: m.key } })

    try {
      const info = await getAppInfo(text.trim())
      const res = await downloadApp(text.trim())

      if (res.size > 2000000000) {
        return conn.sendMessage(m.chat, {
          text: theme.build([
            { type: 'title', text: '❌ خطأ' },
            { type: 'error', text: 'حجم ملف APK كبير جداً' },
            { type: 'info', label: 'الحد الأقصى', value: '2GB' }
          ])
        }, { quoted: m })
      }

      // إرسال صورة التطبيق
      await conn.sendMessage(m.chat, {
        image: { url: info.icon },
        caption: theme.build([
          { type: 'title', text: '📱 مـعـلـومـات الـتـطـبـيـق' },
          { type: 'divider' },
          { type: 'info', label: '📱 الاسم', value: info.name },
          { type: 'info', label: '📦 الحزمة', value: info.packageN },
          { type: 'divider' },
          { type: 'line', text: '⏳ جـاري تـحـمـيـل الـمـلـف...' }
        ]),
        footer: '👑 THE JOKER & ITACHI ♞',
        quoted: m
      })

      // إرسال ملف APK
      await conn.sendMessage(
        m.chat,
        {
          document: { url: res.download },
          mimetype: res.mimetype,
          fileName: res.fileName
        },
        { quoted: m }
      )

      // إرسال ملف OBB لو موجود
      if (info.obb && info.obb_link) {
        await conn.sendMessage(m.chat, {
          text: `📦 *جـاري تـحـمـيـل مـلـف OBB لـ ${info.name}...*`
        }, { quoted: m })

        const obbRes = await fetch(info.obb_link, { method: 'HEAD' })
        const obbMimetype = obbRes.headers.get('content-type') || 'application/octet-stream'
        const obbFileName = decodeURIComponent(info.obb_link.split('/').pop().split('?')[0])

        await conn.sendMessage(
          m.chat,
          {
            document: { url: info.obb_link },
            mimetype: obbMimetype,
            fileName: obbFileName
          },
          { quoted: m }
        )
      }

    } catch (e) {
      console.error(e)
      await conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '❌ خطأ' },
          { type: 'error', text: 'فـشـل فـي تـحـمـيـل APK' }
        ])
      }, { quoted: m })
    }
    return
  }

  // وضع البحث
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

  try {
    const apps = await searchApps(text)
    if (!apps.length) {
      return conn.sendMessage(m.chat, {
        text: theme.build([
          { type: 'title', text: '🔍 بـحـث' },
          { type: 'error', text: 'لـم يـتـم الـعـثـور عـلى أي تـطـبـيـقـات' }
        ])
      }, { quoted: m })
    }

    // إنشاء قائمة النتائج
    const sections = [{
      title: "📱 نـتـائـج الـبـحـث",
      rows: apps.map(app => ({
        title: app.name,
        description: app.package,
        id: `${usedPrefix}apk ${app.package}`
      }))
    }]

    const imageUrl = 'https://i.postimg.cc/QNBdrxPw/9307ca429fbe24b88a4f7fbc7b8f2840.jpg'
    const imageRes = await fetch(imageUrl)
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
    const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer })

    const nativeFlowPayload = {
      body: {
        text: theme.build([
          { type: 'title', text: '🔍 بـحـث عـن' },
          { type: 'info', label: 'البحث', value: text },
          { type: 'spacer' },
          { type: 'line', text: '📱 اخـتـر تـطـبـيـق لـتـحـمـيـلـه' }
        ])
      },
      footer: { text: '👑 THE JOKER & ITACHI ♞' },
      header: {
        hasMediaAttachment: true,
        subtitle: '📲 مـتـجـر APK ⚔️',
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📲 اخـتـر تـطـبـيـق APK',
            sections: sections
          })
        }],
        messageParamsJson: JSON.stringify({
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            list_title: "📱 تـطـبـيـقـات APK",
            button_title: "⚔️ اضـغـط لـعـرض الـنـتـائـج"
          }
        })
      }
    }

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
    const fkontak = await makeFkontak()
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, {
      userJid: conn.user.jid,
      quoted: fkontak
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '❌ خطأ' },
        { type: 'error', text: 'حـدث خـطـأ أثـنـاء الـبـحـث' }
      ])
    }, { quoted: m })
  }
}

// ========== دوال مساعدة ==========
async function searchApps(query) {
  const res = await fetch('http://ws75.aptoide.com/api/7/apps/search?query=' + encodeURIComponent(query) + '&limit=10')
  const json = await res.json()
  return json.datalist.list.map(app => ({
    name: app.name,
    package: app.package
  }))
}

async function getAppInfo(packageName) {
  const res = await fetch('http://ws75.aptoide.com/api/7/apps/search?query=' + encodeURIComponent(packageName) + '&limit=1')
  const json = await res.json()
  const app = json.datalist.list[0]

  if (!app) throw '❌ لم يتم العثور على التطبيق'

  let obb_link = null, obb = false
  try {
    if (app.obb && app.obb.main && app.obb.main.path) {
      obb_link = app.obb.main.path
      obb = true
    }
  } catch {}

  return {
    obb,
    obb_link,
    name: app.name,
    icon: app.icon,
    packageN: app.package
  }
}

async function downloadApp(packageName) {
  const res = await fetch('http://ws75.aptoide.com/api/7/apps/search?query=' + encodeURIComponent(packageName) + '&limit=1')
  const json = await res.json()
  const app = json.datalist.list[0]

  const download = app.file.path
  const fileName = app.package + '.apk'
  const head = await fetch(download, { method: 'HEAD' })
  const size = head.headers.get('content-length')
  const mimetype = head.headers.get('content-type') || 'application/vnd.android.package-archive'

  return { fileName, mimetype, download, size }
}

async function getThumbnail() {
  try {
    const res = await fetch('https://i.postimg.cc/QNBdrxPw/9307ca429fbe24b88a4f7fbc7b8f2840.jpg')
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/QNBdrxPw/9307ca429fbe24b88a4f7fbc7b8f2840.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'JOKER' },
      message: { locationMessage: { name: '👑 THE JOKER & ITACHI ♞', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

handler.command = ['apk']
handler.help = ['apk']
handler.tags = ['downloader']
handler.premium = false
handler.register = false

export default handler;
