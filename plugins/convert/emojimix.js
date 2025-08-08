const {
  makeSticker
} = require("@library/sticker");
module.exports = {
  help: ["emojimix"],
  tags: ["converter"],
  command: /^(emojimix|emix)$/i,
  run: async (m, {
    Func,
    setting,
    API
  }) => {
    try {
      if (!m.text) {
        m.react("ℹ️");
        return m.reply(Func.example(m.prefix, m.command, "🤐+🥲"));
      }
      m.react("⏱️");
      let [emoji1, emoji2] = m.text.split`+`;
      if (!emoji1 || !emoji2) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Format salah. Gunakan dua emoji dipisah dengan '+'. Contoh: 🤐+🥲"));
      }
      emoji1 = emoji1.trim();
      emoji2 = emoji2.trim();
      const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
      if (!emojiRegex.test(emoji1) || !emojiRegex.test(emoji2)) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Pastikan input yang diberikan adalah emoji yang valid."));
      }
      const encodedEmojis = encodeURIComponent(emoji1) + "+" + encodeURIComponent(emoji2);
      let stickerBuffer;
      try {
        const apiUrlV3 = API("wudysoft", "/api/misc/emojimix/v3", {
          emoji: encodedEmojis
        });
        stickerBuffer = await Func.fetchBuffer(apiUrlV3);
        if (stickerBuffer) {
          console.log("Using Emojimix V3 API.");
        }
      } catch (errV3) {
        console.error("V3 API failed, trying V2:", errV3.message);
      }
      if (!stickerBuffer) {
        try {
          const apiUrlV2 = API("wudysoft", "/api/misc/emojimix/v2", {
            emoji: encodedEmojis
          });
          stickerBuffer = await Func.fetchBuffer(apiUrlV2);
          if (stickerBuffer) {
            console.log("Using Emojimix V2 API.");
          }
        } catch (errV2) {
          console.error("V2 API failed, trying V1:", errV2.message);
        }
      }
      if (!stickerBuffer) {
        try {
          const apiUrlV1 = API("wudysoft", "/api/misc/emojimix/v1", {
            emoji: encodedEmojis
          });
          stickerBuffer = await Func.fetchBuffer(apiUrlV1);
          if (stickerBuffer) {
            console.log("Using Emojimix V1 API.");
          }
        } catch (errV1) {
          console.error("V1 API failed, no more fallbacks:", errV1.message);
        }
      }
      if (!stickerBuffer) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Gagal mendapatkan gambar campuran emoji dari semua API. Coba kombinasi lain atau ganti posisi emojinya."));
      }
      await makeSticker(stickerBuffer, {
        pack: setting.stick_pack,
        author: setting.stick_auth
      }).then(v => {
        m.react("✅");
        m.reply({
          sticker: v
        });
      });
    } catch (e) {
      console.error("Error in emojimix command:", e);
      m.react("❌");
      return m.reply(Func.texted("bold", "Terjadi kesalahan. Pastikan emoji support, atau coba ubah posisi/ganti emojinya."));
    }
  },
  limit: 1
};