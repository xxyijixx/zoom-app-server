#!/bin/sh

# 容器启动脚本
# 先执行配置注入，然后启动服务

set -e

echo "=== 容器启动 ==="
echo "开始初始化..."

# 执行配置注入
echo "执行配置注入..."
/usr/local/bin/inject-config.sh

# 启动supervisor管理的服务
echo "启动服务..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf