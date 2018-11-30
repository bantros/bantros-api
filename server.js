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

// Config

const config = {
  twitter: {
    token: null
  },
  spotify: {
    token: null,
    expiresIn: 0
  }
};

// Listen

app.listen(SET_LISTEN_PORT, () =>
  console.log(`Listening on port ${SET_LISTEN_PORT}!`)
);

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

app.get('/fetch-latest-track', (req, res) => {
  fetchLatestTrack().then(data => {
    res.status(200).send(data);
  });
});

// Request OAuth token

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

// Refresh OAuth token

const refreshToken = async () => {
  console.log('refreshToken');

  const auth = {
    spotify: {
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
    }
  };

  try {
    const res = await oauth(
      'https://accounts.spotify.com/api/token',
      auth.spotify
    );
    const { access_token, expires_in } = res;
    const expiresIn = Date.now() + expires_in * 1000;

    config.spotify = {
      token: access_token,
      expiresIn
    };

    return access_token;
  } catch (err) {
    console.error('refreshToken', err);
  }
};

// Twitter

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

// Spotify

const fetchLatestTrack = async () => {
  console.log('fetchLatestTrack');

  let token = config.spotify.token;

  if (config.spotify.expiresIn === 0 || config.spotify.expiresIn < Date.now()) {
    token = await refreshToken();
  }

  const options = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const res = await fetchAsync(
      'https://api.spotify.com/v1/me/player/currently-playing',
      options
    );

    switch (res.status) {
      case 200:
        console.log('setTrackInfo');
        // setTrackInfo(res.data, 'currently');
        break;
      case 204:
        fetchRecentTrack();
        break;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchRecentTrack = async () => {
  console.log('fetchRecentTrack');

  let token = config.spotify.token;

  if (config.spotify.expiresIn === 0 || config.spotify.expiresIn < Date.now()) {
    token = await refreshToken();
  }

  const options = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const res = await fetch.get(
      'https://api.spotify.com/v1/me/player/recently-played',
      options
    );

    if (res.status === 200) {
      setTrackInfo(res.data, 'recently');
    }
  } catch (err) {
    console.error(err);
  }
},
