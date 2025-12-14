const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const mediasoupModule = require('./mediasoup-config')

const { verifyToken } = require('./auth');

const { createWorker, createTransport, getRouter } = mediasoupModule

const app = express()
const server = http.createServer(app)
const io = socketIo(server, { 
  cors: { 
    origin: '*',
    methods: ['GET', 'POST']
  } 
})

// io.use((socket, next) => {
//   try {
//     const token = socket.handshake.auth?.token;
//     const user = verifyToken(token);
//     socket.user = user;
//     next();
//   } catch {
//     next(new Error('Unauthorized'));
//   }
// });

app.use(express.static('public'))
app.use(express.json());

// app.use('/api/meeting', require('./api/meeting'));

const rooms = {}

createWorker().then(() => {
  const router = getRouter()

  io.on('connection', async socket => {
    socket.on('getRouterRtpCapabilities', callback => {
      callback(router.rtpCapabilities)
    })

    socket.on('joinRoom', async (roomId, callback) => {
      if (!rooms[roomId]) {
        rooms[roomId] = { 
          router, 
          peers: {}, 
          screenSharer: null 
        }
      }
      
      rooms[roomId].peers[socket.id] = { 
        transports: [], 
        producers: [], 
        consumers: [],
        name: `User ${socket.id.slice(0, 4)}`
      }
      
      socket.join(roomId)
      
      const participants = Object.keys(rooms[roomId].peers)
      
      socket.to(roomId).emit('peerJoined', { socketId: socket.id, name: `User ${socket.id.slice(0, 4)}` })
      
      callback({
        rtpCapabilities: router.rtpCapabilities,
        participants
      })
    })

    socket.on('createTransport', async ({ roomId, direction }, callback) => {
      if (!rooms[roomId]) return callback({ error: 'No such room' })
      
      try {
        const transport = await createTransport(direction, router)
        rooms[roomId].peers[socket.id].transports.push(transport)
        
        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters
        })
      } catch (error) {
        callback({ error: error.message })
      }
    })

    socket.on('connectTransport', async ({ dtlsParameters, transportId, roomId }, callback) => {
      const peer = rooms[roomId]?.peers[socket.id]
      if (!peer) return callback({ error: 'Peer not found' })
      
      const transport = peer.transports.find(t => t.id == transportId)
      if (!transport) return callback({ error: 'Transport not found' })
      
      try {
        await transport.connect({ dtlsParameters })
        callback()
      } catch (error) {
        callback({ error: error.message })
      }
    })

    socket.on('produce', async ({ roomId, transportId, kind, rtpParameters, appData = {} }, callback) => {
      if (!rooms[roomId]) return callback({ error: 'No such room' })
      
      const peer = rooms[roomId].peers[socket.id]
      if (!peer) return callback({ error: 'Peer not found' })
      
      const transport = peer.transports.find(t => t.id == transportId)
      if (!transport) return callback({ error: 'Transport not found' })
      
      try {
        const producer = await transport.produce({
          kind,
          rtpParameters,
          appData: appData || {}
        })
        
        peer.producers.push(producer)
      
        callback({ id: producer.id })
        
        // Notify other participants
        socket.to(roomId).emit('newProducer', {
          producerId: producer.id,
          socketId: socket.id,
          kind,
          isScreen: appData.isScreen || false
        })
        
      } catch (error) {
        callback({ error: error.message })
      }
    })

    socket.on('getProducers', (roomId, callback) => {
      if (!rooms[roomId]) return callback([])
      
      const peers = rooms[roomId].peers
      const producers = []

      for (const peerId in peers) {
        if (peerId !== socket.id) {
          peers[peerId].producers.forEach(p => {
            producers.push({ 
              id: p.id,
              kind: p.kind,
              appData: p.appData || {}
            })
          })
        }
      }
      
      callback(producers)
    })

    socket.on('consume', async ({ roomId, transportId, rtpCapabilities, producerId }, callback) => {
      try {
        if (!router.canConsume({ producerId, rtpCapabilities })) {
          return callback({ error: 'Cannot consume - unsupported codec' })
        }
        
        if (!rooms[roomId]) return callback({ error: 'No such room' })
        
        const peer = rooms[roomId].peers[socket.id]
        if (!peer) return callback({ error: 'Peer not found' })
        
        const transport = peer.transports.find(t => t.id == transportId)
        if (!transport) return callback({ error: 'Transport not found' })

        let ownerSocketId = null;
        for (const peerId in rooms[roomId].peers) {
          const peerProducers = rooms[roomId].peers[peerId].producers;
          if (peerProducers.find(p => p.id === producerId)) {
            ownerSocketId = peerId;
            break;
          }
        }
        
        if (!ownerSocketId) {
          return callback({ error: 'Producer not found' });
        }

        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: false
        })

        peer.consumers.push(consumer)

        callback({
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          socketId: ownerSocketId
        })
      } catch (err) {
        callback({ error: err.message })
      }
    })

    socket.on('toggleVideo', ({ roomId, hasVideo }) => {
      if (!rooms[roomId]) return
      
      socket.to(roomId).emit('videoToggled', {
        socketId: socket.id,
        hasVideo
      })
    })


     socket.on('toggleAudio', ({ roomId, isMuted }) => {
      if (!rooms[roomId]) return
      
      socket.to(roomId).emit('audioToggled', {
        socketId: socket.id,
        isMuted
      })
    })

    socket.on("chatMessage", ({msg, roomId}) => {
      // Add sender name based on socket ID
      const senderName = rooms[roomId]?.peers[socket.id]?.name || `User ${socket.id.slice(0, 4)}`;
      const enhancedMsg = {
        ...msg,
        sender: senderName,
        senderId: socket.id
      };
      io.to(roomId).emit("chatMessage", enhancedMsg);
    });

    socket.on('startScreenShare', ({ roomId }, callback) => {
      if (!rooms[roomId]) return callback({ error: 'Room not found' })

      if (rooms[roomId].screenSharer && rooms[roomId].screenSharer !== socket.id) {
        return callback({ error: 'Someone is already sharing their screen' })
      }

      rooms[roomId].screenSharer = socket.id
      
      // Notify everyone including the sharer
      io.to(roomId).emit('screenShareStarted', { socketId: socket.id })

      callback({ success: true })
    })

    socket.on('stopScreenShare', ({ roomId }) => {
      if (rooms[roomId] && rooms[roomId].screenSharer === socket.id) {
        rooms[roomId].screenSharer = null
        io.to(roomId).emit('screenShareStopped', { socketId: socket.id })
      }
    })

    socket.on('disconnect', () => {
      for (const roomId in rooms) {
        if (rooms[roomId].peers[socket.id]) {
          const peer = rooms[roomId].peers[socket.id]
          
          if (rooms[roomId].screenSharer === socket.id) {
            rooms[roomId].screenSharer = null
            socket.to(roomId).emit('screenShareStopped', { socketId: socket.id })
          }
          
          // Close all producers
          peer.producers.forEach(p => p.close())
          
          // Close all consumers
          peer.consumers.forEach(c => c.close())
          
          // Close all transports
          peer.transports.forEach(t => t.close())
          
          // Get producer IDs before deleting peer
          const producerIds = peer.producers.map(p => p.id);
          
          delete rooms[roomId].peers[socket.id]

          // Notify other peers with producer IDs so they can clean up consumers
          socket.to(roomId).emit('peerLeft', { 
            socketId: socket.id,
            producerIds: producerIds
          })
          
          if (Object.keys(rooms[roomId].peers).length === 0) {
            delete rooms[roomId]
          }
        }
      }
    })
  })

  server.listen(5500, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:5500')
  })
})