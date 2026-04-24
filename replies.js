import axios from 'axios';
import fs from 'fs';
import { fetchNews, fetchHackerNews } from './data.js';
import { generateDeepDive } from './gemini.js';
import { sendWhatsApp } from './whatsapp.js';

const instanceId = process.env.GREEN_INSTANCE_ID;
const apiToken   = process.env.GREEN_API_TOKEN;
const myNumber   = process.env.WHATSAPP_NUMBER;

let lastProcessedId = null;
let lastBriefTopic  = null;
let skipNextBrief   = false;

export function setLastBriefTopic(topic) {
  lastBriefTopic = topic;
}

export function shouldSkip() {
  if (skipNextBrief) {
    skipNextBrief = false;
    return true;
  }
  return false;
}

async function getNotification() {
  try {
    const url = `https://api.green-api.com/waInstance${instanceId}/receiveNotification/${apiToken}`;
    const res = await axios.get(url, { timeout: 8000 });
    return res.data;
  } catch {
    return null;
  }
}

async function deleteNotification(receiptId) {
  try {
    const url = `https://api.green-api.com/waInstance${instanceId}/deleteNotification/${apiToken}/${receiptId}`;
    await axios.delete(url);
  } catch {}
}

async function handleCommand(raw) {
  // Normalize — handles Help, HELP, HeLp, "more ", " skip " etc.
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  console.log(`📩 Command received: "${cmd}"`);

  // MORE
  if (['more', 'deep dive', 'deepdive', 'details', 'more info', 'elaborate'].includes(cmd)) {
    await sendWhatsApp('⏳ Fetching deep dive, 10 seconds...');
    try {
      const [news, hackerNews] = await Promise.all([fetchNews(), fetchHackerNews()]);
      const deepDive = await generateDeepDive({ news, hackerNews, topic: lastBriefTopic });
      await sendWhatsApp(deepDive);
    } catch (err) {
      await sendWhatsApp('❌ Deep dive failed. Try again in a minute.');
      console.error('Deep dive error:', err.message);
    }
    return;
  }

  // SKIP
  if (cmd === 'skip') {
    skipNextBrief = true;
    await sendWhatsApp('✅ Next brief skipped. See you at the one after!');
    return;
  }

  // STREAK
  if (cmd === 'streak') {
    let count = 0;
    try {
      if (fs.existsSync('./streak.json')) {
        count = JSON.parse(fs.readFileSync('./streak.json', 'utf8')).count || 0;
      }
    } catch {}
    const { getStreakMessage } = await import('./streak.js');
    await sendWhatsApp(`📊 *Your AgentMe Streak*\n\n${getStreakMessage(count)}\n\nChalte raho Adarsh 💪`);
    return;
  }

  // HELP
  if (['help', 'commands', 'menu', '?', 'h'].includes(cmd)) {
    await sendWhatsApp(
      `🤖 *AgentMe Commands*\n\n` +
      `*more* — Deep dive on today's top story\n` +
      `*skip* — Skip the next brief\n` +
      `*streak* — Check your streak\n` +
      `*help* — Show this menu\n\n` +
      `_Works in any case: help, HELP, Help ✓_`
    );
    return;
  }

  // Unrecognized — silently ignore, no spam
  console.log(`📩 Unrecognized: "${raw}" — ignored`);
}

export function startReplyListener() {
  console.log('👂 Reply listener active — polling every 15s');

  setInterval(async () => {
    const notification = await getNotification();
    if (!notification) return;

    const receiptId = notification.receiptId;
    const body      = notification.body;
    console.log('Webhook type:', body?.typeWebhook, '| Chat:', body?.senderData?.chatId);

    const isIncoming = body?.typeWebhook === 'incomingMessageReceived';
    const isFromMe   = body?.senderData?.chatId === `${myNumber}@c.us`;
    const isNew      = receiptId !== lastProcessedId;

    if (isNew && body?.messageData?.textMessageData?.textMessage) {
      lastProcessedId = receiptId;
      const text = body?.messageData?.textMessageData?.textMessage;
      if (text) await handleCommand(text);
    }

    // Always delete from queue
    if (receiptId) await deleteNotification(receiptId);

  }, 15000);
}
