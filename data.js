import axios from 'axios';

export async function fetchNews() {
  try {
    const key = process.env.NEWS_KEY;
    if (!key) return getFallbackNews();
    const res = await axios.get(
      `https://newsapi.org/v2/everything?q=artificial+intelligence+startup+india&sortBy=publishedAt&pageSize=6&language=en&apiKey=${key}`
    );
    return res.data.articles?.map(a => ({
      title: a.title,
      source: a.source?.name,
      description: a.description
    })) || getFallbackNews();
  } catch {
    return getFallbackNews();
  }
}

export async function fetchGithubTrending() {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const dateStr = date.toISOString().split('T')[0];
    const res = await axios.get(
      `https://api.github.com/search/repositories?q=topic:machine-learning+topic:artificial-intelligence+created:>${dateStr}&sort=stars&order=desc&per_page=4`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    return res.data.items?.map(r => ({
      name: r.full_name,
      stars: r.stargazers_count,
      description: r.description,
      language: r.language
    })) || getFallbackGithub();
  } catch {
    return getFallbackGithub();
  }
}

export async function fetchHackerNews() {
  try {
    const res = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = res.data.slice(0, 8);
    const stories = await Promise.all(
      ids.map(id =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(r => r.data)
          .catch(() => null)
      )
    );
    return stories.filter(s => s?.title).map(s => ({
      title: s.title,
      score: s.score
    }));
  } catch {
    return getFallbackHN();
  }
}

export async function fetchMarketData() {
  try {
    const res = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,gold&vs_currencies=usd,inr&include_24hr_change=true'
    );
    const d = res.data;
    return {
      btc: {
        usd: d.bitcoin?.usd,
        inr: d.bitcoin?.inr,
        change: d.bitcoin?.usd_24h_change?.toFixed(2)
      },
      eth: {
        usd: d.ethereum?.usd,
        change: d.ethereum?.usd_24h_change?.toFixed(2)
      },
      gold: {
        usd: d.gold?.usd,
        change: d.gold?.usd_24h_change?.toFixed(2)
      }
    };
  } catch {
    return getFallbackMarket();
  }
}

function getFallbackNews() {
  return [
    { title: 'OpenAI announces major model update', source: 'TechCrunch' },
    { title: 'Indian AI startups raise record funding', source: 'Economic Times' },
    { title: 'Google Gemini gets new capabilities', source: 'The Verge' }
  ];
}

function getFallbackGithub() {
  return [
    { name: 'microsoft/autogen', stars: 32000, description: 'Multi-agent framework', language: 'Python' }
  ];
}

function getFallbackHN() {
  return [
    { title: 'Ask HN: What are you building with AI agents?', score: 312 }
  ];
}

function getFallbackMarket() {
  return {
    btc: { usd: 67000, change: '+1.2' },
    gold: { usd: 2650, change: '+0.3' }
  };
}
