const quote = require("./EtradeNodeClient/quotes/quote");
const OAuth = require("oauth");
require('dotenv').config();
let etrade = require("node-etrade-api");


exports.start = ()=>{
    const secret = process.env.ETRADESANDBOXSECRET;
    const key = process.env.ETRADESANDBOXKEY;
    const oauth = new OAuth.OAuth(
        'https://apisb.etrade.com/oauth/request_token',
        'https://apisb.etrade.com/oauth/access_token',
        key,
        secret,
        '1.0',
        null,
        'HMAC-SHA1'
    );
    oauth.getOAuthRequestToken({}, (err, oauthToken, oauthTokenSecret, parsedQueryString)=>{
        console.log(err)
    })
}