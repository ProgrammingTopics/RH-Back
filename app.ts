import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolver";
import cors from "cors";

//CONST AND VAR INICIALIZATION:

const app = express();

const port = 8080;

const crossOrigin = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
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

  try {
    await mongoose.connect(
      "mongodb+srv://MarceloJM:IgorShinji@rhapplication0.c56rxpp.mongodb.net/?retryWrites=true&w=majority",
      { useNewUrlParser: true }
    );
  } catch (err) {
    console.log(err);
  }
}
db = mongoose.connection;
startServer();

//BODY PARSER:

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//CORS:

app.use(
  crossOrigin({
    origin: "*",
  })
);

//ROUTES:

//USER ROUTES

//REGISTER USER ROUTE:
app.post("/signUp", (req, res) => {
  let data, precessedData;

  //DataBase operations:
  async function DBOperations() {
    await apolloServer.executeOperation({
      query:
        "mutation CreateUser($email: String!, $password: String!, $role: String!, $team: String!, $userType: String!, $fullName: String!, $valuePerHour: Int!, $lastTimeStamp: Int, $hoursWorked: Int) {createUser(email: $email, password: $password, role: $role, team: $team, userType: $userType, fullName: $fullName, valuePerHour: $valuePerHour, lastTimeStamp: $lastTimeStamp, hoursWorked: $hoursWorked) {email fullName hoursWorked id password role tasks team userType valuePerHour lastTimeStamp hoursWorked}}",
      variables: {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        team: req.body.team,
        userType: req.body.userType,
        fullName: req.body.fullName,
        valuePerHour: parseInt(req.body.valuePerHour),
        lastTimeStamp: 0,
        hoursWorked: 0,
      },
    });
  }
  try {
    DBOperations();
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({ status: true });
});

//LOGIN USER ROUTE:
app.post("/signIn", async (req, res) => {
  let data, processedData;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query:
        "query Users {Users {id role team userType fullName password email}}",
      variables: {},
    });
  }
  try {
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).Users;
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  //Login conditions and responses:
  for (var i = 0; i < processedData.length; i++) {
    if (processedData[i].email == req.body.email) {
      if (processedData[i].password == req.body.password) {
        res.send({
          status: true,
          role: processedData[i].role,
          team: processedData[i].team,
          userType: "Manager",
          fullName: processedData[i].fullName,
          userID: processedData[i].id,
        });
        return 0;
      }
    } else if (i === processedData.length - 1) {
      res.send({ status: false });
      return 0;
    }
  }
});

//GET USER BY ID ROUTE:
app.get("/getUserByID", async (req, res) => {
  let data, processedData;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query:
        "query getUserById($id: ID!) {getUserById(ID: $id) {email role team userType fullName valuePerHour id}}",
      variables: { id: req.query.userID },
    });
  }
  try {
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).getUserById;
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({
    status: true,
    email: processedData.email,
    role: processedData.role,
    team: processedData.team,
    userType: processedData.userType,
    fullName: processedData.fullName,
    valuePerHour: processedData.valuePerHour,
  });
  return 0;
});

//GET ALL USERS ROUTE:
app.get("/getAllUsers", async (req, res) => {
  let data, processedData;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query:
        "query Users {Users {id email role team fullName valuePerHour hoursWorked userType}}",
      variables: {},
    });
  }
  try {
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).Users;
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send(processedData);
  return 0;
});

//GET USER BY ID ROUTE: !
app.delete("/deleteUser", async (req, res) => {
  let data,
    dataDeletedUserStatus,
    processedData,
    processedDataDeletedUserStatus;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query:
        "query getUserById($id: ID!) {getUserById(ID: $id) {email role team userType fullName valuePerHour id hoursWorked}}",
      variables: { id: req.query.userId },
    });

    dataDeletedUserStatus = await apolloServer.executeOperation({
      query:
        "mutation DeleteUser($deleteUserId: ID!) {deleteUser(id: $deleteUserId)}",
      variables: { deleteUserId: req.query.userId },
    });
  }
  try {
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).getUserById;
    processedDataDeletedUserStatus = JSON.parse(
      JSON.stringify(dataDeletedUserStatus.data)
    ).deleteUser;
  } catch (err) {
    res.send({ status: processedDataDeletedUserStatus });
    return 0;
  }

  if (
    (processedData.valuePerHour == true && processedData.hoursWorked == true) ||
    (processedData.valuePerHour != null && processedData.hoursWorked != null)
  ) {
    let mustBePaid = processedData.valuePerHour * processedData.hoursWorked;
    res.send({
      status: processedDataDeletedUserStatus,
      mustBePaid: mustBePaid,
    });
  } else {
    res.send({ status: processedDataDeletedUserStatus, mustBePaid: 0 });
  }

  return 0;
});

