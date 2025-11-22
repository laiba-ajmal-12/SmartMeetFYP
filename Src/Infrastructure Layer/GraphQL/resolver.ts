//@ts-ignore
import { userDbRepo } from "../Database/userRepo.ts/userDb.ts";
//@ts-ignore
import { OrganizationMemberDbRepo } from "../Database/Member/OrganizationMember.ts";
//@ts-ignore
import { OrganizationDbRepo } from "../Database/OrganizationRepo/organization.ts";
//@ts-ignore
import { MeetingDbRepo } from "../Database/Meeting/meetingRepo.ts";

const userFetcher:userDbRepo = new userDbRepo()
const organmMember:OrganizationMemberDbRepo = new OrganizationMemberDbRepo();
const organ:OrganizationDbRepo = new OrganizationDbRepo();
const meetings:MeetingDbRepo = new MeetingDbRepo(); 

export const resolvers = {
  Query: {
        getUserbyId: async (_:any, args:any , context:any) =>{
            return await userFetcher.getUserbyId(context.userId);
        },

        getOrganizationbyId:async (_:any, args:any , context:any)=>{
            return await organ.getOrganizationById(args.id);
        },
        getMeetingById:async (_:any , args:any , context:any)=>{
            return await meetings.getMeetingbyid(args.id)
        }
        
  },

  Users: {
    member:async (obj:any)=>{
        return await organmMember.getOrganizationByMember(obj.id);
    }
  },
  OrganizationMember:{
    organization: async (obj:any)=>{
        return await organ.getOrganizationById(obj.organizationId);
    },
    user:async (obj:any) =>{
        return await userFetcher.getUserbyId(obj.userId);
    }
  },
  Organization:{
    meeting: async (obj:any)=>{
        return await meetings.getMeetingbyOrganization(obj.id);
    },
    members: async (obj:any) =>{
        return await organmMember.getAllMemberByOrganiztion(obj.id);
    }
  },
  Meeting:{
    organization: async (obj:any) =>{
        return await organ.getOrganizationById(obj.organizationId);
    },
    host: async (obj:any) =>{
        return await userFetcher.getUserbyId(obj.hostId)
    }
  }

};


