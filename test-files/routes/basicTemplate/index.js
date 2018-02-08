'use strict'

const fp = require('fastify-plugin')

const route = function (fastify, opts, next) {
  fastify.route({
    method: 'GET',
    path: '/basicTemplate',
    handler: async function () {
      const page = require('marko').load(require.resolve('../../pages/basicTemplate/index.marko'))
      return page.stream({
        num: 1
      })
    }
  })
  next()
}

module.exports = route
