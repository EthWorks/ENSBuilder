const chai = require('chai');
const ENSBuilder = require('../index');
const {createMockProvider, getWallets} = require('ethereum-waffle');
const {withENS, lookupAddress} = require('../lib/utils');
const {expect} = chai;

describe('ENS Builder', async () => {
  let builder;
  let wallet;
  let deployer;
  let provider;
  let providerWithEns;
  let expectedAddress;
  let deployerAddress;

  before(async () => {
    provider = createMockProvider();
    [wallet, deployer] = await getWallets(provider);
    expectedAddress = wallet.address;
    deployerAddress = deployer.address;
    builder = new ENSBuilder(deployer);
  });

  describe('bootstrapWith', () => {
    before(async () => {
      providerWithEns = await builder.bootstrapWith('mylogin', 'eth');
      await builder.registerAddress('alex', 'mylogin.eth', expectedAddress);
    });

    it('provider resolves name', async () => {
      expect(await providerWithEns.resolveName('alex.mylogin.eth')).to.eq(expectedAddress);
    });

    it('reverse lookup', async () => {
      expect(await lookupAddress(providerWithEns, deployerAddress)).to.eq('alex.mylogin.eth');
    });
  });

  describe('bootstrap and register name manually', () => {
    before(async () => {
      await builder.bootstrap();
      await builder.registerTLD('eth');
      await builder.registerReverseRegistrar();
      await builder.registerDomain('mylogin', 'eth');
      await builder.registerAddress('alex', 'mylogin.eth', expectedAddress);
      providerWithEns = withENS(provider, builder.ens.address);
    });

    it('provider resolves name', async () => {
      expect(await providerWithEns.resolveName('alex.mylogin.eth')).to.eq(expectedAddress);
    });

    it('reverse lookup', async () => {
      expect(await lookupAddress(providerWithEns, deployerAddress)).to.eq('alex.mylogin.eth');
    });
  });
});
