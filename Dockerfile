FROM node:18-alpine

# تثبيت الحزم الكاملة: بايثون، أدوات البناء، ffmpeg، git، curl، الأدوات البرمجية وكل ما يحتاجه yt-dlp للتحميل بدون مشاكل
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    git \
    curl \
    bash \
    build-base \
    g++ \
    make \
    ca-certificates \
    libstdc++ \
    libgcc

# تحديث وتثبيت أحدث نسخة من yt-dlp مباشرة لضمان عدم توقف الفيديوهات والإيديتات أبداً
RUN python3 -m pip install --no-cache-dir --upgrade pip && \
    python3 -m pip install --no-cache-dir --upgrade yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

