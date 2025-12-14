import * as mediasoupClient from "mediasoup-client";

export class MediaService {
  constructor(socket, roomId) {
    this.socket = socket;
    this.roomId = roomId;
    this.device = null;
    this.producerTransport = null;
    this.consumerTransport = null;
    this.producersList = [];
    this.producerIsScreenMap = {};
    this.consumingConsumers = {};
    this.localStream = null;
    this.screenStream = null;
    this.screenProducer = null;

    this.participants = [];
    this.subscribers = [];

    this.messages = [];
    this.messageSubscribers = [];
    
    this.screenShareSubscribers = [];
    
    this.participants.push({
      id: socket.id,
      name: "You",
      hasVideo: true,
      isMuted: false,
      isLocal: true,
      isHost: true,
      videoProducerId: null,
      audioProducerId: null,
      stream: null
    });

    socket.on("peerJoined", ({ socketId, name }) => {
      if (!this.participants.find(p => p.id === socketId)) {
        this.participants.push({
          id: socketId,
          name: name || `User ${socketId.slice(0, 4)}`,
          hasVideo: true,
          isMuted: false,
          isLocal: false,
          isHost: false,
          videoProducerId: null,
          audioProducerId: null,
          stream: null
        });
        this._notify();
      }
    });

    socket.on("peerLeft", ({ socketId, producerIds }) => {
      this.participants = this.participants.filter(p => p.id !== socketId);
      
      // Clean up consumers for the leaving peer's producers
      if (producerIds && Array.isArray(producerIds)) {
        producerIds.forEach(producerId => {
          const consumer = this.consumingConsumers[producerId];
          if (consumer) {
            consumer.close();
            delete this.consumingConsumers[producerId];
            delete this.producerIsScreenMap[producerId];
          }
        });
      }
      
      // Also clean up any remaining consumers for this socketId
      Object.keys(this.consumingConsumers).forEach(producerId => {
        const consumer = this.consumingConsumers[producerId];
        if (consumer && this.producerIsScreenMap[producerId]) {
          // Check if this was a screen share from the leaving peer
          consumer.close();
          delete this.consumingConsumers[producerId];
          delete this.producerIsScreenMap[producerId];
        }
      });
      
      this._notify();
    });

    socket.on("videoToggled", ({ socketId, hasVideo }) => {
      const participant = this.participants.find(p => p.id === socketId);
      if (participant) {
        participant.hasVideo = hasVideo;
        this._notify();
      }
    });

    socket.on("audioToggled", ({ socketId, isMuted }) => {
      const participant = this.participants.find(p => p.id === socketId);
      if (participant) {
        participant.isMuted = isMuted;
        this._notify();
      }
    });

    socket.on("chatMessage", (msg) => {
      this.messages.push(msg);
      this._notifyChat();
    });

    socket.on("newProducer", ({ producerId, socketId, kind, isScreen }) => {
      if (!this.producersList.includes(producerId)) {
        this.producersList.push(producerId);
      }
      
      this.producerIsScreenMap[producerId] = !!isScreen;
   
      const participant = this.participants.find(p => p.id === socketId);
      if (participant) {
        if (kind === "video") {
          if (isScreen) {
            participant.isScreenSharing = true;
          } else {
            participant.videoProducerId = producerId;
            participant.hasVideo = true;
          }
        } else if (kind === "audio") {
          participant.audioProducerId = producerId;
        }
        this._notify();
      }
    });

    socket.on("screenShareStarted", ({ socketId }) => {
      this._notifyScreenShare({ isSharing: true, sharerId: socketId });
    });

    socket.on("screenShareStopped", ({ socketId }) => {
      this._notifyScreenShare({ isSharing: false, sharerId: null });
      
      // Remove screen share consumer if exists
      Object.keys(this.consumingConsumers).forEach(producerId => {
        if (this.producerIsScreenMap[producerId]) {
          const consumer = this.consumingConsumers[producerId];
          if (consumer) {
            consumer.close();
            delete this.consumingConsumers[producerId];
          }
        }
      });
    });
  }

  async emitAsync(event, data) {
    return new Promise(resolve => {
      if (data === undefined) {
        this.socket.emit(event, resolve);
      } else {
        this.socket.emit(event, data, resolve);
      }
    });
  }

  async loadDevice() {
    if (this.device && this.device.loaded) {
      return;
    }
    
    const rtpCapabilities = await this.emitAsync("getRouterRtpCapabilities");
    this.device = new mediasoupClient.Device();
    await this.device.load({ routerRtpCapabilities: rtpCapabilities });
  }

  async joinRoom() {
    const joinResult = await this.emitAsync("joinRoom", this.roomId);
    const participants = joinResult?.participants || [];
    
    participants.forEach(id => {
      if (id !== this.socket.id && !this.participants.find(p => p.id === id)) {
        this.participants.push({
          id,
          name: `User ${id.slice(0, 4)}`,
          hasVideo: true,
          isMuted: false,
          isLocal: false,
          isHost: false,
          videoProducerId: null,
          audioProducerId: null,
          stream: null
        });
      }
    });
    
    this._notify();
  }

