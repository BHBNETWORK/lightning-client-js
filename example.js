'use strict';

const LightningClient = require('./index');

const client = new LightningClient('/home/bitcoind/.lightning');

client.getinfo()
    .then(info => console.log(info));
