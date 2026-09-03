import { ffmpeg } from "../core/prototype_converter.js";

async function webp2mp4(buffer) {
    try {
        console.log("محاولة التحويل باستخدام FFmpeg...");
        
        // تحويل WebP إلى MP4 باستخدام FFmpeg مباشرة
        const result = await ffmpeg(buffer, [
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-crf", "23"
        ], "webp", "mp4");
        
        if (result && result.length > 1000) {
            console.log("تم التحويل بنجاح عبر FFmpeg");
            return result;
        }
        
        throw new Error("الملف الناتج صغير جداً أو تالف");
        
    } catch (error) {
        console.error("FFmpeg error:", error);
        throw new Error("فشل تحويل الاستيكر إلى فيديو. تأكد من أن FFmpeg مثبت بشكل صحيح.");
    }
}

async function webp2png(buffer) {
    try {
        // تحويل WebP إلى PNG
        const result = await ffmpeg(buffer, [
            "-c:v", "png",
            "-pix_fmt", "rgba"
        ], "webp", "png");
        
        return result;
        
    } catch (error) {
        console.error("PNG conversion error:", error);
        throw new Error("فشل تحويل الاستيكر إلى صورة");
    }
}

export { webp2mp4, webp2png };