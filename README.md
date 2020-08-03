## Depreciation notice
This npm is deprecated and not supported anymore. 
For ENS testing functionality use [@ethereum-waffle/ens](https://github.com/EthWorks/Waffle/tree/master/waffle-ens).


[![Build Status](https://travis-ci.org/EthWorks/ENSBuilder.svg?branch=master)](https://travis-ci.org/EthWorks/ENSBuilder)

# ENSBuilder

ENSBuilder lets you set up your own ENS instance for testing purposes.

Works best with [ethers.js](https://github.com/ethers-io/ethers.js/), but can also be used with [web3js](https://github.com/ethereum/web3.js/y) (see [Using with Web3](#using-with-web3) section below).

## Basic usage
To install:
```sh
npm install ens-builder
```

To create a new instance of the builder using [ethers.js wallet](https://docs.ethers.io/ethers.js/html/api-wallet.html):
```js
import ENSBuilder from 'ens-builder';
const builder = new ENSBuilder(wallet);
```

The fastest way to start is to use the `bootstrapWith` convenience method:
```js
const ensAddress = await builder.bootstrapWith('example', 'eth');
```

This will setup ENS, register the `eth` top-level domain and the `example.eth` subdomain under it.
It will also create a registrar for `example.eth`, a reverse registrar, as well as a global resolver.

The method will return the address of the deployed ENS. It can then be used, for example, to setup a new ethers provider and use it's methods for domain resolution:

```js
const provider = ethers.providers.getDefaultProvider({..., ensAddress})
const address = provider.resolveName('example.eth');
const name = provider.lookupAddress('example.eth');
```

You can also use the `registerAddress` to add even more domains. For example: 
```js
await builder.registerAddress('alex', 'mylogin.eth', givenAddress);
```

Or it's `registerAddressWithReverse` variant that also registers a revers record:
```js
await builder.registerAddressWithReverse('alex', 'mylogin.eth', wallet);
```

## Using with web3
To use with web3 you will have to wrap a web3 provider with an ethers Web3Provider, as well as adding the private key into a ethers wallet:
```js
const privateKey = ...;
const web3Provider = ...;
const ethersProvider = new providers.Web3Provider(web3Provider);
wallet = new ethers.Wallet(privateKey, ethersProvider);
builder = new ENSBuilder(deployer);
```

## Advanced usage
To bootstrap system without any domains yet:
```js
await builder.bootstrap();
```

Single resolver for all domains is available with `resolver` property:
```js
builder.resolver
```

To created top level domain:
```js
await builder.registerTLD('eth');
```

To add reverse registrar for reverse ENS lookup:
```js
await builder.registerReverseRegistrar();
```

To register a domain with a registrar:
```js
await builder.registerDomain('mylogin', 'eth');
```

The registrar for the domain is available with `registrars` property:
```js
builder.registrars['mylogin.eth']
```

To register domain with registrar pointing to given address:
```js
await builder.registerAddress('alex', 'mylogin.eth', givenAddress);
```
