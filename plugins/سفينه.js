// plugins/pirate_ship.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - لعبة سفينة القراصنة الاحترافية 🏴‍☠️

import fetch from 'node-fetch';

// تخزين حالات الألعاب النشطة في الجروبات لمنع تداخل الجلسات وتنظيف الجلسة تماماً بعد الانتهاء
global.pirateGames = global.pirateGames || {};

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ هذه اللعبة تعمل داخل المجموعات فقط!');
    let chatId = m.chat;

    if (global.pirateGames[chatId]) {
        return m.reply('⚠️ هناك لعبة سفينة قراصنة قائمة بالفعل في هذه المجموعة، انتظر حتى تنتهي أو يتم تنظيف الجلسة!');
    }

    // تهيئة الجلسة الكاملة للجروب
    global.pirateGames[chatId] = {
        state: 'gathering',
        players: [],
        votes: {}
    };

    let metadata = await conn.groupMetadata(chatId);
    let participants = metadata.participants.map(p => p.id).filter(id => id !== conn.user.jid);

    if (participants.length < 5) {
        delete global.pirateGames[chatId];
        return m.reply('❌ يلزم وجود 5 لاعبين نشطين على الأقل في المجموعة لبدء رحلة القراصنة الدموية!');
    }

    // إدخال الشخص الذي كتب الأمر تلقائياً ضمن الطاقم لضمان مشاركته
    let senderId = m.sender;
    let otherParticipants = participants.filter(id => id !== senderId);
    let shuffledOthers = otherParticipants.sort(() => 0.5 - Math.random());
    let selectedPlayers = [senderId, ...shuffledOthers.slice(0, 4)];

    let roles = ['🏴‍☠️ القبطان', '🍲 الطباخ', '👁️ المراقب البحري', '🛠️ صانع السفينة', '🩺 الطبيب'];
    let assignedCrew = selectedPlayers.map((jid, index) => ({
        jid: jid,
        role: roles[index],
        alive: true
    }));

    global.pirateGames[chatId].players = assignedCrew;
    global.pirateGames[chatId].state = 'voting_1';

    let crewListText = assignedCrew.map(p => `│ 👤 @${p.jid.split('@')[0]} ⟾ *${p.role}*`).join('\n');

    let startText = `◆━═━═━═━═━═━═━═━═━◆
🃏 *𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹* ➾ *لعبة سفينة القراصنة* 🏴‍☠️
◆━═━═━═━═━═━═━═━═━◆
│ 🌊 *مرحباً بكم في سفينة القراصنة العظيمة!*
│ لقد هبت رياح قوية ومميتة على السفينة، وأصبح الوزن ثقيلاً ويجب التخلص من أحد أفراد الطاقم لنجاة البقية!
│
│ 📋 *أعضاء الطاقم والألقاب الموزعة:*
${crewListText}
│
│ 🗳️ *المرحلة الأولى (التصويت الأول):*
│ من تختارون لرميه في البحر؟
│ ⏱️ *صوّت عبر استطلاع الرأي بالألقاب أدناه!*
◆━═━═━═━═━═━═━═━═━◆
*👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ*`;

    // إرسال صورة البداية المخصصة عبر رابط مباشر لضمان عدم حدوث أي خطأ في التحميل
    let coverImage1 = 'https://i.postimg.cc/VN09r007/7765558645177d784e9f56dbfaa52c85.jpg';
    await conn.sendMessage(chatId, {
        image: { url: coverImage1 },
        caption: startText,
        mentions: selectedPlayers
    });

    // إنشاء خيارات الاستطلاع بالأسماء والألقاب حصراً لكي يتعرف عليها النظام بدقة مطلقة
    let pollValues1 = assignedCrew.map(p => `${p.role} (@${p.jid.split('@')[0]})`);

    let pollMsg1 = await conn.sendMessage(chatId, {
        poll: {
            name: "🗳️ [المرحلة الأولى] من تود رميه في البحر؟",
            values: pollValues1,
            selectableCount: 1
        }
    });

    // رصد أصوات الاستطلاع بدقة عبر مطابقة نصوص الألقاب
    startPollVotingByRole(conn, chatId, pollMsg1.key.id, assignedCrew, 60000, async (eliminatedJid) => {
        let eliminatedPlayer = assignedCrew.find(p => p.jid === eliminatedJid) || assignedCrew[0];
        eliminatedPlayer.alive = false;

        let dropImage = 'https://i.postimg.cc/tRWrvwT6/1491ced16d9642f417468016ea2ed8e7.jpg';
        await conn.sendMessage(chatId, {
            image: { url: dropImage },
            caption: `🌊 *تم تنفيذ القرار!* \nلقد سقط @${eliminatedPlayer.jid.split('@')[0]} (${eliminatedPlayer.role}) في أعماق المحيط المظلم وخرج من اللعبة تماماً! 🦈`,
            mentions: [eliminatedPlayer.jid]
        });

        await startSecondPhase(conn, chatId);
    });
};

