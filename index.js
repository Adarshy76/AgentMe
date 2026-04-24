import 'dotenv/config';
import cron from 'node-cron';
import fs from 'fs';
import { fetchNews, fetchGithubTrending, fetchHackerNews, fetchMarketData } from './data.js';
import { generateBrief, generateWeeklyReport } from './gemini.js';
import { sendWhatsApp } from './whatsapp.js';
import { updateStreak, getStreakMessage } from './streak.js';
import { startReplyListener, setLastBriefTopic } from './replies.js';

// ─── Core brief runner ────────────────────────────────────────────────────────
async function runBrief(slot) {
  const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  console.log(`\n🚀 Running ${slot} brief — ${istTime}`);

  try {
    console.log('📡 Fetching data...');
    const [news, github, hackerNews, market] = await Promise.all([
      fetchNews(),
      fetchGithubTrending(),
      fetchHackerNews(),
      fetchMarketData()
    ]);

    console.log('🤖 Generating brief with Gemini...');
    let brief = await generateBrief({ news, github, hackerNews, market, slot });

    // Inject streak
    const streakCount = updateStreak();
    const streakMsg = getStreakMessage(streakCount);
    brief = brief.replace('[STREAK_PLACEHOLDER]', streakMsg);

    // Store top story for deep dive
    const topStory = news?.[0]?.title || '';
    setLastBriefTopic(topStory);

    console.log('📱 Sending to WhatsApp...');
    await sendWhatsApp(brief);

    console.log(`✅ ${slot} brief delivered — Streak: Day ${streakCount}\n`);
  } catch (err) {
    console.error(`❌ Error in ${slot} brief:`, err.message);
  }
}

// ─── Weekly Sunday report ─────────────────────────────────────────────────────
async function runWeeklyReport() {
  console.log('\n📅 Running weekly Sunday report...');
  try {
    const [news, github, hackerNews, market] = await Promise.all([
      fetchNews(),
      fetchGithubTrending(),
      fetchHackerNews(),
      fetchMarketData()
    ]);

    let streakCount = 0;
    try {
      if (fs.existsSync('./streak.json')) {
        streakCount = JSON.parse(fs.readFileSync('./streak.json', 'utf8')).count || 0;
      }
    } catch {}

    const report = await generateWeeklyReport({ news, github, hackerNews, market, streakCount });
    await sendWhatsApp(report);
    console.log('✅ Weekly report sent!\n');
  } catch (err) {
    console.error('❌ Weekly report error:', err.message);
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────
console.log('');
console.log('🟢 AgentMe WhatsApp Bot v2 started');
console.log('─'.repeat(45));
console.log('📅 Daily:  9am | 3pm | 9pm IST');
console.log('📋 Weekly: Sunday 8pm IST');
console.log('👂 Replies: watching for "more", "skip", "help", "streak"');
console.log('─'.repeat(45));

// IST = UTC+5:30
// 9:00 AM IST  = 03:30 UTC
// 3:00 PM IST  = 09:30 UTC  
// 9:00 PM IST  = 15:30 UTC
// Sunday 8 PM IST = 14:30 UTC

cron.schedule('30 3  * * *', () => runBrief('9am'), { timezone: 'UTC' });
cron.schedule('30 9  * * *', () => runBrief('3pm'), { timezone: 'UTC' });
cron.schedule('30 15 * * *', () => runBrief('9pm'), { timezone: 'UTC' });
cron.schedule('30 14 * * 0', () => runWeeklyReport(), { timezone: 'UTC' });

startReplyListener();

console.log('⏳ Waiting for scheduled times...');
console.log('💡 Run "node test.js" to test immediately\n');
