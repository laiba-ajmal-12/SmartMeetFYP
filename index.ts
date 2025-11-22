//@ts-ignore
import userRouter from "./Src/Presnetation Layer/userRoutes/users.ts";
import express from "express";
import { ApolloServer } from "@apollo/server";
import bodyParser from 'body-parser';
//@ts-ignore
import cors from "cors";
//@ts-ignore
import { resolvers } from "./Src/Infrastructure Layer/GraphQL/resolver.ts";
import { readFileSync } from "fs";
//@ts-ignore
import organRoute from "./Src/Presnetation Layer/OrganizationRoutes/organization.ts";
//@ts-ignore
import MemberRoute from "./Src/Presnetation Layer/MemberRoutes/Members.ts";
//@ts-ignore
import MeetingRoute from "./Src/Presnetation Layer/MeetingRoutes/Meeting.ts";

import path from "path";

const app = express();
const port = 3000;
const json = bodyParser.json;

// TypeDefs
const typeDefs = readFileSync(
  path.join("./Src/Infrastructure Layer/GraphQL/schema.graphql"),
  "utf-8"
);

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    json(),
    (req, res, next) => {
      server
        .executeOperation({
          query: req.body.query,
          variables: req.body.variables,
        })
        .then((result) => res.json(result))
        .catch(next);
    }
  );

  app.use("/api", userRouter);
  app.use('/api' , organRoute);
  app.use('/api' , MeetingRoute);
  app.use('/api' ,  MemberRoute);

  app.get("/check", (req, res) => {
    console.log('server checked!')
    res.status(200).json("Everything is okay");
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();
