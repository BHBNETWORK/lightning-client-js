# lightning-client-js

JavaScript [c-lightning](https://github.com/ElementsProject/lightning) client.

This repository is published as the [`lightning-client`](https://www.npmjs.com/package/lightning-client) NPM module.

## Installing the client

You can easily install this client using `npm` by running:

```
npm install lightning-client
```

## Using the client

Once the client is installed you can use it by loading the main class and instantiating it in this way:

```javascript

'use strict';

const LightningClient = require('lightning-client');

// This should point to your lightning-dir, by default in ~/.lightning. 
// The debug mode is enabled (second parameter) but this decreases performances (see PR #10)
const client = new LightningClient('/home/bitcoind/.lightning', true);

// Every call returns a Promise

// "Show information about this node"
client.getinfo()
	.then(info => console.log(info))
	.catch(err => console.log(err));

// "Create an invoice for {msatoshi} with {label} and {description} with optional {expiry} seconds (default 1 hour)" }
client.invoice(100, 'my-label-4', 'my-description-4', 3600)
	.then(result => console.log(result))
	.catch(err => console.log(err));

// "Show addresses list up to derivation {index} (default is the last bip32 index)"
client.devListaddrs ()
	.then(listaddrs => console.log(JSON.stringify (listaddrs)))
	.catch(err => console.log(err));

```
