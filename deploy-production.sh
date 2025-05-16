#!/bin/bash
# Blooom Next.js Üretim Dağıtım Scripti
# Kullanım: bash deploy-production.sh

# Hata kontrolü
set -e

echo "=== Blooom Next.js uygulaması üretim dağıtımı başlatılıyor ==="

# Mevcut dizin kontrolü
if [ ! -f "package.json" ]; then
  echo "Hata: Bu script Blooom Next.js projesi kök dizininde çalıştırılmalıdır."
  exit 1
fi

echo "=== Bağımlılıklar yükleniyor ==="
bun install

echo "=== Prisma istemcisi oluşturuluyor ==="
bun prisma generate

echo "=== Proje derleniyor ==="
bun run build

echo "=== PM2 durumu kontrol ediliyor ==="
if pm2 list | grep -q "blooom-next"; then
  echo "=== Next.js uygulaması yeniden başlatılıyor ==="
  pm2 restart blooom-next
else
  echo "=== Next.js uygulaması başlatılıyor ==="
  pm2 start "bun run start" --name "blooom-next"
fi

if pm2 list | grep -q "blooom-websocket"; then
  echo "=== WebSocket sunucusu yeniden başlatılıyor ==="
  pm2 restart blooom-websocket
else
  echo "=== WebSocket sunucusu başlatılıyor ==="
  pm2 start server.js --name "blooom-websocket"
fi

echo "=== PM2 yapılandırması kaydediliyor ==="
pm2 save

echo "=== Dağıtım tamamlandı ==="
echo "Next.js uygulaması ve WebSocket sunucusu çalışıyor"
pm2 status

echo ""
echo "Herhangi bir sorunla karşılaşırsanız, PM2 loglarını kontrol edin:"
echo "pm2 logs blooom-next"
echo "pm2 logs blooom-websocket"
