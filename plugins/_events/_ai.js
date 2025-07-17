const axios = require("axios");
module.exports = {
  async before(m, {
    Func,
    API,
    conn
  }) {
    const botIdNumeric = parseInt(conn.user.id.split("@")[0]);
    if (m.mentions && Array.isArray(m.mentions) && m.mentions.some(mention => parseInt(mention) === botIdNumeric)) {
      const quoted = m.quoted ? m.quoted : m;
      if (!quoted || !quoted.text) {
        m.react("ℹ️");
        const senderNumber = m.sender.split("@")[0];
        return m.reply(Func.texted("bold", `Usage: Mention me (@${senderNumber}) and reply to a text message to use AI. Add --meta, --brave, or --copilot at the end to specify the AI model.`));
      }
      const queryText = quoted.text;
      let aiModel = "brave";
      let cleanedQueryText = queryText;
      const models = ["--meta", "--brave", "--copilot"];
      for (const model of models) {
        if (queryText.endsWith(model)) {
          aiModel = model.substring(2);
          cleanedQueryText = queryText.substring(0, queryText.lastIndexOf(model)).trim();
          break;
        }
      }
      if (!cleanedQueryText) {
        m.react("ℹ️");
        return m.reply(Func.texted("bold", `Please provide a query for the AI. Example: @bot What is the capital of France? --meta`));
      }
      m.react("⏱️");
      try {
        let apiUrl;
        switch (aiModel) {
          case "meta":
            apiUrl = API("wudysoft", "/api/ai/meta");
            break;
          case "brave":
            apiUrl = API("wudysoft", "/api/ai/brave");
            break;
          case "copilot":
            apiUrl = API("wudysoft", "/api/ai/copilot");
            break;
          default:
            apiUrl = API("wudysoft", "/api/ai/brave");
        }
        const response = await axios.post(apiUrl, {
          prompt: cleanedQueryText
        });
        if (response && response.data && response.data.result) {
          m.react("✅");
          return m.reply(response.data.result);
        } else {
          m.react("❌");
          return m.reply(`No result received from the AI. Please try again.`);
        }
      } catch (error) {
        m.react("❌");
        let errorMessageForUser = "An unexpected error occurred. Please try again later.";
        if (error.response) {
          errorMessageForUser = `AI API Error (Status: ${error.response.status}): ${error.response.data?.message || JSON.stringify(error.response.data)}`;
        } else if (error.request) {
          errorMessageForUser = `No response received from the AI API. Check your internet connection or API availability.`;
        } else {
          errorMessageForUser = `Error in request setup: ${error.message}`;
        }
        return m.reply(`An error occurred:\n\n${errorMessageForUser}`);
      }
    }
  }
};