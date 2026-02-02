import express from "express"
import dotenv from "dotenv"
import { StreamClient } from "@stream-io/node-sdk"
//@ts-ignore
import { OrganizationDbRepo } from "../../Infrastructure/Database/OrganizationRepo/organization.js"
//@ts-ignore
import { ApplicationError } from "../../BusinessLogic/ErrorHandling/appErrors.js"
//@ts-ignore
import { verifyUser } from "../MiddleWares/jwtAuthMiddleware.js"
//@ts-ignore
import { MeetingService } from "../../BusinessLogic/meetings/meetingService.js"
//@ts-ignore
import { MeetingDbRepo } from "../../Infrastructure/Database/Meeting/meetingRepo.js"
import type { MeetingDTOs } from "../../Domain/DTOs/MeetingDTOs/meetingDTOs.js"
import type { MeetingParticipantDto } from "../../Domain/DTOs/MeetingDTOs/meetingDTOs.js"
//@ts-ignore
import { createMeeting, getMeeting, endMeeting } from "../MeetingSession/session.js"

dotenv.config()

const MeetingRoute = express.Router()

const meetingService: MeetingService = new MeetingService(
  new OrganizationDbRepo(),
  new MeetingDbRepo()
)

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key or secret missing")
}

const serverClient = new StreamClient(apiKey, apiSecret)

