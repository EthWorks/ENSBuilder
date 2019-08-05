const ENSBuilder = require('../ENSBuilder');
const ethers = require('ethers');


const deployENS = async (label, domain, privateKey, jsonRpcUrl) => {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const logger = (message) => console.log(message);
  const ensBuilder = new ENSBuilder(wallet, logger);
  await ensBuilder.bootstrapWith(label, domain);
};


if (process.argv.length === 6) {
  deployENS(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
} else {
  console.log('Invalid syntax. Type yarn deploy:ens [label] [domain] [privateKey] [jsonRpcUrl].');
}
