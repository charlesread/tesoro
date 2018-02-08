'use strict'

const route = function (fastify, opts, next) {
 fastify.route({
   method: 'GET',
   path: '/infoSomeOtherRoutes',
   handler: async function (req, reply) {
     return 'infoSomeOtherRoutes'
   }
 })
  next()
}

module.exports = route