const {utils} = require('ethers');
const {deployContract, waitToBeMined} = require('./utils');
const ENSRegistry = require('../abi/ENSRegistry');
const PublicResolver = require('../abi/PublicResolver');
const FIFSRegistrar = require('../abi/FIFSRegistrar');
const ReverseRegistrar = require('../abi/ReverseRegistrar');

const overrideOptions = {gasLimit: 120000};
const nullLogger = () => {};


class ENSBuilder {
  constructor(deployer, logger = nullLogger) {
    this.deployer = deployer;
    this.registrars = [];
    this.logger = logger;
  }

  async bootstrap() {
    const emptyNode = utils.formatBytes32String(0);
    this.ens = await deployContract(this.deployer, ENSRegistry, []);
    this.logger(`    ENS deployed at: ${this.ens.address}`);
    this.adminRegistrar = await deployContract(this.deployer, FIFSRegistrar, [this.ens.address, emptyNode]);
    this.logger(`    Registrar deployed at: ${this.adminRegistrar.address}`);
    this.resolver = await deployContract(this.deployer, PublicResolver, [this.ens.address]);
    this.logger(`    Resolver deployed at: ${this.resolver.address}`);
    await waitToBeMined(await this.ens.setOwner(utils.formatBytes32String(0), this.adminRegistrar.address));
  }

  async registerTLD(tld) {
    const label = utils.keccak256(utils.toUtf8Bytes(tld));
    const ethNode = utils.namehash(tld);
    await waitToBeMined(await this.adminRegistrar.register(label, this.deployer.address, overrideOptions));
    await waitToBeMined(await this.ens.setResolver(ethNode, this.resolver.address));
    this.registrars[tld] = await deployContract(this.deployer, FIFSRegistrar, [this.ens.address, ethNode]);
    this.logger(`    TLD '${tld}' registrar deployed at: ${this.registrars[tld].address}`);
    await waitToBeMined(await this.ens.setOwner(ethNode, this.registrars[tld].address));
  }

  async registerReverseRegistrar() {
    await this.registerTLD('reverse');
    const label = 'addr';
    const labelHash = utils.keccak256(utils.toUtf8Bytes(label));
    this.registrars['addr.reverse'] = await deployContract(this.deployer, ReverseRegistrar, [this.ens.address, this.resolver.address]);
    this.logger(`    Reverse registrar deployed at: ${this.registrars['addr.reverse'].address}`);
    await waitToBeMined(await this.registrars.reverse.register(labelHash, this.registrars['addr.reverse'].address, overrideOptions));
  }

  async registerDomain(label, domain) {
    const labelHash = utils.keccak256(utils.toUtf8Bytes(label));
    const newDomain = `${label}.${domain}`;
    const node = utils.namehash(newDomain);
    await waitToBeMined(await this.registrars[domain].register(labelHash, this.deployer.address, overrideOptions));
    await waitToBeMined(await this.ens.setResolver(node, this.resolver.address));
    this.registrars[newDomain] = await deployContract(this.deployer, FIFSRegistrar, [this.ens.address, node]);
    this.logger(`    ${newDomain} registrar deployed at: ${this.registrars[newDomain].address}`);
    await waitToBeMined(await this.ens.setOwner(node, this.registrars[newDomain].address));
    return this.registrars[newDomain];
  }

  async registerAddress(label, domain, address) {
    const node = utils.namehash(`${label}.${domain}`);
    const hashLabel = utils.keccak256(utils.toUtf8Bytes(label));
    await waitToBeMined(await this.registrars[domain].register(hashLabel, this.deployer.address, overrideOptions));
    await waitToBeMined(await this.ens.setResolver(node, this.resolver.address));
    await waitToBeMined(await this.resolver.setAddr(node, address));
  }

  async registerAddressWithReverse(label, domain, wallet) {
    await this.registerAddress(label, domain, wallet.address);
    await waitToBeMined(await this.registrars['addr.reverse'].connect(wallet).setName(`${label}.${domain}`, overrideOptions));
  }

  async bootstrapWith(label, domain) {
    await this.bootstrap();
    this.logger(`Registering TLD...`);
    await this.registerTLD(domain);
    this.logger(`Registering reverse registrar...`);
    await this.registerReverseRegistrar();
    this.logger(`Registering ${label}.${domain} domain...`);
    await this.registerDomain(label, domain);
    return this.ens.address;
  }
}

module.exports = ENSBuilder;
