'use strict'

const fetch = require('node-fetch').default

function createApiFn(apiUrl, apiKey) {
  return function ({ address, from, to }) {
    const url = new URL(apiUrl)
    url.searchParams.set('module', 'account')
    url.searchParams.set('action', 'txlist')
    url.searchParams.set('address', address)
    url.searchParams.set('startBlock', from)
    url.searchParams.set('endBlock', to)
    url.searchParams.set('sort', 'desc')
    if (apiKey) {
      url.searchParams.set('apikey', apiKey)
    }
    return fetch(url)
      .then((res) => res.json())
      .then(function (res) {
        if (res.status !== '1' && res.message !== 'No transactions found') {
          throw new Error(res.message)
        }
        return res.result.map((transaction) => transaction.hash)
      })
  }
}

function createExplorer({ apiKey, chainIdPromise }) {
  const getAddressTransactionsFnPromise = chainIdPromise.then(function (chain) {
    switch (chain) {
      case 1:
        return createApiFn('https://api.etherscan.io/api', apiKey)
      case 3:
        return createApiFn('https://api-ropsten.etherscan.io/api', apiKey)
      case 61:
        return createApiFn('https://blockscout.com/etc/mainnet/api')
      case 63:
        return createApiFn('https://blockscout.com/etc/mordor/api')
      default:
        throw new Error(`Unsupported chain ${chain}`)
    }
  })

  function getAddressTransactions(args) {
    return getAddressTransactionsFnPromise.then((fn) => fn(args))
  }

  return { getAddressTransactions }
}

module.exports = createExplorer
