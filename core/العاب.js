// core/العاب.js
// ⧼ 𝑷𝑹𝑶𝑻𝑶𝑻𝒀𝑷𝑬 ⧽ v2 - نظام إدارة الألعاب المركزي 🎮

import fs from 'fs';
import path from 'path';
import { theme } from './theme.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 إعدادات قاعدة البيانات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const dataPath = path.join(process.cwd(), 'database', 'players.json');
const cooldownsPath = path.join(process.cwd(), 'database', 'cooldowns.json');

// التأكد من وجود المجلد والملفات
function ensureDatabase() {
    const dbDir = path.join(process.cwd(), 'database');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}));
    if (!fs.existsSync(cooldownsPath)) fs.writeFileSync(cooldownsPath, JSON.stringify({}));
}

// قراءة قاعدة البيانات
function readDB() {
    ensureDatabase();
    return JSON.parse(fs.readFileSync(dataPath));
}

// كتابة قاعدة البيانات
function writeDB(data) {
    ensureDatabase();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// قراءة الكول داون
function readCooldowns() {
    ensureDatabase();
    return JSON.parse(fs.readFileSync(cooldownsPath));
}

// كتابة الكول داون
function writeCooldowns(data) {
    ensureDatabase();
    fs.writeFileSync(cooldownsPath, JSON.stringify(data, null, 2));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 دالات إدارة اللاعبين
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// الحصول على بيانات لاعب (تنشئ حساب جديد إذا ما كانش موجود)
export function getPlayer(userId) {
    const db = readDB();
    if (!db[userId]) {
        db[userId] = {
            // الأساسيات
            xp: 0,
            level: 1,
            money: 0,
            totalXp: 0,
            
            // إحصائيات الألعاب
            stats: {
                wins: 0,
                losses: 0,
                draws: 0,
                gamesPlayed: 0
            },
            
            // المكافآت اليومية/الأسبوعية/الشهرية
            lastDaily: null,
            lastWeekly: null,
            lastMonthly: null,
            lastDaily2: null,
            lastWeekly2: null,
            lastMonthly2: null,
            
            // الموارد
            resources: {
                wood: 0,
                stone: 0,
                iron: 0,
                gold: 0,
                diamond: 0,
                emerald: 0
            },
            
            // المخزون
            inventory: [],
            
            // تاريخ التسجيل
            registeredAt: new Date().toISOString()
        };
        writeDB(db);
    }
    return db[userId];
}

// تحديث بيانات لاعب
export function updatePlayer(userId, data) {
    const db = readDB();
    db[userId] = { ...db[userId], ...data };
    writeDB(db);
    return db[userId];
}

// حذف حساب لاعب
export function deletePlayer(userId) {
    const db = readDB();
    delete db[userId];
    writeDB(db);
    return true;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 دالات XP والليفل
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// حساب الليفل بناءً على XP
export function calcLevel(xp) {
    // الصيغة: XP مطلوب = (الليفل) × 100
    return Math.floor(xp / 100) + 1;
}

// حساب XP المطلوب لليفل معين
export function xpNeededForLevel(level) {
    return level * 100;
}

// إضافة XP للاعب (تلقائياً ترفع الليفل وتعطي مكافأة)
export async function addXP(userId, amount, conn = null, m = null) {
    let player = getPlayer(userId);
    const oldLevel = player.level;
    
    player.xp += amount;
    player.totalXp += amount;
    player.level = calcLevel(player.xp);
    
    updatePlayer(userId, player);
    
    // إذا زاد الليفل
    if (player.level > oldLevel && conn && m) {
        const reward = player.level * 100;
        player.money += reward;
        updatePlayer(userId, player);
        
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🎉 تهانينا! 🎉' },
                { type: 'spacer' },
                { type: 'info', label: '📈', value: `لقد وصلت إلى الليفل ${player.level}` },
                { type: 'info', label: '💰', value: `حصلت على ${reward} فلوس كمكافأة!` }
            ])
        });
    }
    
    return { oldLevel, newLevel: player.level, xpGained: amount };
}

