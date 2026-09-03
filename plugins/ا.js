// plugins/nixcode-demo.js
// ✧ THE JOKER & ITACHI - Advanced Buttons Demo 🔘

import { Button, ButtonV2, Carousel } from '../core/NIXCODE.js'
let handler = async (m, { conn }) => {

  const developerNumber = "249916221538"
  const developerContact = `https://wa.me/${developerNumber}`
  const newImage = 'https://i.postimg.cc/3wk4dCNq/IMG-20260825-WA0002.jpg'

  const user = await conn.getName(m.sender)
  const fecha = new Date().toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })
  const hora = new Date().toLocaleTimeString('en-US', { hour12: true })
  const uptime = getUptime()

  const customHeaderBox = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 👤 ╎ الاسـم: ${user}
 ┠ 📱 ╎ الـرقـم: ${m.sender.split('@')[0]}
 ┠ ⚡ ╎ البينج: 0.0058ms
 ┠ ⏱️ ╎ التشغيل: ${uptime}
 ┠ 📅 ╎ التاريخ: ${fecha}
 ┠ ⏰ ╎ الوقت: ${hora}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`;

  // ═══════════════════════════════════════
  // 1️⃣ زر عادي + قائمة منسدلة + URL + Copy
  // ═══════════════════════════════════════
  await new Button(conn)
    .setTitle('🃏 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ➾ 𝐈𝐭𝐚𝐜𝐡𝐢♞')
    .setSubtitle('🔘 عــرض الأَزرار التَّفَاعُلِيَّة')
    .setBody(customHeaderBox)
    .setFooter('👑 THE JOKER & ITACHI ♞')
    .setImage(newImage)
    .addReply('📂 الأقسام', '.اوامر')
    .addReply('👑 المطور', '.المطور')
    .addUrl('📢 القناة', 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A', true)
    .addCopy('📋 نسخ رقم المطور', developerNumber)
    .addSelection('📚 اخــتــر الــقــســم الـمـطـلـوب')
    .makeSection('الأقسام الرئيسية')
    .makeRow('👮‍♂️', 'قـسـم الأدْمـن', '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍', '.ق1')
    .makeRow('🎨', 'قـسـم الاسـتـيـكـر', '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍', '.ق2')
    .makeRow('🎮', 'قـسـم الألـعـاب', '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍', '.ق3')
    .makeRow('📥', 'قـسـم الـتـحـمـيـل', '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍', '.ق4')
    .makeRow('🧰', 'قـسـم الأدوات', '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍', '.ق5')
    .send(m.chat, { quoted: m, contextInfo: { mentionedJid: [m.sender] } })

  // ═══════════════════════════════════════
  // 2️⃣ أزرار عائمة (Floating)
  // ═══════════════════════════════════════
  await new ButtonV2(conn)
    .setTitle('🃏 JOKER & ITACHI')
    .setSubtitle('⚡ أزرار عائمة سريعة')
    .setBody(customHeaderBox)
    .setFooter('👑 THE JOKER & ITACHI ♞')
    .setThumbnail(newImage)
    .addRawButton({
      buttonText: { displayText: '📂 عــرض الاقــســام' },
      buttonId: 'menu',
      type: 1,
      nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: "اخــتــر الــقــســم الـمـطـلـوب",
          sections: [{
            title: "الأقسام الرئيسية",
            rows: [
              { title: "👮‍♂️ قـسـم الأدْمـن", description: "〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍", id: ".ق1" },
              { title: "🎨 قـسـم الاسـتـيـكـر", description: "〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍", id: ".ق2" },
              { title: "🎮 قـسـم الألـعـاب", description: "〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍", id: ".ق3" }
            ]
          }]
        })
      }
    })
    .addButton('👑 المطور', '.المطور')
    .addButton('⭐ تقييم', '.تقييم')
    .send(m.chat)

  // ═══════════════════════════════════════
  // 3️⃣ كاروسيل (سلايدر البطاقات)
  // ═══════════════════════════════════════
  await new Carousel(conn)
    .setBody(customHeaderBox)
    .setFooter('👑 اسحب للتصفح واكتشاف الأقسام 👑')
    .addCard(
      await new Button(conn)
        .setTitle('👮‍♂️ قـسـم الأدْمـن')
        .setBody('أوامر المشرفين وإدارة الجروبات بكل احترافية وسلاسة')
        .setImage(newImage)
        .addReply('📂 فتح القسم', '.ق1')
        .toCard()
    )
    .addCard(
      await new Button(conn)
        .setTitle('🎮 قـسـم الألـعـاب')
        .setBody('ألعاب ترفيهية وتفاعلية حماسية للأعضاء والجروبات')
        .setImage(newImage)
        .addReply('🎮 فتح القسم', '.ق3')
        .toCard()
    )
    .addCard(
      await new Button(conn)
        .setTitle('⛄ قـسـم التَّسْلِيَة')
        .setBody('ترفيه ومرح وأوامر ممتعة لجميع أعضاء البوت')
        .setImage(newImage)
        .addReply('🎉 فتح القسم', '.ق10')
        .toCard()
    )
    .send(m.chat, { quoted: m })

}

function getUptime() {
    let totalSeconds = process.uptime()
    let hours = Math.floor(totalSeconds / 3600)
    let minutes = Math.floor((totalSeconds % 3600) / 60)
    let seconds = Math.floor(totalSeconds % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

handler.help = ['نيوكس']
handler.tags = ['tools']
handler.command = /^(نيوكس|nixcode|demo)$/i

export default handler;
