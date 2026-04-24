import fs from 'fs';
import path from 'path';

const STREAK_FILE = './streak.json';

function loadStreak() {
  try {
    if (fs.existsSync(STREAK_FILE)) {
      return JSON.parse(fs.readFileSync(STREAK_FILE, 'utf8'));
    }
  } catch {}
  return { count: 0, lastDate: null };
}

function saveStreak(data) {
  fs.writeFileSync(STREAK_FILE, JSON.stringify(data, null, 2));
}

export function updateStreak() {
  const data = loadStreak();
  const todayIST = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (data.lastDate === todayIST) {
    // Already updated today — just return current streak
    return data.count;
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayIST = yesterdayDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (data.lastDate === yesterdayIST) {
    // Consecutive day — increment
    data.count += 1;
  } else {
    // Streak broken — reset
    data.count = 1;
  }

  data.lastDate = todayIST;
  saveStreak(data);
  return data.count;
}

export function getStreakMessage(count) {
  if (count === 1) return `🌱 Day 1 — every legend starts somewhere.`;
  if (count < 4)  return `🔥 Day ${count} streak — momentum building.`;
  if (count < 7)  return `⚡ Day ${count} streak — you're in the zone.`;
  if (count === 7) return `🏆 Day 7 — one full week. Adarsh, that's real.`;
  if (count < 14) return `🚀 Day ${count} streak — this is becoming identity.`;
  if (count === 14) return `💎 Day 14 — two weeks straight. Rare.`;
  if (count < 30) return `🔥 Day ${count} — don't stop now.`;
  if (count === 30) return `👑 Day 30 STREAK. Adarsh, you just built a habit.`;
  return `🌟 Day ${count} — unstoppable.`;
}
