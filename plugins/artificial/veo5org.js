const axios = require("axios");
module.exports = {
  help: ["veo5org"],
  tags: ["ai"],
  command: /^veo5org$/i,
  run: async (m, {
    quoted,
    Func,
    API
  }) => {
    try {
      const prompt = quoted?.text?.trim();
      if (!prompt) {
        return m.reply(`
╭─[ 🎥 *VEO5ORG VIDEO AI* ]
│
│ *Contoh penggunaan:*
│ └ ${m.prefix}veo5org cinematic futuristic robot walking in snow
╰───────────────────────
        `.trim());
      }
      m.react("🎬");
      const apiUrl = API("wudysoft", "/api/ai/video/v8");
      const {
        data: start
      } = await axios.post(apiUrl, {
        action: "create",
        prompt: prompt
      });
      const taskId = start.task_id;
      if (!taskId) throw "❌ Gagal memulai task.";
      m.reply(`📡 Task dimulai...`);
      const maxPoll = 720;
      let videoUrl = null;
      for (let i = 0; i < maxPoll; i++) {
        await new Promise(r => setTimeout(r, 5e3));
        const statusRes = await axios.post(apiUrl, {
          action: "status",
          task_id: taskId
        });
        if (statusRes.data?.videoUrl) {
          videoUrl = statusRes.data.videoUrl;
          break;
        }
      }
      if (!videoUrl) return m.reply("❌ Gagal mendapatkan video setelah 1 jam.");
      const caption = `🎞️ *Veo5Org Result*\n📝 Prompt: _${prompt}_`;
      const bufferVid = await Func.fetchBuffer(videoUrl);
      await m.reply({
        video: bufferVid,
        caption: caption
      });
      m.react("✅");
    } catch (e) {
      console.error("Veo5Org error:", e);
      m.react("❌");
      const msg = e.response?.data ? JSON.stringify(e.response.data) : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat proses Veo5Org:\n${msg}`));
    }
  },
  limit: 2
};