//EDIT USER DATA ROUTE:
app.put("/editUser", async (req, res) => {
  let dataEditUserStatus, processedDataEditUserStatus, dataUser, processedDataUser;

  //DataBase operations:
  async function DBOperations() {
    dataUser = await apolloServer.executeOperation({
      query:
        "query getUserById($id: ID!) {getUserById(ID: $id) {email role team userType fullName valuePerHour id hoursWorked}}",
      variables: { id: req.query.userId },
    });
    
    processedDataUser = JSON.parse(
      JSON.stringify(dataEditUserStatus.data)
    ).getUserById.userType;

    if(req.body.userType){
      dataEditUserStatus = await apolloServer.executeOperation({
        query:
          "mutation Mutation($updateUserId: ID!, $email: String!, $role: String, $team: String, $userType: String, $fullName: String, $valuePerHour: Int) {updateUser(id: $updateUserId, email: $email, role: $role, team: $team, userType: $userType, fullName: $fullName, valuePerHour: $valuePerHour)}",
        variables: {
          updateUserId: req.body.userId,
          email: req.body.email,
          role: req.body.role,
          team: req.body.team,
          userType: processedDataUser,
          fullName: req.body.fullName,
          valuePerHour: parseInt(req.body.valuePerHour),
        },
      });
    }else{
      dataEditUserStatus = await apolloServer.executeOperation({
        query:
          "mutation Mutation($updateUserId: ID!, $email: String!, $role: String, $team: String, $userType: String, $fullName: String, $valuePerHour: Int) {updateUser(id: $updateUserId, email: $email, role: $role, team: $team, userType: $userType, fullName: $fullName, valuePerHour: $valuePerHour)}",
        variables: {
          updateUserId: req.body.userId,
          email: req.body.email,
          role: req.body.role,
          team: req.body.team,
          userType: req.body.userType,
          fullName: req.body.fullName,
          valuePerHour: parseInt(req.body.valuePerHour),
        },
      });
    }
  }
  try {
    await DBOperations();

    //Collected data:
    processedDataEditUserStatus = JSON.parse(
      JSON.stringify(dataEditUserStatus.data)
    ).updateUser;

  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({ status: processedDataEditUserStatus });
});

//SET INITIAL WORK ROUTINE:
app.post("/initialWorkRoutine", async (req, res) => {
  let dataUpdateTimeStampStatus, processedDataUpdateTimeStampStatus, dataUserTimeStamp, processedDataUserTimeStamp;

  //DataBase operations:
  async function DBOperations() {
    dataUserTimeStamp = await apolloServer.executeOperation({
      query:
        "query GetUserById($id: ID!) {getUserById(ID: $id) {lastTimeStamp}}",
      variables: {
        id: req.body.userId
      },
    });

    processedDataUserTimeStamp = JSON.parse(
      JSON.stringify(dataUserTimeStamp.data)
    ).getUserById.lastTimeStamp;

    console.log(processedDataUserTimeStamp);

    if(processedDataUserTimeStamp == null){
      dataUpdateTimeStampStatus = await apolloServer.executeOperation({
        query:
          "mutation Mutation($setTimeStampId: ID!, $lastTimeStamp: Int) {setTimeStamp(id: $setTimeStampId, lastTimeStamp: $lastTimeStamp)}",
        variables: {
          setTimeStampId: req.body.userId,
          lastTimeStamp: parseInt(req.body.TimeStamp),
        },
      });
    }else{
      res.send({ status: false });
      return 0;
    }
  }
  try {
    await DBOperations();

    //Collected data:
    processedDataUpdateTimeStampStatus = JSON.parse(
      JSON.stringify(dataUpdateTimeStampStatus.data)
    ).setTimeStamp;
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({ status: processedDataUpdateTimeStampStatus });
});

//SET FINAL WORK ROUTINE:
app.post('/closedWorkRoutine',async (req, res) => {
  let dataUpdateTimeStampStatus, processedDataUpdateTimeStampStatus, 
  dataUserTimeStamp, processedDataUserTimeStamp, processedDataUserhoursWorked, calculatedWorkedJourney, hoursWorked;

  async function DBOperations() {
    dataUserTimeStamp = await apolloServer.executeOperation({
      query:
        "query GetUserById($id: ID!) {getUserById(ID: $id) {lastTimeStamp hoursWorked}}",
      variables: {
        id: req.body.userId
      },
    });

    console.log(dataUserTimeStamp);
    processedDataUserTimeStamp = JSON.parse(
      JSON.stringify(dataUserTimeStamp.data)
    ).getUserById.lastTimeStamp;

    console.log(processedDataUserTimeStamp);

    processedDataUserhoursWorked = JSON.parse(
      JSON.stringify(dataUserTimeStamp.data)
      ).getUserById.housWorked;

    if(processedDataUserTimeStamp != null){
      console.log("Entrei");
      calculatedWorkedJourney = parseInt(req.body.TimeStamp) - processedDataUserTimeStamp;
      console.log(calculatedWorkedJourney);
      const date= new Date(calculatedWorkedJourney);
      hoursWorked = date.getHours();
      if(hoursWorked > 8){
        hoursWorked = 8;
      }
      hoursWorked += processedDataUserhoursWorked;
      console.log(processedDataUserhoursWorked)

        processedDataUpdateTimeStampStatus = await apolloServer.executeOperation({
          query: "mutation Mutation($Id: ID!, $housWorked: Int, $lastTimeStamp: Int) {setTimeStamp(id: $Id, lastTimeStamp: $lastTimeStamp)setTimeHoursWorked(id: $Id, housWorked: $housWorked)}",
          variables:{
            Id: req.body.userId,
            lastTimeStamp: null,
            housWorked: hoursWorked
          }
        })
        console.log(processedDataUpdateTimeStampStatus);
    }else{
      res.send({ status: false });
      return 0; 
    }
  }

  try {
    await DBOperations();

    //Collected data:
    processedDataUpdateTimeStampStatus = JSON.parse(
      JSON.stringify(dataUpdateTimeStampStatus.data)
    );
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({ status: processedDataUpdateTimeStampStatus });
 
});

//TO DELEGATE TASK ROUTE:
app.post("/delegateTask", async (req, res) => {
  let dataDelegateTaskStatus,
    processedDataDelegateTaskStatus,
    dataAllTasks,
    processedDataAllTasks,
    taskName,
    taskId;

  //Create task function:
  async function CreateTask() {
    taskId = await apolloServer.executeOperation({
      query:
        "mutation CreateTask($name: String!) {createTask(name: $name) {id}}",
      variables: { name: req.body.name },
    });

    taskId = JSON.parse(JSON.stringify(taskId.data)).createTask.id;

    await apolloServer.executeOperation({
      query:
        "mutation UpdateTask($updateTaskId: ID!, $description: String, $githubUrl: String) {updateTask(id: $updateTaskId, description: $description, github_url: $githubUrl)}",
      variables: {
        updateTaskId: taskId,
        description: req.body.description,
        githubUrl: req.body.githubUrl,
      },
    });
  }

  //DataBase operations:
  async function DBOperations() {
    dataAllTasks = await apolloServer.executeOperation({
      query: "query Tasks {Tasks {id name}}",
      variables: {},
    });

    processedDataAllTasks = JSON.parse(JSON.stringify(dataAllTasks.data)).Tasks;

    if (processedDataAllTasks.length == 0) {
      CreateTask();
    } else {
      //Match the gave task name to an existing one to find the ID if it exists, else create a task with req informations.
      for (var i = 0; i < processedDataAllTasks.length; i++) {
        if (processedDataAllTasks[i].name == req.body.name) {
          taskId = processedDataAllTasks[i].id;
          break;
        } else if (i === processedDataAllTasks.length - 1) {
          CreateTask();
        }
      }
    }
    dataDelegateTaskStatus = await apolloServer.executeOperation({
      query:
        "mutation GiveUserTask($userId: ID!, $taskId: ID!) {giveUserTask(userID: $userId, taskID: $taskId)}",
      variables: { userId: req.body.userId, taskId: taskId },
    });
  }
  try {
    await DBOperations();

    //Collected data:
    processedDataDelegateTaskStatus = JSON.parse(
      JSON.stringify(dataDelegateTaskStatus.data)
    ).giveUserTask;
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({ status: processedDataDelegateTaskStatus });
});

//GET USERS BY TEAM:
app.get("/getUsersByTeam", async (req, res) => {
  let data, processedData, usersInTeam;

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query:
        "query Users {Users {team fullName}}",
      variables: {},
    });
  }
  try {
    await DBOperations();

    //Collected data:
    processedData = JSON.parse(JSON.stringify(data.data)).Users;
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  //Login conditions and responses:
  for (var i = 0; i < processedData.length; i++) {
    if (processedData[i].team == req.query.team) {
      usersInTeam.push({fullName: processedData[i].fullName});
      res.send(usersInTeam);
    } else if (i === processedData.length - 1) {
      res.send({ status: false });
      return 0;
    }
  }
});

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});
