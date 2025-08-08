const axios = require("axios");
module.exports = {
  help: ["padlet"],
  tags: ["ai"],
  command: /^(padlet)$/i,
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
╭─[ 🖼️ PANDUAN PADLET AI 🖼️ ]
│
│ *Fitur*: Membuat gambar dari teks menggunakan Padlet AI.
│
│ *Penggunaan:*
│ ├ *${m.prefix + m.command} [deskripsi_gambar]*
│ └ Reply teks: *${m.prefix + m.command}*
│
│ *Contoh:*
│ ├ *${m.prefix + m.command} pemandangan kota futuristik di malam hari*
│ └ Reply teks dengan deskripsi gambar, lalu ketik *${m.prefix + m.command}*
╰─[ ✨ KREASI AI ✨ ]
`.trim());
      }
      m.react("⏱️");
      const apiUrl = API("wudysoft", "/api/ai/txt2img/gen/v23", {
        prompt: promptText
      });
      const response = await axios.get(apiUrl);
      const result = response.data;
      if (!result || !result.data || !result.data.images || result.data.images.length === 0) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Gagal membuat gambar dengan Padlet AI. Tidak ada gambar yang diterima. Coba lagi."));
      }
      for (const imageInfo of result.data.images) {
        const imageUrl = imageInfo.url;
        if (imageUrl) {
          try {
            const imageBuffer = await Func.fetchBuffer(imageUrl);
            if (imageBuffer) {
              await m.reply({
                image: imageBuffer,
                caption: `🎨 Hasil Padlet AI (Model: Padlet)\nPrompt: _"${promptText}"_`
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
      }
      m.react("✅");
    } catch (e) {
      console.error("Error in padlet command:", e);
      m.react("❌");
      let errorMessage = e.response?.data ? `API Error: ${JSON.stringify(e.response.data)}` : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat menggunakan Padlet AI: ${errorMessage}`));
    }
  },
  limit: 2
};