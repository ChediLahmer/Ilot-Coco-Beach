# Deployment Guide — Without a Domain (IP only)

Run Îlot Coco Beach on a fresh VPS reachable by its **public IP**, with no
domain and no SSL. Use this for a first deployment / test run. When you later
buy a domain, follow `DEPLOY_WITH_DOMAIN.md` — your data is preserved.

Uses: `docker-compose.vps.yml` + `.env` (from `.env.vps.example`).

After launch:

| Service        | URL                       |
| -------------- | ------------------------- |
| Public site    | `http://YOUR_VPS_IP`      |
| Admin panel    | `http://YOUR_VPS_IP:8081` |
| Storage/images | `http://YOUR_VPS_IP:9100` |
| MinIO console  | `http://YOUR_VPS_IP:9101` |

---

## Step 1 — Push the deployment files (on your PC)

```powershell
git add docker-compose.vps.yml .env.vps.example nginx.conf
git commit -m "Add IP-only VPS deployment config"
git push
```

## Step 2 — Connect to the VPS

Get the IP + root password from the Hostinger panel (VPS → Overview).

```powershell
ssh root@72.62.176.202
```

Type `yes` to accept the fingerprint, then enter the root password.

## Step 3 — Install Docker + firewall (on the VPS)

> If you chose the Hostinger "Ubuntu with Docker" template, Docker is already
> installed — run `docker --version` and skip the install lines.

```bash
apt-get update && apt-get upgrade -y
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
apt-get install -y docker-compose-plugin git

# open the ports this deployment uses
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 8081/tcp
ufw allow 9100/tcp
ufw allow 9101/tcp
ufw --force enable
```

Verify:

```bash
docker --version
docker compose version
```

## Step 4 — Get your code

```bash
mkdir -p /opt/ilotcocobeach
cd /opt/ilotcocobeach
git clone https://YOUR_REPO_URL .
```

> Private repo: use a token in the URL —
> `https://USERNAME:TOKEN@github.com/USERNAME/REPO.git`

## Step 5 — Create the secrets file

```bash
cp .env.vps.example .env
nano .env
```

Fill in every `CHANGE_ME`:

| Variable             | Value                                        |
| -------------------- | -------------------------------------------- |
| `VPS_IP`             | VPS public IP, number only (e.g. `82.x.x.x`) |
| `DB_PASSWORD`        | strong random string                         |
| `JWT_SECRET`         | output of `openssl rand -hex 32`             |
| `S3_ACCESS_KEY`      | random string                                |
| `S3_SECRET_KEY`      | random string                                |
| `BREVO_API_KEY`      | Brevo key (optional for first launch)        |
| `BREVO_SENDER_EMAIL` | sender email (optional)                      |

Generate secrets quickly:

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 16   # DB_PASSWORD
openssl rand -hex 16   # S3_ACCESS_KEY
openssl rand -hex 24   # S3_SECRET_KEY
```

Save in nano: `Ctrl+O`, Enter, `Ctrl+X`.

## Step 6 — Build and launch

```bash
docker compose -f docker-compose.vps.yml up -d --build
```

Watch logs (Ctrl+C stops watching, containers keep running):

```bash
docker compose -f docker-compose.vps.yml logs -f
```

Check status:

```bash
docker compose -f docker-compose.vps.yml ps
```

## Step 7 — Seed the admin user (first time only)

```bash
docker exec cocobeach-backend npx prisma db seed
```

See `backend/prisma/seed.js` for the default admin email/password — change it
after first login.

## Step 8 — Verify

- `http://72.62.176.202` → public site
- `http://YOUR_VPS_IP:8081` → admin panel

---

## Everyday commands

```bash
# logs for one service
docker compose -f docker-compose.vps.yml logs -f backend

# update after pushing new code
cd /opt/cocobeach && git pull
docker compose -f docker-compose.vps.yml up -d --build

# restart a service
docker compose -f docker-compose.vps.yml restart backend

# reset admin password (emergency)
docker exec cocobeach-backend node scripts/reset-password.js admin@example.com newpassword123
```

## Notes

- Database and uploaded images live in Docker volumes (`pgdata`, `miniodata`).
  They survive restarts, rebuilds, and the later switch to a domain.
- No HTTPS in this mode — fine for testing. Do not collect real passwords over
  `http://` long-term; move to `DEPLOY_WITH_DOMAIN.md` for SSL before going public.
