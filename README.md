# Ethereum Transactions Provider

[![Build Status](https://travis-ci.com/autonomoussoftware/ethereum-transactions-provider.svg?branch=develop)](https://travis-ci.com/autonomoussoftware/ethereum-transactions-provider)
[![Code Style](https://img.shields.io/badge/code%20style-bloq-0063a6.svg)](https://github.com/bloq/eslint-config-bloq)

Simple transactions provider service for Ethereum blockchains.
This service provides a REST API to query all transactions related to a given address and a [Socket.IO](https://socket.io/) subscription mechanism to be notified when new transactions are mined.
It is API-compatible with the [Ethereum Transactions Indexer](https://github.com/autonomoussoftware/ethereum-transaction-indexer) but uses the [Etherscan API](https://etherscan.io/apis) and [BlockScout API](https://blockscout.com/etc/mainnet/api_docs) instead.

## REST API

### `GET /addresses/:address/transactions[?from=<number>&to=<number>]`

Will return a JSON array having all Ethereum transaction IDs related to the given address.
Optionally specify `from` and `to` to limit the query to only that block range.

```json
[
  "0xed3a75ab0677e1a4b24874c5f9ac1a6c38a1b419ff7616fb3ed764713095bf10",
  "0xbfbff2e8bbddbb0575120366be9d2b7dd7f231f8375c43cbb5629ae01ed0003f",
  "0x735df07d3d73a3f95355e0d6bd6c0a8ce1b5922834b7db372b18888ff2660b55",
  "0xc54fb504aa7cfedadd0a25623dc568a7ed8bdf92920520639df785729f580868"
]
```

Transactions are returned in reverse-chronological order.

### `GET /blocks/best`

Will return an object containing information of the latest block.

```json
{
  "number": 1828,
  "hash": "0xe04c1cded9a4724d8b22a8f7d6558f778392253ae61a2672a2242c60fe8992df",
  "totalDifficulty": "342830896"
}
```

## Events interface

The Socket.IO events interface is available at the following route: `/v1`.

### `subscribe`

Will allow the subscriber to start receiving notifications of new mined transactions related to the given addresses.

Subscription message:

```json
{
  "event": "subscribe",
  "data": {
    "type": "txs",
    "addresses": ["0xb1d4c88a30a392aee6859e6f62738230db0c2d93"]
  }
}
```

Subscription responses:

```json
{
  "event": "tx",
  "data": {
    "txid": "0x64473dec378049472234c854d53f2ce92cd7a94468b62f785b683a9cacdb7f86",
    "status": "confirmed"
  }
}
```

## Running the service

### Configuration

Default configuration can be customized by setting environment variables or createing a JSON file in the `config` folder following the [config](https://github.com/lorenwest/node-config/) module guidelines.

- `ETH_NODE_URL`: the URL of the node used to listen for new blocks.
- `EXPLORER_API_KEY`: the API key to query the block explorers.

### Installing dependencies

```sh
npm install
```

### Start

```sh
npm start
```

### Docker

```sh
npm run docker:build
docker run -it --rm -p 3005:3005 ethereum-transactions-provider
```

### End-to-end tests

```sh
E2E=true npm run test
```

## License

MIT
