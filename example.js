'use strict';

const LightningClient = require('lightning-client');

// This should point to your lightning-dir, by default in ~/.lightning
const client = new LightningClient('/home/bitcoind/.lightning');

// "Show information about this node"
client.getinfo()
	.then(info => console.log(info));

// "Create an invoice for {msatoshi} with {label} and {description} with optional {expiry} seconds (default 1 hour)" }
client.invoice(100, 'my-label-3', 'my-description-3', 3600)
	.then(result => console.log(result));
