const axios = require("axios");

module.exports = {
  help: ["pixara-txt2img", "pixara-txt2vid", "pixara-img2vid"],
  tags: ["ai"],
  command: /^(pixara-(txt2img|txt2vid|img2vid))$/i,
  run: async (m, {
    quoted,
    Func,
    API,
    conn
  }) => {
    try {
      // Menentukan action secara langsung dari command
      const action = m.command.split('-')[1];
      const input = quoted?.text?.trim();

      if (!input) {
        return m.reply(`
╭─[ 🧠 *PANDUAN PIXARA* ]
│
│ *Perintah:*
│ ├ *${m.prefix}pixara-txt2vid prompt --duration=5*
│ ├ *${m.prefix}pixara-img2vid imageUrl prompt --model=xyz*
│
│ *Contoh:*
│ ├ ${m.prefix}pixara-txt2vid neon robot --duration=7
│ └ ${m.prefix}pixara-img2vid https://img.jpg glowing skull --aspectRatio=1:1
╰────────────────
        `.trim());
      }

      m.react("🎬");
      
      const body = { action }; // Inisialisasi body dengan action

      // Pisahkan input menjadi token
      const tokens = input.split(/\s+/);
      const promptParts = [];

      // Tangani kasus img2vid dengan URL
      if (action === "img2vid" && /^https?:\/\/.*/.test(tokens[0])) {
        body.imageUrl = tokens.shift();
      }

      // Proses token untuk menemukan prompt dan parameter
      for (const token of tokens) {
        if (token.startsWith("--") && token.includes("=")) {
          const [key, ...value] = token.slice(2).split("=");
          body[key] = value.join("=");
        } else {
          promptParts.push(token);
        }
      }

      // Gabungkan sisa token menjadi prompt
      const prompt = promptParts.join(" ");
      if (!prompt) {
        return m.reply("❌ Prompt tidak ditemukan.");
      }
      body.prompt = prompt;

      const apiUrl = API("wudysoft", "/api/ai/pixara");
      
      // Tahap 1: Memulai task
      const { data: start } = await axios.post(apiUrl, body);
      const taskId = start?.task_id;
      if (!taskId) throw "❌ Gagal memulai task.";
      m.reply(`📡 Task dimulai...`);

      let result = null;
      const maxPoll = 720;
      const pollInterval = 5000;

      // Tahap 2: Memeriksa status task secara berkala
      for (let i = 0; i < maxPoll; i++) {
        await new Promise(r => setTimeout(r, pollInterval));
        const { data: status } = await axios.post(apiUrl, { action: "status", task_id: taskId });
        
        if (status?.status === "success" && status?.progress === 100) {
          result = status.result;
          break;
        }
        
        if (status?.status === "failed") {
          throw `❌ Task gagal diproses: ${status?.error}`;
        }
        
        if (i === maxPoll - 1) {
            return m.reply("❌ Gagal mendapatkan hasil setelah 1 jam. Silakan coba lagi.");
        }
      }

      if (!result) return m.reply("❌ Gagal mendapatkan hasil.");
      
      const caption = `🎨 *Pixara ${action}*\n📝 Prompt: _${body.prompt}_`;
      
      // Mengirim hasil
      if (action === "txt2img" && result.imageUrl) {
        const bufferImg = await Func.fetchBuffer(result.imageUrl);
        await m.reply({ image: bufferImg, caption });
      } else if (result.videoUrl) {
        const bufferVid = await Func.fetchBuffer(result.videoUrl);
        await m.reply({ video: bufferVid, caption });
      } else {
        return m.reply("❌ Hasil tidak ditemukan atau formatnya tidak sesuai.");
      }
      
      m.react("✅");

    } catch (e) {
      console.error("Pixara error:", e);
      m.react("❌");
      const msg = e.response?.data ? JSON.stringify(e.response.data) : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat proses Pixara:\n${msg}`));
    }
  },
  limit: 2
};