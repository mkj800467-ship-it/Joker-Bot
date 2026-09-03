// plugins/soundcloud.js
// ✧ UCHIHA - Uchiha Itachi - أمر التحميل من SoundCloud بالشارينگان 🎵

import fetch from "node-fetch";
import { theme } from '../core/theme.js';
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';

let CLIENT_IDS = [
  'DzA2vRpkKqKVM37Lh9O3XPIJwTpL4U9M',
  'a3e059563d7fd3372b49b37f00a00bcf',
  'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX',
  'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M',
  'ZbE1zOjMvRkXpL2qW8yN5cF7uA3sD6gH9jK',
];

async function searchSoundCloud(query, limit = 10) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://soundcloud.com',
    'Referer': 'https://soundcloud.com/'
  };

  for (const cid of CLIENT_IDS) {
    try {
      const url = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(query)}&client_id=${cid}&limit=${limit}&variant_ids=`;
      const res = await fetch(url, { headers });
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const data = await res.json();
      const tracks = data?.collection?.filter(item => item.kind === 'track') || [];
      if (tracks.length > 0) return tracks.slice(0, limit);
    } catch (err) {
      console.log(`[ITACHI-SC] Search error: ${err.message}`);
    }
  }
  return [];
}

async function downloadSoundCloud(trackUrl) {
  for (const cid of CLIENT_IDS) {
    try {
      const resolveUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(trackUrl)}&client_id=${cid}`;
      const res = await fetch(resolveUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const track = await res.json();
      if (!track?.media?.transcodings?.length) continue;

      const tc = track.media.transcodings;
      const pick = tc.find(t => t.format?.protocol === 'progressive') || tc[0];
      if (!pick?.url) continue;

      const sep = pick.url.includes('?') ? '&' : '?';
      const streamRes = await fetch(`${pick.url}${sep}client_id=${cid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      if (streamRes.status === 429) continue;
      if (!streamRes.ok) continue;
      const streamData = await streamRes.json();
      if (!streamData?.url) continue;

      return {
        audioUrl: streamData.url,
        title: track.title || 'SoundCloud',
        thumb: track.artwork_url ? track.artwork_url.replace('large', 't500x500') : null,
      };
    } catch (err) {
      console.log(`[ITACHI-SC] Download error: ${err.message}`);
    }
  }
  throw new Error('فشل استدعاء وتنزيل الصوت من الأبعاد');
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }); } catch {}
  };

  if (text && text.includes('soundcloud.com')) {
    await react('⏳');
    try {
      const result = await downloadSoundCloud(text.trim());
      await conn.sendMessage(m.chat, {
        audio: { url: result.audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false,
        contextInfo: {
          forwardingScore: 200,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363429074575231@newsletter',
            newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
            serverMessageId: 1
          }
        }
      }, { quoted: m });
      await react('✅');
    } catch (e) {
      await react('❌');
      
      const failText = theme.build([
        { type: 'title', text: '❄️ إتاتشي: "فشل استدعاء الصوت"' },
        { type: 'warning', text: e.message }
      ]);

      const interactiveMessage = {
        body: { text: failText },
        footer: { text: '⛩️ Uchiha Itachi - Sharingan SoundCloud ⛩️' },
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
    }
    return;
  }

  if (!text) {
    await react('✍️');
    
    const warningText = theme.build([
      { type: 'title', text: '⛩️ إتاتشي: "وحدة ساوند كلاود للشارينگان"' },
      { type: 'divider' },
      { type: 'line', text: '🔮 *استدعاء الأغاني والمقاطع الصوتية من SoundCloud*' },
      { type: 'divider' },
      { type: 'info', label: '⚔️ الاستخدام', value: `${usedPrefix + command} <اسم الأغنية>` },
      { type: 'spacer' },
      { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} faded alan walker` }
    ]);

    const interactiveMessage = {
      body: { text: warningText },
      footer: { text: '⛩️ Uchiha Itachi - Sharingan SoundCloud ⛩️' },
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

  await react('🔍');
  
  const searchNotice = theme.build([
    { type: 'title', text: '⛩️ إتاتشي: "جاري البحث في الأبعاد الصوتية"' },
    { type: 'info', label: '🎯 الهدف', value: text }
  ]);

  await conn.sendMessage(m.chat, { 
    text: searchNotice,
    contextInfo: {
      forwardingScore: 200,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
        serverMessageId: 1
      }
    }
  }, { quoted: m });

  try {
    const tracks = await searchSoundCloud(text, 10);
    if (!tracks.length) {
      await react('❌');
      
      const noResText = theme.build([
        { type: 'title', text: '❄️ إتاتشي: "لا توجد نتائج في هذا البعد"' },
        { type: 'warning', text: `لم يتم العثور على نتائج للبحث: ${text}` }
      ]);

      const interactiveMessage = {
        body: { text: noResText },
        footer: { text: '⛩️ Uchiha Itachi - Sharingan SoundCloud ⛩️' },
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

    let headerImage = null;
    for (const track of tracks) {
      if (track.artwork_url) {
        try {
          const imgUrl = track.artwork_url.replace('large', 't500x500');
          const imgRes = await fetch(imgUrl);
          if (imgRes.ok) {
            headerImage = Buffer.from(await imgRes.arrayBuffer());
            break;
          }
        } catch {}
      }
    }

    const sections = [];
    const rows = [];

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const artistName = track.user?.username || track.user?.full_name || 'Unknown';
      const duration = Math.floor(track.duration / 60000) + ':' + Math.floor((track.duration % 60000) / 1000).toString().padStart(2, '0');
      const title = track.title.length > 35 ? track.title.substring(0, 32) + '...' : track.title;

      rows.push({
        title: `${i + 1}. ${title}`,
        description: `👤 ${artistName} | ⏱️ ${duration}`,
        id: `.ساوند_تحميل ${track.permalink_url}`
      });
    }

    sections.push({
      title: "🎵 نتائج البحث بالشارينگان",
      rows: rows
    });

    let header = { hasMediaAttachment: false };
    if (headerImage) {
      const media = await prepareWAMessageMedia(
        { image: headerImage },
        { upload: conn.waUploadToServer }
      );
      header = {
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      };
    }

    const menuText = theme.build([
      { type: 'title', text: '⛩️ إتاتشي: "نتائج بحث ساوند كلاود"' },
      { type: 'info', label: '🎯 البحث', value: text },
      { type: 'info', label: '📊 النتائج', value: `${tracks.length} مقطع` },
      { type: 'divider' },
      { type: 'line', text: '⚔️ اضغط على القائمة أدناه لاختيار الصوت المطلوب' }
    ]);

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ text: menuText }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: '⛩️ Uchiha Itachi - Sharingan SoundCloud ⛩️' }),
            header: proto.Message.InteractiveMessage.Header.fromObject(header),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: "🎵 اختر المقطع الصوتي",
                    sections: sections
                  })
                },
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📢 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                    copy_code: '120363429074575231@newsletter'
                  })
                }
              ],
              messageParamsJson: JSON.stringify({
                bottom_sheet: {
                  in_thread_buttons_limit: 1,
                  list_title: "🎵 قائمة المقاطع الصوتية",
                  button_title: "🎵 عرض القائمة"
                }
              })
            })
          })
        }
      }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    await react('✅');

  } catch (e) {
    console.error('[ITACHI-SC]', e);
    await react('❌');
    
    const errText = theme.build([
      { type: 'title', text: '❄️ إتاتشي: "فشلت مهمة الاستدعاء"' },
      { type: 'warning', text: e.message }
    ]);

    const interactiveMessage = {
      body: { text: errText },
      footer: { text: '⛩️ Uchiha Itachi - Sharingan SoundCloud ⛩️' },
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
  }
};

handler.before = async function (m, { conn }) {
  if (!m.text) return;

  if (m.text.startsWith('.ساوند_تحميل')) {
    const trackUrl = m.text.replace('.ساوند_تحميل', '').trim();
    if (trackUrl) {
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {});
      try {
        const result = await downloadSoundCloud(trackUrl);
        await conn.sendMessage(m.chat, {
          audio: { url: result.audioUrl },
          mimetype: 'audio/mpeg',
          ptt: false,
          contextInfo: {
            forwardingScore: 200,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363429074575231@newsletter',
              newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
              serverMessageId: 1
            }
          }
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
      } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
        
        const failText = theme.build([
          { type: 'title', text: '❄️ إتاتشي: "فشل التحميل النهائي"' },
          { type: 'warning', text: e.message }
        ]);

        const interactiveMessage = {
          body: { text: failText },
          footer: { text: '⛩️ Uchiha Itachi - Sharingan SoundCloud ⛩️' },
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
      }
      return true;
    }
  }
  return;
};

handler.help = ['ساوند <اسم>'];
handler.tags = ['downloader'];
handler.command = /^(اغنيه|soundcloud|sc|ساوند)$/i;

export default handler;
