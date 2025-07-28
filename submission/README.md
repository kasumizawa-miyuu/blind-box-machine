# blind-box-machine

## **1. Github链接**
https://github.com/kasumizawa-miyuu/blind-box-machine.git

## **2. 打包平台**
**Windows**

## **3. 环境要求**
- Node.js **v18+**（运行后端）
- MongoDB **（需要本地数据库支持）**
- 现代浏览器（Chrome/Firefox/Edge）

---

## **4. 如何运行**

### **📦 前端（Client）**

前端已经打包成静态文件，无需额外构建     
直接使用 **任意 HTTP 服务器** 托管 `client/` 目录
然后访问：👉 http://localhost:5173

### **⚙️ 后端（Server）**

使用 MongoDB 数据库，**无 SQLite 文件**

#### 方式 1：使用本地 MongoDB
- 确保 MongoDB 服务已运行
  - 启动 MongoDB
  - mongod
- 导入数据（可选）
  - 进入 db_export 目录，按需导入数据
  - mongoimport --db your_db --collection users --file db_export/users.json（或其他json文件）
- 安装依赖并启动
  - cd submission/server
  - npm install
  - node server.js

#### 方式 2：无数据库运行
- 如果不想用 MongoDB，可以修改 server.js，注释掉数据库相关代码，改用其他方式

---

## **5. 数据库说明**

📂 db_export/ 目录内容
- blindbox.users.json：用户数据（含管理员账户）
- blindbox.storages.json：仓库数据
- blindbox.orders.json：订单数据
- blindbox.boxes.json：盲盒数据

🔑 默认管理员：admin/admin123

⚠️ 注意事项
- MongoDB 必须手动运行，否则后端无法连接数据库
- 若使用默认管理员无法登录，请导入数据库之后再重试
- 确保后端运行在 👉 http://localhost:3000，或修改 client/vite.config.js 中的 proxy 配置

## **6. 额外功能描述**

- 用户、管理员双重身份
- 盲盒与内容物的图片上传
- 可根据页面内容实现不同筛选的重复利用组件
- 账户资金管理
- 磨损度定价系统
- 实时展示墙