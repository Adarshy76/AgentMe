import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-3-flash-preview';

function getClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_KEY);
}

async function callGemini(model, prompt) {
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (i === 2) throw err;
      console.log(`⏳ Retrying in 5s... (attempt ${i + 2}/3)`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

export async function generateBrief({ news, github, hackerNews, market, slot }) {
  const model = getClient().getGenerativeModel({ model: MODEL });

  const slotConfig = {
    '9am': {
      emoji: '🌅',
      opener: 'Good morning Adarsh! Here is what is moving today —',
      action: 'Do This Today',
      closer: 'Aaj kuch ship karo. Bas ek cheez.'
    },
    '3pm': {
      emoji: '☀️',
      opener: 'Afternoon check-in Adarsh —',
      action: 'Afternoon Focus',
      closer: 'Do ghante bache hain productive hone ke liye. Use them.'
    },
    '9pm': {
      emoji: '🌙',
      opener: 'Evening wrap Adarsh —',
      action: 'Evening Reflect',
      closer: 'Aaj ka din count kiya? Kal fresh start hai.'
    }
  };

  const s = slotConfig[slot] || slotConfig['9am'];

  const prompt = `
You are AgentMe — personal AI for Adarsh, a 21-year-old CSE student in India building an AI startup.
His interests: AI/ML, startups, YC ecosystem, investing (gold/crypto/Nifty), Indian tech scene.

TIME SLOT: ${slot}
Opening line to use: "${s.emoji} ${s.opener}"

DATA (use this to fill the sections):
News: ${JSON.stringify(news?.slice(0, 5))}
GitHub: ${JSON.stringify(github?.slice(0, 3))}
HackerNews: ${JSON.stringify(hackerNews?.slice(0, 4))}
Market: ${JSON.stringify(market)}

Write a WhatsApp message with EXACTLY these sections in this order:

${s.emoji} ${s.opener}

🔥 *Top Story*
(Most important news right now — 2 lines, why it matters to Adarsh)

🤖 *AI Pulse*
(One AI/ML development worth knowing — 2 lines)

📈 *Markets*
(Gold, BTC, Nifty — actual numbers and direction in 1-2 lines)

⚡ *${s.action}*
(One specific actionable thing for Adarsh — different each slot)

[STREAK_PLACEHOLDER]

_Reply *more* for deep dive | *skip* to skip next | *help* for commands_

Rules:
- Max 200 words total
- WhatsApp formatting: *bold* headers, emojis
- Hinglish natural where it fits
- Closing line after action: "${s.closer}"
- Output ONLY the message, nothing else
`;

  return callGemini(model, prompt);
}

export async function generateDeepDive({ news, hackerNews, topic }) {
  const model = getClient().getGenerativeModel({ model: MODEL });
  const prompt = `
You are AgentMe giving Adarsh a DEEP DIVE.
Adarsh: 21-year-old CSE student building an AI startup in India.
Topic: ${topic || 'top AI/startup story today'}

News: ${JSON.stringify(news?.slice(0, 6))}
HackerNews: ${JSON.stringify(hackerNews?.slice(0, 5))}

Write WhatsApp deep dive:

*🔍 Deep Dive*

*What happened:* (3-4 lines)
*India angle:* (why Indian startup ecosystem should care)
*Builder take:* (what Adarsh building AI product should think)
*Do this:* (one concrete action today)

Max 300 words. WhatsApp formatting. Output ONLY the message.
`;
  return callGemini(model, prompt);
}

export async function generateWeeklyReport({ news, github, hackerNews, market, streakCount }) {
  const model = getClient().getGenerativeModel({ model: MODEL });
  const prompt = `
You are AgentMe writing Adarsh's WEEKLY SUNDAY REPORT.
Adarsh: 21-year-old CSE student building AgentMe in India.
Streak: ${streakCount} days.

News: ${JSON.stringify(news?.slice(0, 8))}
GitHub: ${JSON.stringify(github?.slice(0, 4))}
HackerNews: ${JSON.stringify(hackerNews?.slice(0, 6))}
Markets: ${JSON.stringify(market)}

Write weekly WhatsApp report with EXACTLY these sections:

📅 *Week in Review*

🌍 *Biggest Story This Week*
🚀 *India Startup Pulse*
📈 *Markets This Week*
🧠 *What You Should Have Done* (brutally honest, one thing)
⚡ *Focus Next Week* (one clear priority)
🔥 *${streakCount} Day Streak* (one sharp motivating line)

Max 400 words. Talk directly TO Adarsh. Output ONLY the message.
`;
  return callGemini(model, prompt);
}
