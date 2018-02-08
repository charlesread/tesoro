'use strict'

const fp = require('fastify-plugin')

const route = function (fastify, opts, next) {
  fastify.route({
    method: 'GET',
    path: '/info',
    handler: async function (req, reply) {
      return 'info'
    }
  })
  next()
}

module.exports = route