// نظام فحص وتحليل أصوات الاستطلاع بالاعتماد على الفهرس والألقاب بدقة تامة
function startPollVotingByRole(conn, chatId, pollMsgId, targetPlayers, duration, callback) {
    let game = global.pirateGames[chatId];
    if (!game) return;

    let pollVotes = {};

    let listener = conn.ev.on('messages.update', async (updates) => {
        for (let update of updates) {
            if (update.key.id === pollMsgId && update.update?.pollUpdates) {
                let pollUpdates = update.update.pollUpdates;
                for (let pu of pollUpdates) {
                    let voterJid = pu.sender || update.key.participant;
                    let selectedOptions = pu.optionAcks || [];
                    if (selectedOptions.length > 0) {
                        let chosenIndex = selectedOptions[0];
                        let living = targetPlayers.filter(p => p.alive);
                        if (living[chosenIndex]) {
                            pollVotes[voterJid] = living[chosenIndex].jid;
                        }
                    }
                }
            }
        }
    });

    setTimeout(() => {
        let voteCounts = {};
        for (let voter in pollVotes) {
            let votedFor = pollVotes[voter];
            voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
        }

        let sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
        let targetJid;
        let living = targetPlayers.filter(p => p.alive);

        if (sortedVotes.length > 0) {
            targetJid = sortedVotes[0][0];
        } else {
            targetJid = living[Math.floor(Math.random() * living.length)].jid;
        }

        callback(targetJid);
    }, duration);
}

