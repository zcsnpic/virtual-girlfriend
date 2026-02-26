export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const audioData = await callVolcengineTTS(data.text, data.voice);
      return new Response(JSON.stringify({ success: true, data: audioData }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  } else {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}

async function callVolcengineTTS(text, voice) {
  const endpoint = 'https://openspeech.bytedance.com/api/v1/tts';
  const data = {
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
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer;${process.env.VOLCENGINE_ACCESS_KEY}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const jsonData = await response.json();
  if (jsonData.code === 3000) {
    return jsonData.data;
  } else {
    throw new Error(`Volcengine error: ${jsonData.message}`);
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
