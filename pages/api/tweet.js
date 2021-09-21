import Cors from 'cors';
import { TwitterClient } from '../../helpers/auth';

const originWhiteList = process.env.ORIGIN_WHITE_LIST;

const initMiddleware = (middleware) => (req, res) => new Promise((resolve, reject) => {
  middleware(req, res, (result) => {
    if (result instanceof Error) {
      return reject(result);
    }
    return resolve(result);
  });
});

// const performAuth = (user, password) => true;

// const apiKeys = initMiddleware(
//   (req, res, cb) => {
//     if (!req.headers.authorization) return cb(new Error('No API Key Provided'));
//     const base64Credentials = req.headers.authorization.split(' ')[1];
//     const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
//     const [username, password] = credentials.split(':');
//     if (performAuth(username, password)) {
//       return cb();
//     }
//     return cb(new Error('API Key invalid'));
//   },
// );

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors((req, callback) => {
    if (originWhiteList.includes(req.headers.Origin)) callback(null, { origin: true });
    else {
      callback(null, { origin: false });
    }
  }),
);

const createTweet = async (tweet = 'Soli Deo Gloria!!') => {
  TwitterClient.post('statuses/update', { status: tweet }, (error, t, response) => {
    if (error) throw error;
    console.log('tweet', t); // tweet
    console.log('resp', response);
  });
};

export default async (req, res) => {
  await cors(req, res);
  const result = await createTweet(req.body.tweet);
  res
    .status(200)
    .json({ data: result });
};