// المرحلة الثانية: جريمة القتل الغامضة والمشتبه بهم والقبض عليهم ومحاكمتهم بالقصاص
async function startSecondPhase(conn, chatId) {
    let game = global.pirateGames[chatId];
    let survivingPlayers = game.players.filter(p => p.alive);

    let crimeImage = 'https://i.postimg.cc/nrDGyjpD/b7d4ec91a3d00e2ad20cb3b941ada1ff.jpg';
    await conn.sendMessage(chatId, {
        image: { url: crimeImage },
        caption: `⚓ *استعدوا للقادم أيها المتبقون على متن السفينة!* \nالبحر يخفي أسراراً مرعبة... لقد تم العثور على أحد أفراد الطاقم ميتاً في ظروف غامضة! 🗡️🩸`
    });

    await new Promise(r => setTimeout(r, 4000));

    let shuffledLiving = survivingPlayers.sort(() => 0.5 - Math.random());
    let suspects = shuffledLiving.slice(0, 2);
    game.suspects = suspects;

    let suspectImage = 'https://i.postimg.cc/BbKBrL4L/bbb52a9fd0ff0e03abc64dcf7a225fc1.jpg';
    await conn.sendMessage(chatId, {
        image: { url: suspectImage },
        caption: `⚖️ *تحقيق عاجل عبر استطلاع الرأي:* \nوُجهت أصابع الاتهام واشتبه البوت في كلا من:\n1️⃣ @${suspects[0].jid.split('@')[0]} (${suspects[0].role})\n2️⃣ @${suspects[1].jid.split('@')[0]} (${suspects[1].role})\n\nصوّت في الاستطلاع أدناه لإدانة الجاني وإلقاء القبض عليه لمحاكمته بالقصاص! ⚖️`,
        mentions: suspects.map(s => s.jid)
    });

    let pollValues2 = suspects.map(s => `${s.role} (@${s.jid.split('@')[0]})`);

    let poll2 = await conn.sendMessage(chatId, {
        poll: {
            name: "⚖️ [محاكمة المشتبه بهم] من هو القاتل؟",
            values: pollValues2,
            selectableCount: 1
        }
    });

    startSuspectPollVoting(conn, chatId, poll2.key.id, suspects, 60000, async (guiltyJid) => {
        let guiltyPlayer = suspects.find(s => s.jid === guiltyJid) || suspects[0];
        guiltyPlayer.alive = false;

        let revealImage = 'https://i.postimg.cc/4yqFtRNH/IMG-20260831-WA4240.jpg';
        await conn.sendMessage(chatId, {
            image: { url: revealImage },
            caption: `⚡ *إعلان الحكم النهائي!* \nأظهرت الأصوات إدانة الجاني: @${guiltyPlayer.jid.split('@')[0]} (${guiltyPlayer.role})!\nتم القبض عليه وسيُحاكم عليه بالقصاص! ⚖️⚔️`,
            mentions: [guiltyPlayer.jid]
        });

        await startFinalShowdown(conn, chatId);
    });
}

function startSuspectPollVoting(conn, chatId, pollMsgId, suspectsList, duration, callback) {
    let game = global.pirateGames[chatId];
    let pollVotes = {};

    let listener = conn.ev.on('messages.update', async (updates) => {
        for (let update of updates) {
            if (update.key.id === pollMsgId && update.update?.pollUpdates) {
                let pollUpdates = update.update.pollUpdates;
                for (let pu of pollUpdates) {
                    let voterJid = pu.sender || update.key.participant;
                    let selectedOptions = pu.optionAcks || [];
                    if (selectedOptions.length > 0) {
                        let chosenIndex = selectedOptions[0];
                        if (suspectsList[chosenIndex]) {
                            pollVotes[voterJid] = suspectsList[chosenIndex].jid;
                        }
                    }
                }
            }
        }
    });

    setTimeout(() => {
        let voteCounts = {};
        for (let voter in pollVotes) {
            let votedFor = pollVotes[voter];
            voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
        }

        let sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
        let guilty = sorted.length > 0 ? sorted[0][0] : suspectsList[0].jid;
        callback(guilty);
    }, duration);
}

