#!/bin/bash
# Blooom Next.js Server Kurulum Scripti
# Kullanım: sudo bash server-setup.sh yourdomain.com

# Hata kontrolü
set -e

# Domain parametresi kontrolü
if [ -z "$1" ]; then
  echo "Domain adını belirtin: sudo bash server-setup.sh yourdomain.com"
  exit 1
fi

DOMAIN=$1
APP_DIR="/var/www/blooom-next"
NODE_VERSION="20"

echo "=== Blooom Next.js uygulaması için sunucu kurulumu başlatılıyor ==="
echo "Domain: $DOMAIN"
echo "Uygulama dizini: $APP_DIR"

# Sistem güncellemesi
echo "=== Sistem güncellemesi yapılıyor ==="
apt update && apt upgrade -y

# Gerekli paketleri yükle
echo "=== Gerekli paketler yükleniyor ==="
apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Node.js kurulumu
echo "=== Node.js v$NODE_VERSION kuruluyor ==="
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Bun kurulumu
echo "=== Bun paket yöneticisi kuruluyor ==="
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc

# PM2 kurulumu
echo "=== PM2 process manager kuruluyor ==="
npm install -g pm2

# Nginx yapılandırması
echo "=== Nginx yapılandırması oluşturuluyor ==="
cat > /etc/nginx/sites-available/blooom-next.conf << EOF
# Blooom Next.js Nginx Konfigürasyonu

# Upstream Next.js uygulaması için
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Upstream WebSocket sunucusu için
upstream websocket_upstream {
    server 127.0.0.1:4000;
    keepalive 64;
}

# HTTP -> HTTPS yönlendirmesi
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        return 301 https://\$host\$request_uri;
    }

    # Let's Encrypt doğrulama
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}

# Ana HTTPS sunucu
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL sertifikaları otomatik olarak eklenecek (certbot tarafından)

    # Güvenlik başlıkları
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Frame-Options SAMEORIGIN;

    # Gzip sıkıştırma
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Next.js API route'ları
    location /api/ {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket sunucusu için özel yapılandırma
    location /socket.io/ {
        proxy_pass http://websocket_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket için uzun zaman aşımı süreleri
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # _next (statik içerik) için özel önbellek yapılandırması
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;

        # Statik içerik için önbellek
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    # Diğer tüm Next.js route'ları
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Nginx yapılandırmasını etkinleştir
ln -sf /etc/nginx/sites-available/blooom-next.conf /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Güvenlik duvarı yapılandırması
echo "=== Güvenlik duvarı yapılandırılıyor ==="
ufw allow 'Nginx Full'
ufw allow 3000
ufw allow 4000
ufw --force enable

# SSL sertifikası
echo "=== SSL sertifikası alınıyor ==="
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Uygulama dizini oluşturma
echo "=== Uygulama dizini hazırlanıyor ==="
mkdir -p $APP_DIR
chown -R www-data:www-data $APP_DIR

# Environment örneği
cat > $APP_DIR/.env.example << EOF
# Database configuration
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"

# NextAuth configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://$DOMAIN"

# WebSocket server configuration
WS_PORT=4000
NEXT_PUBLIC_SOCKET_URL="https://$DOMAIN:4000"

# CORS configuration
CORS_ALLOWED_ORIGINS="https://$DOMAIN,https://www.$DOMAIN"
EOF

# PM2 yapılandırması
pm2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u www-data --hp /var/www

echo "=== Kurulum tamamlandı ==="
echo "Uygulamanızı $APP_DIR dizinine deploy edin ve aşağıdaki komutu çalıştırın:"
echo "cd $APP_DIR && bun install && bun run build"
echo ""
echo "Ardından PM2 ile uygulamayı başlatın:"
echo "pm2 start \"bun run start\" --name \"blooom-next\" && pm2 start server.js --name \"blooom-websocket\""
echo ""
echo "PM2 yapılandırmasını kaydedin:"
echo "pm2 save"
echo ""
echo "Uygulama şimdi https://$DOMAIN adresinde erişilebilir olacak"
