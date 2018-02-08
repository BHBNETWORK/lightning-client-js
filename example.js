'use strict';

const LightningClient = require('lightning-client');

// This should point to your lightning-dir, by default in ~/.lightning
const client = new LightningClient('/home/bitcoind/.lightning');

// Every call returns a Promise

// "Show information about this node"
client.getinfo()
	.then(info => console.log(info))
	.catch(err => console.log(err.message));

// "Create an invoice for {msatoshi} with {label} and {description} with optional {expiry} seconds (default 1 hour)" }
client.invoice(100, 'my-label-4', 'my-description-4', 3600)
	.then(result => console.log(result))
	.catch(err => console.log(err.message));
