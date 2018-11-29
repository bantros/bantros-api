const express = require('express');
const app = express();

const fetchAsync = require('./utils/fetchAsync');
const oauth = require('./utils/oauth');
const projects = require('./data/projects');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const SET_ORIGIN_URLS = ['https://bantros.net:443', 'http://localhost:8080'];
const SET_LISTEN_PORT = process.env.PORT || 8000;

// Listen

app.listen(SET_LISTEN_PORT, () =>
  console.log(`Listening on port ${SET_LISTEN_PORT}!`)
);

// Use

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (SET_ORIGIN_URLS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Routes

app.get('/projects', (req, res) => {
  res.status(200).send(projects);
});

app.get('/fetch-latest-tweet', (req, res) => {
  fetchLatestTweet().then(data => {
    res.status(200).send(data);
  });
});

// app.get('/', (req, res) => res.send('Hello World!'));

// Request token

const requestToken = async () => {
  console.log('requestToken');

  const auth = {
    twitter: {
      client_id: process.env.TWITTER_CLIENT_ID,
      client_secret: process.env.TWITTER_CLIENT_SECRET,
      grant_type: 'client_credentials'
    }
  };

  try {
    const twitter = await oauth(
      'https://api.twitter.com/oauth2/token',
      auth.twitter
    );
    return twitter.access_token;
  } catch (err) {
    console.error(err);
  }
};

const fetchLatestTweet = async () => {
  console.log('fetchLatestTweet');

  const token = await requestToken();
  const options = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const res = await fetchAsync(
      'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=bantros&count=1',
      options
    );

    return res.data;
  } catch (err) {
    console.error(err);
  }
};
