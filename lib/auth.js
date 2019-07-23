// ---SETUP---
// config
// google deets
let google = {
  authURL: 'https://www.googleapis.com/oauth2/v4/token',
  oauthGrantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  algorithm: "RS256"
}

// json web token wrangling
const jwt = require('jsonwebtoken');

// web request wrangling
const axios = require('axios');



// ---FUNCTIONS---
// grab a unix timestamp
var getNow = function() {
  return Math.floor(Date.now() / 1000);
};



// ---PUBLIC ITEMS---
// Auth
class Auth {
  constructor(scopes, keyfilePath){

    try{
      this.scopes = scopes;
      this.keyfile = require(keyfilePath);
      this.token = '';
      this.ready = false;
      this.tokenExp = 0;

      this.fetchToken()
      .catch(err => {throw new Error(err)})

    } catch(err){
      throw new Error(err);
    }
  }

  fetchToken(){
    return new Promise((resolve, reject)=>{
      // don't loose yourself
      const self = this;

      try {
        // check that the token isn't expired
        if(self.tokenExp > (getNow() + 5)){  // pad the age by a few seconds
          // send back the token that we have in hand
          resolve(self.token);
        } else {  // fetch a new token
          // build the claimset
          let claimset = {
            iss: self.keyfile.client_email,
            scope: self.scopes,
            aud: google.authURL,
            exp: (getNow() + 3600),
            iat: getNow()
          }

          // generate the request JWT
          let requestJWT = jwt.sign(claimset, self.keyfile.private_key, { algorithm: google.algorithm })

          // configure the request
          const requestConfig = {
            url: google.authURL,
            method: `post`,
            data: {
              "grant_type": google.oauthGrantType,
              "assertion": requestJWT
            }
          }

          // make the request
          axios(requestConfig)
            .then(res => {
              // commit it to memory
              self.token = res.data.access_token;
              self.tokenExp = getNow() + res.data.expires_in;
              self.ready = true;
              resolve();
            })
            .catch(err => reject(err));
        }
      } catch(err) {
        reject(err);
      }
    })
  }

  getToken(){
    return new Promise((resolve, reject)=>{
      // don't loose yourself
      const self = this;

      try {
        // check that we're fully initialized
        if (self.ready){
          self.fetchToken()
            .then(res => resolve(res))
            .catch(err => reject(err));
        } else {
          setTimeout(function(){
            self.getToken()
              .then(res => resolve(res))
              .catch(err => reject(err));
          }, 1000);
        }
      } catch(err) {
        reject(err);
      }
    })
  }
}

// ---EXPORT---
module.exports = Auth;
