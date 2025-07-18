const config = require("@system/config");
const axios = require("axios");
const {
  fromBuffer
} = require("file-type");
class Provider {
  constructor() {
    if (this.constructor === Provider) {
      throw new Error("Abstract class cannot be instantiated");
    }
  }
  form(...args) {
    const form = new FormData();
    if (args) {
      form.append(...args);
    }
    return form;
  }
}
class QuaxProvider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("files[]", blob, `file.${ext}`);
    const {
      data
    } = await axios.post("https://qu.ax/upload.php", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data.files[0].url;
  }
}
class FreeImageProvider extends Provider {
  async upload(buffer) {
    const {
      data: html
    } = await axios.get("https://freeimage.host/").catch(() => null);
    const token = html.match(/PF.obj.config.auth_token = "(.+?)";/)[1];
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("source", blob, `file.${ext}`);
    const options = {
      type: "file",
      action: "upload",
      timestamp: (Date.now() / 1e3).toString(),
      auth_token: token,
      nsfw: "0"
    };
    for (const [key, value] of Object.entries(options)) {
      form.append(key, value);
    }
    const {
      data
    } = await axios.post("https://freeimage.host/json", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data.image.url;
  }
}
class TmpFilesProvider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("file", blob, `file.${ext}`);
    const {
      data
    } = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    const match = /https?:\/\/tmpfiles.org\/(.*)/.exec(data.data.url);
    return `https://tmpfiles.org/dl/${match[1]}`;
  }
}
class NetorareProvider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("file", blob, `file.${ext}`);
    const {
      data
    } = await axios.post("https://scdn.pdi.moe/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return "https://scdn.pdi.moe" + data.result.downloadUrl;
  }
}
class Pomf2Provider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("files[]", blob, `file.${ext}`);
    const {
      data
    } = await axios.post("https://pomf2.lain.la/upload.php", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data.files[0].url;
  }
}
class UguuProvider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("files[]", blob, `file.${ext}`);
    const {
      data
    } = await axios.post("https://uguu.se/upload.php", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data.files[0].url;
  }
}
class CatboxProvider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("userhash", "b4429b5b2683032c0a0617ccd");
    form.append("fileToUpload", blob, `upload.${ext}`);
    const {
      data
    } = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: {
        ...form.getHeaders ? form.getHeaders() : {},
        "Content-Type": "multipart/form-data"
      }
    });
    return data;
  }
}
class ImgBBProvider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = new FormData();
    form.append("image", blob, `file_${Date.now()}.${ext}`);
    const {
      data
    } = await axios.post(`https://api.imgbb.com/1/upload?expiration=604800&key=${config.IBB_KEY}`, form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data.data.url;
  }
}
class PasteboardProvider extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("file", blob, `image.${ext}`);
    form.set("cb", "-9");
    const {
      data
    } = await axios.post("https://pasteboard.co/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    if (!data.url) {
      throw new Error(data);
    }
    return "https://pasteboard.co/" + data.fileName;
  }
}
class Pixhost extends Provider {
  async upload(buffer) {
    const {
      mime,
      ext
    } = await fromBuffer(buffer);
    const blob = new Blob([buffer], {
      type: mime
    });
    const form = this.form("img", blob, `image.${ext}`);
    form.set("content_type", "0");
    const {
      data
    } = await axios.post("https://api.pixhost.to/images", form, {
      headers: {
        "Content-Type": "multipart/form-data; charset=utf-8",
        Accept: "application/json"
      }
    });
    const {
      data: html
    } = await axios.get(data.show_url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const regex = html.match(/id="image"[^>]*class="image-img"[^>]*src="([^"]*)"/);
    if (!regex || !regex[1]) {
      throw new Error("Failed.");
    }
    return regex[1];
  }
}
class Uploader {
  constructor() {
    this.providers = {
      quax: new QuaxProvider(),
      freeimage: new FreeImageProvider(),
      tmpfiles: new TmpFilesProvider(),
      netorare: new NetorareProvider(),
      pomf2: new Pomf2Provider(),
      uguu: new UguuProvider(),
      catbox: new CatboxProvider(),
      imgBB: new ImgBBProvider(),
      pasteBoard: new PasteboardProvider(),
      pixHost: new Pixhost()
    };
  }
  isBuffer(buffer) {
    return Buffer.isBuffer(buffer);
  }
  async upload(buffer, provider) {
    if (!this.providers[provider]) {
      throw new Error("Uploader not found");
    }
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Buffer is not a buffer");
    }
    try {
      const url = await this.providers[provider].upload(buffer);
      return url;
    } catch (error) {
      throw new Error(error);
    }
  }
}
const uploader = new Uploader();
module.exports = uploader;
const {
  quax,
  freeimage,
  tmpfiles,
  netorare,
  pomf2,
  uguu,
  catbox,
  imgBB,
  pasteBoard,
  pixHost
} = uploader.providers;