#!/bin/bash
# ==========================================
# ILOT COCO BEACH - VPS Deployment Script
# ==========================================
# Run on a fresh Ubuntu 22.04+ OVHCloud VPS
# Usage: ssh root@YOUR_VPS_IP 'bash -s' < deploy.sh

set -e

echo "==> Updating system..."
apt-get update && apt-get upgrade -y

echo "==> Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

echo "==> Installing Docker Compose plugin..."
if ! docker compose version &> /dev/null; then
  apt-get install -y docker-compose-plugin
fi

echo "==> Creating app directory..."
mkdir -p /opt/cocobeach
cd /opt/cocobeach

echo "==> Setting up firewall (UFW)..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=========================================="
echo " VPS is ready!"
echo "=========================================="
echo ""
echo " Next steps:"
echo " 1. Clone your repo to /opt/cocobeach/"
echo "    git clone https://your-repo.git /opt/cocobeach"
echo ""
echo " 2. Copy and edit the production env file:"
echo "    cp .env.production .env"
echo "    nano .env"
echo ""
echo " 3. Point DNS records to this VPS IP:"
echo "    A  ilotcocobeach.tn       → $(curl -s ifconfig.me)"
echo "    A  www.ilotcocobeach.tn   → $(curl -s ifconfig.me)"
echo "    A  admin.ilotcocobeach.tn → $(curl -s ifconfig.me)"
echo "    A  api.ilotcocobeach.tn   → $(curl -s ifconfig.me)"
echo "    A  storage.ilotcocobeach.tn → $(curl -s ifconfig.me)"
echo ""
echo " 4. Deploy:"
echo "    docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo " 5. Seed admin user (first time only):"
echo "    docker exec cocobeach-backend npx prisma db seed"
echo ""
echo "=========================================="
