# AgentMe WhatsApp Bot v2

Sends personalized AI briefs on WhatsApp at 9am, 3pm, 9pm IST.
Features: Streak counter, reply commands, weekly Sunday report.

---

## What's New in v2

- 🔥 **Streak Counter** — tracks consecutive days, shown at end of every message
- 📩 **Reply Commands** — reply to any message:
  - `more` → Deep dive on today's top story
  - `skip` → Skip the next brief
  - `streak` → Check your current streak
  - `help` → Show all commands
- 📅 **Weekly Sunday Report** — 8pm every Sunday, full week review + brutal honest reflection

---

## Setup (same as v1)

### 1. Get Gemini API Key
https://aistudio.google.com → Get API Key → free

### 2. Get Green API credentials
https://green-api.com → Free signup → copy Instance ID + API Token → scan QR

### 3. Install & configure
```bash
npm install
cp .env.example .env
# Fill in GEMINI_KEY, GREEN_INSTANCE_ID, GREEN_API_TOKEN
# WHATSAPP_NUMBER=918853384154 already set
```

### 4. Test
```bash
node test.js morning    # test 9am brief
node test.js afternoon  # test 3pm brief
node test.js evening    # test 9pm brief
node test.js weekly     # test Sunday report
```

### 5. Run
```bash
node index.js
```

---

## Deploy Free on Railway (24/7)

1. Push to GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Deploy — runs forever free

---

## Schedule
| Time | Brief |
|------|-------|
| 9:00 AM IST | Morning — what to focus on today |
| 3:00 PM IST | Afternoon — what changed, are you on track |
| 9:00 PM IST | Evening — reflect + tomorrow prep |
| Sunday 8 PM IST | Weekly — full week review |

## Cost: ₹0
