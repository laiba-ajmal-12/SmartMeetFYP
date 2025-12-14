const mediasoup = require('mediasoup')
const os = require('os')
// require("dotenv").config()


const workerSettings = {
  logLevel: 'debug',   
  rtcMinPort: 10000,
  rtcMaxPort: 10100
}

const routerOptions = {
  mediaCodecs: [
    { 
      kind: 'audio', 
      mimeType: 'audio/opus', 
      clockRate: 48000, 
      channels: 2 
    },
    { 
      kind: 'video', 
      mimeType: 'video/VP8', 
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000
      }
    }
  ]
}

let worker
let router

const getLocalIP = () => {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        console.log(`Using network interface: ${config.address} on ${iface}`)
        return config.address
      }
    }
  }
  return '0.0.0.0'   
}

const createWorker = async () => {
  if (worker) return
  worker = await mediasoup.createWorker(workerSettings)
  worker.on('died', () => {
    console.error('Mediasoup worker died')
    process.exit(1)
  })
  router = await worker.createRouter({ mediaCodecs: routerOptions.mediaCodecs })
}

const createTransport = async (side, routerParam) => {
 
  const localIP = getLocalIP() 
  
  const transport = await routerParam.createWebRtcTransport({
    listenIps: [{ 
      ip: '0.0.0.0',  
      announcedIp: getLocalIP()
    }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
 
    iceServers: [
      { 
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302'
        ]
      }
    ],
    initialAvailableOutgoingBitrate: 1000000,
    minimumAvailableOutgoingBitrate: 600000,
    maxSctpMessageSize: 262144,
    appData: { direction: side }
  })
  
   console.log(`Transport created: ${transport.id}, ICE candidates:`, transport.iceCandidates)
  return transport
}

const getWorker = () => worker;
const getRouter = () => router;

module.exports = { createWorker, createTransport, getWorker, getRouter };