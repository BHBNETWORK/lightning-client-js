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

```
const LightningClient = require('lightning-client');

// This should point to your lightning-dir, by default in ~/.lightning
const client = new LightningClient('/home/bitcoind/.lightning');

// Every call returns a Promise
client.getinfo()
    .then(info => console.log(info));
```