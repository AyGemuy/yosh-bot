const axios = require("axios");
module.exports = {
  help: ["get", "fetch"],
  tags: ["downloader", "tools"],
  command: /^(get|fetch)$/i,
  run: async (m, {
    conn,
    quoted
  }) => {
    const URL_REGEX = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9.]+\.[^\s]{2,}|https?:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d+)?(?:(?:\/[a-zA-Z0-9\/._-]+)?(?:\?[a-zA-Z0-9=&_.-]+)?(?:\#[a-zA-Z0-9_-]+)?)?|localhost(?::\d+)?(?:(?:\/[a-zA-Z0-9\/._-]+)?(?:\?[a-zA-Z0-9=&_.-]+)?(?:\#[a-zA-Z0-9_-]+)?)?)(?:\/\S*)?$/i;
    const tryParseJSON = str => {
      let cleanedStr = str.trim();
      try {
        const parsedStrict = JSON.parse(cleanedStr);
        if (typeof parsedStrict === "object" && parsedStrict !== null) {
          return parsedStrict;
        }
      } catch (e) {
        try {
          let formattedStr = cleanedStr.replace(/(?<!\\)'/g, '"');
          formattedStr = formattedStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          formattedStr = formattedStr.replace(/:(\s*)(true|false|null)(\s*[,\]\}])/g, ":$1$2$3");
          formattedStr = formattedStr.replace(/:(\s*)([0-9.-]+)(\s*[,\]\}])/g, ":$1$2$3");
          const parsedLoose = JSON.parse(formattedStr);
          if (typeof parsedLoose === "object" && parsedLoose !== null) {
            return parsedLoose;
          }
        } catch (e2) {
          return str;
        }
      }
      return str;
    };
    const formatSize = bytes => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    let fullCommandText = "";
    if (quoted && quoted.text) {
      fullCommandText = quoted.text.trim();
    } else if (m.body) {
      const commandPrefix = m.command;
      const bodyLower = m.body.toLowerCase();
      const prefixIndex = bodyLower.toLowerCase().indexOf(commandPrefix.toLowerCase());
      if (prefixIndex === 0) {
        fullCommandText = m.body.substring(commandPrefix.length).trim();
      } else {
        fullCommandText = m.body.trim();
      }
    }
    const axiosConfig = {
      method: "get",
      url: null,
      responseType: "arraybuffer",
      validateStatus: function(status) {
        return true;
      },
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        DNT: "1",
        "Upgrade-Insecure-Requests": "1"
      },
      params: {},
      data: null
    };
    let tokens = fullCommandText.split(/\s+/).filter(Boolean);
    let urlFound = false;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (URL_REGEX.test(token) && !urlFound) {
        axiosConfig.url = token;
        urlFound = true;
        tokens.splice(i, 1);
        i--;
      } else if (token.startsWith("--")) {
        const flag = token.substring(2).toLowerCase();
        if (["get", "post", "put", "delete", "patch", "head"].includes(flag)) {
          axiosConfig.method = flag;
          tokens.splice(i, 1);
          i--;
        }
      }
    }
    let processingFlag = null;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.startsWith("--")) {
        processingFlag = token.substring(2).toLowerCase();
        continue;
      }
      if (token.startsWith("{") || token.startsWith("[")) {
        let jsonString = token;
        let jsonEndFound = false;
        let bracketCount = (token.match(/{/g) || []).length - (token.match(/}/g) || []).length;
        bracketCount += (token.match(/\[/g) || []).length - (token.match(/\]/g) || []).length;
        for (let j = i + 1; j < tokens.length; j++) {
          jsonString += " " + tokens[j];
          bracketCount += (tokens[j].match(/{/g) || []).length - (tokens[j].match(/}/g) || []).length;
          bracketCount += (tokens[j].match(/\[/g) || []).length - (tokens[j].match(/\]/g) || []).length;
          if (bracketCount === 0 && (tokens[j].includes("}") || tokens[j].includes("]"))) {
            jsonEndFound = true;
            i = j;
            break;
          }
        }
        if (jsonEndFound) {
          const parsedValue = tryParseJSON(jsonString);
          if (processingFlag) {
            if (["post", "put", "patch", "delete", "data"].includes(processingFlag)) {
              axiosConfig.data = typeof parsedValue === "object" && parsedValue !== null ? parsedValue : String(parsedValue);
              if (typeof axiosConfig.data === "object") {
                axiosConfig.headers["Content-Type"] = "application/json";
              }
            } else if (["get", "params"].includes(processingFlag)) {
              if (typeof parsedValue === "object" && parsedValue !== null) {
                axiosConfig.params = {
                  ...axiosConfig.params,
                  ...parsedValue
                };
              } else {
                conn.reply(m.chat, "*Format parameter tidak valid untuk --" + processingFlag + ". Diharapkan format JSON.*", m);
                return;
              }
            } else if (["head", "headers", "h"].includes(processingFlag)) {
              if (typeof parsedValue === "object" && parsedValue !== null) {
                axiosConfig.headers = {
                  ...axiosConfig.headers,
                  ...parsedValue
                };
              } else {
                conn.reply(m.chat, "*Format header tidak valid untuk --" + processingFlag + ". Diharapkan format JSON.*", m);
                return;
              }
            } else if (processingFlag === "method") {
              axiosConfig.method = String(parsedValue).toLowerCase();
            }
            processingFlag = null;
          } else {
            if (["post", "put", "patch", "delete"].includes(axiosConfig.method)) {
              axiosConfig.data = typeof parsedValue === "object" && parsedValue !== null ? parsedValue : String(parsedValue);
              if (typeof axiosConfig.data === "object") {
                axiosConfig.headers["Content-Type"] = "application/json";
              }
            } else {
              axiosConfig.params = {
                ...axiosConfig.params,
                ...typeof parsedValue === "object" && parsedValue !== null ? parsedValue : {}
              };
            }
          }
          continue;
        }
      }
    }
    if (!axiosConfig.url || !URL_REGEX.test(axiosConfig.url)) {
      m.react("ℹ️");
      const commandUsage = m.prefix + m.command;
      return conn.reply(m.chat, "*Penggunaan:*\n" + "- " + commandUsage + " <URL>\n" + "- " + commandUsage + " <URL> --get {key: 'value'}\n" + "- " + commandUsage + " <URL> --post {prompt: 'hi'}\n" + "- " + commandUsage + " <URL> --head {Auth: 'token'}\n" + "- " + commandUsage + " <URL> --get {param: 'value'} --head {Accept: '*/*'}\n" + "- " + commandUsage + " <URL> --post {data: 'value'} --head {Content-Type: 'application/json'}\n\n" + "*Contoh:*\n" + "- " + commandUsage + " [https://example.com/file.pdf](https://example.com/file.pdf)\n" + "- " + commandUsage + " [https://api.example.com/users](https://api.example.com/users) --get {id: 123, limit: 10}\n" + "- " + commandUsage + " [https://api.example.com/users](https://api.example.com/users) --post {name: 'Alice', age: 30}\n" + "- " + commandUsage + " [https://api.example.com/data](https://api.example.com/data) --head {Authorization: 'Bearer token'}\n" + "- " + commandUsage + " [https://api.example.com/search](https://api.example.com/search) --get {query: 'hello'} --head {User-Agent: 'MyBot'}", m);
    }
    axiosConfig.url = /^https?:\/\//i.test(axiosConfig.url) ? axiosConfig.url : "http://" + axiosConfig.url;
    if (axiosConfig.method === "get" && axiosConfig.data !== null && Object.keys(axiosConfig.params).length === 0) {
      axiosConfig.params = axiosConfig.data;
      axiosConfig.data = null;
    } else if (axiosConfig.method === "get" && axiosConfig.data !== null) {
      axiosConfig.data = null;
    }
    m.react("⏱️");
    try {
      const response = await axios(axiosConfig);
      const contentLength = response.headers["content-length"];
      const statusCode = response.status;
      const statusText = response.statusText;
      if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
        m.react("❌");
        return conn.reply(m.chat, `🚨 *ERROR: Konten terlalu besar!* (${formatSize(parseInt(contentLength))}). Batas maksimum adalah 100 MB.`, m);
      }
      const contentType = response.headers["content-type"] || "application/octet-stream";
      let filename = "downloaded_file";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8''|)([^\s;]+)['"]?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/^utf-8''/i, ""));
        }
      }
      if (filename === "downloaded_file") {
        try {
          const parsedUrl = new URL(axiosConfig.url);
          const urlParts = parsedUrl.pathname.split("/");
          let baseFilename = urlParts[urlParts.length - 1];
          filename = baseFilename.split("?")[0];
          if (!filename) filename = "index";
        } catch (e) {
          filename = "downloaded_file";
        }
      }
      if (!filename.includes(".") && contentType.includes("/")) {
        const extensionMap = {
          "image/jpeg": ".jpg",
          "image/png": ".png",
          "image/gif": ".gif",
          "image/webp": ".webp",
          "application/pdf": ".pdf",
          "audio/mpeg": ".mp3",
          "video/mp4": ".mp4",
          "text/plain": ".txt",
          "application/json": ".json",
          "text/html": ".html",
          "application/zip": ".zip",
          "application/x-rar-compressed": ".rar",
          "application/octet-stream": ".bin"
        };
        const inferredExtension = extensionMap[contentType.split(";")[0]];
        if (inferredExtension) {
          filename += inferredExtension;
        } else {
          filename += ".dat";
        }
      }
      const buffer = Buffer.from(response.data);
      if (/^image\//.test(contentType) || /^audio\//.test(contentType) || /^video\//.test(contentType) || /^application\/(pdf|zip|x-rar-compressed)/.test(contentType)) {
        conn.sendFile(m.chat, buffer, filename, "", m);
      } else if (/^text\//.test(contentType) || /^application\/json/.test(contentType) || /^text\/html/.test(contentType)) {
        let contentText;
        try {
          contentText = buffer.toString("utf8");
          if (/^application\/json/.test(contentType)) {
            const jsonContent = JSON.parse(contentText);
            contentText = "```json\n" + JSON.stringify(jsonContent, null, 2) + "\n```";
          } else if (/^text\/html/.test(contentType) && contentText.length > 2e3) {
            contentText = contentText.substring(0, 2e3) + "\n...\n[Konten HTML terlalu panjang, dipotong]";
          } else if (contentText.length > 2e3) {
            contentText = contentText.substring(0, 2e3) + "\n...\n[Konten teks terlalu panjang, dipotong]";
          }
        } catch (e) {
          contentText = "[Konten tidak dapat ditampilkan sebagai teks atau diparse]\nError parsing: " + e.message.slice(0, 200);
        }
        conn.reply(m.chat, String(contentText), m);
      } else {
        conn.sendFile(m.chat, buffer, filename, "", m);
      }
      m.react("✅");
      return;
    } catch (error) {
      m.react("❌");
      let displayError = "Terjadi kesalahan saat melakukan permintaan.";
      if (error.response) {
        displayError = `Permintaan gagal dengan status *${error.response.status}* (${error.response.statusText || "Unknown Status"}).`;
        if (error.response.data) {
          try {
            const errorData = Buffer.from(error.response.data).toString("utf8");
            const parsedError = tryParseJSON(errorData);
            if (typeof parsedError === "object" && parsedError !== null) {
              displayError += "\nDetail: ```json\n" + JSON.stringify(parsedError, null, 2).slice(0, 500) + "\n```";
            } else {
              displayError += "\nDetail: " + errorData.slice(0, 500);
            }
          } catch (e) {
            displayError += "\nDetail: " + Buffer.from(error.response.data).toString("utf8").slice(0, 500);
          }
        }
      } else if (error.request) {
        displayError = "Tidak ada respons diterima dari server. Pastikan URL benar atau server sedang aktif.";
      } else {
        displayError = "Error: " + (error.message || "Terjadi kesalahan tidak terduga.") + ".";
      }
      return conn.reply(m.chat, "❌ *ERROR GET/FETCH:*\n\n" + displayError, m);
    }
  },
  limit: 1
};