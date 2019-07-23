// ---SETUP---
// config
// auth scopes necessary to modify cloud DNS
let authScopes = 'https://www.googleapis.com/auth/ndev.clouddns.readwrite';

// googl oauth2 token
const Auth = require('./lib/auth');

// web request wrangling
const axios = require('axios');



// ---FUNCTIONS---
// grab a unix timestamp
var getNow = function() {
  return Math.floor(Date.now() / 1000);
};



// ---PUBLIC ITEMS---
// Zone
class Zone {
  constructor(keyfilePath, zone, domain){
    try{
      this.keyfilePath = keyfilePath;
      const keyfile = require(keyfilePath);
      this.project = keyfile.project_id;
      this.zone = zone;
      this.domain = domain;
      this.changeURL = `https://www.googleapis.com/dns/v1/projects/${this.project}/managedZones/${this.zone}/changes`;
      this.recordListURL = `https://www.googleapis.com/dns/v1/projects/${this.project}/managedZones/${this.zone}/rrsets`;

    }catch(err){
      throw new Error(err);
    }
}

  makeRequest(method, url, change){
    return new Promise((resolve, reject)=>{
      const self = this;
      try {
        const auth = new Auth(authScopes, this.keyfilePath);

        // grab an auth token
        auth.getToken()
          .then(res => {

            // configure the request
            const requestConfig = {
              url: url,
              method: method,
              headers: {
                Authorization: `Bearer ${res}`//,
                //"Content-Type": "application/json"
              },
              data: change
            }

            // make the request
            axios(requestConfig)
              .then(res => {
                resolve(res.data);
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err)
          })
      } catch(err) {
        reject(err);
      }
    });
  }

  submitChange(change){
    return new Promise((resolve, reject)=>{
      const self = this;
      try {
        self.makeRequest("post", self.changeURL, change)
        .then(res => resolve(res))
        .catch(err => reject(err));
      }catch(err){
        reject(err);
      }
    });
  }

  createA(name, data, ttl){
    return new Promise((resolve, reject)=>{
      const self = this;
      try {
        // prep the change config
        let change = {
          additions: [
            {
              name: `${name}.${self.domain}.`,
              type: "A",
              ttl: ttl,
              rrdatas: data
            }
          ]
        }

        // submit the change
        self.submitChange(change)
        .then(res => resolve(res))
        .catch(err => reject(err));

      }catch(err){
        reject(err);
      }
    });
  }

  createCNAME(name, data, ttl){
    return new Promise((resolve, reject)=>{
      const self = this;
      try {
        // q&d validation for `data`
        if (data.slice(-1) != "."){
          data = `${data}.`
        }

        // prep the change config
        let change = {
          additions: [
            {
              name: `${name}.${self.domain}.`,
              type: "CNAME",
              ttl: ttl,
              rrdatas: data
            }
          ]
        }

        // submit the change
        self.submitChange(change)
        .then(res => resolve(res))
        .catch(err => reject(err.response.data))

      }catch(err){
        reject(err);
      }
    });
  }

  getRecords(){
    return new Promise((resolve, reject)=>{
      const self = this;
      try {
        self.makeRequest('get', this.recordListURL)
        .then(res => {
            resolve(res.rrsets)
        })
        .catch(err => reject(err));
      }catch(err){reject(err)};
    });
  }
}



// ---EXPORT---
module.exports = Zone;
