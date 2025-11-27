const mediasoup = require('mediasoup')

const workerSettings = {
  logLevel: 'warn',
  rtcMinPort: 10000,
  rtcMaxPort: 10100
}

const routerOptions = {
  mediaCodecs: [
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
    { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
  ]
}

let worker
let router

const ANNOUNCED_IP = '172.21.50.88'

const createWorker = async () => {
  if (worker) return
  worker = await mediasoup.createWorker(workerSettings)
  worker.on('died', () => process.exit(1))
  router = await worker.createRouter({ mediaCodecs: routerOptions.mediaCodecs })
}

const createTransport = async (side, routerParam) => {
  const transport = await routerParam.createWebRtcTransport({
    listenIps: [{ ip: '0.0.0.0', announcedIp: ANNOUNCED_IP }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    appData: { direction: side }
  })
  return transport
}

const getWorker = () => worker
const getRouter = () => router

module.exports = { createWorker, createTransport, getWorker, getRouter }
