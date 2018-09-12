const chai = require('chai');
const ENSBuilder = require('../index');
const {withENS, getWallets, createMockProvider} = require('../lib/utils');
const {expect} = chai;

describe('ENS Builder', async () => {
  let builder;
  let wallet;
  let deployer;
  let provider;
  let providerWithEns;

  before(async () => {
    provider = createMockProvider();
    [wallet, deployer] = await getWallets(provider);
    builder = new ENSBuilder(deployer);
  });

  describe('bootstrapWith', () => {
    before(async () => {
      providerWithEns = await builder.bootstrapWith('mylogin', 'eth');
      await builder.registerAddressWithReverse('alex', 'mylogin.eth', wallet);
    });

    it('provider resolves name', async () => {
      expect(await providerWithEns.resolveName('alex.mylogin.eth')).to.eq(wallet.address);
    });

    it('reverse lookup with provider', async () => {
      expect(await providerWithEns.lookupAddress(wallet.address)).to.eq('alex.mylogin.eth');
    });
  });

  describe('bootstrap and register name manually', () => {
    before(async () => {
      await builder.bootstrap();
      await builder.registerTLD('eth');
      await builder.registerReverseRegistrar();
      await builder.registerDomain('mylogin', 'eth');
      await builder.registerAddressWithReverse('alex', 'mylogin.eth', wallet);
      providerWithEns = withENS(provider, builder.ens.address);
    });

    it('provider resolves name', async () => {
      expect(await providerWithEns.resolveName('alex.mylogin.eth')).to.eq(wallet.address);
    });

    it('reverse lookup with provider', async () => {
      expect(await providerWithEns.lookupAddress(wallet.address)).to.eq('alex.mylogin.eth');
    });
  });
});
