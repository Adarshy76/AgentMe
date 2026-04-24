import 'dotenv/config';
import fs from 'fs';
import { fetchNews, fetchGithubTrending, fetchHackerNews, fetchMarketData } from './data.js';
import { generateBrief, generateWeeklyReport } from './gemini.js';
import { sendWhatsApp } from './whatsapp.js';
import { updateStreak, getStreakMessage } from './streak.js';

// Which test to run — change as needed
// Options: 'morning' | 'afternoon' | 'evening' | 'weekly'
const TEST_TYPE = process.argv[2] || 'morning';

const slotMap = { morning: '9am', afternoon: '3pm', evening: '9pm' };

console.log(`\n🧪 Testing AgentMe v2 — ${TEST_TYPE} brief\n`);

try {
  const [news, github, hackerNews, market] = await Promise.all([
    fetchNews(),
    fetchGithubTrending(),
    fetchHackerNews(),
    fetchMarketData()
  ]);

  console.log('✅ Data fetched');

  let message;

  if (TEST_TYPE === 'weekly') {
    let streakCount = 0;
    try {
      if (fs.existsSync('./streak.json')) {
        streakCount = JSON.parse(fs.readFileSync('./streak.json', 'utf8')).count || 0;
      }
    } catch {}
    message = await generateWeeklyReport({ news, github, hackerNews, market, streakCount });
  } else {
    const slot = slotMap[TEST_TYPE] || '9am';
    message = await generateBrief({ news, github, hackerNews, market, slot });

    // Inject streak
    const streakCount = updateStreak();
    const streakMsg = getStreakMessage(streakCount);
    message = message.replace('[STREAK_PLACEHOLDER]', streakMsg);
  }

  console.log('\n📝 Generated Message:\n');
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));

  console.log('\n📱 Sending to WhatsApp...');
  await sendWhatsApp(message);
  console.log('\n✅ Done! Check your WhatsApp.\n');
  console.log('Other test commands:');
  console.log('  node test.js morning');
  console.log('  node test.js afternoon');
  console.log('  node test.js evening');
  console.log('  node test.js weekly\n');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
