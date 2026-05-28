const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GGPIX_API_KEY;
const externalId = "paydoc_test";

function getUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "X-API-Key": API_KEY || ""
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  console.log("GGPIX_API_KEY:", API_KEY ? `${API_KEY.substring(0, 10)}...` : "Não encontrada");
  if (!API_KEY) return;

  // URL 1: https://ggpixapi.com/api/v1/pix/in/${externalId}
  try {
    const url = `https://ggpixapi.com/api/v1/pix/in/${externalId}`;
    console.log("Tentando URL 1:", url);
    const res = await getUrl(url);
    console.log("Status URL 1:", res.status);
    console.log("Resposta URL 1:", res.body.substring(0, 500));
  } catch (err) {
    console.error("Erro URL 1:", err.message);
  }

  // URL 2: https://ggpixapi.com/api/v1/pix/in?externalId=${externalId}
  try {
    const url = `https://ggpixapi.com/api/v1/pix/in?externalId=${externalId}`;
    console.log("\nTentando URL 2:", url);
    const res = await getUrl(url);
    console.log("Status URL 2:", res.status);
    console.log("Resposta URL 2:", res.body.substring(0, 500));
  } catch (err) {
    console.error("Erro URL 2:", err.message);
  }
}

run();
