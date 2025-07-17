<div align="center">YOSHIDA-BOT</div><div align="center">  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">  <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp">  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">  <img src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white" alt="JSON">  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License"></div><div align="center">  <h3>🚀 Lightweight & Powerful WhatsApp Bot</h3>  <p><em>Built with Baileys • Powered by Yoshida-APIs • Completely Free</em></p></div>✨ Why Choose Yoshida-Bot?<table><tr><td>🆓 <strong>100% Free</strong></td><td>No hidden costs, completely open-source</td></tr><tr><td>🔌 <strong>Plugin-Ready</strong></td><td>Modular architecture for easy customization</td></tr><tr><td>⚡ <strong>Lightning Fast</strong></td><td>Built on Baileys for optimal performance</td></tr><tr><td>💾 <strong>Hybrid Storage</strong></td><td>PostgreSQL + JSON for optimal performance</td></tr><tr><td>🛡️ <strong>Reliable</strong></td><td>Stable connection with advanced error handling</td></tr><tr><td>🎯 <strong>Easy Deploy</strong></td><td>Multiple deployment options available</td></tr></table>🏗️ Architecture Overview📦 yoshida-bot/
├── 📁 library/           # Core logic & helper modules
├── 📁 plugins/           # Command-based plugin modules  
├── 📁 system/            # Internal system logic
├── 📁 sessions/          # WhatsApp session files (JSON)
├── 📁 database/          # Local database files (JSON)
├── 📄 index.js           # Main application entry point
├── 📄 machine.js         # State management logic
├── ⚙️ ecosystem.config.js # PM2 deployment configuration
└── 📋 package.json       # Project dependencies
📋 RequirementsSystem RequirementsComponentVersionRequiredNode.js16.x or higher✅npm/yarnLatest✅GitLatest✅FFmpegLatest✅ImageMagickLatest✅PostgreSQL12.x or higher⚠️ Optional🟢 For Heroku UsersRequired Buildpacks (Add in this order):# 1. Node.js buildpack
heroku buildpacks:add heroku/nodejs

# 2. Python buildpack
heroku buildpacks:add heroku/python

# 3. FFmpeg buildpack
heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git

# 4. ImageMagick buildpack
heroku buildpacks:add https://github.com/DuckyTeam/heroku-buildpack-imagemagick.git
Alternative using app.json:{
  "buildpacks": [
    { "url": "heroku/nodejs" },
    { "url": "heroku/python" },
    { "url": "https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git" },
    { "url": "https://github.com/DuckyTeam/heroku-buildpack-imagemagick.git" }
  ]
}
🟡 For Windows / RDP UsersDownload and install the following software:SoftwareDownload LinkPurposeGitDownload hereVersion control & cloningNode.jsDownload hereJavaScript runtimeFFmpegDownload hereMedia processingImageMagickDownload hereImage processingInstallation Steps:Install Git   - Download Git from the official website   - Run the installer with default settings   - Verify: git --versionInstall Node.js   - Download LTS version from nodejs.org   - Run the installer (includes npm)   - Verify: node --version and npm --versionInstall FFmpeg   - Download the Windows build   - Extract to C:\ffmpeg\   - Add C:\ffmpeg\bin to your system PATH   - Verify: ffmpeg -versionInstall ImageMagick   - Download Windows installer   - Run with default settings   - Verify: magick -version🟠 For Linux/VPS UsersUbuntu/Debian:# Update package list
sudo apt update

# Install required packages
sudo apt install -y git nodejs npm ffmpeg imagemagick postgresql postgresql-contrib

# Verify installations
node --version
npm --version
ffmpeg -version
convert -version
CentOS/RHEL:# Install NodeJS
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Install other packages
sudo yum install -y git ffmpeg ImageMagick postgresql postgresql-server

# Verify installations
node --version
npm --version
ffmpeg -version
convert -version
🚀 Quick Start Guide1️⃣ Installation# Clone the repository
git clone https://github.com/yuurahz/yoshida.git

# Navigate to project directory
cd yoshida

# Install dependencies
npm install
2️⃣ ConfigurationBuat file config.js di direktori utama:// config.js
const config = {
  // Konfigurasi Zona Waktu
  TZ: "Asia/Jakarta", // Contoh: "America/New_York", "Europe/London"

  // Konfigurasi Pairing
  PAIRING_STATE: true, // Atur ke true untuk mengaktifkan kode pairing, false untuk QR
  PAIRING_NUMBER: "628xxxxxxxxxx", // Nomor WhatsApp Anda dengan kode negara, contoh: "6281234567890"

  // Pengaturan Database dan Sesi
  // Pilihan: 'local' (untuk file JSON) atau 'postgres' (untuk database PostgreSQL)
  DATABASE_NAME: "local", // Default: 'local'. Ubah ke 'postgres' jika menggunakan PostgreSQL
  DATABASE_STATE: "", // Umumnya tidak digunakan untuk 'local'. Untuk 'postgres', ini mungkin mendefinisikan status awal, tetapi biasanya ditangani oleh pengaturan DB.
  SESSION_NAME: "yoshida_session", // Nama untuk file/tabel sesi Anda
  SESSION_TYPE: "local", // Default: 'local'. Ubah ke 'postgres' jika menggunakan PostgreSQL

  // Konfigurasi PostgreSQL (hanya jika DATABASE_NAME atau SESSION_TYPE adalah 'postgres')
  // Kunjungi https://console.aiven.io atau penyedia PostgreSQL Anda untuk detail ini
  POSTGRES_HOST: "", // Contoh: "your-postgres-host.aivencloud.com"
  POSTGRES_PASSWORD: "", // Kata sandi PostgreSQL Anda
  POSTGRES_USER: "", // Nama pengguna PostgreSQL Anda
  POSTGRES_DATABASE: "", // Nama database PostgreSQL Anda
  POSTGRES_PORT: 5432, // Port PostgreSQL Anda, default adalah 5432
  POSTGRES_SSL: false, // Atur ke true jika koneksi PostgreSQL Anda memerlukan SSL (contoh: Aiven)
};

