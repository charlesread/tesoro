'use strict'

require('require-self-ref')
const fastify = require('fastify')
const dir = require('node-dir')
const lasso = require('lasso')
const EventEmitter = require('events')
const debug = require('debug')(require('./package.json').name)
const fs = require('fs')

const _config = require('~/config')
let config

function IMPLEMENTATION(options) {
  config = _config(options)
  this._options = config.options
  if (!this._options.lasso || !this._options.lasso.outputDir) {
    throw config.errors.options.lasso
  }
  this.server = fastify()
  this.lasso = lasso
  this.initialized = false
  this.started = false
}

IMPLEMENTATION.prototype = Object.create(EventEmitter.prototype)
IMPLEMENTATION.prototype.constructor = IMPLEMENTATION
// FLAME.prototype.registerInertRoutes = async function () {
//   debug('5 - registering inert')
//   await this.server.register(require('inert'))
//   debug('6 - static folder, start')
//   // serve static folder
//   if (this._options.staticPath || this.lasso.defaultConfig.outputDir) {
//     this.server.route({
//       method: 'GET',
//       path: '/static/{param*}',
//       handler: {
//         directory: {
//           path: this._options.staticPath || this.lasso.defaultConfig.outputDir
//         }
//       }
//     })
//     debug('7 - static folder, end')
//   }
//   debug('8 - assets folder, start')
//   // serve assets folder
//   if (this._options.assetsPath) {
//     this.server.route({
//       method: 'GET',
//       path: '/assets/{param*}',
//       handler: {
//         directory: {
//           path: this._options.assetsPath
//         }
//       }
//     })
//     debug('9 - assets folder, end')
//   }
// }

IMPLEMENTATION.prototype.registerRoutes = function () {
  this.emit('willRegisterRoutes')
  debug('4 - registering routes')
  return new Promise((resolve, reject) => {
    const routesPathArray = this._options.routesPath
    for (let k = 0; k < routesPathArray.length; k++) {
      try {
        const files = dir.files(routesPathArray[k], {sync: true})
        debug('4a - files for %s: %j', routesPathArray[k], files)
        for (let i = 0; i < files.length; i++) {
          debug(' registering route at %s', files[i])
          try {
            this.server.register(require(files[i]))
          } catch (err) {
            console.error(err.stack)
          }
          if (i === files.length - 1 && k === routesPathArray.length - 1) {
            debug('5 - done registering routes')
            this.emit('routesRegistered')
            resolve()
          }
        }
      } catch (err) {
        debug('4a - ERROR with %s: %s', routesPathArray[k], err.message)
        //return resolve()
      }
    }
  })
}

IMPLEMENTATION.prototype.registerIoSockets = function () {
  debug('11 - registering sockets')
  return new Promise((resolve, reject) => {
    try {
      fs.statSync(this._options.ioPath)
      debug('11a - this._options.ioPath does exist: %s', this._options.ioPath)
    } catch (err) {
      debug('11a - this._options.ioPath does NOT exist: %s', this._options.ioPath)
      return resolve()
    }
    dir.files(this._options.ioPath, (err, files) => {
      if (err) {
        return reject(err)
      }
      for (let i = 0; i < files.length; i++) {
        debug(' registering socket at %s', files[i])
        try {
          require(files[i])(this.io)
        } catch (err) {
        }
        if (i === files.length - 1) {
          resolve()
        }
      }
    })
  })
}

IMPLEMENTATION.prototype.init = async function () {
  this.emit('willInitialize')
  debug('starting init()')
  require('marko/node-require').install()
  require('marko/compiler').defaultOptions.writeToDisk = false
  debug('1 - rigging socket.io')
  this.io = require('socket.io')(this.server.listener)
  debug('2 - configuring lasso')
  this.lasso.configure(this._options.lasso)
  this.initialized = true
  this.emit('initialized')
  debug('3 - returning from init()')
  return this
}

IMPLEMENTATION.prototype.start = async function () {
  this.emit('willStart')
  debug('starting start()')
  if (this.started === true) {
    throw new Error('already started')
  }
  if (!this.initialized) {
    debug('!this.initialized')
    await this.init()
  }
  // await this.registerInertRoutes()
  await this.registerRoutes()
  await this.registerIoSockets()
  await this.server.listen(this._options.server.port, this._options.server.address)
  this.started = true
  this.emit('started')
  debug('14 - resolving from start()')
}

module.exports = IMPLEMENTATION
