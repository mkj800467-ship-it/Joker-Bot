// plugins/nassab.js
// ⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽v2 - رد تلقائي على كلمة نصاب (ملاحظة فيديو) 🎥

let handler = async (m, { conn }) => {
  try {
    let videoUrl = 'https://file.garden/aauvg01sjleV_ic1/VID-20260530-WA0090.mp4'

    // تفاعل بإيموجي فوري على رسالة الشخص
    await conn.sendMessage(m.chat, { 
      react: { text: '🎭', key: m.key } 
    });

    // إرسال الفيديو كملاحظة فيديو (PTV)
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      ptv: true,  // هذا يحول الفيديو إلى ملاحظة فيديو
      caption: '🎭 *نصاب* 🎭'
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    await m.reply('❌ حدث خطأ أثناء إرسال الفيديو.')
  }
}

// يشتغل عند وجود كلمة "نصاب" في أي مكان في الرسالة
handler.customPrefix = /نصاب/i
handler.command = new RegExp()

export default handler;
