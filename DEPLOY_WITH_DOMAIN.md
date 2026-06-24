# Deployment Guide — With a Domain (HTTPS)

Run Îlot Coco Beach on a VPS with a real domain, automatic HTTPS (Let's Encrypt),
and clean subdomain URLs. Traefik handles routing and SSL for you.

Uses: `docker-compose.prod.yml` + `.env` (from `.env.production`).

Final URLs:

| Service     | URL                              |
| ----------- | -------------------------------- |
| Public site | `https://yourdomain.com`         |
| Public site | `https://www.yourdomain.com`     |
| Admin panel | `https://admin.yourdomain.com`   |
| Backend API | `https://api.yourdomain.com`     |
| Storage     | `https://storage.yourdomain.com` |

> Already deployed on IP via `DEPLOY_WITHOUT_DOMAIN.md`? Jump to
> **"Switching from the IP deployment"** at the bottom — your data is preserved.

---

## Step 1 — Point DNS at the VPS

In your domain's DNS manager (Hostinger → Domains → DNS / Nameservers), add
these **A records**, all pointing to your **VPS IP**:

| Type | Name      | Value       |
| ---- | --------- | ----------- |
| A    | `@`       | YOUR_VPS_IP |
| A    | `www`     | YOUR_VPS_IP |
| A    | `admin`   | YOUR_VPS_IP |
| A    | `api`     | YOUR_VPS_IP |
| A    | `storage` | YOUR_VPS_IP |

> Traefik needs these resolving **before** it can issue SSL certificates.
> DNS propagation takes ~15 min–2 h. Verify with:
> `nslookup api.yourdomain.com` → should return your VPS IP.

## Step 2 — Connect to the VPS

```powershell
ssh root@YOUR_VPS_IP
```

## Step 3 — Install Docker + firewall (skip if already done)

> If you chose Hostinger's "Ubuntu with Docker" template, Docker is already
> installed — run `docker --version` and skip the install lines.

```bash
apt-get update && apt-get upgrade -y
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
apt-get install -y docker-compose-plugin git

# domain mode only needs SSH + web ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## Step 4 — Get your code (skip if already cloned)

```bash
mkdir -p /opt/cocobeach
cd /opt/cocobeach
git clone https://YOUR_REPO_URL .
```

## Step 5 — Create the secrets file

```bash
cd /opt/cocobeach
cp .env.production .env
nano .env
```

Fill in every value:

| Variable             | Value                                  |
| -------------------- | -------------------------------------- |
| `DOMAIN`             | your domain, e.g. `yourdomain.com`     |
| `ACME_EMAIL`         | your email (for Let's Encrypt notices) |
| `DB_PASSWORD`        | strong random string                   |
| `JWT_SECRET`         | output of `openssl rand -hex 32`       |
| `S3_ACCESS_KEY`      | random string                          |
| `S3_SECRET_KEY`      | random string                          |
| `BREVO_API_KEY`      | Brevo key (password-reset emails)      |
| `BREVO_SENDER_EMAIL` | e.g. `contact@yourdomain.com`          |

Generate secrets:

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 16   # DB_PASSWORD
openssl rand -hex 16   # S3_ACCESS_KEY
openssl rand -hex 24   # S3_SECRET_KEY
```

Save: `Ctrl+O`, Enter, `Ctrl+X`.

## Step 6 — Build and launch

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This builds the apps, starts PostgreSQL + MinIO + Traefik, runs DB migrations
automatically, and requests SSL certificates for all subdomains.

Watch logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Check status:

```bash
docker compose -f docker-compose.prod.yml ps
```

## Step 7 — Seed the admin user (first time only)

```bash
docker exec cocobeach-backend npx prisma db seed
```

Change the default admin password after first login.

## Step 8 — Verify

- `https://yourdomain.com` → public site
- `https://admin.yourdomain.com` → admin panel
- `https://api.yourdomain.com/api` → backend API

> Certificate warning right after launch? Wait 1–2 min for Traefik to issue the
> cert. If it persists, DNS hasn't propagated yet (re-check Step 1).

---

## Switching from the IP deployment

If you already ran `docker-compose.vps.yml` (IP mode), switch like this. Your
database and uploaded images are in Docker volumes (`pgdata`, `miniodata`) and
are **preserved**.

```bash
cd /opt/cocobeach
git pull                                   # get latest code
docker compose -f docker-compose.vps.yml down   # stop IP mode (keeps volumes)

cp .env.production .env                     # switch to domain env
nano .env                                   # set DOMAIN + reuse the same secrets

docker compose -f docker-compose.prod.yml up -d --build
```

> Reuse the **same** `DB_PASSWORD`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` you used in
> IP mode so the app keeps matching the existing database and storage.

Then open the firewall for HTTPS (and optionally close the IP-mode ports):

```bash
ufw allow 443/tcp
# optional cleanup of IP-mode ports:
ufw delete allow 8081/tcp
ufw delete allow 9100/tcp
ufw delete allow 9101/tcp
```

---

## Everyday commands

```bash
# logs for one service
docker compose -f docker-compose.prod.yml logs -f backend

# update after pushing new code
cd /opt/cocobeach && git pull
docker compose -f docker-compose.prod.yml up -d --build

# restart a service
docker compose -f docker-compose.prod.yml restart backend

# reset admin password (emergency)
docker exec cocobeach-backend node scripts/reset-password.js admin@yourdomain.com newpassword123

# database backup (cron suggestion: daily 3am)
docker exec cocobeach-db pg_dump -U cocobeach cocobeach | gzip > /opt/cocobeach/backups/db-$(date +%Y%m%d).sql.gz
```

## Security checklist

- [ ] Strong unique `DB_PASSWORD`, `JWT_SECRET`, `S3_*` values
- [ ] UFW firewall enabled (22/80/443 only in domain mode)
- [ ] SSL working on all subdomains
- [ ] `CORS_ORIGIN` restricted to your domains (set automatically from `DOMAIN`)
- [ ] Regular database backups
- [ ] Admin default password changed after first login
