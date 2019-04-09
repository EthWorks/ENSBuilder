import {Wallet} from 'ethers';

declare class ENSBuilder {
  constructor(deployer);

  bootstrap(): void;

  registerTLD(tld: string): void;

  registerReverseRegistrar(): void;

  registerDomain(label: string, domain: string): void;

  registerAddress(label: string, domain: string, address: string): void;

  registerAddressWithReverse(label: string, domain: string, wallet: Wallet): void;

  bootstrapWith(label, domain): Promise<string>;
}

export default ENSBuilder;
