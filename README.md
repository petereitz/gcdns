# gcdns
Programmatically work with name records in Google Cloud DNS. 

## Overview
Given a service account keyfile and zone information, handles OAuth2 negotiation and proxies requests to the API.

## Install

```
npm -i gcdns
```

## Use

```javascript
const ZONE = require('gcdns');
const zone = new ZONE('/path-to/service-account/keyfile.json', 'example-com', 'example.com');

// pull an entire zone
zone.getRecords()
.then(result => console.log(result))
.catch(err => throw new Error(err))
```

## Creating Records

- `.createA("subDomain", "targetIP", ttl)` - Return a promise that resolves to the submitted change request.

```javascript
zone.createA('awesome', '1.2.3.4', 300)
.then(result => console.log(result))
.catch(err => throw new Error(err))
```

- `.createCNAME("subDomain", "targetDomain", ttl)` - Return a promise that resolves to the submitted change request.

```javascript
zone.createCNAME('alsoawesome', 'awesome.example.com', 300)
.then(result => console.log(result))
.catch(err => throw new Error(err))
```

## Querying Records

- `.getRecords()` - Return a promise that resolves to an array of all record objects in zone.

```javascript
zone.getRecords()
.then(result => console.log(result))
.catch(err => throw new Error(err));
``` 


## Changelog
- **v0.0.6** 
  - zone constructor and underlying auth constructor now take either a keyfile path or an object containing the same.
  - update axios to 0.25.0
- **v0.0.5** 
  - update axios to 0.24.0
- **v0.0.2-4** 
  - code and docu spruce up
- **v0.0.1**
  - initial
