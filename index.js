'use strict';

const path = require('path');
const net = require('net');
const debug = require('debug')('lightning-client');
const {EventEmitter} = require('events');
const _ = require('lodash');
const methods = require('./methods');

class LightningClient extends EventEmitter {
    constructor(rpcPath) {
        if (!path.isAbsolute(rpcPath)) {
            throw new Error('The rpcPath must be an absolute path');
        }

        rpcPath = path.join(rpcPath, '/lightning-rpc');

        debug(`Connecting to ${rpcPath}`);

        super();
        this.rpcPath = rpcPath;
        this.reconnectWait = 0.5;
        this.reconnectTimeout = null;
        this.reqcount = 0;

        const _self = this;

        this.client = net.createConnection(rpcPath);
        this.clientConnectionPromise = new Promise(resolve => {
            _self.client.on('connect', () => {
                debug(`Lightning client connected`);
                _self.reconnectWait = 1;
                resolve();
            });

            _self.client.on('end', () => {
                console.error('Lightning client connection closed, reconnecting');
                _self.increaseWaitTime();
                _self.reconnect();
            });

            _self.client.on('error', error => {
                console.error(`Lightning client connection error`, error);
                _self.increaseWaitTime();
                _self.reconnect();
            });
        });

        this.client.on('data', data => {
            _.each(LightningClient.splitJSON(data.toString()), str => {
                let dataObject = {};
                try {
                    dataObject = JSON.parse(str);
                } catch (err) {
                    return;
                }

                _self.emit('res:' + dataObject.id, dataObject);
            });
        });
    }

    static splitJSON(str) {
        const parts = [];

        let openCount = 0;
        let lastSplit = 0;

        for (let i = 0; i < str.length; i++) {
            if (i > 0 && str.charCodeAt(i - 1) === 115) { // 115 => backslash, ignore this character
                continue;
            }

            if (str[i] === '{') {
                openCount++;
            } else if (str[i] === '}') {
                openCount--;

                if (openCount === 0) {
                    const start = lastSplit;
                    const end = i + 1 === str.length ? undefined : i + 1;

                    parts.push(str.slice(start, end));

                    lastSplit = end;
                }
            }
        }

        return parts.length === 0 ? [str] : parts;
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
            debug('Trying to reconnect...');

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
