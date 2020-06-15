'use strict'

const timeBombs = require('time-bombs')
const Web3 = require('web3')

function createBlocksParser({ logger, url }) {
  const web3 = new Web3(url)

  function getChainId() {
    return web3.eth.getChainId()
  }

  function getLatestBlock() {
    return web3.eth.getBlock('latest').then(function (block) {
      return {
        number: block.number,
        hash: block.hash,
        totalDifficulty: block.totalDifficulty,
      }
    })
  }

  function attach(io) {
    const bomb = timeBombs.create(60000, function () {
      throw new Error('No new blocks received in 1 min. Lost connection?')
    })
    web3.eth
      .subscribe('newBlockHeaders')
      .on('data', function (header) {
        bomb.reset()

        logger.verbose('Block received %d %s', header.number, header.hash)

        web3.eth
          .getBlock(header.hash, true)
          .then(function (block) {
            block.transactions.forEach(function ({ from, hash, to }) {
              ;[from, to]
                .filter((address) => !!address)
                .map((address) => address.toLowerCase())
                .forEach(function (address) {
                  io.to(address).emit('tx', { txid: hash, status: 'confirmed' })
                })
            })
          })
          .catch(function (err) {
            logger.warn('Fail to get block: %s', err.message)
          })
      })
      .on('error', function (err) {
        throw err
      })
  }

  return {
    attach,
    getChainId,
    getLatestBlock,
  }
}

module.exports = createBlocksParser
