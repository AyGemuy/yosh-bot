const axios = require("axios");
module.exports = {
  help: ["deepseek"],
  tags: ["ai"],
  command: /^(deepseek)$/i,
  run: async (m, {
    Func,
    API,
    conn,
    quoted
  }) => {
    if (!quoted || !quoted.text) {
      m.react("ℹ️");
      return m.reply(Func.texted("bold", `Usage: Reply to a text message with .deepseek to use Deepseek AI.`));
    }
    const queryText = quoted.text;
    m.react("⏱️");
    try {
      const apiUrl = API("wudysoft", "/api/ai/deepseek/v2");
      const response = await axios.post(apiUrl, {
        prompt: queryText
      });
      if (response && response.data && response.data.result) {
        m.react("✅");
        return m.reply(Func.texted("bold", response.data.result));
      } else {
        m.react("❌");
        return m.reply(Func.texted("bold", "No result received from Deepseek AI."));
      }
    } catch (error) {
      console.error(error);
      m.react("❌");
      let errorMessage = error.response?.data ? Func.texted("monospace", JSON.stringify(error.response.data, null, 2)) : Func.texted("monospace", error.message || error);
      return m.reply(Func.texted("bold", `An error occurred:\n\n${errorMessage}`));
    }
  },
  limit: 1
};