const axios = require("axios");
module.exports = {
  help: ["aigreem"],
  tags: ["ai"],
  command: /^(aigreem)$/i,
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
╭─[ 🖼️ PANDUAN AIGREEM AI 🖼️ ]
│
│ *Fitur*: Membuat gambar dari teks menggunakan Aigreem AI.
│
│ *Penggunaan:*
│ ├ *${m.prefix + m.command} [prompt]* [opsi lainnya...]
│ └ Reply teks: *${m.prefix + m.command}* [opsi lainnya...]
│
│ *Opsi (opsional):*
│ ├ *-p="[prompt]"* : Deskripsi gambar
│ ├ *-np="[negative_prompt]"* : Apa yang tidak diinginkan
│ ├ *-w=[width]* : Lebar gambar (default API: 512)
│ ├ *-h=[height]* : Tinggi gambar (default API: 768)
│ ├ *-m="[model_name]"* : Nama model (cth: "Realistic Western")
│ ├ *-b=[batch_size]* : Jumlah gambar (default API: 1, maks: 4)
│ ├ *-s=[seed]* : Seed untuk reproduksi gambar
│ ├ *-sc=[scale]* : Skala prompt (default API: 7)
│ ├ *-qt=[true/false]* : Tag kualitas (default API: false)
│ ├ *-cf=[true/false]* : Filter bersih (default API: false)
│ ├ *-rs=[true/false]* : Saklar seed acak (default API: false)
│ ├ *-g=[true/false]* : Status dihasilkan (default API: false)
│ ├ *-ui="[upload_image_url]"* : URL gambar untuk upload
│ └ *-d=[denoising]* : Level denoising (0.1-1.0)
│
│ *Contoh:*
│ ├ *${m.prefix + m.command} -p="kucing lucu di luar angkasa" -w=768 -h=512 -b=2*
│ └ *${m.prefix + m.command} -p="rumah minimalis" -m="anime style" -np="buruk, jelek"*
╰─[ ✨ KREASI AI ✨ ]
`.trim());
      }
      m.react("⏱️");
      const options = {};
      let remainingInput = fullInput;
      const extractStringParam = (regex, paramName) => {
        const match = remainingInput.match(regex);
        if (match) {
          options[paramName] = match[1].trim();
          remainingInput = remainingInput.replace(match[0], "").trim();
        }
      };
      const extractNumberParam = (regex, paramName) => {
        const match = remainingInput.match(regex);
        if (match) {
          const parsed = parseFloat(match[1]);
          if (!isNaN(parsed)) {
            options[paramName] = parsed;
          }
          remainingInput = remainingInput.replace(match[0], "").trim();
        }
      };
      const extractBooleanParam = (regex, paramName) => {
        const match = remainingInput.match(regex);
        if (match) {
          options[paramName] = match[1].toLowerCase() === "true";
          remainingInput = remainingInput.replace(match[0], "").trim();
        }
      };
      extractStringParam(/-p="([^"]+)"/, "prompt");
      extractStringParam(/-p='([^']+)'/, "prompt");
      extractStringParam(/-p=([^\s-]+)/, "prompt");
      extractStringParam(/-np="([^"]+)"/, "negativePrompt");
      extractStringParam(/-np='([^']+)'/, "negativePrompt");
      extractStringParam(/-np=([^\s-]+)/, "negativePrompt");
      extractNumberParam(/-w=(\d+)/, "width");
      extractNumberParam(/-h=(\d+)/, "height");
      extractStringParam(/-m="([^"]+)"/, "model");
      extractStringParam(/-m='([^']+)'/, "model");
      extractStringParam(/-m=([^\s-]+)/, "model");
      extractNumberParam(/-b=(\d+)/, "batchSize");
      extractNumberParam(/-s=(\d+)/, "seed");
      extractNumberParam(/-sc=(\d+(\.\d+)?)/, "scale");
      extractBooleanParam(/-qt=(true|false)/i, "qualityTag");
      extractBooleanParam(/-cf=(true|false)/i, "cleanFilter");
      extractBooleanParam(/-rs=(true|false)/i, "rndSeedSwitch");
      extractBooleanParam(/-g=(true|false)/i, "generated");
      extractStringParam(/-ui="([^"]+)"/, "uploadImage");
      extractStringParam(/-ui='([^']+)'/, "uploadImage");
      extractStringParam(/-ui=([^\s-]+)/, "uploadImage");
      extractNumberParam(/-d=(\d+(\.\d+)?)/, "denoising");
      if (!options.prompt && remainingInput) {
        options.prompt = remainingInput.trim();
      }
      if (!options.prompt) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Harap berikan prompt untuk membuat gambar."));
      }
      if (options.batchSize > 4) {
        m.reply(Func.texted("bold", "Ukuran batch maksimum adalah 4. Menggunakan batchSize=4."));
        options.batchSize = 4;
      }
      const apiParams = {
        prompt: options.prompt
      };
      if (options.negativePrompt !== undefined) apiParams.negative_prompt = options.negativePrompt;
      if (options.width !== undefined) apiParams.width = options.width;
      if (options.height !== undefined) apiParams.height = options.height;
      if (options.model !== undefined) apiParams.model = options.model;
      if (options.batchSize !== undefined) apiParams.batchSize = options.batchSize;
      if (options.seed !== undefined) apiParams.seed = options.seed;
      if (options.scale !== undefined) apiParams.scale = options.scale;
      if (options.qualityTag !== undefined) apiParams.qualityTag = options.qualityTag;
      if (options.cleanFilter !== undefined) apiParams.cleanFilter = options.cleanFilter;
      if (options.rndSeedSwitch !== undefined) apiParams.rndSeedSwitch = options.rndSeedSwitch;
      if (options.generated !== undefined) apiParams.generated = options.generated;
      if (options.uploadImage !== undefined) apiParams.uploadImage = options.uploadImage;
      if (options.denoising !== undefined) apiParams.denoising = options.denoising;
      const apiUrl = API("wudysoft", "/api/ai/txt2img/gen/v20", apiParams);
      console.log("Aigreem API URL:", apiUrl);
      const response = await axios.get(apiUrl);
      const result = response.data;
      if (!result || !result.images || result.images.length === 0) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Gagal membuat gambar dengan Aigreem AI. Tidak ada gambar yang diterima. Coba lagi."));
      }
      for (const imageUrl of result.images) {
        if (imageUrl) {
          try {
            const imageBuffer = await Func.fetchBuffer(imageUrl);
            if (imageBuffer) {
              let caption = `🎨 *Hasil Aigreem AI*\n`;
              caption += `*Prompt*: _"${options.prompt}"_\n`;
              if (options.negativePrompt !== undefined) caption += `*Prompt Negatif*: _"${options.negativePrompt}"_\n`;
              if (options.width !== undefined) caption += `*Ukuran*: ${options.width}x${options.height !== undefined ? options.height : "N/A"}\n`;
              else if (options.height !== undefined) caption += `*Ukuran*: N/Ax${options.height}\n`;
              if (options.model !== undefined) caption += `*Model*: _"${options.model}"_\n`;
              if (options.batchSize !== undefined) caption += `*Jumlah Gambar*: ${options.batchSize}\n`;
              if (options.seed !== undefined) caption += `*Seed*: ${options.seed}\n`;
              if (options.scale !== undefined) caption += `*Skala*: ${options.scale}\n`;
              if (options.qualityTag !== undefined) caption += `*Tag Kualitas*: ${options.qualityTag}\n`;
              if (options.cleanFilter !== undefined) caption += `*Filter Bersih*: ${options.cleanFilter}\n`;
              if (options.rndSeedSwitch !== undefined) caption += `*Seed Acak*: ${options.rndSeedSwitch}\n`;
              if (options.generated !== undefined) caption += `*Dihasilkan*: ${options.generated}\n`;
              if (options.uploadImage !== undefined) caption += `*Gambar Upload*: ${options.uploadImage.substring(0, 50)}...\n`;
              if (options.denoising !== undefined) caption += `*Denoising*: ${options.denoising}\n`;
              if (result.greems) caption += `*Greems Digunakan*: ${result.greems}\n`;
              await m.reply({
                image: imageBuffer,
                caption: caption.trim()
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
      console.error("Error in aigreem command:", e);
      m.react("❌");
      let errorMessage = e.response?.data ? `API Error: ${JSON.stringify(e.response.data)}` : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat menggunakan Aigreem AI: ${errorMessage}`));
    }
  },
  limit: 2
};