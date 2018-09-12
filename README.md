[![Build Status](https://travis-ci.org/EthWorks/ENSBuilder.svg?branch=master)](https://travis-ci.org/EthWorks/ENSBuilder)

# ENSBuilder

ENSBuilder lets you set up your own ENS instance for testing.

Works best with [ethers.js](https://github.com/ethers-io/ethers.js/) and can be used with [web3js](https://github.com/ethereum/web3.js/y) (see [Using with Web3](#using-with-web3) section below).

## Basic usage

To create a new instance of the builder using [ethers.js wallet](https://docs.ethers.io/ethers.js/html/api-wallet.html):
```js
const builder = new ENSBuilder(wallet);
```

The fastest way to setup testing environment is to call `bootstrapWith`:
```js
const provider = await builder.bootstrapWith('example', 'eth');
```

This will setup ENS, register top-level domain `eth` and domain under it `example.eth`.
It will also create a registrar for `example.eth` as well as a global resolver and a reverse registrar.

The method will return `ethers` provider pre-configured with new ENS.

You can now register subdomain of `mylogin.eth`, pointing to given address e.g.:
```js
await builder.registerAddress('alex', 'mylogin.eth', givenAddress);
```

If you want to include reverse record, use `registerAddressWithReverse` which requires wallet as the last argument:
```js
await builder.registerAddressWithReverse('alex', 'mylogin.eth', wallet);
```

Now you can use provider's method for domain resolution, e.g.:
```js
const address = provider.resolveName('example.eth');
const name = provider.lookupAddress('example.eth');
```

## Using with web3
To use with web3 you will have to wrap web3 provider with ethersProvider as well as address into ethers wallet:
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

To register domain without registrar pointing to given address:
```js
await builder.registerAddress('alex', 'mylogin.eth', givenAddress);
```
