const axios = require("axios");
const FormData = require("form-data");
const {
  Blob
} = require("buffer");
module.exports = {
  help: ["upload"],
  tags: ["tools"],
  command: /^(upload)$/i,
  run: async (m, {
    conn,
    quoted
  }) => {
    const commandName = m.command;
    const messageText = (m.body || "").trim();
    const commandIndex = messageText.toLowerCase().indexOf(commandName.toLowerCase());
    let inputHost = null;
    if (commandIndex !== -1) {
      inputHost = messageText.substring(commandIndex + commandName.length).trim().split(" ")[0]?.toLowerCase();
    }
    let hostsList = [];
    try {
      const {
        data
      } = await axios.get("https://wudysoft.xyz/api/tools/upload");
      hostsList = data?.hosts?.map(h => h.toLowerCase()) || [];
    } catch (e) {
      return m.reply("❌ Gagal mengambil daftar host.");
    }
    if (!inputHost) {
      const teks = `📎 *Balas media (gambar/video/dokumen) untuk diunggah.*\n\n🌐 *Daftar host tersedia:*\n${hostsList.map(h => ` • *${h}*`).join("\n")}\n\n📌 *Contoh:* .upload catbox (balas gambar)`;
      return conn.reply(m.chat, teks, m);
    }
    if (!hostsList.includes(inputHost)) {
      const teks = `⚠️ *Host '${inputHost}' tidak tersedia.*\n\n🌐 *Host yang valid:*\n${hostsList.map(h => ` • *${h}*`).join("\n")}`;
      return conn.reply(m.chat, teks, m);
    }
    if (!quoted || typeof quoted.download !== "function") {
      return conn.reply(m.chat, `📎 *Balas media (gambar/video/dokumen) untuk diunggah ke host:* *${inputHost}*`, m);
    }
    m.react("⏳");
    try {
      const buffer = await quoted.download();
      if (!buffer) throw new Error("Gagal mendownload media.");
      const mime = quoted.mimetype || "application/octet-stream";
      const ext = mime.split("/")[1] || "dat";
      const filename = `upload_${Date.now()}.${ext}`;
      const blob = new Blob([buffer], {
        type: mime
      });
      const form = new FormData();
      form.append("file", blob, filename);
      const response = await axios.post(`https://wudysoft.xyz/api/tools/upload?host=${inputHost}`, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      const result = response.data;
      if (result?.result) {
        m.react("✅");
        return conn.reply(m.chat, `✅ *UPLOAD BERHASIL*\n\n🔗 *Link:* ${result.result}`, m);
      } else {
        throw new Error("Respons tidak berisi URL.");
      }
    } catch (err) {
      m.react("❌");
      return conn.reply(m.chat, `❌ *UPLOAD GAGAL:*\n${err.message || err}`, m);
    }
  },
  limit: 3
};