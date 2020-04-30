'use strict'

const config = require('config')
const fetch = require('node-fetch').default
const io = require('socket.io-client')
require('chai').should()

const port = config.get('port')

require('../server')

describe('Indexer', function () {
  before(function () {
    if (!process.env.E2E) {
      this.skip()
    }
  })

  it('should respond with the best block', function () {
    return fetch(`http://localhost:${port}/blocks/best`)
      .then((res) => res.json())
      .then(function (res) {
        res.should.have.property('number')
        res.should.have.property('hash')
        res.should.have.property('totalDifficulty')
      })
  })

  it('should respond with all the transactions of an address', function () {
    const address = '0xb29a60219268D4D58aeF50F113CC6c059D70da7c'
    const query = '?from=7000000'
    return fetch(
      `http://localhost:${port}/addresses/${address}/transactions${query}`
    )
      .then((res) => res.json())
      .then(function (res) {
        res.should.be.an('array')
        res[0].should.be.a('string')
      })
  })

  it('should subscribe and receive tx events', function (done) {
    this.timeout(60000)

    const addresses = ['0xb29a60219268D4D58aeF50F113CC6c059D70da7c']
    const socket = io.connect(`http://localhost:${port}/v1`)
    socket.on('connect', function () {
      socket.emit('subscribe', { type: 'txs', addresses })
    })
    socket.on('tx', function (data) {
      data.should.have.property('txid')
      data.should.have.property('status')
      done()
    })
  })
})
