完美！三个项目：**admin**、**client**、**server**。让我先看看 readme 和每个项目的配置：## 🚀 三个项目启动指南

这是一个完整的商城系统，需要按顺序启动：

### 📋 启动顺序

| 项目 | 类型 | 端口 | 依赖 |
|------|------|
| **server** | Node.js + Express 后端 | 300 | MySQL |
| **admin** | React + Vite 后台 | 5173 | server |
| **client** | Taro 3 微信小程序 | - | server |

---

### 🔧 第一步：启动 MySQL 数据库

```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

### 🗄️ 第二步：初始化数据库

```bash
mysql -u root -proot123 < /Users/huanghui/Documents/gitee/mini/server/database/schema.sql
```

### 🌐 第三步：启动后端 Server（端口 300）

```bash
cd /Users/huanghui/Documents/gite/mini/server
npm install
npm start
```

### 🎨 第四步：启动后台 Admin（端口 5173）- 新终端

```bash
cd /Users/huanghui/Documents/gitee/mini/admin
npm install
npm run dev
```

### 📱 第五步：启动小程序 Client - 新终端

```bash
cd /Users/huanghui/Documents/gitee/mini/client
npm install
npm run dev:weapp
```

---

## ⚡ 一键启动脚本

我可以帮你创建一个启动脚本。需要吗？

或者你想让我帮你配置 `exec` 权限，让我直接执行这些命令？