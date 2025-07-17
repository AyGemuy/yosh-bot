const axios = require("axios");
const FormData = require("form-data");
module.exports = {
  help: ["upload"],
  tags: ["tools"],
  command: /^(upload)$/i,
  run: async (m, {
    Func,
    API,
    conn,
    quoted
  }) => {
    let inputHost = null;
    let defaultHost = "Eax";
    const commandName = m.command;
    const messageText = (m.body || "").trim();
    let argText = "";
    const commandIndex = messageText.toLowerCase().indexOf(commandName.toLowerCase());
    if (commandIndex !== -1) {
      argText = messageText.substring(commandIndex + commandName.length).trim();
    }
    if (argText) {
      inputHost = argText.split(" ")[0];
    }
    const listHostsApiUrl = API("wudysoft", "/api/tools/upload");
    let availableHosts = [];
    try {
      const response = await axios.get(listHostsApiUrl);
      if (response && response.data && response.data.hosts) {
        availableHosts = response.data.hosts;
      } else {
        m.react("💢");
        return m.reply(`💢 *ERROR: Gagal mengambil daftar target deploy dari API.*`);
      }
    } catch (error) {
      console.error(error);
      m.react("❌");
      let errorMessage = error.response?.data ? `${JSON.stringify(error.response.data, null, 2).substring(0, 500)}...` : `${error.message || error}`;
      return m.reply(`❌ *DEPLOY DIBATALKAN: Kesalahan sistem saat akuisisi target.*\n\n${errorMessage}`);
    }
    let finalHost = defaultHost;
    let showHostList = false;
    let statusMessage = "";
    if (inputHost) {
      if (availableHosts.includes(inputHost)) {
        finalHost = inputHost;
        statusMessage = `🟢 *Target ditentukan:* *${finalHost}*`;
      } else {
        statusMessage = `⚠️ *PERINGATAN: Target '${inputHost}' tidak valid.* Menggunakan default: *${defaultHost}*.`;
        showHostList = true;
      }
    } else {
      statusMessage = `💡 *Tidak ada target ditentukan.* Menggunakan default: *${defaultHost}*.`;
    }
    if (!quoted || typeof quoted.download !== "function" || showHostList) {
      let replyText = ``;
      if (showHostList) {
        m.react("⚠️");
        replyText += `⚠️ *PERINGATAN: Target deploy tidak valid:* *${inputHost}*.\n`;
        replyText += `Silakan pilih dari daftar berikut atau gunakan default:\n`;
      } else {
        m.react("ℹ️");
        replyText += `🚀 *DEPLOY INITIATED*\n`;
        replyText += `\n${statusMessage}\n`;
        replyText += `\nUntuk mengunggah data, *balas gambar/video/dokumen*.\n`;
        replyText += `\nSertakan nama host: .upload *<nama_host>*\n`;
      }
      let hostsList = availableHosts.map(h => `  • *${h}*`).join("\n");
      replyText += `\n🌐 *AVAILABLE TARGETS*\n${hostsList}\n`;
      replyText += `\n*Contoh:* .upload *Supa* (balas gambar)` + `\n*Atau untuk default:* .upload (balas gambar, akan diunggah ke *${defaultHost}*)`;
      return m.reply(replyText);
    }
    m.react("⏳");
    try {
      const buffer = await quoted.download();
      if (!buffer) {
        m.react("💢");
        return m.reply(`💢 *ERROR: Aliran data rusak. Gagal memperoleh file.*`);
      }
      const now = new Date();
      const dateTimeString = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, "0") + now.getDate().toString().padStart(2, "0") + "_" + now.getHours().toString().padStart(2, "0") + now.getMinutes().toString().padStart(2, "0") + now.getSeconds().toString().padStart(2, "0");
      const fileExtension = quoted.msg?.mimetype ? quoted.msg.mimetype.split("/")[1] : "dat";
      const newFilename = `upload_${dateTimeString}.${fileExtension}`;
      const formData = new FormData();
      formData.append("file", buffer, {
        filename: newFilename,
        contentType: quoted.msg?.mimetype
      });
      const uploadApiUrl = API("wudysoft", "/api/tools/upload", {
        host: finalHost
      });
      const response = await axios.post(uploadApiUrl, formData, {
        headers: formData.getHeaders()
      });
      if (response && response.data && response.data.result) {
        m.react("✅");
        return m.reply(`✅ *DEPLOY BERHASIL*\n` + `\n*Host:* ${finalHost}\n` + `\n🔗 *Titik Akses:*\n${response.data.result}\n` + `\n_Transaksi selesai. Data aman._`);
      } else {
        console.error("Upload API returned no result:", response?.data);
        m.react("❌");
        return m.reply(`❌ *DEPLOY GAGAL: Sistem target tidak responsif.*`);
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      m.react("❌");
      return m.reply(`❌ *DEPLOY GAGAL: Terjadi kesalahan saat mengunggah.*`);
    }
  },
  limit: 3
};