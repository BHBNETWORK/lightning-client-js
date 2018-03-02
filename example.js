'use strict';

const LightningClient = require('lightning-client');
// const LightningClient = require('./index');

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
