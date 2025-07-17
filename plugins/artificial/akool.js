const axios = require("axios");
module.exports = {
  help: ["akool"],
  tags: ["ai"],
  command: /^(akool)$/i,
  run: async (m, {
    Func,
    API
  }) => {
    try {
      let promptText = m.text.replace(new RegExp(`^${m.prefix + m.command}\\s*`, "i"), "").trim();
      if (!promptText && m.quoted && m.quoted.text) {
        promptText = m.quoted.text.trim();
      }
      if (!promptText) {
        m.react("ℹ️");
        return m.reply(`
╭─[ 🎨 PANDUAN AKOOL 🎨 ]
│
│ *Fitur*: Membuat gambar dari teks menggunakan Akool AI.
│
│ *Penggunaan:*
│ ├ *${m.prefix + m.command} [deskripsi_gambar]*
│ └ Reply teks: *${m.prefix + m.command}*
│
│ *Contoh:*
│ ├ *${m.prefix + m.command} seorang pria di ruangan dengan komputer*
│ └ Reply teks dengan deskripsi gambar, lalu ketik *${m.prefix + m.command}*
╰─[ ✨ KREASI AI ✨ ]
`.trim());
      }
      m.react("⏱️");
      const apiUrl = API("wudysoft", "/api/ai/txt2img/akool", {
        prompt: promptText
      });
      const response = await axios.get(apiUrl);
      const result = response.data;
      if (!result || result.error_reasons && result.error_reasons.length > 0) {
        m.react("❌");
        return m.reply(Func.texted("bold", `Gagal membuat gambar dengan Akool AI. Alasan: ${result.error_reasons.join(", ") || "Tidak diketahui"}. Coba lagi.`));
      }
      if (!result.upscaled_urls || result.upscaled_urls.length === 0) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Akool AI berhasil memproses, tetapi tidak ada URL gambar yang di-upscale ditemukan."));
      }
      for (const imageUrl of result.upscaled_urls) {
        try {
          const imageBuffer = await Func.fetchBuffer(imageUrl);
          if (imageBuffer) {
            await m.reply({
              image: imageBuffer,
              caption: `🎨 Hasil Akool AI (Model: Akool)\nPrompt: _"${promptText}"_`
            });
          } else {
            console.warn(`Failed to fetch image from URL: ${imageUrl}`);
            await m.reply(Func.texted("bold", `Gagal mengunduh gambar dari URL: ${imageUrl.substring(0, 50)}...`));
          }
        } catch (downloadError) {
          console.error(`Error downloading image ${imageUrl}:`, downloadError);
          await m.reply(Func.texted("bold", `Terjadi kesalahan saat mengunduh gambar dari URL: ${imageUrl.substring(0, 50)}...`));
        }
      }
      m.react("✅");
    } catch (e) {
      console.error("Error in akool command:", e);
      m.react("❌");
      let errorMessage = e.response?.data ? `API Error: ${JSON.stringify(e.response.data)}` : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat menggunakan Akool AI: ${errorMessage}`));
    }
  },
  limit: 2
};