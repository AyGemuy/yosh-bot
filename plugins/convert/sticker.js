const {
  makeSticker
} = require("@library/sticker");
module.exports = {
  help: ["sticker"],
  tags: ["converter"],
  command: /^s(ti(c?k(er(gif)?)?|c)|gif)?$/i,
  run: async (m, {
    Func,
    conn,
    uploader,
    quoted,
    setting,
    API
  }) => {
    try {
      m.react("⏱️");
      let mime = quoted && (quoted.msg || quoted).mimetype || "";
      const isImage = /image\/(jpe?g|png)/.test(mime);
      const isVideo = /video/.test(mime);
      const quotedText = quoted && quoted.text ? quoted.text : "";
      const urlFromCommand = Func.isUrl(m.text.split(" ")[1] || m.text) || [];
      const urlFromQuoted = Func.isUrl(quotedText) || [];
      const inputUrl = urlFromCommand[0] || urlFromQuoted[0];
      const isURL = !!inputUrl;
      const commandOptions = m.text.toLowerCase();
      const options = {
        circle: commandOptions.includes("-circle"),
        keepScale: !commandOptions.includes("-crop"),
        removeBackground: commandOptions.includes("-nobg")
      };
      let buffer;
      if (isImage || isVideo) {
        buffer = await quoted.download();
        if (!buffer) {
          m.react("❌");
          return m.reply(Func.texted("bold", "Gagal mengunduh media."));
        }
      } else if (isURL) {
        buffer = await Func.fetchBuffer(inputUrl);
        if (!buffer) {
          m.react("❌");
          return m.reply(Func.texted("bold", "Gagal mengunduh dari URL."));
        }
      } else {
        m.react("ℹ️");
        return m.reply(`
╭─[ 📝 PANDUAN STICKER 📝 ]
│
│ *Fitur*: Mengubah media menjadi stiker.
│
│ *Dari Gambar (Reply/URL):*
│ ├ Reply gambar: *${m.prefix + m.command}*
│ ├ URL gambar: *${m.prefix + m.command} [link_gambar]*
│ ├ Bentuk Lingkaran: *${m.prefix + m.command} -circle*
│ ├ Tanpa Crop: *${m.prefix + m.command} -crop*
│ └ Tanpa Background: *${m.prefix + m.command} -nobg*
│
│ *Dari Video/GIF (Reply/URL):*
│ ├ Reply video/gif (maks. 7 detik): *${m.prefix + m.command}*
│ └ URL video/gif (maks. 7 detik): *${m.prefix + m.command} [link_video/gif]*
│
╰─[ 💡 TIPS PENGGUNAAN 💡 ]
`.trim());
      }
      if (options.removeBackground && (isImage || isURL && /\.(jpe?g|png)$/i.test(inputUrl))) {
        try {
          let imageUrl = await uploader.providers.tmpfiles.upload(buffer);
          if (!imageUrl) {
            console.error("Gagal mengupload gambar untuk hapus background.");
            m.react("❌");
            return m.reply(Func.texted("bold", "Gagal mengupload gambar untuk hapus background."));
          }
          const removeBgApiUrl = API("wudysoft", "/api/tools/remove-bg/v1", {
            url: imageUrl,
            provider: 1
          });
          const noBgBuffer = await Func.fetchBuffer(removeBgApiUrl);
          if (!noBgBuffer) {
            console.error("Gagal menghapus background dari gambar.");
            m.react("❌");
            return m.reply(Func.texted("bold", "Gagal menghapus background. Coba lagi atau tanpa -nobg."));
          }
          buffer = noBgBuffer;
        } catch (error) {
          console.error("Kesalahan saat penghapusan background:", error);
          m.react("❌");
          return m.reply(Func.texted("bold", "Terjadi kesalahan saat menghapus background."));
        }
      }
      const finalMimeType = isImage || isURL && /\.(jpe?g|png)$/i.test(inputUrl) ? "image" : isVideo || isURL && /\.(mp4|gif)$/i.test(inputUrl) ? "video" : null;
      if (finalMimeType === "image") {
        return await makeSticker(buffer, {
          pack: setting.stick_pack,
          author: setting.stick_auth,
          circle: options.circle,
          keepScale: options.keepScale
        }).then(v => {
          m.react("✅");
          m.reply({
            sticker: v
          });
        });
      } else if (finalMimeType === "video") {
        if (quoted && (quoted.msg || quoted).seconds > 7) {
          m.react("❌");
          return m.reply(Func.texted("bold", `Durasi maksimum video/GIF adalah 7 detik.`));
        }
        return await makeSticker(buffer, {
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
        m.react("❌");
        return m.reply(Func.texted("bold", "Tipe media tidak didukung untuk membuat stiker."));
      }
    } catch (e) {
      console.error("Kesalahan di perintah stiker:", e);
      m.react("❌");
      return m.reply(Func.texted("bold", "Terjadi kesalahan fatal saat membuat stiker. Pastikan media valid."));
    }
  },
  limit: 1
};