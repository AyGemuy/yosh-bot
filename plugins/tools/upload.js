module.exports = {
  help: ["upload"],
  tags: ["tools"],
  command: /^(upload)$/i,
  run: async (m, {
    Func,
    conn,
    quoted,
    uploader
  }) => {
    let inputHost = null;
    let defaultHost = "catbox";
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

    const availableHosts = Object.keys(uploader.providers);

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
      let hostsList = availableHosts.map(h => ` • *${h}*`).join("\n");
      replyText += `\n🌐 *AVAILABLE TARGETS*\n${hostsList}\n`;
      replyText += `\n*Contoh:* .upload *catbox* (balas gambar)` + `\n*Atau untuk default:* .upload (balas gambar, akan diunggah ke *${defaultHost}*)`;
      return conn.reply(m.chat, replyText, m);
    }

    m.react("⏳");
    try {
      const buffer = await quoted.download();
      if (!buffer) {
        m.react("💢");
        return conn.reply(m.chat, `💢 *ERROR: Aliran data rusak. Gagal memperoleh file.*`, m);
      }

      const uploaderProvider = uploader.providers[finalHost];

      if (!uploaderProvider || typeof uploaderProvider.upload !== 'function') {
        m.react("❌");
        return conn.reply(m.chat, `❌ *DEPLOY GAGAL: Provider "${finalHost}" tidak ditemukan atau tidak memiliki method upload yang valid.*`, m);
      }

      const fileExtension = quoted.msg?.mimetype ? quoted.msg.mimetype.split("/")[1] : "dat";
      const now = new Date();
      const dateTimeString = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, "0") + now.getDate().toString().padStart(2, "0") + "_" + now.getHours().toString().padStart(2, "0") + now.getMinutes().toString().padStart(2, "0") + now.getSeconds().toString().padStart(2, "0");
      const filename = `upload_${dateTimeString}.${fileExtension}`;
      const mimetype = quoted.msg?.mimetype;

      const result = await uploaderProvider.upload(buffer, {
        filename,
        contentType: mimetype
      });

      if (typeof result === 'string' && result.startsWith('http')) { // Memeriksa jika result adalah string dan dimulai dengan 'http'
        m.react("✅");
        return conn.reply(m.chat, `✅ *DEPLOY BERHASIL*\n` + `\n*Host:* ${finalHost}\n` + `\n🔗 *Titik Akses:*\n${result}\n` + `\n_Transaksi selesai. Data aman._`, m);
      } else {
        m.react("❌");
        return conn.reply(m.chat, `❌ *DEPLOY GAGAL: Sistem target tidak responsif atau tidak mengembalikan URL yang valid.*`, m);
      }
    } catch (error) {
      m.react("❌");
      let errorMessage = error.message || error;
      if (error.response && error.response.data) {
        try {
          errorMessage += `\nDetail: ${JSON.stringify(error.response.data).slice(0, 500)}`;
        } catch (e) {
          errorMessage += `\nDetail: ${error.response.data.toString().slice(0, 500)}`;
        }
      }
      return conn.reply(m.chat, `❌ *DEPLOY GAGAL: Terjadi kesalahan saat mengunggah.* \n\n${errorMessage}`, m);
    }
  },
  limit: 3
};