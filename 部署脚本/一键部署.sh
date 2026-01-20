#!/bin/bash

# GSJT 系统一键部署脚本
# 适用于 Ubuntu/Debian 系统

set -e

echo "=========================================="
echo "GSJT 系统公网部署脚本"
echo "=========================================="
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 配置变量
APP_DIR="/var/www/gsjt-system"
DB_NAME="gsjt"
DB_USER="gsjt_user"
DOMAIN=""
EMAIL=""

# 读取配置
read -p "请输入应用目录 [$APP_DIR]: " input_dir
APP_DIR=${input_dir:-$APP_DIR}

read -p "请输入数据库名称 [$DB_NAME]: " input_db
DB_NAME=${input_db:-$DB_NAME}

read -p "请输入数据库用户名 [$DB_USER]: " input_user
DB_USER=${input_user:-$DB_USER}

read -sp "请输入数据库密码: " DB_PASSWORD
echo ""

read -p "请输入域名（留空则使用IP）: " DOMAIN
read -p "请输入邮箱（用于SSL证书，可选）: " EMAIL

echo ""
echo "开始部署..."
echo ""

# 1. 更新系统
echo "[1/8] 更新系统包..."
apt update
apt upgrade -y

# 2. 安装 Node.js
echo "[2/8] 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node.js 版本: $(node -v)"

# 3. 安装 PostgreSQL
echo "[3/8] 安装 PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# 创建数据库和用户
sudo -u postgres psql <<EOF
-- 创建数据库
SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- 创建用户
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF

echo "数据库创建完成"

# 4. 安装 Nginx
echo "[4/8] 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# 5. 安装 PM2
echo "[5/8] 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 6. 创建应用目录
echo "[6/8] 创建应用目录..."
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

echo "请将代码上传到 $APP_DIR 目录"
read -p "代码已上传？(y/n): " code_uploaded

if [ "$code_uploaded" != "y" ]; then
    echo "请先上传代码，然后重新运行脚本"
    exit 1
fi

# 7. 安装依赖和构建
echo "[7/8] 安装依赖和构建..."
cd $APP_DIR

# 后端
cd backend
npm install --production

# 创建 .env 文件
cat > .env <<ENVFILE
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
ENVFILE

# 初始化数据库
cd database
node initTables.js
node importScenarios.js
cd ..

# 启动后端
pm2 start server.js --name gsjt-backend
pm2 save

# 前端
cd ../frontend
npm install
npm run build

cd $APP_DIR

# 8. 配置 Nginx
echo "[8/8] 配置 Nginx..."

if [ -z "$DOMAIN" ]; then
    SERVER_NAME="_"
else
    SERVER_NAME="$DOMAIN"
fi

cat > /etc/nginx/sites-available/gsjt <<NGINXCONF
server {
    listen 80;
    server_name $SERVER_NAME;

    # 前端
    root $APP_DIR/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXCONF

# 启用站点
ln -sf /etc/nginx/sites-available/gsjt /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx

# 配置 SSL（如果有域名和邮箱）
if [ ! -z "$DOMAIN" ] && [ ! -z "$EMAIL" ]; then
    echo "配置 SSL 证书..."
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
fi

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "应用目录: $APP_DIR"
echo "数据库: $DB_NAME"
echo "PM2 状态: pm2 status"
echo "Nginx 状态: systemctl status nginx"
echo ""

if [ ! -z "$DOMAIN" ]; then
    echo "访问地址: http://$DOMAIN 或 https://$DOMAIN"
else
    echo "请配置域名或使用服务器 IP 访问"
fi

echo ""
echo "下一步："
echo "1. 配置防火墙: ufw allow 80,443/tcp"
echo "2. 检查 PM2 日志: pm2 logs gsjt-backend"
echo "3. 检查 Nginx 日志: tail -f /var/log/nginx/error.log"
echo ""
