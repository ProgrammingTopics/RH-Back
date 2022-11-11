import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolver";
import cors from 'cors';


const app = express();

const port = 3000;

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var db;

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
db = mongoose.connection;
startServer();


app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.post('/signUp', (req, res) => {

  async function DBOperations() {
    await apolloServer.executeOperation({
      query: 'mutation Mutation($email: String!, $password: String!) { createUser(email: $email, password: $password) {email id password}}',
      variables: { email: req.body.email, password: req.body.password },
    });
  }
  try{
    DBOperations();
  }catch(err){
    res.send({signedUp : false});

    return 0;
  }
  res.send({signedUp : true});
});

app.post('/signIn', (req, res) => {

  async function DBOperations() {
    //const response = 
    //console.log(response);
  }
  try{
    DBOperations();
  }catch(err){
    res.send({signedIn : false});

    return 0;
  }
  res.send({signedIn : true});
});

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});