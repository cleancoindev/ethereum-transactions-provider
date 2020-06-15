'use strict'

const config = require('config')
const express = require('express')
const http = require('http')
const createLogger = require('@bloq/service-logger')

const createBlocksParser = require('./src/blocks-parser')
const createHttpHealthRouter = require('./src/http-health-router')
const createRestApiRouter = require('./src/rest-api-router')
const createSocketIoServer = require('./src/socket.io-server')
const createExplorer = require('./src/explorer')

const logger = createLogger(config.get('logger'))

logger.debug('Startup configuration %j', config)

// Create the blocks parser
const url = config.get('ethNodeUrl')
const blocksParser = createBlocksParser({ logger, url })

// Create the function to get the transactions of an address
const apiKey = config.get('explorerApiKey')
const chainIdPromise = blocksParser.getChainId()
const explorer = createExplorer({ apiKey, chainIdPromise })

// Create the REST API and HTTP server
const restApiRouter = createRestApiRouter({ blocksParser, explorer, logger })
const healthRouter = createHttpHealthRouter()
const app = express()
  .use('/', restApiRouter)
  .use('/', healthRouter)
  .use(function (req, res) {
    res.status(404).json({ message: 'Not Found' })
  })
const server = http.createServer(app)

// Create Socket.IO server and attach to the HTTP server
const maxAddresses = config.get('subscriptionMaxAddresses')
const io = createSocketIoServer({ logger, maxAddresses, path: 'v1' })
io.server.attach(server)

// Attach the blocks parser to the Socket.IO server
blocksParser.attach(io)

// Start listening
const port = config.get('port')
server.listen(port, function () {
  logger.info('HTTP server listening on port %s', port)
})
