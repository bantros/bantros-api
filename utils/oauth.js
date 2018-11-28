const axios = require('axios');

const oauth = async (url, options) => {
  // Base64 encode client id and secret
  const buffer = new Buffer(
    options.client_id + ':' + options.client_secret
  ).toString('base64');

  // Setup post params
  const params = {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + buffer,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    data: `grant_type=${options.grant_type}`
  };

  if (options.code && options.redirect_uri) {
    params.data += `&code=${options.code}&redirect_uri=${options.redirect_uri}`;
  }

  if (options.refresh_token) {
    params.data += `&refresh_token=${options.refresh_token}`;
  }

  try {
    const res = await axios(url, params);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = oauth;
