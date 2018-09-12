[![Build Status](https://travis-ci.org/EthWorks/ENSBuilder.svg?branch=master)](https://travis-ci.org/EthWorks/ENSBuilder)

# ENSBuilder

ENSBuilder lets you set up your own ENS instance for testing. Works with `ethers.js`.

## Basic usage:

To create a new instance of the builder using `ethers.js` Wallet:
```js
const builder = new ENSBuilder(wallet);
```

The fastest way to setup testing environment is to call `bootstrapWith`:
```js
const provider = await builder.bootstrapWith('example', 'eth');
```

This will setup ENS, register top-level domain `eth` and `example.eth`.
It will also create a registrar, resolver and reverse registrar for `example.eth`.

This will return `ethers` provider pre-configured with new ENS.
You can use provider methods for domain resolution, e.g.:
```js
const address = provider.resolveName('example.eth');
```

You can now register subdomain of `mylogin.eth`, pointing to given address e.g.:
```js
await builder.registerAddress('alex', 'mylogin.eth', givenAddress);
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

