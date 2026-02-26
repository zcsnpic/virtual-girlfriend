const https = require('https');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        callVolcengineTTS(data.text, data.voice)
          .then(audioData => {
            res.status(200).json({ success: true, data: audioData });
          })
          .catch(error => {
            res.status(500).json({ success: false, error: error.message });
          });
      } catch (error) {
        res.status(400).json({ success: false, error: 'Invalid request body' });
      }
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

function callVolcengineTTS(text, voice) {
  return new Promise((resolve, reject) => {
    const endpoint = 'https://openspeech.bytedance.com/api/v1/tts';
    const data = JSON.stringify({
      app: {
        appid: process.env.VOLCENGINE_APP_ID,
        token: process.env.VOLCENGINE_ACCESS_KEY,
        cluster: 'volcano_tts'
      },
      user: {
        uid: 'user_' + Date.now()
      },
      audio: {
        voice_type: voice || 'BV700_streaming',
        encoding: 'mp3',
        rate: 24000,
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0
      },
      request: {
        reqid: generateUUID(),
        text: text,
        text_type: 'plain',
        operation: 'query'
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer;${process.env.VOLCENGINE_ACCESS_KEY}`
      }
    };

    const req = https.request(endpoint, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          if (jsonData.code === 3000) {
            resolve(jsonData.data);
          } else {
            reject(new Error(`Volcengine error: ${jsonData.message}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