module.exports = config;
3️⃣ Launch Your BotChoose your preferred method:# Development Mode
npm start

# Production Mode with PM2
npm run pm2

# Manual PM2 Setup
pm2 start ecosystem.config.js
🔧 Plugin DevelopmentCreating a Basic Pluginmodule.exports = {
  // Plugin metadata
  help: ['ping', 'test'],
  tags: ['tools'],
  command: /^(ping|test)$/i,
  
  // Main plugin logic
  run: async (m, { conn }) => {
    try {
      const startTime = Date.now()
      await conn.reply(m.chat, '🏓 Pong!', m)
      const endTime = Date.now()
      
      await conn.reply(m.chat, `⚡ Response time: ${endTime - startTime}ms`, m)
    } catch (error) {
      return conn.reply(m.chat, `❌ Error: ${error.message}`, m)
    }
  },
  
  // Plugin permissions
  group: false,     // Works in groups
  admin: false,     // Requires admin
  limit: false,     // Uses command limit
  premium: false,   // Premium only
  botAdmin: false,  // Bot needs admin
  owner: false      // Owner only
}
Creating Event Handlersmodule.exports = {
  async before(m, { conn }) {
    try {
      // Pre-processing logic
      if (m.text && m.text.includes('hello')) {
        await conn.reply(m.chat, '👋 Hello there!', m)
      }
    } catch (error) {
      console.error('Event handler error:', error)
    }
    return true
  }
}
🌐 Deployment Options<div align="center">PlatformDifficultyCostRecommended🟢 HerokuEasyFree Tier✅ Best for beginners🟡 RailwayEasyFree Tier✅ Great alternative🟠 VPS/VDSMedium$5-20/month⭐ Most flexible🟡 ReplitEasyFree Tier⚠️ Limited resources</div>Heroku Deployment# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create your-bot-name

# Deploy
git push heroku main
PM2 Configurationmodule.exports = {
  apps: [{
    name: "yoshida-bot",
    script: "./index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    node_args: "--max-old-space-size=2048",
    env: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
}
📊 Storage & DatabaseMulti-Storage ArchitectureYoshida-Bot uses a hybrid storage system for optimal performance and reliability:<table><tr><td>🗄️ <strong>PostgreSQL</strong></td><td>Primary database for persistent data</td></tr><tr><td>📁 <strong>JSON Local</strong></td><td>Local file storage for sessions & cache</td></tr></table>Session Management// Multiple session storage options
const sessionConfig = {
  // PostgreSQL for production
  database: {
    type: 'postgresql',
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    username: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    database: config.POSTGRES_DATABASE
  },
  
  // Local JSON for development/backup
  local: {
    type: 'json',
    path: './sessions/',
    autoSave: true
  }
}
Database Configuration// PostgreSQL connection example
const { Pool } = require('pg')
const config = require('./config'); // Pastikan ini mengarah ke file config.js Anda

const pool = new Pool({
  user: config.POSTGRES_USER,
  host: config.POSTGRES_HOST,
  database: config.POSTGRES_DATABASE,
  password: config.POSTGRES_PASSWORD,
  port: config.POSTGRES_PORT,
  ssl: config.POSTGRES_SSL
})

// Local JSON storage
const fs = require('fs')
const path = require('path')

class LocalStorage {
  constructor(basePath = './database/') {
    this.basePath = basePath
    this.ensureDir()
  }
  
  save(key, data) {
    const filePath = path.join(this.basePath, `${key}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  }
  
  load(key) {
    const filePath = path.join(this.basePath, `${key}.json`)
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
    return null
  }
}
🤝 ContributingWe welcome contributions! Here's how you can help:🍴 Fork the repository🌟 Create a feature branch (git checkout -b feature/amazing-feature)💾 Commit your changes (git commit -m 'Add amazing feature')📤 Push to the branch (git push origin feature/amazing-feature)🔄 Open a Pull Request📜 License & Terms<div align="center">MIT License - Free for personal and commercial use⭐ Please star this repository if you find it useful!</div>Usage Guidelines✅ Free to use and modify✅ Commercial use allowed✅ Private use allowed⚠️ Must include license and copyright notice❌ No warranty provided🏆 Credits & Acknowledgements<div align="center">RoleContributorLinks👨‍💻 Lead DeveloperyuurahzGitHub📚 Library Provider@yoshx/funcnpm🌐 API ProviderYoshida-APIsDocumentation</div>🆘 Support & Community<div align="center">Need help? Open an issue or join our community discussions!</div>🔮 Roadmap[ ] 🎨 Web-based dashboard[ ] 📱 Mobile app companion[ ] 🔌 Plugin marketplace[ ] 🌍 Multi-language support[ ] 🤖 AI integration[ ] 📊 Analytics dashboard<div align="center">Made with ❤️ by the Yoshida-Bot TeamBuilding the future of WhatsApp automation</div>