'use strict'

const fp = require('fastify-plugin')

const route = function (fastify, opts, next) {
  fastify.route({
    method: 'GET',
    path: '/lassoTemplate',
    handler: async function () {
      const page = require('marko').load(require.resolve('../../pages/lassoTemplate/index.marko'))
      return page.stream({
        now: new Date()
      })
    }
  })
  next()
}

module.exports = route
