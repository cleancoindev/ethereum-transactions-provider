'use strict'

const { isAddress, isHexStrict } = require('web3').utils
const { isArray, negate, overEvery, noop, some } = require('lodash')
const socketIo = require('socket.io')

function createSocketIoServer({ logger, maxAddresses, path }) {
  function onConnection(socket) {
    logger.verbose('Client connected')
    socket.on('subscribe', function (data = {}, ack = noop) {
      const { type, addresses = [] } = data

      if (type !== 'txs') {
        ack('invalid subscription type')
        return
      }

      if (
        !isArray(addresses) ||
        addresses.length > maxAddresses ||
        some(addresses, negate(overEvery([isHexStrict, isAddress])))
      ) {
        ack('invalid subscription')
        return
      }

      addresses
        .map((address) => address.toLowerCase())
        .forEach(function (address) {
          socket.join(address)
        })

      ack()
    })
  }

  return socketIo().of(path).on('connection', onConnection)
}

module.exports = createSocketIoServer
