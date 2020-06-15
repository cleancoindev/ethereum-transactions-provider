'use strict'

const { isAddress } = require('web3').utils
const express = require('express')

const stringifyAndTrim = (o, len = 64) => JSON.stringify(o).substr(0, len)

function asyncFnToMiddleware(fn, logger) {
  return function (req, res) {
    const args = { ...req.params, ...req.query }
    logger.verbose('--> %s %s', req.url, stringifyAndTrim(args))
    fn(args)
      .then(function (result) {
        logger.verbose('<-- %s %s', req.url, stringifyAndTrim(result))
        res.json(result)
      })
      .catch(function (err) {
        logger.warn('<-- %s Failure: %s', req.url, err.message)
        res.status(500).json({ message: 'Internal Server Error' })
      })
  }
}

function validateParam(name, testFn) {
  return function (req, res, next) {
    const param = req.params[name] || req.query[name]

    if (!testFn(param)) {
      res.status(400).json({ message: 'Bad Request' })
      return
    }

    next()
  }
}

function applyDefault(name, defVal) {
  return function (req, res, next) {
    const param = req.query[name]

    if (param) {
      next()
      return
    }

    Promise.resolve(typeof defVal === 'function' ? defVal() : defVal)
      .then(function (value) {
        req.query[name] = value
        next()
      })
      .catch(next)
  }
}

const isCardinal = (str) => /^[0-9]+$/.test(str)

function createRouter({ blocksParser, explorer, logger }) {
  const getLatestBlockNumber = () =>
    blocksParser.getLatestBlock().then((block) => block.number.toString())

  return express
    .Router()
    .get(
      '/blocks/best',
      asyncFnToMiddleware(blocksParser.getLatestBlock, logger)
    )
    .get(
      '/addresses/:address(0x[0-9a-fA-F]{40})/transactions',
      validateParam('address', isAddress),
      applyDefault('from', 0),
      validateParam('from', isCardinal),
      applyDefault('to', getLatestBlockNumber),
      validateParam('to', isCardinal),
      asyncFnToMiddleware(explorer.getAddressTransactions, logger)
    )
}

module.exports = createRouter
