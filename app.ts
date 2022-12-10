import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolver";
import cors from 'cors';

//CONST AND VAR INICIALIZATION:

const app = express();

const port = 3000;

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var db;


//START SERVER CONFIGURATIONS:

let apolloServer = null;
async function startServer() {
  apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
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


//BODY PARSER:

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());



//ROUTES:


//USER ROUTES



  //TEST ROUTE:
app.get('/', (req, res) => {
  res.send({status : true});
})


  //REGISTER USER ROUTE:
app.post('/signUp', (req, res) => {

  let dataUpdatedUserStatus, processedDataUpdatedUserStatus;

  //DataBase operations:
  async function DBOperations() {
    await apolloServer.executeOperation({
      query: 'mutation CreateUser($email: String!, $password: String!, $role: String, $team: String, $userType: Int, $fullName: String, $valuePerHour: Int) {createUser(email: $email, password: $password, role: $role, team: $team, userType: $userType, fullName: $fullName, valuePerHour: $valuePerHour) {email fullName hoursWorked id password role tasks team userType valuePerHour}}',
      variables: { email: req.body.email, password: req.body.password, role: req.body.role, team: req.body.team, userType: req.body.userType, fullName: req.body.fullName, valuePerHour: req.body.valuePerHour },
    });
  }
  try{
    DBOperations();
  }catch(err){
    res.send({status : false, ERROR: true});

    return 0;
  }
  res.send({status : true, ERROR: false});
});



  //LOGIN USER ROUTE:
app.post('/signIn', async (req, res) => {

  let data, processedData;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query: 'query Users {Users {email id password}}',
      variables: { },
    });
  }
  try{
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).Users
  }catch(err){
    res.send({status : false, ERROR : true});

    return 0;
  }
 
  //Login conditions and responses:
  for (var i=0 ; i < processedData.length ; i++)
  {
    if (processedData[i].email == req.body.email) {
      if (processedData[i].password == req.body.password) {
        res.send({status : true, role: processedData[i].role, team: processedData[i].team, userType: processedData[i].userType, fullName: processedData[i].fullName, userID: processedData[i].id});
        return 0;
      }
    }else if(i === processedData.length - 1){
      res.send({status : false, ERROR : false});
      return 0;
    }
  }
});



  //GET USER BY ID ROUTE:
app.get('/getUserByID', async (req, res) => {

  let data, processedData;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query: 'query getUserById($id: ID!) {getUserById(ID: $id) {email role team userType fullName valuePerHour id}}',
      variables: { id: req.body.userID },
    });
  }
  try{
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).getUserById
  }catch(err){
    res.send({status : false});

    return 0;
  }

  res.send({status : true, email: processedData.email, role: processedData.role, team: processedData.team, userType: processedData.userType, fullName: processedData.fullName, valuePerHour: processedData.valuePerHour});
  return 0;
});



  //GET ALL USERS ROUTE:
app.get('/getAllUsers', async (req, res) => {

  let data, processedData;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query: 'query Users {Users {id email role team fullName valuePerHour hoursWorked}}',
      variables: { },
    });
  }
  try{
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).Users
  }catch(err){
    res.send({status : false});

    return 0;
  }

  res.send(processedData);
  return 0;
});



  //GET USER BY ID ROUTE:
app.delete('/deleteUser', async (req, res) => {

  let data, dataDeletedUserStatus, processedData, processedDataDeletedUserStatus;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query: 'query getUserById($id: ID!) {getUserById(ID: $id) {email role team userType fullName valuePerHour id hoursWorked}}',
      variables: { id: req.body.userID },
    });

    dataDeletedUserStatus = await apolloServer.executeOperation({
      query: 'mutation DeleteUser($deleteUserId: ID!) {deleteUser(id: $deleteUserId)}',
      variables: { deleteUserId: req.body.userID },
    });
  }
  try{
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).getUserById
    processedDataDeletedUserStatus = JSON.parse(JSON.stringify(dataDeletedUserStatus.data)).deleteUser
  }catch(err){
    res.send({ status : processedDataDeletedUserStatus });

    return 0;
  }

  if(processedData.valuePerHour == true && processedData.hoursWorked == true || processedData.valuePerHour != null && processedData.hoursWorked != null){
    let mustBePaid = processedData.valuePerHour * processedData.hoursWorked;
    res.send({ status : processedDataDeletedUserStatus, mustBePaid : mustBePaid });
  }else{
    res.send({ status : processedDataDeletedUserStatus, mustBePaid : 0 });
  }

  return 0;
});



  //EDIT USER DATA ROUTE:
app.put('/editUser', async (req, res) => {

  let dataEditUserStatus, processedDataEditUserStatus;

  //DataBase operations:
  async function DBOperations() {
    dataEditUserStatus = await apolloServer.executeOperation({
      query: 'mutation Mutation($updateUserId: ID!, $email: String, $role: String, $team: String, $userType: Int, $fullName: String, $valuePerHour: Int) {updateUser(id: $updateUserId, email: $email, role: $role, team: $team, userType: $userType, fullName: $fullName, valuePerHour: $valuePerHour)}',
      variables: { updateUserId: req.body.userId, email: req.body.email, role: req.body.role, team: req.body.team, userType: req.body.userType, fullName: req.body.fullName, valuePerHour: req.body.valuePerHour },
    });
  }
  try{
    await DBOperations();

    //Collected data:
    processedDataEditUserStatus = JSON.parse(JSON.stringify(dataEditUserStatus.data)).updateUser
  }catch(err){
    res.send({status : false, ERROR : true});

    return 0;
  }

  res.send({status : processedDataEditUserStatus, ERROR : false});
  
});


app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});

