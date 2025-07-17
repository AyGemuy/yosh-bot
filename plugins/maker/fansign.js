const axios = require("axios");
module.exports = {
  help: ["fansign"],
  tags: ["maker"],
  command: /^(fansign)$/i,
  run: async (m, {
    Func,
    API
  }) => {
    try {
      let inputText = m.text.replace(new RegExp(`^${m.prefix + m.command}\\s*`, "i"), "").trim();
      if (!inputText && m.quoted && m.quoted.text) {
        inputText = m.quoted.text.trim();
      }
      if (!inputText) {
        m.react("ℹ️");
        return m.reply(`
╭─[ ✍️ PANDUAN FANSIGN ✍️ ]
│
│ *Fitur*: Membuat gambar fansign dari teks Anda.
│
│ *Penggunaan:*
│ ├ *${m.prefix + m.command} [teks_anda]*
│ ├ *${m.prefix + m.command} [teks_anda] -model=[nomor_model]*
│ └ Reply teks: *${m.prefix + m.command}* (lalu tambahkan -model jika perlu)
│
│ *Contoh:*
│ ├ *${m.prefix + m.command} Bot Keren*
│ └ *${m.prefix + m.command} Aku Cinta Kamu -model=5*
│
│ *Pilihan Model (1-10):*
│ └ Jika tidak ditentukan, model akan dipilih acak.
╰─[ ✨ KREASI FANSIGN ✨ ]
`.trim());
      }
      m.react("⏱️");
      let textToFansign = inputText;
      let model = Math.floor(Math.random() * 10) + 1;
      const modelMatch = inputText.match(/-model=(\d+)/i);
      if (modelMatch && modelMatch[1]) {
        const parsedModel = parseInt(modelMatch[1]);
        if (!isNaN(parsedModel) && parsedModel >= 1 && parsedModel <= 10) {
          model = parsedModel;
          textToFansign = textToFansign.replace(/-model=\d+/i, "").trim();
        } else {
          m.reply(Func.texted("bold", "Nomor model tidak valid. Pilih antara 1 dan 10. Menggunakan model acak."));
        }
      }
      const apiUrl = API("wudysoft", "/api/maker/fansign/v1", {
        text: textToFansign,
        model: model
      });
      const imageBuffer = await Func.fetchBuffer(apiUrl);
      if (!imageBuffer) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Gagal membuat fansign. Pastikan teks tidak terlalu panjang dan coba lagi."));
      }
      await m.reply({
        image: imageBuffer,
        caption: `✨ *Fansign untuk:* _"${textToFansign}"_\n*Menggunakan Model:* _${model}_`
      });
      m.react("✅");
    } catch (e) {
      console.error("Error in fansign command:", e);
      m.react("❌");
      return m.reply(Func.texted("bold", "Terjadi kesalahan saat membuat fansign. Pastikan teks valid dan coba lagi."));
    }
  },
  limit: 1
};