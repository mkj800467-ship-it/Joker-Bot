import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

const baseURL = 'https://ezgif.com';

function isURL(path) {
    let lower = path.trim().toLowerCase();
    return lower.startsWith('https://') || lower.startsWith('http://');
}

async function loadImage(type, path) {
    let data = new FormData();
    if (isURL(path))
        data.append('new-image-url', path);
    else
        data.append('new-image', fs.createReadStream(path), 'image.webp');
    
    let result = await axios({
        url: `${baseURL}/${type}`,
        method: 'POST',
        data: data,
        headers: data.getHeaders(),
        timeout: 30000
    });
    return cheerio.load(result.data);
}

async function imageToBuffer(url) {
    let img = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
    return Buffer.from(img.data);
}

function setupModifiers(cResultData) {
    let token = cResultData('input[name=token]').attr('value');
    let newUrl = cResultData('form').attr('action');
    let file = newUrl.substr(newUrl.lastIndexOf('/') + 1);
    let data = new FormData();
    data.append('file', file);
    data.append('token', token);
    return { data, newUrl };
}

async function modify(newUrl, data) {
    let speed = await axios({
        url: newUrl,
        method: 'POST',
        data: data,
        headers: data.getHeaders(),
        timeout: 30000
    });
    let cSpeed = cheerio.load(speed.data);
    let output = cSpeed('div[id=output]').html();
    let cOutput = cheerio.load(output);
    let saveLink = cOutput('a[class=save]').attr('href');
    if (!saveLink) throw new Error("لم يتم العثور على رابط الحفظ");
    return saveLink;
}

// الدالة الرئيسية لتحويل WebP إلى MP4
async function webpToMp4(source, options = {}) {
    try {
        // تحديد المصدر (ملف محلي أو رابط)
        const isUrl = isURL(source);
        let filePath = source;
        
        if (!isUrl && Buffer.isBuffer(source)) {
            // إذا كان المصدر Buffer، نحتاج لحفظه مؤقتاً
            const tempPath = './tmp/' + Date.now() + '.webp';
            fs.writeFileSync(tempPath, source);
            filePath = tempPath;
            const result = await webpToMp4(filePath, options);
            fs.unlinkSync(tempPath);
            return result;
        }
        
        // 1. تحميل الصفحة ورفع الملف
        const $ = await loadImage('webp-to-mp4', filePath);
        
        // 2. إعداد البيانات للإرسال
        const token = $('input[name=token]').attr('value');
        const formAction = $('form').attr('action');
        const fileId = formAction.substr(formAction.lastIndexOf('/') + 1);
        
        const data = new FormData();
        data.append('file', fileId);
        data.append('token', token);
        
        // إضافة خيارات إضافية
        if (options.loop !== undefined) data.append('loop', options.loop ? 'on' : '');
        if (options.method) data.append('method', options.method);
        
        // 3. إرسال طلب التحويل
        const resultUrl = await modify(formAction, data);
        
        // 4. تحويل النتيجة إلى Buffer
        const buffer = await imageToBuffer(resultUrl);
        
        return buffer;
        
    } catch (error) {
        console.error("Ezgif conversion error:", error.message);
        throw new Error(`فشل تحويل WebP إلى MP4: ${error.message}`);
    }
}

// تحويل WebP إلى PNG
async function webpToPng(source) {
    try {
        const isUrl = isURL(source);
        let filePath = source;
        
        if (!isUrl && Buffer.isBuffer(source)) {
            const tempPath = './tmp/' + Date.now() + '.webp';
            fs.writeFileSync(tempPath, source);
            filePath = tempPath;
            const result = await webpToPng(filePath);
            fs.unlinkSync(tempPath);
            return result;
        }
        
        const $ = await loadImage('webp-to-png', filePath);
        
        const token = $('input[name=token]').attr('value');
        const formAction = $('form').attr('action');
        const fileId = formAction.substr(formAction.lastIndexOf('/') + 1);
        
        const data = new FormData();
        data.append('file', fileId);
        data.append('token', token);
        
        const resultUrl = await modify(formAction, data);
        const buffer = await imageToBuffer(resultUrl);
        
        return buffer;
        
    } catch (error) {
        console.error("Ezgif conversion error:", error.message);
        throw new Error(`فشل تحويل WebP إلى PNG: ${error.message}`);
    }
}

export {
    webpToMp4,
    webpToPng,
    isURL,
    loadImage,
    imageToBuffer
};