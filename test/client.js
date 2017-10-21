const Lightning = require('../index');

const LN_DIR = process.env.LN_DIR || require('path').join(require('os').homedir(), '.lightning');

describe('LightningClient', () => {
    let lnc;

    before(() => lnc = new Lightning(LN_DIR));

    it('connects to c-lightning', () => lnc.clientConnectionPromise);

    it('can send RPC commands', () =>
        lnc.call('getinfo', [])
            .then(res => res.blockheight || Promise.reject('invalid response'))
    );

    it('provides shortcut methods', () =>
        lnc.getinfo()
            .then(res => res.blockheight || Promise.reject('invalid response'))
    );

    it('forwards arguments', () =>
        lnc.getlog('debug')
            .then(res => res.log.some(e => e.type == 'DEBUG') || Promise.reject('log should include debug level messages'))
    );

    after(() => lnc.client.destroy());
})
