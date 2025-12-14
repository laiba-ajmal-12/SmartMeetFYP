import { MediaService } from './serverServices.js'

export class MediaRoutes {
  constructor(socket, roomId, localVideo, remoteContainer, screenShareContainer) {
    this.service = new MediaService(socket, roomId)
    this.localVideo = localVideo
    this.remoteContainer = remoteContainer
    this.screenShareContainer = screenShareContainer
    this.isSending = false

    socket.on('newProducer', async ({ producerId, socketId, kind, isScreen }) => {
      if (!this.service.producersList.includes(producerId)) {
        this.service.producersList.push(producerId)
      }
      
      this.service.producerIsScreenMap[producerId] = !!isScreen
      
      await this.waitForConsumerSetup()
      if (!this.service.consumingConsumers[producerId]) {
        await this.service.consumeProducer(
          producerId,
          this.remoteContainer,
          this.screenShareContainer,
          !!isScreen
        )
      }
      
      this._notify()
    })

    socket.on('screenShareStopped', ({ socketId }) => {
      this.screenShareContainer.innerHTML = ''
      this.service._notifyScreenShare({ isSharing: false, sharerId: null })
    })

    this.service.subscribe((participants) => {
      this._notify()
    })
  }

  async waitForConsumerSetup() {
    let attempts = 0
    while ((!this.service.consumerTransport || !this.service.device?.rtpCapabilities) && attempts < 100) {
      await new Promise(res => setTimeout(res, 50))
      attempts++
    }
  }

  async joinRoom() {
    await this.service.joinRoom()
  }

  async leaveRoom() {
    this.isSending = false
    await this.service.leaveRoom()
  }

  async startSending() {
    await this.service.loadDevice()
    const params = await this.service.createTransport('send')
    this.service.producerTransport = this.service.device.createSendTransport(params)

    this.service.producerTransport.on('connect', async ({ dtlsParameters }, cb) => {
      await this.service.connectTransport(this.service.producerTransport.id, dtlsParameters)
      cb()
    })

    this.service.producerTransport.on('produce', async ({ kind, rtpParameters, appData = {} }, cb) => {
      const id = await this.service.produce(kind, rtpParameters, appData)
      cb({ id })
    })

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      this.service.localStream = stream
      this.localVideo.srcObject = stream
      
      await new Promise((resolve) => {
        this.localVideo.onloadedmetadata = () => {
          resolve()
        }
        setTimeout(resolve, 1000)
      })

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        await this.service.producerTransport.produce({ 
          track: videoTrack,
          appData: { isScreen: false }
        })
      }

      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        await this.service.producerTransport.produce({ 
          track: audioTrack,
          appData: { isScreen: false }
        })
      }
      
      this.localVideo.play()
      
    } catch (error) {
      alert('Could not access camera/microphone. Please check permissions.')
    }
  }

  async startReceiving() {
    await this.service.loadDevice()
    const params = await this.service.createTransport('recv')
    this.service.consumerTransport = this.service.device.createRecvTransport(params)

    this.service.consumerTransport.on('connect', async ({ dtlsParameters }, cb) => {
      await this.service.connectTransport(this.service.consumerTransport.id, dtlsParameters)
      cb()
    })

    const producers = await this.service.getProducers()
    
    for (const p of producers) {
      const isScreen = this.service.producerIsScreenMap[p.id] || false
      if (!this.service.consumingConsumers[p.id]) {
        await this.service.consumeProducer(p.id, this.remoteContainer, this.screenShareContainer, isScreen)
      }
    }
  }

  async startScreenShare() {
    try {
      const result = await this.service.emitAsync('startScreenShare', { roomId: this.service.roomId });
      if (result.error) {
        alert(result.error);
        return;
      }
      
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          frameRate: { ideal: 30 },
          width: { max: 1920 },
          height: { max: 1080 }
        }, 
        audio: false 
      })
      
      this.service.screenStream = screenStream
      const screenTrack = screenStream.getVideoTracks()[0]
      
      if (screenTrack) {
        this.screenProducer = await this.service.producerTransport.produce({ 
          track: screenTrack, 
          appData: { isScreen: true } 
        })
        
        screenTrack.onended = () => {
          this.stopScreenShare()
        }
      }
      
      this.service._notifyScreenShare({ isSharing: true, sharerId: this.service.socket.id })
      
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        console.error('Screen share error:', error);
      }
      await this.service.emitAsync('stopScreenShare', { roomId: this.service.roomId });
    }
  }

  async stopScreenShare() {
    if (this.screenProducer) {
      this.screenProducer.close()
      this.screenProducer = null
    }
    
    if (this.service.screenStream) {
      this.service.screenStream.getTracks().forEach(t => t.stop())
      this.service.screenStream = null
    }

    await this.service.emitAsync('stopScreenShare', { roomId: this.service.roomId })
    this.service._notifyScreenShare({ isSharing: false, sharerId: null })
  }

  toggleMute() {
    const result = this.service.toggleMute()
    return result
  }

  toggleVideo() {
    const result = this.service.toggleVideo()
    return result
  }

  handleChat(text, roomId) {
    const message = {
      id: crypto.randomUUID(),
      senderId: this.service.socket.id,
      sender: "You", // This will be overwritten by server with actual name
      text,
      time: new Date().toLocaleTimeString(),
    };

    this.service.socket.emit("chatMessage", {
      msg: message,
      roomId
    });

    return message
  }

  getParticipants() {
    return this.service.participants
  }

  _notify() {
    this.service._notify()
  }

  subscribe(fn) {
    this.service.subscribe(fn)
  }

  _notifyChat() {
    this.service._notifyChat()
  }
  
  subscribeChat(fn) {
    this.service.subscribeChat(fn)
  }

  _notifyScreenShare(data) {
    this.service._notifyScreenShare(data)
  }

  subscribeScreenShare(fn) {
    this.service.subscribeScreenShare(fn)
  }
}