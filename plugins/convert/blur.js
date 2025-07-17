const jimp = require("jimp");
module.exports = {
  help: ["blur"],
  tags: ["converter"],
  command: /^(blur|buram)$/i,
  run: async (m, {
    Func,
    quoted
  }) => {
    try {
      let mime = quoted && (quoted.msg || quoted).mimetype || "";
      if (!mime) {
        m.react("ℹ️");
        return m.reply(Func.texted("bold", `Reply photo.`));
      }
      if (!/webp|image\/(jpe?g|png)/.test(mime)) {
        m.react("❌");
        return m.reply(Func.texted("bold", `Media is not supported, can only be pictures and stickers.`));
      }
      m.react("⏱️");
      let image = await quoted.download();
      if (!image) {
        m.react("❌");
        return m.reply(Func.texted("bold", `Gagal mengunduh media.`));
      }
      let level = m.text ? m.text.replace(new RegExp(`^${m.prefix + m.command}\\s*`, "i"), "").trim() : "5";
      let img = await jimp.read(image);
      img.blur(isNaN(level) ? 5 : parseInt(level));
      img.getBuffer("image/jpeg", (e, buffer) => {
        if (e) {
          console.error("Error processing image with Jimp:", e);
          m.react("❌");
          return m.reply(Func.texted("bold", "Terjadi kesalahan saat memproses gambar."));
        }
        m.react("✅");
        m.reply({
          image: buffer
        });
      });
    } catch (e) {
      console.error("Error in blur command:", e);
      m.react("❌");
      return m.reply(Func.texted("bold", "Terjadi kesalahan fatal saat membuat efek blur."));
    }
  },
  limit: 1
};