// plugins/bomb-game.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - لعبة القنبلة الجماعية المرعبة 💣🔥

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let isListening = false;
const bombTimers = Object.create(null);

// ================== إعدادات ==================
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 20;
const BOMB_TIME = 30000;

// ================== مسارات ==================
const DATA_DIR = path.join(__dirname, '..', 'data', 'bomb');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ================== ملفات ==================
const gameFile = (jid) => path.join(DATA_DIR, `${jid}.json`);

const loadGame = (jid) => {
  if (!fs.existsSync(gameFile(jid))) return null;
  return JSON.parse(fs.readFileSync(gameFile(jid), 'utf8'));
};

const saveGame = (jid, data) => {
  const safe = {
    stage: data.stage,
    players: data.players,
    holder: data.holder,
    owner: data.owner,
    endTime: data.endTime
  };
  fs.writeFileSync(gameFile(jid), JSON.stringify(safe, null, 2));
};

const deleteGame = (jid) => {
  if (fs.existsSync(gameFile(jid))) fs.unlinkSync(gameFile(jid));
  if (bombTimers[jid]) {
    clearTimeout(bombTimers[jid]);
    delete bombTimers[jid];
  }
};

// ================== إعدادات القناة وطابع اتاتشي ==================
const getChannelContext = () => ({
  contextInfo: {
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363429074575231@newsletter',
      newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
      serverMessageId: 970
    }
  }
});

// ================== إرسال ==================
const reply = (conn, jid, text, quoted = null) =>
  conn.sendMessage(jid, { text, ...getChannelContext() }, quoted ? { quoted } : {});

const replyMention = (conn, jid, text, mentions, quoted = null) =>
  conn.sendMessage(jid, { text, mentions, ...getChannelContext() }, quoted ? { quoted } : {});

// ================== أدوات ==================
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getMentioned = async (m, conn) => {
  const ctx = m.message?.extendedTextMessage?.contextInfo;
  if (ctx?.mentionedJid?.length) {
    const fixed = [];
    for (const j of ctx.mentionedJid) {
      fixed.push(await conn.convertLidToRealJid(j, m.chat));
    }
    return fixed;
  }
  
  const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
  const matches = text.match(/@(\d{5,20})/g);
  if (matches) {
    return matches.map(v => v.replace('@', '') + '@s.whatsapp.net');
  }
  
  return [];
};

