import { buildSchema } from "graphql"
import express from "express";
import mongoose from "mongoose";
import { ApolloServer, gql } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolver } from "./resolver";

const app = express();
const server = new ApolloServer({
    typeDefs,
    resolver
})
const port = 3000;

server.applyMiddleware({app})

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});