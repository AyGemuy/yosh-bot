const axios = require("axios");
module.exports = {
  help: ["api"],
  tags: ["owner"],
  command: /^(api)$/i,
  run: async (m, {
    Func,
    API,
    conn,
    quoted
  }) => {
    if (!quoted || !quoted.text) {
      return m.reply(Func.texted("bold", `Usage:\nReply to a text message with: .api <path> [key=value ...] [--body <json>]`));
    }
    const args = quoted.text.split(/\s+/);
    let path = args[0];
    let queryParams = {};
    let body = null;
    let bodyIndex = args.findIndex(arg => arg === "--body");
    if (bodyIndex !== -1) {
      for (let i = 1; i < bodyIndex; i++) {
        const [key, value] = args[i].split("=");
        if (key && value) queryParams[key] = value;
      }
      let bodyText = args.slice(bodyIndex + 1).join(" ");
      try {
        body = JSON.parse(bodyText);
      } catch (error) {
        return m.reply(Func.texted("bold", `Invalid JSON body format: ${error.message}`));
      }
    } else {
      for (let i = 1; i < args.length; i++) {
        const [key, value] = args[i].split("=");
        if (key && value) queryParams[key] = value;
      }
    }
    m.reply(Func.texted("bold", "Processing request..."));
    try {
      const apiUrl = API("wudysoft", `/api${path}`, queryParams);
      if (!apiUrl) return m.reply(Func.texted("bold", "Failed to construct API URL."));
      let response;
      let method = "get";
      if (body) {
        method = (body.method || "post").toLowerCase();
        if (body.method) delete body.method;
        if (["get", "post", "put", "delete", "patch"].includes(method)) {
          response = await axios[method](apiUrl, body);
        } else {
          response = await axios.post(apiUrl, body);
        }
      } else {
        response = await axios.get(apiUrl);
      }
      if (response && response.data) {
        const contentType = response.headers["content-type"];
        let mediaType = "document";
        if (contentType?.startsWith("image")) {
          mediaType = "image";
        } else if (contentType?.startsWith("video")) {
          mediaType = "video";
        } else if (contentType?.startsWith("audio")) {
          mediaType = "audio";
        }
        if (mediaType !== "document" || contentType === "application/pdf") {
          return conn.sendFile(m.chat, apiUrl, `file.${mediaType.split("/")[1] || "bin"}`, "", m, false, {
            mimetype: contentType,
            fileName: `response.${mediaType.split("/")[1] || "bin"}`,
            asDocument: mediaType === "document" || contentType === "application/pdf"
          }, mediaType);
        } else if (typeof response.data === "object") {
          const jsonString = JSON.stringify(response.data, null, 2);
          return m.reply(Func.texted("monospace", jsonString));
        } else {
          return m.reply(Func.texted("bold", response.data));
        }
      } else {
        return m.reply(Func.texted("bold", "No data received from API."));
      }
    } catch (error) {
      console.error(error);
      let errorMessage = error.response?.data ? Func.texted("monospace", JSON.stringify(error.response.data, null, 2)) : Func.texted("monospace", error.message || error);
      return m.reply(Func.texted("bold", `An error occurred:\n\n${errorMessage}`));
    }
  },
  limit: 1
};