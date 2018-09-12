const ethers = require('ethers');
const {utils, providers} = ethers;
const ENS = require('../abi/ENS');
const PublicResolver = require('../abi/PublicResolver');

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

module.exports = {addressToBytes32, lookupAddress, withENS};
