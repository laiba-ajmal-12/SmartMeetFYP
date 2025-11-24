// imports
import  express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
//@ts-ignore
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { readFileSync } from "fs";
import type { Request } from "express";

//@ts-ignore
import organRoute from "./Src/Presnetation Layer/OrganizationRoutes/organization.ts";
//@ts-ignore
import userRoute from "./Src/Presnetation Layer/userRoutes/users.ts";
//@ts-ignore
import MemberRoute from "./Src/Presnetation Layer/MemberRoutes/Members.ts";
//@ts-ignore
import MeetingRoute from "./Src/Presnetation Layer/MeetingRoutes/Meeting.ts";
//@ts-ignore
import { resolvers } from "./Src/Infrastructure Layer/GraphQL/resolver.ts";
//@ts-ignore
import { verifyUser } from "./Src/Presnetation Layer/MiddleWares/jwtAuthMiddleware.ts";

const app = express();
const port = 4000;
const json = bodyParser.json
const typeDefs = readFileSync(
  path.join("./Src/Infrastructure Layer/GraphQL/schema.graphql"),
  "utf-8"
);

const startServer = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors({
    origin: '*',                     // ✅ sab origins allow
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true                // cookies waghera allow
  }));

  app.use(
    "/graphql",
    verifyUser,
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {

      context: async ( {req}) => {
        //@ts-ignore
        console.error('[Context]: ' , req.user?.id)
        //@ts-ignore
        return { userId: req.user?.id };
      },
    })
  );
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
  app.use(cors())
  
  // REST routes
  app.use("/api", userRoute);
  app.use("/api", organRoute);
  app.use("/api", MeetingRoute);
  app.use("/api", MemberRoute);

  app.get("/check", (req:any, res:any) => {
    console.log("server checked!");
    res.status(200).json("Everything is okay");
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();
