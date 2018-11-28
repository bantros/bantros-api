const axios = require('axios');

const fetchAsync = async (url, options) => {
  if (options === undefined) {
    options = {};
  }

  try {
    const res = await axios.get(url, options);
    return res;
  } catch (err) {
    console.error(err);
  }
};

module.exports = fetchAsync;
