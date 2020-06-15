'use strict'

const express = require('express')

function healthCheck(req, res) {
  res.sendStatus(200)
}

function createRouter() {
  return express.Router().get('/', healthCheck)
}

module.exports = createRouter