  async leaveRoom() {
    try {
      if (this.producerTransport) {
        this.producerTransport._producers?.forEach(p => p.close());
        this.producerTransport.close();
      }
      
      if (this.consumerTransport) {
        Object.values(this.consumingConsumers).forEach(c => c.close());
        this.consumerTransport.close();
      }
      
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }
      
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
      }
      
      this.socket.disconnect();
    } catch (e) {}
  }

  async createTransport(direction) {
    return await this.emitAsync("createTransport", { roomId: this.roomId, direction });
  }

  async connectTransport(transportId, dtlsParameters) {
    await this.emitAsync("connectTransport", { 
      roomId: this.roomId, 
      transportId, 
      dtlsParameters 
    });
  }

  async produce(kind, rtpParameters, appData = {}) {
    const { id } = await this.emitAsync("produce", {
      roomId: this.roomId,
      transportId: this.producerTransport.id,
      kind,
      rtpParameters,
      appData
    });

    const localParticipant = this.participants.find(p => p.isLocal);
    if (localParticipant) {
      if (kind === "video") {
        if (appData.isScreen) {
          localParticipant.isScreenSharing = true;
        } else {
          localParticipant.videoProducerId = id;
          localParticipant.hasVideo = true;
        }
      } else if (kind === "audio") {
        localParticipant.audioProducerId = id;
      }
      this._notify();
    }

    return id;
  }

  async getProducers() {
    const producers = await this.emitAsync("getProducers", this.roomId);
    
    this.producersList = producers.map(p => p.id);
    
    producers.forEach(p => {
      this.producerIsScreenMap[p.id] = p.appData?.isScreen || false;
    });
    
    return producers;
  }

  async consumeProducer(producerId, container, screenShareContainer, isScreen) {
    const data = await this.emitAsync("consume", {
      roomId: this.roomId,
      transportId: this.consumerTransport.id,
      rtpCapabilities: this.device.rtpCapabilities,
      producerId
    });

    if (data?.error) {
      return;
    }

    try {
      const consumer = await this.consumerTransport.consume({
        id: data.id,
        producerId: data.producerId,
        kind: data.kind,
        rtpParameters: data.rtpParameters
      });

      this.consumingConsumers[producerId] = consumer;
      
      const stream = new MediaStream([consumer.track]);

      const socketId = data.socketId;
      if (!socketId) {
        return;
      }

      let participant = this.participants.find(p => p.id === socketId);
      
      if (!participant) {
        return;
      }

      if (consumer.kind === "video" && isScreen) {
        // Clear previous screen share
        screenShareContainer.innerHTML = '';
        
        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = stream;
        video.id = `video-screen-${producerId}`;
        video.className = "w-full h-full object-contain bg-black rounded-lg";
        
        screenShareContainer.appendChild(video);
        
        setTimeout(() => {
          video.play().catch(e => console.log("Screen share play error:", e));
        }, 500);
        
      } else if (consumer.kind === "video") {
        participant.stream = stream;
        participant.hasVideo = true;
        this._notify();
        
      } else if (consumer.kind === "audio") {
        const audio = document.createElement("audio");
        audio.autoplay = true;
        audio.srcObject = stream;
        audio.id = `audio-${producerId}`;
        container.appendChild(audio);
      }

      await consumer.resume();
      
    } catch (err) {
      console.error("Consume error:", err);
    }
  }

  toggleMute() {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      
      const localParticipant = this.participants.find(p => p.isLocal);
      if (localParticipant) {
        localParticipant.isMuted = !newState;
        this._notify();
      }

      this.socket.emit("toggleAudio", {
        roomId: this.roomId,
        isMuted: !newState
      });
      
      return newState;
    }
    return false;
  }

  toggleVideo() {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return false;

    const newState = !videoTrack.enabled;
    videoTrack.enabled = newState;

    const localParticipant = this.participants.find(p => p.isLocal);
    if (localParticipant) {
      localParticipant.hasVideo = newState;
      this._notify();
    }

    this.socket.emit("toggleVideo", {
      roomId: this.roomId,
      hasVideo: newState
    });

    return newState;
  }

  _notify() {
    this.subscribers.forEach(fn => {
      try {
        fn(Object.freeze([...this.participants]));
      } catch (err) {}
    });
  }

  subscribe(fn) {
    this.subscribers.push(fn);
    fn(Object.freeze([...this.participants]));
  }

  _notifyChat() {
    this.messageSubscribers.forEach(fn => {
      try {
        fn(Object.freeze([...this.messages]));
      } catch (err) {}
    });
  }
  
  subscribeChat(fn) {
    this.messageSubscribers.push(fn);
    fn(Object.freeze([...this.messages]));
  }

  _notifyScreenShare(data) {
    this.screenShareSubscribers.forEach(fn => {
      try {
        fn(data);
      } catch (err) {}
    });
  }

  subscribeScreenShare(fn) {
    this.screenShareSubscribers.push(fn);
  }
}