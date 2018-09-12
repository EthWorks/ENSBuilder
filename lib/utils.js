const Ganache = require('ganache-core');
const ethers = require('ethers');
const {utils, providers} = ethers;
const ENS = require('../abi/ENS');
const PublicResolver = require('../abi/PublicResolver');

const balance = '10000000000000000000000000000000000';

const accounts = [{
  balance,
  secretKey: '0x29f3edee0ad3abf8e2699402e0e28cd6492c9be7eaab00d732a791c33552f797'
}, {
  balance,
  secretKey: '0x5c8b9227cd5065c7e3f6b73826b8b42e198c4497f6688e3085d5ab3a6d520e74'
}, {
  balance,
  secretKey: '0x50c8b3fc81e908501c8cd0a60911633acaca1a567d1be8e769c5ae7007b34b23'
}, {
  balance,
  secretKey: '0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7c5'
}, {
  balance,
  secretKey: '0xe217d63f0be63e8d127815c7f26531e649204ab9486b134ec1a0ae9b0fee6bcf'
}, {
  balance,
  secretKey: '0x8101cca52cd2a6d8def002ffa2c606f05e109716522ca2440b2cc84e4d49700b'
}, {
  balance,
  secretKey: '0x837fd366bc7402b65311de9940de0d6c0ba3125629b8509aebbfb057ebeaaa25'
}, {
  balance,
  secretKey: '0xba35c32f7cbda6a6cedeea5f73ff928d1e41557eddfd457123f6426a43adb1e4'
}, {
  balance,
  secretKey: '0x71f7818582e55456cb575eea3d0ce408dcf4cbbc3d845e86a7936d2f48f74035'
}, {
  balance,
  secretKey: '0x03c909455dcef4e1e981a21ffb14c1c51214906ce19e8e7541921b758221b5ae'
}];

const defaultGanacheOptions = {accounts};

const defaultDeployOptions = {
  gasLimit: 4000000,
  gasPrice: 9000000000
};

const addressToBytes32 = (address) =>
  utils.padZeros(utils.arrayify(address), 32);

const lookupAddress = async (provider, address) => {
  const node = utils.namehash(`${address.slice(2)}.addr.reverse`.toLowerCase());
  const ens = new ethers.Contract(provider.ensAddress, ENS.interface, provider);
  const resolver = await ens.resolver(node);
  const contract = new ethers.Contract(resolver, PublicResolver.interface, provider);
  return await contract.name(node);
};

const withENS = (provider, ensAddress) => {
  const chainOptions = {ensAddress, chainId: 0};
  // eslint-disable-next-line no-underscore-dangle
  return new providers.Web3Provider(provider._web3Provider, chainOptions);
};

const createMockProvider = (ganacheOptions = {}) => {
  const options = {...defaultGanacheOptions, ganacheOptions};
  return new providers.Web3Provider(Ganache.provider(options));
};

const getWallets = async (provider) =>
  accounts.map((account) => new ethers.Wallet(account.secretKey, provider));

const deployContract = async (wallet, contractJSON, args = [], overrideOptions = {}) => {
  const {provider} = wallet;
  const bytecode = `0x${contractJSON.bytecode}`;
  const abi = contractJSON.interface;
  const deployTransaction = {
    ...defaultDeployOptions,
    ...overrideOptions,
    ...ethers.Contract.getDeployTransaction(bytecode, abi, ...args)
  };
  const tx = await wallet.sendTransaction(deployTransaction);
  const receipt = await provider.getTransactionReceipt(tx.hash);
  return new ethers.Contract(receipt.contractAddress, abi, wallet);
};

module.exports = {addressToBytes32, lookupAddress, withENS, createMockProvider, getWallets, deployContract};
