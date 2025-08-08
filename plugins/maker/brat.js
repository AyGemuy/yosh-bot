const {
  makeSticker
} = require("@library/sticker");
module.exports = {
  help: ["brat"],
  tags: ["maker"],
  command: /^(brat|stext|stickertext)$/i,
  run: async (m, {
    Func,
    quoted,
    setting,
    API
  }) => {
    try {
      const inputText = quoted && quoted.text ? quoted.text : m.text.replace(new RegExp(`^${m.prefix + m.command}\\s*`, "i"), "").trim();
      if (!inputText) {
        m.react("ℹ️");
        return m.reply(`
╭─[ 📝 PANDUAN BRAT STICKER 📝 ]
│
│ *Fitur*: Mengubah teks menjadi stiker artistik.
│
│ *Stiker Teks Statis:*
│ ├ Penggunaan: *${m.prefix + m.command} [teks_anda]*
│ ├ Contoh: *${m.prefix + m.command} Hello World*
│ └ Catatan: Bisa juga dengan reply chat teks
│
│ *Stiker Teks Animasi:*
│ ├ Penggunaan: *${m.prefix + m.command} [teks_anda] -animate*
│ ├ Contoh: *${m.prefix + m.command} Bot Keren -animate*
│ └ Catatan: Bisa juga dengan reply chat teks dengan "-animate" di akhir
│
╰─[ 💡 TIPS KREASI 💡 ]
`.trim());
      }
      m.react("⏱️");
      let textToBrat = inputText;
      const isAnimated = inputText.toLowerCase().includes("-animate");
      if (isAnimated) {
        textToBrat = inputText.toLowerCase().replace("-animate", "").trim();
        const randomVideoHost = Math.floor(Math.random() * 9) + 1;
        const apiUrl = API("wudysoft", "/api/maker/brat/video", {
          text: textToBrat,
          host: randomVideoHost
        });
        const videoBuffer = await Func.fetchBuffer(apiUrl);
        if (!videoBuffer) {
          m.react("❌");
          return m.reply(Func.texted("bold", "Gagal membuat stiker animasi teks. Coba lagi."));
        }
        await makeSticker(videoBuffer, {
          pack: setting.stick_pack,
          author: setting.stick_auth,
          keepScale: true
        }).then(v => {
          m.react("✅");
          m.reply({
            sticker: v
          });
        });
      } else {
        const randomImageHost = Math.floor(Math.random() * 6) + 1;
        const apiUrl = API("wudysoft", "/api/maker/brat/v1", {
          text: textToBrat,
          host: randomImageHost
        });
        const imageBuffer = await Func.fetchBuffer(apiUrl);
        if (!imageBuffer) {
          m.react("❌");
          return m.reply(Func.texted("bold", "Gagal membuat stiker teks statis. Coba lagi."));
        }
        await makeSticker(imageBuffer, {
          pack: setting.stick_pack,
          author: setting.stick_auth
        }).then(v => {
          m.react("✅");
          m.reply({
            sticker: v
          });
        });
      }
    } catch (e) {
      console.error("Error in brat command:", e);
      m.react("❌");
      return m.reply(Func.texted("bold", "Terjadi kesalahan saat membuat stiker brat. Pastikan teks valid."));
    }
  },
  limit: 1
};