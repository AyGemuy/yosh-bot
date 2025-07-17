module.exports = {
  help: ["nulis"],
  tags: ["maker"],
  command: ["nulis"],
  run: async (m, {
    Func,
    quoted,
    conn,
    API,
    args
  }) => {
    try {
      const MAX_CHAR_PER_PAGE = 2500;
      let fullInputText = m.text.replace(new RegExp(`^${m.prefix + m.command}\\s*`, "i"), "").trim();
      if (!fullInputText && quoted && quoted.text) {
        fullInputText = quoted.text.trim();
      }
      if (!fullInputText) {
        m.react("ℹ️");
        return m.reply(`
╭─[ ✍️ PANDUAN NULIS ✍️ ]
│
│ *Fitur*: Mengubah teks menjadi tulisan tangan virtual.
│
│ *Penggunaan:*
│ ├ Reply teks: *${m.prefix + m.command}*
│ └ Atau: *${m.prefix + m.command} [teks_anda] [opsi]*
│
│ *Opsi Kertas (opsional):*
│ ├ *-ori*: Kertas original (default)
│ └ *-folio*: Kertas folio
│
│ *Contoh:*
│ ├ *${m.prefix + m.command} Halo dunia ini keren!*
│ └ *${m.prefix + m.command} Ini adalah teks panjang -folio*
│
╰─[ 📝 HASIL ESTETIK 📝 ]
`.trim());
      }
      m.react("⏱️");
      let textToNulis = fullInputText;
      let isFolio = false;
      if (textToNulis.toLowerCase().endsWith("-folio")) {
        isFolio = true;
        textToNulis = textToNulis.replace(/-folio$/i, "").trim();
      } else if (textToNulis.toLowerCase().endsWith("-ori")) {
        isFolio = false;
        textToNulis = textToNulis.replace(/-ori$/i, "").trim();
      }
      let baseModel = isFolio ? 4 : 2;
      let color = "black";
      const pages = [];
      let currentPage = "";
      const words = textToNulis.split(/\s+/);
      for (const word of words) {
        if ((currentPage + (currentPage === "" ? "" : " ") + word).length <= MAX_CHAR_PER_PAGE || currentPage === "" && word.length > MAX_CHAR_PER_PAGE) {
          currentPage += (currentPage === "" ? "" : " ") + word;
        } else {
          if (currentPage === "" && word.length > MAX_CHAR_PER_PAGE) {
            let remainingWord = word;
            while (remainingWord.length > MAX_CHAR_PER_PAGE) {
              pages.push(remainingWord.substring(0, MAX_CHAR_PER_PAGE));
              remainingWord = remainingWord.substring(MAX_CHAR_PER_PAGE);
            }
            currentPage = remainingWord;
          } else {
            pages.push(currentPage);
            currentPage = word;
          }
        }
      }
      if (currentPage !== "") {
        pages.push(currentPage);
      }
      for (let i = 0; i < pages.length; i++) {
        const pageText = pages[i];
        const date = Func.toDate(new Date());
        const model = baseModel + i % 2;
        const nulisApiUrl = API("wudysoft", "/api/maker/nulis/v2", {
          text: pageText,
          date: date,
          model: model,
          color: color
        });
        const imageBuffer = await Func.fetchBuffer(nulisApiUrl);
        if (!imageBuffer) {
          m.react("❌");
          return m.reply(Func.texted("bold", `Gagal membuat halaman ${i + 1} dari tulisan tangan. Coba lagi.`));
        }
        await conn.sendFile(m.chat, imageBuffer, `nulis_page_${i + 1}.jpg`, `*Halaman ${i + 1}/${pages.length}*`, m);
      }
      m.react("✅");
    } catch (e) {
      console.error("Error in nulis command:", e);
      m.react("❌");
      return m.reply(Func.texted("bold", "Terjadi kesalahan saat membuat tulisan tangan. Pastikan teks valid dan tidak terlalu panjang."));
    }
  },
  limit: 2
};