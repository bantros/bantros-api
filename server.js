const express = require('express');
const app = express();

const oauth = require('./utils/oauth');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const SET_ORIGIN_URLS = ['https://bantros.net:443', 'http://localhost:8080'];
const SET_LISTEN_PORT = process.env.PORT || 8000;

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

// app.get('/', (req, res) => res.send('Hello World!'));

app.get('/user', (req, res) => {
  fetchLatestTweet().then(data => console.log('data', data));
  // res.status(200).send(data);
});

// const fetchAsync = async url => {
//   try {
//     const response = await fetch(url);
//     return response.json();
//   } catch (err) {
//     return err;
//   }
// };

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
    const twitter = await oauth.getToken(
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
  return token;

  // const options = {
  //   headers: { Authorization: 'Bearer ' + token }
  // };

  // try {
  //   const response = await fetch.get(
  //     'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=bantros&count=1', {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     }
  //   );
  //   if (response.status === 200) {
  //     // this.setLatestTweet(response.data);
  //     console.log(response.data);
  //   }
  // } catch (err) {
  //   console.error(err);
  // }
};
