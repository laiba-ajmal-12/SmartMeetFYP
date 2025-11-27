const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const mediasoupModule = require('./mediasoup-config');
const { createWorker, createTransport, getRouter } = mediasoupModule;

const app = express()
const server = http.createServer(app)
const io = socketIo(server, { cors: { origin: '*' } })

app.use(express.static('public'))

const rooms = {}

createWorker().then(() => {
  const router = getRouter();

  io.on('connection', async socket => {
    console.log('New client connected:', socket.id)

    socket.on('getRouterRtpCapabilities', callback => {
      callback(router.rtpCapabilities)
    })

    socket.on('joinRoom', async (roomId, callback) => {
      if (!rooms[roomId]) {
        rooms[roomId] = { router, peers: {} }
      }
      rooms[roomId].peers[socket.id] = { transports: [], producers: [], consumers: [] }
       socket.join(roomId)

      const participants = Object.keys(rooms[roomId].peers)
      socket.to(roomId).emit('peerJoined', { socketId: socket.id })
      callback(rooms[roomId].router.rtpCapabilities, participants)
    })

    socket.on('createTransport', async ({ roomId, direction }, callback) => {
      if (!rooms[roomId]) return callback({ error: 'No such room' })
      const transport = await createTransport(direction, router)
      rooms[roomId].peers[socket.id].transports.push(transport)

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      })
    })

    socket.on('connectTransport', async ({ dtlsParameters, transportId, roomId }, callback) => {
      const transport = rooms[roomId].peers[socket.id].transports.find(t => t.id == transportId)
      if (!transport) return callback({ error: 'transport not found' })
      await transport.connect({ dtlsParameters })
      callback()
    })

    socket.on('produce', async ({ roomId, transportId, kind, rtpParameters }, callback) => {
      const transport = rooms[roomId].peers[socket.id].transports.find(t => t.id == transportId)
      if (!transport) return callback({ error: 'transport not found' })

      const producer = await transport.produce({ kind, rtpParameters })
      rooms[roomId].peers[socket.id].producers.push(producer)
      callback({ id: producer.id })
      socket.to(roomId).emit('newProducer', { producerId: producer.id ,socketId: socket.id})
    })

    socket.on('getProducers', (roomId, callback) => {
      if (!rooms[roomId]) return callback([])
      const peers = rooms[roomId].peers
      const producers = []

      for (const peerId in peers) {
        if (peerId !== socket.id) {
          peers[peerId].producers.forEach(p => {
            producers.push({ id: p.id })
          })
        }
      }

      callback(producers)
    })

    socket.on('consume', async ({ roomId, transportId, rtpCapabilities, producerId }, callback) => {
      try {
        if (!router.canConsume({ producerId, rtpCapabilities })) {
          return callback({ error: 'Cannot consume' })
        }
        const transport = rooms[roomId].peers[socket.id].transports.find(t => t.id == transportId)
        if (!transport) return callback({ error: 'transport not found' })

        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: false
        })

        rooms[roomId].peers[socket.id].consumers.push(consumer)

        callback({
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters
        })
      } catch (err) {
        console.error('consume error', err)
        callback({ error: err.message })
      }
    })

    socket.on('disconnect', () => {
      for (const roomId in rooms) {
        if (rooms[roomId].peers[socket.id]) {
          rooms[roomId].peers[socket.id].producers.forEach(p => p.close())
          rooms[roomId].peers[socket.id].transports.forEach(t => t.close())
          delete rooms[roomId].peers[socket.id]
          socket.to(roomId).emit('peerLeft', { socketId: socket.id })
        }
      }
    })
  })

  server.listen(5500, '0.0.0.0', () => console.log('Running on 5500'))

})