// خصم XP
export function removeXP(userId, amount) {
    let player = getPlayer(userId);
    if (player.xp < amount) return false;
    player.xp -= amount;
    player.level = calcLevel(player.xp);
    updatePlayer(userId, player);
    return true;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 دالات الفلوس
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// إضافة فلوس
export function addMoney(userId, amount) {
    let player = getPlayer(userId);
    player.money += amount;
    updatePlayer(userId, player);
    return player.money;
}

// خصم فلوس
export function removeMoney(userId, amount) {
    let player = getPlayer(userId);
    if (player.money < amount) return false;
    player.money -= amount;
    updatePlayer(userId, player);
    return true;
}

// تحويل فلوس من لاعب لآخر
export function transferMoney(fromUserId, toUserId, amount) {
    if (removeMoney(fromUserId, amount)) {
        addMoney(toUserId, amount);
        return true;
    }
    return false;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 دالات الموارد
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// إضافة مورد
export function addResource(userId, resource, amount) {
    let player = getPlayer(userId);
    if (!player.resources[resource]) player.resources[resource] = 0;
    player.resources[resource] += amount;
    updatePlayer(userId, player);
    return player.resources[resource];
}

// خصم مورد
export function removeResource(userId, resource, amount) {
    let player = getPlayer(userId);
    if (!player.resources[resource] || player.resources[resource] < amount) return false;
    player.resources[resource] -= amount;
    updatePlayer(userId, player);
    return true;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 دالات إحصائيات الألعاب
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// تسجيل فوز
export function addWin(userId) {
    let player = getPlayer(userId);
    player.stats.wins++;
    player.stats.gamesPlayed++;
    updatePlayer(userId, player);
}

// تسجيل خسارة
export function addLoss(userId) {
    let player = getPlayer(userId);
    player.stats.losses++;
    player.stats.gamesPlayed++;
    updatePlayer(userId, player);
}

// تسجيل تعادل
export function addDraw(userId) {
    let player = getPlayer(userId);
    player.stats.draws++;
    player.stats.gamesPlayed++;
    updatePlayer(userId, player);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏰ دالات الكول داون
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// التحقق من الكول داون
export function checkCooldown(userId, command, seconds = 5) {
    const cooldowns = readCooldowns();
    const key = `${userId}_${command}`;
    const now = Date.now();
    
    if (cooldowns[key] && cooldowns[key] > now) {
        const remaining = Math.ceil((cooldowns[key] - now) / 1000);
        return { onCooldown: true, remaining };
    }
    
    cooldowns[key] = now + (seconds * 1000);
    writeCooldowns(cooldowns);
    return { onCooldown: false, remaining: 0 };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏆 دالات الترتيب والمكافآت
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// الحصول على ترتيب اللاعبين (ليدر بورد)
export function getLeaderboard(type = 'xp', limit = 10) {
    const db = readDB();
    const players = Object.entries(db).map(([id, data]) => ({
        id,
        name: id.split('@')[0],
        xp: data.xp,
        level: data.level,
        money: data.money,
        wins: data.stats.wins
    }));
    
    if (type === 'xp') players.sort((a, b) => b.xp - a.xp);
    else if (type === 'money') players.sort((a, b) => b.money - a.money);
    else if (type === 'wins') players.sort((a, b) => b.wins - a.wins);
    
    return players.slice(0, limit);
}

// مكافأة يومية
export async function dailyReward(userId, conn, m) {
    let player = getPlayer(userId);
    const now = new Date().toDateString();
    
    if (player.lastDaily === now) {
        return { success: false, message: 'لقد حصلت على مكافأتك اليومية بالفعل!' };
    }
    
    const reward = 100;
    player.money += reward;
    player.lastDaily = now;
    updatePlayer(userId, player);
    
    return { success: true, reward, message: `🎁 مكافأتك اليومية: ${reward} فلوس!` };
}

// مكافأة أسبوعية
export async function weeklyReward(userId, conn, m) {
    let player = getPlayer(userId);
    const now = new Date();
    const lastWeek = player.lastWeekly ? new Date(player.lastWeekly) : null;
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (lastWeek && (now - lastWeek) < weekInMs) {
        const remaining = Math.ceil((weekInMs - (now - lastWeek)) / (24 * 60 * 60 * 1000));
        return { success: false, message: `المكافأة الأسبوعية متاحة بعد ${remaining} يوم` };
    }
    
    const reward = 500;
    player.money += reward;
    player.lastWeekly = now.toISOString();
    updatePlayer(userId, player);
    
    return { success: true, reward, message: `🎁 مكافأتك الأسبوعية: ${reward} فلوس!` };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 عرض معلومات اللاعب
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getPlayerInfo(userId) {
    const player = getPlayer(userId);
    return {
        xp: player.xp,
        level: player.level,
        money: player.money,
        totalXp: player.totalXp,
        wins: player.stats.wins,
        losses: player.stats.losses,
        draws: player.stats.draws,
        gamesPlayed: player.stats.gamesPlayed,
        winRate: player.stats.gamesPlayed > 0 
            ? ((player.stats.wins / player.stats.gamesPlayed) * 100).toFixed(1) 
            : 0
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 دالة مساعدة للألعاب (نتيجة موحدة)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function handleGameResult(userId, result, xpGain, moneyGain, conn, m) {
    // win, loss, draw
    if (result === 'win') addWin(userId);
    else if (result === 'loss') addLoss(userId);
    else if (result === 'draw') addDraw(userId);
    
    await addXP(userId, xpGain, conn, m);
    addMoney(userId, moneyGain);
    
    const player = getPlayer(userId);
    
    return {
        xpGained: xpGain,
        moneyGained: moneyGain,
        newLevel: player.level,
        newMoney: player.money,
        stats: player.stats
    };
}

export default {
    getPlayer,
    updatePlayer,
    deletePlayer,
    calcLevel,
    addXP,
    removeXP,
    addMoney,
    removeMoney,
    transferMoney,
    addResource,
    removeResource,
    addWin,
    addLoss,
    addDraw,
    checkCooldown,
    getLeaderboard,
    dailyReward,
    weeklyReward,
    getPlayerInfo,
    handleGameResult
};