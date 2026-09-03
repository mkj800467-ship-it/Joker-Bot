// plugins/game-ttt.js
// ✧ THE JOKER & ITACHI - Tic Tac Toe Game ❌⭕

import { theme } from '../core/theme.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 كلاس TicTacToe
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class TicTacToe {
    constructor(playerX = 'x', playerO = 'o') {
        this.playerX = playerX;
        this.playerO = playerO;
        this.board = Array(9).fill(null);
        this.currentTurn = playerX;
        this.winner = null;
    }

    render() {
        return this.board.map((cell, index) => {
            if (cell === 'X') return 'X';
            if (cell === 'O') return 'O';
            // إرجاع الرقم مباشرة بناءً على الفهرس لكي يظهر الأرقام 1-9 في اللوحة الفارغة
            return (index + 1).toString();
        });
    }

    turn(player, pos) {
        if (this.winner) return false;
        if (player !== this.currentTurn) return false;
        if (pos < 0 || pos > 8) return false;
        if (this.board[pos] !== null) return false;

        this.board[pos] = player === this.playerX ? 'X' : 'O';
        this.currentTurn = player === this.playerX ? this.playerO : this.playerX;

        this.checkWinner();
        return true;
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a] === 'X' ? this.playerX : this.playerO;
                return;
            }
        }
        if (this.board.every(cell => cell !== null)) {
            this.winner = 'draw';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 أمر اللعبة
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let handler = async (m, { conn, usedPrefix, command, text }) => {
    conn.game = conn.game ? conn.game : {};

    // التحقق إذا كان المستخدم بالفعل في لعبة
    if (Object.values(conn.game).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender))) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '⚠️ تـنـبـيـه هام' },
                { type: 'divider' },
                { type: 'error', text: 'أنت بالفعل مشارك في لعبة إكس أو قائمة حالياً!' },
                { type: 'spacer' },
                { type: 'warning', text: '⚔️ أنهِ لعبتك الحالية أو انتظر انتهائها أولاً' }
            ])
        }, { quoted: m });
    }

    // البحث عن غرفة في انتظار خصم
    let room = Object.values(conn.game).find(room => room.state === 'WAITING' && (text ? room.name === text : true));

    if (room) {
        // منع اللاعب من اللعب ضد نفسه
        if (room.game.playerX === m.sender) {
            return conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '⚠️ لا يمكنك اللعب ضد نفسك' },
                    { type: 'divider' },
                    { type: 'error', text: 'انتظر شخصاً آخر لينضم إلى غرفتك' }
                ])
            }, { quoted: m });
        }

        room.o = m.chat;
        room.game.playerO = m.sender;
        room.state = 'PLAYING';

        // عرض لوحة اللعب الأولى
        let arr = room.game.render().map(v => {
            return {
                'X': '❌',
                'O': '⭕',
                '1': '1️⃣',
                '2': '2️⃣',
                '3': '3️⃣',
                '4': '4️⃣',
                '5': '5️⃣',
                '6': '6️⃣',
                '7': '7️⃣',
                '8': '8️⃣',
                '9': '9️⃣',
            }[v] || v;
        });

        let str = theme.build([
            { type: 'title', text: '🎮 لـعـبـة إكـس أو ❌⭕' },
            { type: 'divider' },
            { type: 'info', label: '📋 الـغـرفـة', value: room.id },
            { type: 'divider' },
            { type: 'line', text: '🎯 *الـسـاحـة:*' },
            { type: 'spacer' },
            { type: 'line', text: `${arr.slice(0, 3).join(' ')}` },
            { type: 'line', text: `${arr.slice(3, 6).join(' ')}` },
            { type: 'line', text: `${arr.slice(6).join(' ')}` },
            { type: 'divider' },
            { type: 'info', label: '⚔️ الدور الآن لـ', value: '@' + room.game.currentTurn.split('@')[0] },
            { type: 'line', text: '📌 أرسل رقم المربع (1-9) في المحادثة للعب' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        await conn.sendMessage(room.x, { text: str, mentions: [room.game.currentTurn] }, { quoted: m });
        if (room.x !== room.o) {
            await conn.sendMessage(room.o, { text: str, mentions: [room.game.currentTurn] }, { quoted: m });
        }

    } else {
        // إنشاء غرفة جديدة
        room = {
            id: 'tictactoe-' + (+new Date),
            x: m.chat,
            o: '',
            game: new TicTacToe(m.sender, 'o'),
            state: 'WAITING'
        };
        if (text) room.name = text;

        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🔍 بـحـث عـن خـصـم ❌⭕' },
                { type: 'divider' },
                { type: 'line', text: '⏳ تم إنشاء غرفة جديدة، في انتظار انضمام خصم...' },
                { type: 'spacer' },
                { type: 'info', label: '📌 للانضمام', value: `${usedPrefix}${command} ${text ? text : ''}` },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ])
        }, { quoted: m });

        conn.game[room.id] = room;
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 معالج حركات اللاعبين
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
handler.before = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {};
    if (!m.isGroup) return false;

    let room = Object.values(conn.game).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender) && room.state === 'PLAYING');
    if (!room) return false;

    let pos = parseInt(m.text);
    if (isNaN(pos) || pos < 1 || pos > 9) return false;

    let { game, x, o } = room;
    if (game.currentTurn !== m.sender) {
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '⚠️ لـيـس دورك' },
                { type: 'divider' },
                { type: 'warning', text: 'انتظر دورك حتى يقوم الخصم باللعب' }
            ])
        }, { quoted: m });
        return true;
    }

    let currentPlayerMark = game.currentTurn === game.playerX ? 'X' : 'O';

    if (game.turn(currentPlayerMark, pos - 1)) {
        let arr = game.render().map(v => {
            return {
                'X': '❌',
                'O': '⭕',
                '1': '1️⃣',
                '2': '2️⃣',
                '3': '3️⃣',
                '4': '4️⃣',
                '5': '5️⃣',
                '6': '6️⃣',
                '7': '7️⃣',
                '8': '8️⃣',
                '9': '9️⃣',
            }[v] || v;
        });

        let str = theme.build([
            { type: 'title', text: '🎮 لـعـبـة إكـس أو ❌⭕' },
            { type: 'divider' },
            { type: 'line', text: '🎯 *الـسـاحـة:*' },
            { type: 'spacer' },
            { type: 'line', text: `${arr.slice(0, 3).join(' ')}` },
            { type: 'line', text: `${arr.slice(3, 6).join(' ')}` },
            { type: 'line', text: `${arr.slice(6).join(' ')}` },
            { type: 'divider' },
            { type: 'info', label: '⚔️ الدور الآن لـ', value: '@' + game.currentTurn.split('@')[0] },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        if (room.x !== room.o && room.o) {
            await conn.sendMessage(room.x, { text: str, mentions: [game.currentTurn] });
            await conn.sendMessage(room.o, { text: str, mentions: [game.currentTurn] });
        } else {
            await conn.sendMessage(room.x, { text: str, mentions: [game.currentTurn] });
        }

        if (game.winner) {
            if (game.winner === 'draw') {
                await conn.sendMessage(m.chat, {
                    text: theme.build([
                        { type: 'title', text: '🤝 تـعـادل بـيـن الـلاعبين' },
                        { type: 'divider' },
                        { type: 'line', text: 'انتهت الجولة بالتعادل الإيجابي!' },
                        { type: 'divider' },
                        { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
                    ])
                }, { quoted: m });
            } else {
                let winner = game.winner === 'X' ? game.playerX : game.playerO;
                
                // إضافة نقاط للمطور أو فحص بنية الداتا بيس بسلام
                if (global.db && global.db.data && global.db.data.users) {
                    if (!global.db.data.users[winner]) global.db.data.users[winner] = { points: 0 };
                    if (typeof global.db.data.users[winner].points !== 'number') global.db.data.users[winner].points = 0;
                    global.db.data.users[winner].points += 500;
                }

                await conn.sendMessage(m.chat, {
                    text: theme.build([
                        { type: 'title', text: '🎉 فـائـز أُسـطـوري' },
                        { type: 'divider' },
                        { type: 'subtitle', text: `الفائز في اللعبة هو: @${winner.split('@')[0]}` },
                        { type: 'info', label: '🏆 الجائزة', value: '+500 نقطة' },
                        { type: 'divider' },
                        { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
                    ]),
                    mentions: [winner]
                }, { quoted: m });
            }
            delete conn.game[room.id];
        }
    } else {
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ في الحركة' },
                { type: 'divider' },
                { type: 'error', text: 'هذا المربع مشغول مسبقاً، اختر رقماً فارغاً (1-9)' }
            ])
        }, { quoted: m });
    }
    return true;
};

handler.help = ['اكس_او'].map(v => v + ' *[اسم الغرفة اختياري]*');
handler.tags = ['game'];
handler.command = /^(اكس_او|ttt|tic)$/i;

export default handler;
