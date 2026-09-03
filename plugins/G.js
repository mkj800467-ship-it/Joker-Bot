// plugins/exec.js
// ✧ THE JOKER & ITACHI - Advanced Terminal Execution 🃏

import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec).bind(cp);

let handler = async (m, { conn, isROwner, command, text }) => {
  if (!isROwner) return;
  if (global.conn.user.jid !== conn.user.jid) return;

  // دمج الأمر مع النص المدخل (مثلاً: $ npm i أو $ ls)
  let cmdText = (command + ' ' + (text || '')).trim();
  
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let o;
  try {
    o = await exec(cmdText);
  } catch (e) {
    o = e;
  } finally {
    const { stdout, stderr } = o;
    let output = '';

    if (stdout && stdout.trim()) {
      output += `*📥 [STDOUT]:*\n\`\`\`${stdout.trim()}\`\`\`\n`;
    }
    if (stderr && stderr.trim()) {
      output += `*⚠️ [STDERR]:*\n\`\`\`${stderr.trim()}\`\`\`\`;
    }

    if (!output) {
      output = '⚡ *[تم التنفيذ بنجاح دون مخرجات نصية]*';
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    await m.reply(output);
  }
};

handler.customPrefix = /^[$]/;
handler.command = new RegExp();
handler.rowner = true;

export default handler;
