const axios = require("axios");

module.exports = {
  help: ["funfun-txt2img", "funfun-img2img"],
  tags: ["ai"],
  command: /^(funfun-(txt2img|img2img))$/i,
  run: async (m, {
    quoted,
    Func,
    API,
    uploader
  }) => {
    try {
      const input = quoted?.text?.trim();

      // Menentukan action secara langsung dari command
      const action = m.command.split('-')[1];
      
      if (!input) {
        return m.reply(`
╭─[ 🎨 *FUNFUN AI* ]
│
│ *Perintah:*
│ ├ *${m.prefix}funfun-txt2img prompt --style=vibrant*
│ └ *${m.prefix}funfun-img2img prompt --seed=123* (balas gambar)
│
│ *Contoh:*
│ ├ ${m.prefix}funfun-txt2img flying city --style=oil
│ └ (balas gambar) ${m.prefix}funfun-img2img dark samurai --ratio=1:1
╰────────────────────
        `.trim());
      }

      m.react("🎨");

      const body = { action };

      if (action === "img2img") {
        let mime = quoted && (quoted.msg || quoted).mimetype || "";
      const isImage = /image\/(jpe?g|png)/.test(mime);
      
        if (!isImage) return m.reply("❌ Untuk *img2img*, Anda harus membalas gambar.");
        const media = await (quoted || m.quoted).download();
        const imageUrl = await uploader.providers.tmpfiles.upload(media);
        if (!imageUrl) throw "❌ Gagal mengunggah gambar.";
        body.imageUrl = imageUrl;
      }

      const tokens = input.split(/\s+/);
      const promptParts = [];
      
      for (const token of tokens) {
        if (token.startsWith("--") && token.includes("=")) {
          const [key, ...value] = token.slice(2).split("=");
          body[key] = value.join("=");
        } else {
          promptParts.push(token);
        }
      }

      const prompt = promptParts.join(" ");
      if (!prompt) {
        return m.reply("❌ Prompt tidak ditemukan.");
      }
      body.prompt = prompt;

      const apiUrl = API("wudysoft", "/api/ai/fun-fun");
      
      const { data: start } = await axios.post(apiUrl, body);
      const taskId = start?.task_id;
      if (!taskId) throw "❌ Gagal memulai task.";
      m.reply(`📡 Task dimulai...`);

      let resultUrl = null;
      const maxPoll = 720;
      const pollInterval = 5000;

      for (let i = 0; i < maxPoll; i++) {
        await new Promise(r => setTimeout(r, pollInterval));
        const { data: status } = await axios.post(apiUrl, { action: "status", task_id: taskId });
        
        if (status?.status === "done" && Array.isArray(status?.attachments)) {
          const file = status.attachments.find(x => /\.(jpg|png|webp)$/i.test(x.url));
          if (file?.url) {
            resultUrl = file.url;
            break;
          }
        }
        
        if (status?.status === "failed") {
          throw `❌ Task gagal diproses: ${status?.error}`;
        }
        
        if (i === maxPoll - 1) {
            return m.reply("❌ Gagal mendapatkan hasil setelah 1 jam. Silakan coba lagi.");
        }
      }

      const caption = `🎨 *FunFun ${action}*\n📝 Prompt: _${body.prompt}_`;
      const bufferImg = await Func.fetchBuffer(resultUrl);

      await m.reply({
        image: bufferImg,
        caption: caption
      });

      m.react("✅");

    } catch (e) {
      console.error("FunFun Error:", e);
      m.react("❌");
      const msg = e.response?.data ? JSON.stringify(e.response.data) : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat proses FunFun:\n${msg}`));
    }
  },
  limit: 2
};