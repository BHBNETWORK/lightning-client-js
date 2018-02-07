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

// This should point to your lightning-dir, by default in ~/.lightning
const client = new LightningClient('/home/bitcoind/.lightning');

// Every call returns a Promise

// "Show information about this node"
client.getinfo()
	.then(info => console.log(info));

// "Create an invoice for {msatoshi} with {label} and {description} with optional {expiry} seconds (default 1 hour)" }
client.invoice(100, 'my-label-3', 'my-description-3', 3600)
	.then(result => console.log(result));
```