MeetingRoute.post("/CreateMeeting", verifyUser, async (req, res) => {
  try {
    const meeting = req.body

    const meetingCreated: MeetingDTOs = {
      id: meeting.id,
      name: meeting.name,
      description: meeting.description,
      organizationId: Number(meeting.organizationId),
      startTime: new Date(`${meeting.date}T${meeting.time}:00`),
      daily: meeting.daily === true || meeting.daily === "true",
      EnableEngagement:
        meeting.EnableEngagement === true ||
        meeting.EnableEngagement === "true",
      weekly: meeting.weekly,
      hostId: Number(meeting.hostId),
      meetingDuration: Number(meeting.meetingDuration),
      meetingLink: meeting.meetingLink,
      Engagment: Number(meeting.Engagment)
    }

    const created = await meetingService.createMeeting(meetingCreated)
    return res.status(201).json(created)
  } catch (error) {
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({ message: error.message })
    }
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

MeetingRoute.put("/UpdateMeeting", verifyUser, async (req, res) => {
  try {
    const meeting: MeetingDTOs = req.body
    const updated = await meetingService.updateMeeting(meeting)
    return res.status(200).json(updated)
  } catch (error) {
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({ message: error.message })
    }
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

MeetingRoute.delete(
  "/DeleteMeeting/:meetingID",
  verifyUser,
  async (req: any, res) => {
    try {
      const meetingId = Number(req.params.meetingID)
      await meetingService.cancelMeeting(req.user.id, meetingId)
      return res.status(204).send()
    } catch (error) {
      if (error instanceof ApplicationError) {
        return res.status(error.status).json({ message: error.message })
      }
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
)

MeetingRoute.post("/JoinMeeting", verifyUser, async (req: any, res) => {
  try {
    const { data: user, meetingId } = req.body
    if (!user) {
      return res.status(400).json({ message: "User data missing" })
    }
    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID missing" })
    }

    const meetingIdNum = Number(meetingId)
    if (Number.isNaN(meetingIdNum)) {
      return res.status(400).json({ message: "Invalid meeting ID" })
    }

    await serverClient.upsertUsers([
      {
        id: String(user.id),
        role: user.role === "Host" ? "admin" : "user",
        name: user.name,
        image: user.ImagePath
      }
    ])

    const hostId = user.role === "Host" ? user.id : null
    if (!getMeeting(String(meetingIdNum))) {
      createMeeting(String(meetingIdNum), hostId)
    }

    const meeting = getMeeting(String(meetingIdNum))
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }

    meeting.participants.set(user.id, {
      userId: user.id,
      name: user.name,
      isActive: true,
      cameraOn: true,
      currentJoinTime: new Date(),
      totalActiveSeconds: 0,
      attentionSum: 0,
      gazeSum: 0,
      faceSum: 0,
      samples: 0
    })

    const token = serverClient.createToken(String(user.id))
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        ImagePath: user.ImagePath,
        role: user.role
      }
    })
  } catch (error) {
    console.error("JoinMeeting error:", error)
    return res.status(500).json({ message: "Failed to join meeting" })
  }
})

MeetingRoute.post("/metrics", async (req: any, res) => {
  try {
    const { meetingId, userId, attention, gaze, face, window } = req.body
    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
    const p = meeting.participants.get(userId)
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    if (!p.isActive || !p.cameraOn) {
      return res.send({ ignored: true })
    }
    p.totalActiveSeconds += window || 5
    p.attentionSum += attention || 0
    p.gazeSum += gaze || 0
    p.faceSum += face || 0
    p.samples++
    console.log("Particiapnt stats here are : ", p)
    return res.send({ ok: true })
  } catch (error) {
    console.error("Metrics error:", error)
    return res.status(500).json({ message: "Failed to update metrics" })
  }
})

MeetingRoute.post("/camera-off", async (req, res) => {
  try {
    const { meetingId, userId } = req.body
    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
    const p = meeting.participants.get(userId)
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    p.cameraOn = false
    return res.send({ ok: true })
  } catch (error) {
    console.error("Camera-off error:", error)
    return res.status(500).json({ message: "Failed to update camera state" })
  }
})

MeetingRoute.post("/camera-on", async (req, res) => {
  try {
    const { meetingId, userId } = req.body
    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
    const p = meeting.participants.get(userId)
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    p.cameraOn = true
    return res.send({ ok: true })
  } catch (error) {
    console.error("Camera-on error:", error)
    return res.status(500).json({ message: "Failed to update camera state" })
  }
})

MeetingRoute.post("/leave", async (req, res) => {
  try {
    const { meetingId, userId } = req.body

    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
  
    const p = meeting.participants.get(userId)
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    p.isActive = false

    console.log("Participant left the meeting")
    return res.send({ ok: true })
  } catch (error) {
    console.error("Leave error:", error)
    return res.status(500).json({ message: "Failed to leave meeting" })
  }
})

MeetingRoute.post("/end", verifyUser, async (req, res) => {
  try {
    const { meetingId } = req.body
    if (!meetingId) {
      return res.status(400).json({ ok: false, message: "meetingId required" })
    }
    const meeting = getMeeting(meetingId)
    console.log("Host ended the meeting !")
    if (!meeting) {
      return res.status(404).json({ ok: false, message: "Meeting not found" })
    }
    const meetingEndTime = Date.now()
    const meetingDurationSeconds =
      Math.floor((meetingEndTime - meeting.startTime) / 1000)
    for (const participant of meeting.participants.values()) {
      const {
        userId,
        totalActiveSeconds,
        attentionSum,
        gazeSum,
        faceSum,
        samples
      } = participant
      const avgAttention = samples > 0 ? attentionSum / samples : 0
      const avgGaze = samples > 0 ? gazeSum / samples : 0
      const avgFace = samples > 0 ? faceSum / samples : 0
      const meetingSession: MeetingParticipantDto = {
        id: Number(meetingId),
        userId: Number(participant.userId),
        meetingId: Number(meetingId),
        avgAttention: avgAttention,
        avgFace: avgFace,
        avgGaze: avgGaze,
        totalActiveSeconds: participant.totalActiveSeconds,
        firstJoinTime: participant.currentJoinTime,
        lastLeaveTime: new Date()
      }
      await meetingService.createMeetingParticipant(meetingSession)
    }
    endMeeting(meetingId)
    return res.status(200).json({
      ok: true,
      message: "Meeting ended and stats finalized"
    })
  } catch (error) {
    console.error("End meeting error:", error)
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({ message: error.message })
    }
    return res.status(500).json({ message: "Failed to end meeting" })
  }
})

export default MeetingRoute
