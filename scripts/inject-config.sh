#!/bin/sh

# 配置注入脚本
# 用于在nginx启动前动态注入配置到前端文件中

set -e

# 默认配置值
BASE_URL=${BASE_URL:-""}
API_BASE_URL=${API_BASE_URL:-"/api"}
APP_TITLE=${APP_TITLE:-"Zoom App"}
ENV=${ENV:-"production"}

# 前端构建文件路径
# 在容器中使用nginx路径，本地测试时使用dist路径
if [ -d "/usr/share/nginx/html" ]; then
  HTML_DIR="/usr/share/nginx/html"
else
  # 本地测试时使用相对路径
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  HTML_DIR="$SCRIPT_DIR/../web/dist"
fi

HTML_FILE="$HTML_DIR/index.html"
CONFIG_JS_FILE="$HTML_DIR/config.js"

echo "开始注入配置..."
echo "HTML_DIR: $HTML_DIR"
echo "BASE_URL: $BASE_URL"
echo "API_BASE_URL: $API_BASE_URL"
echo "APP_TITLE: $APP_TITLE"
echo "ENV: $ENV"

# 确保目标目录存在
if [ ! -d "$HTML_DIR" ]; then
  echo "错误: 目标目录不存在: $HTML_DIR"
  exit 1
fi

if [ ! -f "$HTML_FILE" ]; then
  echo "错误: HTML文件不存在: $HTML_FILE"
  exit 1
fi

# 生成配置文件
cat > "$CONFIG_JS_FILE" << EOF
// 运行时配置 - 由容器启动时动态生成
window.__APP_CONFIG__ = {
  baseUrl: '$BASE_URL',
  apiBaseUrl: '$API_BASE_URL',
  appTitle: '$APP_TITLE',
  env: '$ENV',
  timestamp: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
};
EOF

# 在HTML文件中注入配置脚本引用
if ! grep -q "config.js" "$HTML_FILE"; then
  # 在head标签结束前插入配置脚本
  # 兼容macOS和Linux的sed命令
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's|</head>|  <script src="/config.js"></script>\n  </head>|' "$HTML_FILE"
  else
    # Linux
    sed -i 's|</head>|  <script src="/config.js"></script>\n  </head>|' "$HTML_FILE"
  fi
  echo "已在HTML中注入配置脚本引用"
else
  echo "配置脚本引用已存在"
fi

# 更新HTML标题
if [ "$APP_TITLE" != "Zoom App" ]; then
  # 兼容macOS和Linux的sed命令
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|<title>.*</title>|<title>$APP_TITLE</title>|" "$HTML_FILE"
  else
    # Linux
    sed -i "s|<title>.*</title>|<title>$APP_TITLE</title>|" "$HTML_FILE"
  fi
  echo "已更新HTML标题为: $APP_TITLE"
fi

echo "配置注入完成"