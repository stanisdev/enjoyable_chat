const client = require('./redisClient');
const session = require('koa-session');

module.exports = function (app) {
  app.keys = ['some secret key'];

  const CONFIG = {
    key: 'app:sess',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    store: {
      /**
       * Retrieve session data
       */
      get: async(cookieKey) => {
        try {
          let result = await client.hgetallAsync(`sess:${cookieKey}`);
          Object.keys(result).forEach((key) => { // Serialize objects
            let val = result[key];
            if (['{', '['].indexOf(val[0]) > -1) {
              try {
                result[key] = JSON.parse(val);
              } catch (err) {}
            }
          });
          return result;
        } catch (err) {
          console.log('Error while fetching session value');
          console.log(err);
        }
      },
      /**
       * Set new values
       */
      set: async(cookieKey, sessData, maxage) => {
        const keys = Object.keys(sessData).filter(key => !key.startsWith('_'));
        const hashData = [];
        const sessKey = `sess:${cookieKey}`;
        for (let key of keys) {
          let value = sessData[key];
          if (!value) { // If undefined then remove
            await client.hdel(sessKey, key);
            continue;
          }
          if (value instanceof Object) {
            value = JSON.stringify(value);
          } else {
            value = value.toString();
          }
          hashData.push(key, value);
        }
        hashData.unshift(sessKey);
        try {
          const hashExists = await client.existsAsync(sessKey);
          await client.hmsetAsync(...hashData);
          if (!hashExists) { // Set live-time to redis store as cookie maxAge
            await client.expireAsync(sessKey, Math.floor(maxage / 1000));
          }
        } catch (err) {
          console.log('Session data has not been saved to redis store');
          console.log(err);
        }
      },
      /**
       * Clear session data
       */
      destroy: async(cookieKey) => {
        try {
          await client.delAsync(`sess:${cookieKey}`);
        } catch (err) {
          console.log('Session key cannot be removed');
          console.log(err);
        }
      }
    }
  };

  app.use(session(CONFIG, app));
};