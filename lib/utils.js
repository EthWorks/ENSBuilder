const ethers = require('ethers');
const {utils, providers} = ethers;

const defaultDeployOptions = {
  gasLimit: 4000000,
  gasPrice: 9000000000
};

const addressToBytes32 = (address) =>
  utils.padZeros(utils.arrayify(address), 32);

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

module.exports = {addressToBytes32, deployContract};
