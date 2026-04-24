import axios from 'axios';

export async function sendWhatsApp(message) {
  const instanceId = process.env.GREEN_INSTANCE_ID;
  const apiToken = process.env.GREEN_API_TOKEN;
  const phone = process.env.WHATSAPP_NUMBER; // format: 918853384154 (country code + number, no +)

  if (!instanceId || !apiToken || !phone) {
    throw new Error('GREEN_INSTANCE_ID, GREEN_API_TOKEN, or WHATSAPP_NUMBER not set in .env');
  }

  const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`;

  const payload = {
    chatId: `${phone}@c.us`,
    message: message
  };

  const res = await axios.post(url, payload);

  if (res.data?.idMessage) {
    console.log(`✅ WhatsApp sent — Message ID: ${res.data.idMessage}`);
    return true;
  } else {
    throw new Error(`WhatsApp send failed: ${JSON.stringify(res.data)}`);
  }
}
