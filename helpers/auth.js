import oauth1a from 'oauth-1.0a';
import crypto from 'crypto';
import Twitter from 'twitter';

const {
  TWITTER_KEY: CONSUMER_KEY,
  TWITTER_SECRET: CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN: TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET: TOKEN_SECRET,
} = process.env;

const getAuth = (request) => {
  const oauth = oauth1a({
    consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
    signature_method: 'HMAC-SHA1',
    hash_function(baseStr, key) {
      return crypto
        .createHmac('sha1', key)
        .update(baseStr)
        .digest('base64');
    },
  });

  const authorization = oauth.authorize(request, {
    key: TOKEN_KEY,
    secret: TOKEN_SECRET,
  });

  return oauth.toHeader(authorization);
};

export default getAuth;

export const TwitterClient = new Twitter({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  access_token_key: TOKEN_KEY,
  access_token_secret: TOKEN_SECRET,
});
