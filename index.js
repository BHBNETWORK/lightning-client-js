'use strict';

const path = require('path');
const net = require('net');
const readline = require('readline');
const {EventEmitter} = require('events');
const _ = require('lodash');
const methods = require('./methods');

class LightningClient extends EventEmitter {
    constructor(rpcPath) {
        if (!path.isAbsolute(rpcPath)) {
            throw new Error('The rpcPath must be an absolute path');
        }

        rpcPath = path.join(rpcPath, '/lightning-rpc');

        console.log(`Connecting to ${rpcPath}`);

        super();
        this.rpcPath = rpcPath;
        this.reconnectWait = 0.5;
        this.reconnectTimeout = null;
        this.reqcount = 0;

        const _self = this;

        this.client = net.createConnection(rpcPath);
        this.clientConnectionPromise = new Promise(resolve => {
            _self.client.on('connect', () => {
                console.log(`Lightning client connected`);
                _self.reconnectWait = 1;
                resolve();
            });

            _self.client.on('end', () => {
                console.log('Lightning client connection closed, reconnecting');
                _self.increaseWaitTime();
                _self.reconnect();
            });

            _self.client.on('error', error => {
                console.log(`Lightning client connection error`, error);
                _self.increaseWaitTime();
                _self.reconnect();
            });
        });

        readline.createInterface({input: this.client}).on('line', str => {
            let data;
            try {
                data = JSON.parse(str);
            } catch (err) {
                return _self.emit('error', 'Invalid JSON: ' + str);
            }

            _self.emit('res:' + data.id, data);
        });
    }

    increaseWaitTime() {
        if (this.reconnectWait >= 16) {
            this.reconnectWait = 16;
        } else {
            this.reconnectWait *= 2;
        }
    }

    reconnect() {
        const _self = this;

        if (this.reconnectTimeout) {
            return;
        }

        this.reconnectTimeout = setTimeout(() => {
            console.log('Trying to reconnect...');

            _self.client.connect(_self.rpcPath);
            _self.reconnectTimeout = null;
        }, this.reconnectWait * 1000);
    }

    call(method, args = []) {
        if (!_.isString(method) || !_.isArray(args)) {
            return Promise.reject(new Error('invalid_call'));
        }

        const _self = this;

        const callInt = ++this.reqcount;
        const sendObj = {
            method,
            params: args,
            id: callInt
        };

        // Wait for the client to connect
        return this.clientConnectionPromise
            .then(() => new Promise((resolve, reject) => {
                // Wait for a response
                this.once('res:' + callInt, response => {
                    if (_.isNil(response.error)) {
                        resolve(response.result);
                        return;
                    }

                    reject(new Error(response.error));
                });

                // Send the command
                _self.client.write(JSON.stringify(sendObj));
            }));
    }
}

const protify = s => s.replace(/-([a-z])/g, m => m[1].toUpperCase());

methods.forEach(k => {
    LightningClient.prototype[protify(k)] = function (...args) {
        return this.call(k, args);
    };
});

module.exports = LightningClient;
