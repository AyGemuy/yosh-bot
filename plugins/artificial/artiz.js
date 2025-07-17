const axios = require("axios");
module.exports = {
  help: ["artiz"],
  tags: ["ai"],
  command: /^(artiz)$/i,
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
╭─[ 🖼️ PANDUAN ARTIZ AI 🖼️ ]
│
│ *Fitur*: Membuat gambar dari teks menggunakan Artiz AI.
│
│ *Penggunaan:*
│ ├ *${m.prefix + m.command} [prompt]* [opsi lainnya...]
│ └ Reply teks: *${m.prefix + m.command}* [opsi lainnya...]
│
│ *Opsi (opsional):*
│ ├ *-p="[prompt]"* : Deskripsi gambar utama
│ ├ *-np="[negative_prompt]"* : Apa yang tidak diinginkan dalam gambar
│ ├ *-size="[WxH]"* : Ukuran gambar (cth: "960x1280", "512x512")
│ ├ *-m=[model_id]* : ID Model Artiz (cth: "10541" untuk Flux Free)
│ ├ *-t=[type]* : Tipe model (cth: "free")
│ ├ *-st=[style_id]* : ID Gaya (default: 0)
│ ├ *-l="[lora_id]"* : ID LoRA
│ ├ *-ls=[lora_strength]* : Kekuatan LoRA (0.1-1.0, default: 0.8)
│ ├ *-i2i="[img_url]"* : URL gambar untuk Image-to-Image
│ ├ *-d=[denoise_strength]* : Kekuatan denoise (0-100, default: 100)
│ ├ *-e2i="[edge_img_url]"* : URL gambar untuk Edge-to-Image
│ ├ *-es=[edge_strength]* : Kekuatan Edge-to-Image (default: 0)
│ ├ *-dep2i="[depth_img_url]"* : URL gambar untuk Depth-to-Image
│ ├ *-deps=[depth_strength]* : Kekuatan Depth-to-Image (default: 0)
│ ├ *-pos2i="[pose_img_url]"* : URL gambar untuk Pose-to-Image
│ ├ *-poss=[pose_strength]* : Kekuatan Pose-to-Image (default: 0)
│ ├ *-r2i="[ref_img_url]"* : URL gambar referensi
│ ├ *-rs=[ref_strength]* : Kekuatan referensi (0.1-1.0, default: 0.58)
│ ├ *-f2i="[face_img_url]"* : URL gambar wajah untuk Face Swap
│ ├ *-fs=[face_strength]* : Kekuatan Face Swap (default: 0)
│ ├ *-num=[num_images]* : Jumlah gambar (default: 2)
│ ├ *-seed=[seed_val]* : Nilai seed (default: -1 untuk acak)
│ ├ *-public=[0/1]* : Visibilitas publik (0=private, 1=public, default: 0)
│ └ *-fixf=[0/1]* : Perbaikan wajah (0=mati, 1=hidup, default: 0)
│
│ *Contoh:*
│ ├ *${m.prefix + m.command} -p="gadis anime cantik" -size="768x1024" -num=4*
│ └ *${m.prefix + m.command} -p="pria tua tersenyum" -np="keriput, sedih" -fixf=1*
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
      const extractNumberParam = (paramName, ...regexes) => {
        for (const regex of regexes) {
          const match = remainingInput.match(regex);
          if (match) {
            const parsed = parseFloat(match[1]);
            if (!isNaN(parsed)) {
              options[paramName] = parsed;
            }
            remainingInput = remainingInput.replace(match[0], "").trim();
            return;
          }
        }
      };
      const extractBooleanishParam = (paramName, ...regexes) => {
        for (const regex of regexes) {
          const match = remainingInput.match(regex);
          if (match) {
            options[paramName] = parseInt(match[1]);
            remainingInput = remainingInput.replace(match[0], "").trim();
            return;
          }
        }
      };
      extractStringParam("prompt", /-p="([^"]+)"/, /-p='([^']+)'/, /-p=([^\s-]+)/);
      extractStringParam("negativePrompt", /-np="([^"]+)"/, /-np='([^']+)'/, /-np=([^\s-]+)/);
      extractStringParam("size", /-size="([^"]+)"/, /-size='([^']+)'/, /-size=([^\s-]+)/);
      extractNumberParam("model", /-m=(\d+)/);
      extractStringParam("type", /-t=([^\s-]+)/);
      extractNumberParam("style", /-st=(\d+)/);
      extractStringParam("lora", /-l="([^"]+)"/, /-l='([^']+)'/, /-l=([^\s-]+)/);
      extractNumberParam("loraSth", /-ls=(\d+(\.\d+)?)/);
      extractStringParam("img2img", /-i2i="([^"]+)"/, /-i2i='([^']+)'/, /-i2i=([^\s-]+)/);
      extractNumberParam("denoise", /-d=(\d+)/);
      extractStringParam("edge2img", /-e2i="([^"]+)"/, /-e2i='([^']+)'/, /-e2i=([^\s-]+)/);
      extractNumberParam("edgeSth", /-es=(\d+(\.\d+)?)/);
      extractStringParam("depth2img", /-dep2i="([^"]+)"/, /-dep2i='([^']+)'/, /-dep2i=([^\s-]+)/);
      extractNumberParam("depthSth", /-deps=(\d+(\.\d+)?)/);
      extractStringParam("pose2img", /-pos2i="([^"]+)"/, /-pos2i='([^']+)'/, /-pos2i=([^\s-]+)/);
      extractNumberParam("poseSth", /-poss=(\d+(\.\d+)?)/);
      extractStringParam("ref2img", /-r2i="([^"]+)"/, /-r2i='([^']+)'/, /-r2i=([^\s-]+)/);
      extractNumberParam("refSth", /-rs=(\d+(\.\d+)?)/);
      extractStringParam("face2img", /-f2i="([^"]+)"/, /-f2i='([^']+)'/, /-f2i=([^\s-]+)/);
      extractNumberParam("faceSth", /-fs=(\d+(\.\d+)?)/);
      extractNumberParam("imgNum", /-num=(\d+)/);
      extractNumberParam("seed", /-seed=(\-?\d+)/);
      extractBooleanishParam("isPublic", /-public=([01])/);
      extractBooleanishParam("fixFace", /-fixf=([01])/);
      if (!options.prompt && remainingInput) {
        options.prompt = remainingInput.trim();
      }
      if (!options.prompt) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Harap berikan prompt untuk membuat gambar."));
      }
      const apiParams = {
        prompt: options.prompt
      };
      if (options.negativePrompt !== undefined) apiParams.negativePrompt = options.negativePrompt;
      if (options.size !== undefined) apiParams.size = options.size;
      if (options.model !== undefined) apiParams.model = options.model;
      if (options.type !== undefined) apiParams.type = options.type;
      if (options.style !== undefined) apiParams.style = options.style;
      if (options.lora !== undefined) apiParams.lora = options.lora;
      if (options.loraSth !== undefined) apiParams.loraSth = options.loraSth;
      if (options.img2img !== undefined) apiParams.img2img = options.img2img;
      if (options.denoise !== undefined) apiParams.denoise = options.denoise;
      if (options.edge2img !== undefined) apiParams.edge2img = options.edge2img;
      if (options.edgeSth !== undefined) apiParams.edgeSth = options.edgeSth;
      if (options.depth2img !== undefined) apiParams.depth2img = options.depth2img;
      if (options.depthSth !== undefined) apiParams.depthSth = options.depthSth;
      if (options.pose2img !== undefined) apiParams.pose2img = options.pose2img;
      if (options.poseSth !== undefined) apiParams.poseSth = options.poseSth;
      if (options.ref2img !== undefined) apiParams.ref2img = options.ref2img;
      if (options.refSth !== undefined) apiParams.refSth = options.refSth;
      if (options.face2img !== undefined) apiParams.face2img = options.face2img;
      if (options.faceSth !== undefined) apiParams.faceSth = options.faceSth;
      if (options.imgNum !== undefined) apiParams.imgNum = options.imgNum;
      if (options.seed !== undefined) apiParams.seed = options.seed;
      if (options.isPublic !== undefined) apiParams.isPublic = options.isPublic;
      if (options.fixFace !== undefined) apiParams.fixFace = options.fixFace;
      if (apiParams.imgNum > 4) {
        m.reply(Func.texted("bold", "Jumlah gambar maksimum adalah 4. Menggunakan imgNum=4."));
        apiParams.imgNum = 4;
      }
      const apiUrl = API("wudysoft", "/api/ai/txt2img/artiz", apiParams);
      console.log("Artiz API URL:", apiUrl);
      const response = await axios.get(apiUrl);
      const result = response.data;
      if (!result || !result.imglist || result.imglist.length === 0) {
        m.react("❌");
        return m.reply(Func.texted("bold", "Gagal membuat gambar dengan Artiz AI. Tidak ada gambar yang diterima. Coba lagi."));
      }
      for (const imageInfo of result.imglist) {
        const imageUrl = imageInfo.full_url;
        if (imageUrl) {
          try {
            const imageBuffer = await Func.fetchBuffer(imageUrl);
            if (imageBuffer) {
              let caption = `🎨 *Hasil Artiz AI*\n`;
              caption += `*Prompt*: _"${apiParams.prompt}"_\n`;
              if (apiParams.negativePrompt !== undefined) caption += `*Prompt Negatif*: _"${apiParams.negativePrompt}"_\n`;
              if (apiParams.size !== undefined) caption += `*Ukuran*: ${apiParams.size}\n`;
              if (apiParams.model !== undefined) caption += `*Model ID*: ${apiParams.model} (${result.modelname || "N/A"})\n`;
              if (apiParams.type !== undefined) caption += `*Tipe*: ${apiParams.type}\n`;
              if (apiParams.style !== undefined) caption += `*Gaya ID*: ${apiParams.style}\n`;
              if (apiParams.lora !== undefined) caption += `*LoRA*: ${apiParams.lora}\n`;
              if (apiParams.loraSth !== undefined) caption += `*Kekuatan LoRA*: ${apiParams.loraSth}\n`;
              if (apiParams.img2img !== undefined) caption += `*Image-to-Image*: ${apiParams.img2img.substring(0, 50)}...\n`;
              if (apiParams.denoise !== undefined) caption += `*Denoise*: ${apiParams.denoise}\n`;
              if (apiParams.edge2img !== undefined) caption += `*Edge-to-Image*: ${apiParams.edge2img.substring(0, 50)}...\n`;
              if (apiParams.edgeSth !== undefined) caption += `*Kekuatan Edge*: ${apiParams.edgeSth}\n`;
              if (apiParams.depth2img !== undefined) caption += `*Depth-to-Image*: ${apiParams.depth2img.substring(0, 50)}...\n`;
              if (apiParams.depthSth !== undefined) caption += `*Kekuatan Depth*: ${apiParams.depthSth}\n`;
              if (apiParams.pose2img !== undefined) caption += `*Pose-to-Image*: ${apiParams.pose2img.substring(0, 50)}...\n`;
              if (apiParams.poseSth !== undefined) caption += `*Kekuatan Pose*: ${apiParams.poseSth}\n`;
              if (apiParams.ref2img !== undefined) caption += `*Referensi Gambar*: ${apiParams.ref2img.substring(0, 50)}...\n`;
              if (apiParams.refSth !== undefined) caption += `*Kekuatan Referensi*: ${apiParams.refSth}\n`;
              if (apiParams.face2img !== undefined) caption += `*Face Swap*: ${apiParams.face2img.substring(0, 50)}...\n`;
              if (apiParams.faceSth !== undefined) caption += `*Kekuatan Face Swap*: ${apiParams.faceSth}\n`;
              if (apiParams.imgNum !== undefined) caption += `*Jumlah Gambar*: ${apiParams.imgNum}\n`;
              if (apiParams.seed !== undefined && apiParams.seed !== -1) caption += `*Seed*: ${apiParams.seed}\n`;
              if (apiParams.isPublic !== undefined) caption += `*Publik*: ${apiParams.isPublic === 1 ? "Ya" : "Tidak"}\n`;
              if (apiParams.fixFace !== undefined) caption += `*Perbaikan Wajah*: ${apiParams.fixFace === 1 ? "Ya" : "Tidak"}\n`;
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
      console.error("Error in artiz command:", e);
      m.react("❌");
      let errorMessage = e.response?.data ? `API Error: ${JSON.stringify(e.response.data)}` : e.message || e;
      return m.reply(Func.texted("bold", `Terjadi kesalahan saat menggunakan Artiz AI: ${errorMessage}`));
    }
  },
  limit: 2
};