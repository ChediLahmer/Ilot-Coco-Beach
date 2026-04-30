# Deployment Guide — OVH Cloud (VPS)

## Recommended OVH Plan

| Resource      | Minimum          | Recommended      |
| ------------- | ---------------- | ---------------- |
| **Plan**      | VPS Starter      | VPS Essential    |
| **vCPU**      | 1                | 2                |
| **RAM**       | 2 GB             | 4 GB             |
| **Storage**   | 20 GB SSD        | 40 GB SSD        |
| **OS**        | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **Bandwidth** | Unlimited        | Unlimited        |

Estimated cost: **~€6–12/month** on OVH.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  OVH VPS (Ubuntu)                           │
│                                             │
│  ┌───────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Nginx    │  │ Node.js  │  │ Postgres │  │
│  │  :80/:443 │→ │ :3000    │  │  :5432   │  │
│  └───────────┘  └──────────┘  └─────────┘  │
│       │                                     │
│       ├── /          → client dist (static) │
│       ├── /admin     → admin dist (static)  │
│       └── /api/*     → proxy to Node :3000  │
│                                             │
│  ┌──────────┐                               │
│  │  MinIO   │  (or local filesystem)        │
│  │  :9000   │                               │
│  └──────────┘                               │
└─────────────────────────────────────────────┘
```

---

## Step 1: Server Setup

```bash
# Connect via SSH
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install essentials
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2
```

---

## Step 2: Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Step 3: PostgreSQL

```bash
sudo -u postgres psql

CREATE USER cocobeach WITH PASSWORD 'CHANGE_THIS_STRONG_PASSWORD';
CREATE DATABASE cocobeach OWNER cocobeach;
\q
```

---

## Step 4: MinIO (Optional — for file uploads)

If you want S3-compatible storage for images. Otherwise you can use local filesystem.

```bash
# Download MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
mv minio /usr/local/bin/

# Create data directory
mkdir -p /data/minio

# Create systemd service
cat > /etc/systemd/system/minio.service << 'EOF'
[Unit]
Description=MinIO
After=network.target

[Service]
User=root
Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=CHANGE_THIS_PASSWORD"
ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable minio
systemctl start minio
```

Create the bucket:

```bash
# Install mc (MinIO client)
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc && mv mc /usr/local/bin/

mc alias set local http://localhost:9000 minioadmin CHANGE_THIS_PASSWORD
mc mb local/cocobeach
mc anonymous set download local/cocobeach
```

---

## Step 5: Deploy Application

```bash
# Create app user
adduser --disabled-password cocobeach
mkdir -p /home/cocobeach/app
cd /home/cocobeach/app

# Clone your repository (or upload via scp/rsync)
git clone https://your-repo-url.git .

# Backend setup
cd backend
npm ci --production

# Create .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://cocobeach:CHANGE_THIS_STRONG_PASSWORD@localhost:5432/cocobeach"
JWT_SECRET="GENERATE_A_RANDOM_64_CHAR_STRING"
PORT=3000
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="CHANGE_THIS_PASSWORD"
S3_BUCKET="cocobeach"
S3_REGION="us-east-1"
S3_PUBLIC_URL="https://yourdomain.com/storage"
CORS_ORIGIN="https://yourdomain.com,https://admin.yourdomain.com"
EOF

# Run migrations + seed
npx prisma migrate deploy
npx prisma db seed

# Build client frontends
cd ../client
npm ci && npx vite build

cd ../admin
npm ci && npx vite build
```

---

## Step 6: PM2 — Process Manager

```bash
cd /home/cocobeach/app/backend

pm2 start src/index.js --name cocobeach-api --node-args="--env-file=.env"
pm2 save
pm2 startup
```

---

## Step 7: Nginx Configuration

```nginx
# /etc/nginx/sites-available/cocobeach
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Client frontend
    root /home/cocobeach/app/client/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }

    # MinIO storage proxy (public bucket)
    location /storage/ {
        proxy_pass http://127.0.0.1:9000/cocobeach/;
        proxy_set_header Host $host;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|webp|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Admin panel (subdomain or path)
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /home/cocobeach/app/admin/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable & test:

```bash
ln -s /etc/nginx/sites-available/cocobeach /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## Step 8: SSL (Let's Encrypt)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com
```

Auto-renewal is configured automatically by certbot.

---

## Step 9: DNS (OVH Domain)

In OVH DNS zone manager, add:

| Type | Name  | Target      |
| ---- | ----- | ----------- |
| A    | @     | YOUR_VPS_IP |
| A    | www   | YOUR_VPS_IP |
| A    | admin | YOUR_VPS_IP |

---

## Maintenance Commands

### Reset Admin Password

```bash
cd /home/cocobeach/app/backend
node scripts/reset-password.js admin@ilotcocobeach.tn newpassword123
```

### Update Deployment

```bash
cd /home/cocobeach/app
git pull

# Backend
cd backend && npm ci --production
npx prisma migrate deploy
pm2 restart cocobeach-api

# Client
cd ../client && npm ci && npx vite build

# Admin
cd ../admin && npm ci && npx vite build
```

### View Logs

```bash
pm2 logs cocobeach-api
pm2 monit
```

### Database Backup

```bash
# Add to crontab: crontab -e
# Daily backup at 3am
0 3 * * * pg_dump -U cocobeach cocobeach | gzip > /home/cocobeach/backups/db-$(date +\%Y\%m\%d).sql.gz
```

---

## Environment Variables Reference

| Variable             | Description                       | Example                                           |
| -------------------- | --------------------------------- | ------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection             | `postgresql://user:pass@localhost:5432/cocobeach` |
| `JWT_SECRET`         | Token signing key (min 32 chars)  | Random string                                     |
| `PORT`               | Backend port                      | `3000`                                            |
| `S3_ENDPOINT`        | MinIO/S3 endpoint                 | `http://localhost:9000`                           |
| `S3_ACCESS_KEY`      | Storage access key                | `minioadmin`                                      |
| `S3_SECRET_KEY`      | Storage secret key                | Secret                                            |
| `S3_BUCKET`          | Bucket name                       | `cocobeach`                                       |
| `S3_REGION`          | Region                            | `us-east-1`                                       |
| `S3_PUBLIC_URL`      | Public URL for uploaded files     | `https://yourdomain.com/storage`                  |
| `CORS_ORIGIN`        | Allowed origins (comma-separated) | `https://yourdomain.com`                          |
| `BREVO_API_KEY`      | Brevo transactional email API key | `xkeysib-...`                                     |
| `BREVO_SENDER_EMAIL` | Sender email for password resets  | `noreply@ilotcocobeach.tn`                        |
| `ADMIN_URL`          | Admin panel URL (for reset links) | `https://admin.yourdomain.com`                    |

---

## Password Reset (Brevo)

The admin panel includes a "Forgot Password" flow that sends reset emails via [Brevo](https://www.brevo.com) (free tier: 300 emails/day).

### Setup

1. Create a free Brevo account at https://www.brevo.com
2. Go to **SMTP & API** → **API Keys** → Generate a new key
3. Add a verified sender email in **Senders, Domains & Dedicated IPs**
4. Set these environment variables in `backend/.env`:
   ```
   BREVO_API_KEY=xkeysib-your-api-key-here
   BREVO_SENDER_EMAIL=noreply@ilotcocobeach.tn
   ADMIN_URL=https://admin.yourdomain.com
   ```

### Flow

1. Admin clicks "Mot de passe oublié ?" on the login page
2. Enters their email → backend sends a reset link (valid 15 min)
3. Admin clicks the link → enters a new password → done

### Emergency: CLI Reset

If email is unavailable, you can still reset the password from the server:

```bash
cd /var/www/cocobeach/backend
node scripts/reset-password.js admin@ilotcocobeach.tn newpassword123
```

---

## Security Checklist

- [ ] Change all default passwords (PostgreSQL, MinIO, JWT secret)
- [ ] Enable UFW firewall
- [ ] SSL certificate installed
- [ ] `CORS_ORIGIN` restricted to your domains only
- [ ] Regular database backups enabled
- [ ] PM2 log rotation configured (`pm2 install pm2-logrotate`)
- [ ] Fail2ban installed (`apt install fail2ban`)
- [ ] SSH key-only authentication (disable password login)