// ================== الأمر ==================
let handler = async (m, { conn }) => {
  const jid = m.chat;
  const starter = m.sender;

  if (!jid.endsWith('@g.us')) {
    return m.reply('> 👑 *ITACHI & JOKER: "تنبيه"* \n> 🔮 لعبة القنبلة تعمل حصرياً داخل المجموعات السيبرانية!');
  }

  if (loadGame(jid)) {
    return m.reply('> ⚠️ *ITACHI & JOKER: "تنبيه"* \n> 💣 هناك لعبة قنبلة مشتعلة بالفعل في هذه المجموعة!');
  }

  const game = {
    stage: 'waiting',
    players: [starter],
    holder: null,
    owner: starter,
    endTime: null
  };

  saveGame(jid, game);

  await replyMention(conn, jid,
    `> 👑 *[ لعبة القنبلة الملكية - ITACHI & JOKER ]* 👑\n> \n> ⚡ *المنظم الأسطوري:* @${starter.split('@')[0]}\n> \n> • اكتب *شارك* للدخول إلى حلبة الموت\n> • فقط المنظم يمكنه كتابة *بدء* للانطلاق\n> \n> 📊 *العدد الحالي:* 1\n> 📉 *الحد الأدنى:* ${MIN_PLAYERS}\n> 📈 *الحد الأقصى:* ${MAX_PLAYERS}\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
    [starter],
    m
  );

  // ================== Listener ==================
  if (!isListening) {
    conn.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages?.[0];
      if (!msg || !msg.message) return;
      if (msg.key.fromMe) return;

      const jid = msg.key.remoteJid;
      if (!jid || !jid.endsWith('@g.us')) return;

      const game = loadGame(jid);
      if (!game || game.stage === 'ended') return;

      const text = msg.message?.conversation || m.message?.extendedTextMessage?.text || msg.message?.extendedTextMessage?.text || '';
      const sender = msg.key.participant || msg.key.remoteJid;
      if (!sender) return;

      // ===== انتظار =====
      if (game.stage === 'waiting') {
        if (text.trim() === 'شارك') {
          if (game.players.includes(sender)) {
            return reply(conn, jid, '> ❌ أنت بالفعل مسجل في قائمة الموت.', msg);
          }
          if (game.players.length >= MAX_PLAYERS) {
            return reply(conn, jid, '> ❌ امتء عدد اللاعبين بالكامل، انتهت المقاعد.', msg);
          }

          game.players.push(sender);
          saveGame(jid, game);

          await replyMention(conn, jid,
            `> ✅ انضم اللاعب @${sender.split('@')[0]} إلى الحلبة\n> 📊 *العدد الحالي:* ${game.players.length}\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            [sender],
            msg
          );

          if (game.players.length === MIN_PLAYERS) {
            return reply(conn, jid, '> ✅ *تم تحقيق الحد الأدنى من المحاربين*\n> ✳️ يمكن للمنظم الآن كتابة *بدء* لإشعال فتيل اللعبة!');
          }
        }

        if (text.trim() === 'بدء') {
          if (sender !== game.owner) {
            return reply(conn, jid, '> ❌ عذراً، فقط منظم اللعبة الأسطوري يمكنه إعطاء إشارة البدء.', msg);
          }
          if (game.players.length < MIN_PLAYERS) {
            return reply(conn, jid, `> ❌ لم يكتمل طاقم اللاعبين المطلوب (${game.players.length}/${MIN_PLAYERS})`);
          }

          game.stage = 'playing';
          game.holder = rand(game.players);
          game.endTime = Date.now() + BOMB_TIME;

          saveGame(jid, game);

          await replyMention(conn, jid,
            `> 🔥 *بدأت معركة الجوكر واتاتشي الكبرى!*\n> 💣 القنبلة المشتعلة الآن مع @${game.holder.split('@')[0]}\n> ⏱️ *الوقت المتبقي للانفجار:* 30 ثانية\n> *(مرر القنبلة بمنشن سريع لمن تحب أو تكره!)*\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
            [game.holder],
            msg
          );

          startBomb(conn, jid);
        }
      }

      // ===== اللعب =====
      else if (game.stage === 'playing') {
        const mentioned = await getMentioned(msg, conn);
        if (mentioned.length !== 1) return;
        if (sender !== game.holder) return;

        let to = mentioned[0];
        to = await conn.convertLidToRealJid(to, jid);

        if (to === sender) {
          return reply(conn, jid, '> ❌ أين تحاول الهروب؟ لا يمكنك تمرير القنبلة لنفسك!', msg);
        }
        if (to === conn.user.jid) {
          return reply(conn, jid, '> ❌ إياك ومحاولة توريط النظام أو تمرير القنبلة للبوت!', msg);
        }
        if (!game.players.includes(to)) {
          return reply(conn, jid, '> ❌ هذا الشخص ليس مشاركاً في حلبة الموت هذه.', msg);
        }

        // تمرير القنبلة
        game.holder = to;
        saveGame(jid, game);

        await replyMention(conn, jid,
          `> 💣 *انتقلت القنبلة بدقة إلى* @${to.split('@')[0]}\n> ⏱️ *الوقت المتبقي للتفجير:* ${Math.ceil((game.endTime - Date.now()) / 1000)} ثانية\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
          [to],
          msg
        );
      }
    });
    isListening = true;
  }
};

// ================== عداد القنبلة والانفجار ==================
const startBomb = (conn, jid) => {
  const game = loadGame(jid);
  if (!game || game.stage !== 'playing') return;

  const timeLeft = Math.max(0, game.endTime - Date.now());

  bombTimers[jid] = setTimeout(async () => {
    const g = loadGame(jid);
    if (!g) return;

    const loser = g.holder;
    g.players = g.players.filter(p => p !== loser);

    await replyMention(conn, jid,
      `> 💥 *BOOM! انفجرت القنبلة في وجه الضحية!*\n> ❌ تم سحق واستبعاد اللاعب @${loser.split('@')[0]} من المعركة\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      [loser]
    );

    if (g.players.length === 1) {
      g.stage = 'ended';
      saveGame(jid, g);

      await replyMention(conn, jid,
        `> 🏆 *انتهت اللعبة! الفائز الأسطوري بالعرش هو* @${g.players[0].split('@')[0]}\n> 🎉 مبروك لك هذا الإنجاز العظيم!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
        [g.players[0]]
      );

      deleteGame(jid);
      return;
    }

    g.holder = rand(g.players);
    g.endTime = Date.now() + BOMB_TIME;

    saveGame(jid, g);

    await replyMention(conn, jid,
      `> 💣 *قنبلة جديدة وجولة مشتعلة مع* @${g.holder.split('@')[0]}\n> ⏱️ *العداد بدأ:* 30 ثانية أمامك للنجاة!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`,
      [g.holder]
    );

    startBomb(conn, jid);

  }, timeLeft);
};

handler.help = ['قنبله'];
handler.tags = ['game'];
handler.command = /^(قنبله|قنبلة|bomb)$/i;
handler.group = true;

export default handler;
