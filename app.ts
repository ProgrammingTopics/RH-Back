import { buildSchema } from "graphql"
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolver";

const app = express();

const port = 3000;

const mongoose = require('mongoose');

let apolloServer = null;
async function startServer() {
  apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  try{
    await mongoose.connect("mongodb+srv://MarceloJM:IgorShinji@rhapplication0.c56rxpp.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});
  }catch(err){
    console.log(err);
  }
}


startServer();

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});