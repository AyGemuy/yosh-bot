const axios = require("axios");
module.exports = {
  help: ["imagesart"],
  tags: ["ai"],
  command: /^(imagesart)$/i,
  run: async (m, {
    Func,
    API
  }) => {
    try {
      let fullInput = m.text.replace(new RegExp(`^${m.prefix + m.command}\\s*`, "i"), "").trim();
      if (!fullInput && m.quoted && m.quoted.text) {
        fullInput = m.quoted.text.trim();
      }
      if (!fullInput) {
        m.react("ℹ️");
        return m.reply(`
╭─[ 🖼️ PANDUAN IMAGESART AI 🖼️ ]
│
│ *Fitur*: Membuat gambar dari teks menggunakan ImagesArt AI.
│
│ *Penggunaan:*
│ ├ *${m.prefix + m.command} [prompt]* [opsi lainnya...]
│ └ Reply teks: *${m.prefix + m.command}* [opsi lainnya...]
│
│ *Opsi (opsional):*
│ ├ *-p="[prompt]"* : Deskripsi gambar utama
│ ├ *-m=[model_name]* : Model AI (default: "flux-dev-fp8" di sisi API, tidak dikirim jika tidak diinput)
│ ├ *-ar=[aspect_ratio]* : Rasio aspek (default: "9:16" di sisi API, tidak dikirim jika tidak diinput)
│ ├ *-pub=[true/false]* : Publikasikan gambar (default: true di sisi API, tidak dikirim jika tidak diinput)
│ ├ *-wm=[true/false]* : Tambah watermark (default: true di sisi API, tidak dikirim jika tidak diinput)
│ └ *-it=[input_type]* : Tipe input (default: "text" di sisi API, tidak dikirim jika tidak diinput)
│
│ *Contoh:*
│ ├ *${m.prefix + m.command} -p="pemandangan laut sunset" -ar="16:9"*
│ └ *${m.prefix + m.command} -p="kucing lucu" -m="realism" -pub=false*
╰─[ ✨ KREASI AI ✨ ]
`.trim());
      }
      m.react("⏱️");
      const options = {};
      let remainingInput = fullInput;
      const extractStringParam = (paramName, ...regexes) => {
        for (const regex of regexes) {
          const match = remainingInput.match(regex);
          if (match) {
            options[paramName] = match[1].trim();
            remainingInput = remainingInput.replace(match[0], "").trim();
            return;
          }
        }
      };
      const extractBooleanParam = (paramName, ...regexes) => {
        for (const regex of regexes) {
          const match = remainingInput.match(regex);
          if (match) {
            options[paramName] = match[1].toLowerCase() === "true";
            remainingInput = remainingInput.replace(match[0], "").trim();
            return;
          }
        }
      };
      extractStringParam("prompt", /-p="([^"]+)"/, /-p='([^']+)'/, /-p=([^\s-]+)/);
      extractStringParam("model", /-m=([^\s-]+)/);
      extractStringParam("aspect_ratio", /-ar=([^\s-]+)/);
      extractBooleanParam("isPublic", /-pub=(true|false)/i);
      extractBooleanParam("watermark", /-wm=(true|false)/i);
      extractStringParam("inputType", /-it=([^\s-]+)/);
      if (!options.prompt && remainingInput) {
        options.prompt = remainingInput.trim();
      }
      if (!options.prompt) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Harap berikan prompt untuk membuat gambar."));
      }
      const apiParams = {
        action: "generate",
        prompt: options.prompt
      };
      if (options.model !== undefined) apiParams.model = options.model;
      if (options.aspect_ratio !== undefined) apiParams.aspect_ratio = options.aspect_ratio;
      if (options.isPublic !== undefined) apiParams.isPublic = options.isPublic;
      if (options.watermark !== undefined) apiParams.watermark = options.watermark;
      if (options.inputType !== undefined) apiParams.inputType = options.inputType;
      const apiUrl = API("wudysoft", "/api/ai/txt2img/imagesart", apiParams);
      console.log("ImagesArt API URL:", apiUrl);
      const response = await axios.get(apiUrl);
      const result = response.data;
      if (!result || !result.imageUrl) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Gagal membuat gambar dengan ImagesArt AI. Tidak ada gambar yang diterima. Coba lagi."));
      }
      if (result.imageUrl) {
        try {
          const imageBuffer = await Func.fetchBuffer(result.imageUrl);
          if (imageBuffer) {
            let caption = `🎨 *Hasil ImagesArt AI*\n`;
            caption += `*Prompt*: _"${apiParams.prompt}"_\n`;
            if (apiParams.model !== undefined) caption += `*Model*: _"${apiParams.model}"_\n`;
            if (apiParams.aspect_ratio !== undefined) caption += `*Rasio Aspek*: ${apiParams.aspect_ratio}\n`;
            if (apiParams.isPublic !== undefined) caption += `*Publik*: ${apiParams.isPublic ? "Ya" : "Tidak"}\n`;
            if (apiParams.watermark !== undefined) caption += `*Watermark*: ${apiParams.watermark ? "Ya" : "Tidak"}\n`;
            if (result.hasWatermark !== undefined) caption += `*Ada Watermark (dari API)*: ${result.hasWatermark ? "Ya" : "Tidak"}\n`;
            if (result.metadata?.parameters?.credits) caption += `*Credits Digunakan*: ${result.metadata.parameters.credits}\n`;
            await m.reply({
              image: imageBuffer,
              caption: caption.trim()
            });
          } else {
            console.warn(`Failed to fetch image from URL: ${result.imageUrl}`);
            await m.reply(Func.texted("bold", `Gagal mengunduh gambar dari URL: ${result.imageUrl.substring(0, 50)}...`));
          }
        } catch (downloadError) {
          console.error(`Error downloading image ${result.imageUrl}:`, downloadError);
          await m.reply(Func.texted("bold", `Terjadi kesalahan saat mengunduh gambar dari URL: ${result.imageUrl.substring(0, 50)}...`));
        }
      } else {
        m.react("❌");
        return m.reply(Func.texted("bold", "Tidak ada URL gambar yang ditemukan dalam respons API."));
      }
      m.react("✅");
    } catch (e) {
      console.error("Error in imagesart command:", e);
      m.react("❌");
      let errorMessage = e.response?.data ? `API Error: ${JSON.stringify(e.response.data)}` : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat menggunakan ImagesArt AI: ${errorMessage}`));
    }
  },
  limit: 2
};