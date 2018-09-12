const {utils} = require('ethers');
const {addressToBytes32, withENS, deployContract} = require('./lib/utils');
const ENSRegistry = require('./abi/ENSRegistry');
const PublicResolver = require('./abi/PublicResolver');
const FIFSRegistrar = require('./abi/FIFSRegistrar');
const ReverseRegistrar = require('./abi/ReverseRegistrar');

const {namehash} = utils;

class ENSBuilder {
  constructor(deployer) {
    this.deployer = deployer;
    this.registrars = [];
  }

  async bootstrap() {
    const emptyNode = addressToBytes32('0x0');
    this.ens = await deployContract(this.deployer, ENSRegistry, []);
    this.adminRegistrar = await deployContract(this.deployer, FIFSRegistrar, [this.ens.address, emptyNode]);
    this.resolver = await deployContract(this.deployer, PublicResolver, [this.ens.address]);
    await this.ens.setOwner([0], this.adminRegistrar.address);
  }

  async registerTLD(tld) {
    const label = utils.keccak256(utils.toUtf8Bytes(tld));
    const ethNode = namehash(tld);
    await this.adminRegistrar.register(label, this.deployer.address);
    await this.ens.setResolver(ethNode, this.resolver.address);
    this.registrars[tld] = await deployContract(this.deployer, FIFSRegistrar, [this.ens.address, ethNode]);
    await this.ens.setOwner(ethNode, this.registrars[tld].address);
  }

  async registerReverseRegistrar() {
    await this.registerTLD('reverse');
    const label = 'addr';
    const labelHash = utils.keccak256(utils.toUtf8Bytes(label));
    this.registrars['addr.reverse'] = await deployContract(this.deployer, ReverseRegistrar, [this.ens.address, this.resolver.address]);
    await this.registrars.reverse.register(labelHash, this.registrars['addr.reverse'].address);
  }

  async registerDomain(label, domain) {
    const labelHash = utils.keccak256(utils.toUtf8Bytes(label));
    const newDomain = `${label}.${domain}`;
    const node = namehash(newDomain);
    await this.registrars[domain].register(labelHash, this.deployer.address);
    await this.ens.setResolver(node, this.resolver.address);
    this.registrars[newDomain] = await deployContract(this.deployer, FIFSRegistrar, [this.ens.address, node]);
    await this.ens.setOwner(node, this.registrars[newDomain].address);
    return this.registrars[newDomain];
  }

  async registerAddress(label, domain, address) {
    const node = namehash(`${label}.${domain}`);
    const hashLabel = utils.keccak256(utils.toUtf8Bytes(label));
    await this.registrars[domain].register(hashLabel, this.deployer.address);
    await this.ens.setResolver(node, this.resolver.address);
    await this.resolver.setAddr(node, address);
  }

  async registerAddressWithReverse(label, domain, wallet) {
    const node = namehash(`${label}.${domain}`);
    const hashLabel = utils.keccak256(utils.toUtf8Bytes(label));
    await this.registrars[domain].register(hashLabel, this.deployer.address);
    await this.ens.setResolver(node, this.resolver.address);
    await this.resolver.setAddr(node, wallet.address);
    this.registrars['addr.reverse'].connect(wallet).setName('alex.mylogin.eth');
  }

  async bootstrapWith(label, domain) {
    await this.bootstrap();
    await this.registerTLD(domain);
    await this.registerReverseRegistrar();
    await this.registerDomain(label, domain);
    return withENS(this.deployer.provider, this.ens.address);
  }
}

module.exports = ENSBuilder;
