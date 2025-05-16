# Blooom Next.js Uygulama Dağıtım Kılavuzu

Bu belge, Blooom Next.js uygulamasını kendi sunucunuza nasıl deploy edeceğinizi açıklamaktadır.

## Gereksinimler

- Node.js 18.0.0 veya üzeri
- PostgreSQL veritabanı
- Bun paket yöneticisi
- HTTPS desteği olan bir sunucu veya hosting hizmeti

## Kurulum Adımları

### 1. Projeyi Klonla veya Kopyala

```bash
# Projeyi indirin
git clone <repo-url> blooom-next
cd blooom-next
```

### 2. Bağımlılıkları Yükle

```bash
bun install
```

### 3. Veritabanı Kurulumu

- PostgreSQL veritabanı oluşturun
- Mevcut migration'ları apply edin:

```bash
bun prisma migrate deploy
```

- Seed verilerini yükleyin:

```bash
bun prisma db seed
```

### 4. Environment Değişkenlerini Ayarla

`.env.example` dosyasını `.env` olarak kopyalayıp gerçek değerlerle doldurun:

```bash
cp .env.example .env
```

`.env` dosyasındaki değerleri kendi ortamınıza göre güncelleyin:

- `DATABASE_URL`: PostgreSQL veritabanı bağlantı dizinizi girin
- `NEXTAUTH_SECRET`: Güvenli, rastgele bir string oluşturun (OpenSSL ile oluşturabilirsiniz)
- `NEXTAUTH_URL`: Uygulamanızın üretim URL'i
- `WS_PORT`: WebSocket sunucusu için port (genellikle 4000)
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket sunucu adresi (public URL)

### 5. Projeyi Build Et

```bash
bun run build
```

### 6. WebSocket Sunucusunu Ayarla

WebSocket sunucusu için bir process manager (PM2 gibi) kullanmanız önerilir:

```bash
# PM2 kurulumu
npm install -g pm2

# WebSocket sunucusunu başlat
pm2 start server.js --name "blooom-websocket"
```

### 7. Next.js Uygulamasını Başlat

```bash
# Üretim modunda başlat
bun run start
```

Alternatif olarak, PM2 ile yönetin:

```bash
pm2 start "bun run start" --name "blooom-next"
```

### 8. Reverse Proxy Ayarları (Nginx örneği)

```nginx
# Next.js uygulaması için
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# WebSocket sunucusu için
server {
    listen 4000;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9. HTTPS Yapılandırması

Certbot kullanarak Let's Encrypt SSL sertifikası oluşturabilirsiniz:

```bash
sudo certbot --nginx -d yourdomain.com
```

## Monolith Kurulum Alternatifi

Tek bir process ile hem Next.js hem de WebSocket sunucusunu çalıştırmak için:

```bash
# package.json içinde
"scripts": {
  "start:prod": "concurrently \"next start -p 3000\" \"node server.js\""
}
```

```bash
bun run start:prod
```

## Sorun Giderme

- **Veritabanı bağlantı sorunları**: PostgreSQL'in çalıştığından ve bağlantı URL'inin doğru olduğundan emin olun
- **WebSocket bağlantı sorunları**: Güvenlik duvarı ayarlarını kontrol edin, portun açık olduğundan emin olun
- **Oturum sorunları**: NEXTAUTH_SECRET ve NEXTAUTH_URL değişkenlerinin doğru ayarlandığından emin olun

## 502 Bad Gateway Sorunları ve Çözümleri

502 Bad Gateway hatası, genellikle sunucu tarafında bir sorun olduğunda ortaya çıkar. Aşağıdaki adımları kontrol ederek sorunu çözebilirsiniz:

### 1. Sunucu Portları

- Next.js uygulaması (3000 portu) ve WebSocket sunucusunun (4000 portu) çalıştığından emin olun
- Güvenlik duvarı ayarlarını kontrol edin ve bu portların dışarıya açık olduğundan emin olun:

```bash
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 4000
```

### 2. Environment Değişkenleri

- `.env` dosyasındaki URL'lerin doğru olduğundan emin olun:
  - `NEXTAUTH_URL` gerçek domain adınızı içermeli
  - `NEXT_PUBLIC_SOCKET_URL` WebSocket sunucunuzun tam adresini içermeli
  - `CORS_ALLOWED_ORIGINS` ana domain adınızı içermeli

### 3. WebSocket Bağlantı Sorunları

- WebSocket sunucusunun çalıştığını doğrulayın:

```bash
pm2 status
curl http://localhost:4000
```

- WebSocket sunucusu loglarını kontrol edin:

```bash
pm2 logs blooom-websocket
```

### 4. Nginx Yapılandırma Sorunları

Nginx'in WebSocket'i doğru şekilde proxy yapmasını sağlayın:

```nginx
# WebSocket için eklenmesi gereken başlıklar
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_http_version 1.1;
```

WebSocket için zaman aşımı ayarlarını artırın:

```nginx
# WebSocket bağlantıları için zaman aşımı ayarları
proxy_read_timeout 86400s;
proxy_send_timeout 86400s;
```

### 5. Uygulama Günlükleri

Next.js uygulamasının günlüklerini kontrol edin:

```bash
pm2 logs blooom-next
```

### 6. Veritabanı Sorunları

Veritabanı bağlantısını test edin:

```bash
bun prisma db pull
```

### 7. Uygulamayı Yeniden Başlatma

Sorun devam ederse, tüm servisleri yeniden başlatın:

```bash
pm2 restart all
```

### 8. Temiz Kurulum

En son çare olarak, uygulamayı sıfırdan kurun:

```bash
# Uygulama klasörüne gidin
cd blooom-next

# Bağımlılıkları temizleyin ve yeniden yükleyin
rm -rf node_modules
bun install

# Yapıyı temizleyin ve yeniden oluşturun
rm -rf .next
bun run build

# Servisleri yeniden başlatın
pm2 restart all
```

## Güvenlik Notları

- `.env` dosyasını güvenli tutun ve git'e eklemediğinizden emin olun
- `NEXTAUTH_SECRET` için güçlü bir rastgele değer kullanın
- PostgreSQL parola ve kullanıcı adını paylaşılan ortamlarda kullanmayın
- WebSocket portunu, sadece gerekli trafiğe izin verecek şekilde yapılandırın