// المرحلة النهائية: المعركة الحاسمة مع رسالة التبديل السريع واستطلاع الرأي الختامي وتنظيف الجلسة
async function startFinalShowdown(conn, chatId) {
    let game = global.pirateGames[chatId];
    let finalists = game.players.filter(p => p.alive);

    if (finalists.length < 2) {
        delete global.pirateGames[chatId];
        return conn.sendMessage(chatId, { text: '🏆 انتهت اللعبة لعدم اكتمال المتنافسين الأخيرين!' });
    }

    let p1 = finalists[0];
    let p2 = finalists[1];

    let finalShowdownImage = 'https://i.postimg.cc/XqCkRG4y/fa60c1fdc9f47f96543a9a1c926d50c4.jpg';
    let changingMsg = await conn.sendMessage(chatId, {
        image: { url: finalShowdownImage },
        caption: `🔥 *المعركة الحاسمة والتحدي الملكي الأخير!* \nلم يتبقَ سوى البطلين:\n1️⃣ @${p1.jid.split('@')[0]} (${p1.role})\n2️⃣ @${p2.jid.split('@')[0]} (${p2.role})\n\n🎡 *جاري تدوير عجلة الحظ الكبرى في نفس الرسالة لاختيار الفائز بالتحدي الفاصل...* ⚡`,
        mentions: [p1.jid, p2.jid]
    });

    let spinningNames = [
        `🔄 جارِ السحب بين: [@${p1.jid.split('@')[0]}] و [@${p2.jid.split('@')[0]}]...`,
        `⚡ اللحظات الحاسمة تقترب...`,
        `🎲 يتم اختيار البطل الأسطوري الآن...`
    ];

    for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 1500));
        await conn.sendMessage(chatId, {
            text: spinningNames[i],
            edit: changingMsg.key
        });
    }

    let round2Winner = Math.random() < 0.5 ? p1 : p2;

    await conn.sendMessage(chatId, {
        text: `🎯 *نتيجة عجلة الحظ:* \nحسم البطل @${round2Winner.jid.split('@')[0]} النقطة لصالح في الجولة الثانية! 🌟`,
        edit: changingMsg.key,
        mentions: [round2Winner.jid]
    });

    await new Promise(r => setTimeout(r, 3000));

    // المرحلة الثالثة والفاصلة: استطلاع رأي حقيقي أخير بالألقاب
    let finalPollValues = [
        `${p1.role} (@${p1.jid.split('@')[0]})`,
        `${p2.role} (@${p2.jid.split('@')[0]})`
    ];

    let finalPoll = await conn.sendMessage(chatId, {
        poll: {
            name: "👑 [الخاتمة الكبرى] من يستحق كنز القراصنة الأبدي؟",
            values: finalPollValues,
            selectableCount: 1
        }
    });

    let finalPollVotes = {};

    let finalListener = conn.ev.on('messages.update', async (updates) => {
        for (let update of updates) {
            if (update.key.id === finalPoll.key.id && update.update?.pollUpdates) {
                let pollUpdates = update.update.pollUpdates;
                for (let pu of pollUpdates) {
                    let voterJid = pu.sender || update.key.participant;
                    let selectedOptions = pu.optionAcks || [];
                    if (selectedOptions.length > 0) {
                        let chosenIndex = selectedOptions[0];
                        if (chosenIndex === 0) finalPollVotes[voterJid] = p1.jid;
                        if (chosenIndex === 1) finalPollVotes[voterJid] = p2.jid;
                    }
                }
            }
        }
    });

    setTimeout(async () => {
        let p1Count = 0;
        let p2Count = 0;

        for (let voter in finalPollVotes) {
            if (finalPollVotes[voter] === p1.jid) p1Count++;
            if (finalPollVotes[voter] === p2.jid) p2Count++;
        }

        let ultimateWinner;
        if (p1Count > p2Count) {
            ultimateWinner = p1;
        } else if (p2Count > p1Count) {
            ultimateWinner = p2;
        } else {
            ultimateWinner = round2Winner;
        }

        let winnerImage = 'https://i.postimg.cc/X75shhYf/336bc83562d41d415c029ec8c9545d68.jpg';

        let victoryText = `◆━═━═━═━═━═━═━═━═━◆
🃏 *𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹* ⟾ *إعلان ملك البحار والكنز* 👑🏴‍☠️
◆━═━═━═━═━═━═━═━═━◆
│ 🏆 *الفائز العظيم ومالك الكنز الأبدي:*
│ @${ultimateWinner.jid.split('@')[0]} (${ultimateWinner.role})!
│
│ *BOOYAH! لقد ربحت كنز القراصنة العظيم ونلت الجبروت والسلطان على متن السفينة!* 🏴‍☠️🔥
◆━═━═━═━═━═━═━═━═━◆
*👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ*`;

        await conn.sendMessage(chatId, {
            image: { url: winnerImage },
            caption: victoryText,
            mentions: [ultimateWinner.jid]
        });

        // تنظيف جلسة اللعبة بالكامل للسماح ببدء جلسة جديدة فوراً دون أي مشاكل
        delete global.pirateGames[chatId];
    }, 60000);
}

handler.command = /^(سفينه_القراصنه|سفينة_القراصنه|pirateship)$/i;
export default handler;
