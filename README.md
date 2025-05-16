# Blooom Next.js Uygulaması

Blooom, çiftler için özel anılarını paylaşabilecekleri ve iletişim kurabilecekleri kişisel bir platform.

## Özellikler

- Kullanıcı kimlik doğrulama
- Gerçek zamanlı mesajlaşma
- Not ve şiir paylaşımı
- Tema değiştirme (açık/koyu)
- Admin paneli

## Teknik Yapı

- Next.js 15, React, TypeScript
- Tailwind CSS, Shadcn/UI
- PostgreSQL, Prisma ORM
- Socket.IO

## Kurulum

1. Bağımlılıkları yükleyin: `bun install`
2. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri girin
3. Veritabanını hazırlayın: `bun prisma migrate dev`
4. Örnek verileri yükleyin: `bun prisma db seed`
5. Uygulamayı başlatın: `bun run dev:all` (hem Next.js hem de WebSocket sunucusu başlatılır)

## Üretim için Dağıtım

### Hızlı Kurulum

Sunucunuzda projeyi hızlıca kurmak için:

1. `server-setup.sh` dosyasını kullanarak sunucuya temel kurulumu yapın:
   ```bash
   sudo bash server-setup.sh yourdomain.com
   ```

2. Projeyi sunucuya aktarın ve `deploy-production.sh` dosyasını çalıştırın:
   ```bash
   bash deploy-production.sh
   ```

### 502 Bad Gateway Sorunu

Eğer dağıtım sonrası 502 hatası alıyorsanız:

1. WebSocket sunucusunun çalıştığından emin olun (`pm2 status`)
2. `.env` dosyasındaki URL'lerin doğru yapılandırıldığını kontrol edin
3. Nginx yapılandırmasını kontrol edin
4. Servisleri yeniden başlatın: `pm2 restart all`

Ayrıntılı dağıtım ve sorun giderme adımları için `DEPLOYMENT.md` dosyasına bakın.

## Test Hesapları

- Admin: `admin` / `admin123`
- Normal Kullanıcı: `user` / `user123`

## Lisans

Bu proje özel kullanım içindir.
