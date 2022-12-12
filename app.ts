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
        "query Users {Users {id role team userType fullName password email lastTimeStamp}}",
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
          userType: processedData[i].userType,
          fullName: processedData[i].fullName,
          userId: processedData[i].id,
          lastTimeStamp: processedData[i].lastTimeStamp,
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
      variables: { id: req.query.userId },
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
  let processedDataArray = [];

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

  processedData.forEach((user) => {
    processedDataArray.push({
      userId: user.id,
      email: user.email,
      role: user.role,
      team: user.team,
      fullName: user.fullName,
      valuePerHour: user.valuePerHour,
      hoursWorked: user.hoursWorked,
      userType: user.userType,
    });
  });

  res.send(processedDataArray);
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
  let dataEditUserStatus,
    processedDataEditUserStatus,
    dataUser,
    processedDataUser;

  //DataBase operations:
  async function DBOperations() {
    dataUser = await apolloServer.executeOperation({
      query:
        "query getUserById($id: ID!) {getUserById(ID: $id) {email role team userType fullName valuePerHour id}}",
      variables: { id: req.query.userId },
    });

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
app.post("/startWorkRoutine", async (req, res) => {
  let dataUpdateTimeStampStatus,
    processedDataUpdateTimeStampStatus,
    dataUserTimeStamp,
    processedDataUserTimeStamp;

  //DataBase operations:
  async function DBOperations() {
    dataUserTimeStamp = await apolloServer.executeOperation({
      query:
        "query GetUserById($id: ID!) {getUserById(ID: $id) {lastTimeStamp}}",
      variables: {
        id: req.body.userId,
      },
    });

    processedDataUserTimeStamp = JSON.parse(
      JSON.stringify(dataUserTimeStamp.data)
    ).getUserById.lastTimeStamp;

    if (processedDataUserTimeStamp == 0) {
      dataUpdateTimeStampStatus = await apolloServer.executeOperation({
        query:
          "mutation Mutation($setTimeStampId: ID!, $lastTimeStamp: Int) {setTimeStamp(id: $setTimeStampId, lastTimeStamp: $lastTimeStamp)}",
        variables: {
          setTimeStampId: req.body.userId,
          lastTimeStamp: parseInt(req.body.timeStamp),
        },
      });
    } else {
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
app.post("/endWorkRoutine", async (req, res) => {
  let dataUpdateTimeStampStatus,
    processedDataUpdateTimeStampStatus,
    dataUserTimeStamp,
    processedDataUserTimeStamp,
    processedDataUserhoursWorked,
    calculatedWorkedJourney,
    hoursWorked;

  async function DBOperations() {
    dataUserTimeStamp = await apolloServer.executeOperation({
      query:
        "query GetUserById($id: ID!) {getUserById(ID: $id) {lastTimeStamp hoursWorked}}",
      variables: {
        id: req.body.userId,
      },
    });

    processedDataUserTimeStamp = JSON.parse(
      JSON.stringify(dataUserTimeStamp.data)
    ).getUserById.lastTimeStamp;

    processedDataUserhoursWorked = JSON.parse(
      JSON.stringify(dataUserTimeStamp.data)
    ).getUserById.hoursWorked;

    if (processedDataUserTimeStamp != 0) {
      console.log("Entrei");
      calculatedWorkedJourney =
        parseInt(req.body.timeStamp) - processedDataUserTimeStamp;

      hoursWorked = processedDataUserhoursWorked + calculatedWorkedJourney;

      await apolloServer.executeOperation({
        query:
          "mutation Mutation($id: ID!, $hoursWorked: Int, $lastTimeStamp: Int) {setTimeStamp(id: $id, lastTimeStamp: $lastTimeStamp) setTimeHoursWorked(id: $id, hoursWorked: $hoursWorked)}",
        variables: {
          id: req.body.userId,
          lastTimeStamp: 0,
          hoursWorked: hoursWorked,
        },
      });
    } else {
      res.send({ status: false });

      return 0;
    }
  }

  try {
    await DBOperations();
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({ status: true });
});

app.post('/createTask', async(req,res)=>{
  let dataCreateTaskStatus,
    processedCreateTaskStatus;

    //DataBase operations:
    async function DBOperations() {
      dataCreateTaskStatus = await apolloServer.executeOperation({
        query:
          "mutation Mutation($name: String!, $description: String, $status: String, $githubUrl: String) {createTask(name: $name, description: $description, status: $status, githubUrl: $githubUrl) {id name githubUrl description}}",
        variables: {
          name: req.body.name, 
          description: req.body.description, 
          status: "onGoing", 
          githubUrl: req.body.githubUrl}
      })
    }

    try{
      await DBOperations();

      //Collected data:
      processedCreateTaskStatus = JSON.parse(JSON.stringify(dataCreateTaskStatus.data)
      ).createTask;
    }catch(err) {
      res.send({status: false});
      return 0;
    }
})

//TO DELEGATE TASK ROUTE:
app.post("/delegateTask", async (req, res) => {
  let dataDelegateTaskStatus,
    processedDataDelegateTaskStatus;


  //DataBase operations:
  async function DBOperations() {
    dataDelegateTaskStatus = await apolloServer.executeOperation({
      query:
        "mutation GiveUserTask($userId: ID!, $taskId: ID!) {giveUserTask(userID: $userId, taskID: $taskId)}",
      variables: { userId: req.body.userId, taskId: req.body.taskId },
    });
    console.log(dataDelegateTaskStatus);
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
  let data, processedData;
  let usersInTeam = [];

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query: "query Users {Users {team fullName id}}",
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

  processedData
    .filter((user) => user.team === req.query.team)
    .forEach((user) => {
      usersInTeam.push({ fullName: user.fullName, userId: user.id });
    });

  if (processedData.length > 0) {
    res.send(usersInTeam);
    return 0;
  }
  res.send({ status: false });
  return 0;
});

//GET TASKS BY USER;
app.get("/getTasksByUser", async (req, res) => {
  let data, processedData, dataTasks;
  let processedDataTasks = [];

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query: "query GetUserById($id: ID!) {getUserById(ID: $id) {tasks}}",
      variables: { id: req.query.userId },
    });

    processedData = JSON.parse(JSON.stringify(data.data)).getUserById.tasks;

    for (var i = 0; i < processedData.length; i++) {
      dataTasks = await apolloServer.executeOperation({
        query:
          "query GetTaskById($id: ID!) {getTaskById(ID: $id) {name description status assigns githubUrl id}}",
        variables: { id: processedData[i] },
      });

      processedDataTasks.push(
        JSON.parse(JSON.stringify(dataTasks.data)).getTaskById
      );
    }
  }
  try {
    await DBOperations();
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send(processedDataTasks);
});

//GET TASKS BY TEAM:
app.get("/getTasksByTeam", async (req, res) => {
  let data, processedData, tasksInTeam;
  let tasksIdInTeam = [];
  let processedTasksInTeam = [];

  //Remove duplicates:
  function removeDuplicates(arr) {
    var unique = [];
    arr.forEach((element) => {
      if (!unique.includes(element)) {
        unique.push(element);
      }
    });
    return unique;
  }

  //DataBase operations:
  async function DBOperations() {
    data = await apolloServer.executeOperation({
      query: "query Users {Users {team tasks}}",
      variables: {},
    });

    processedData = JSON.parse(JSON.stringify(data.data)).Users;

    processedData
      .filter((user) => user.team === req.query.team)
      .forEach((user) => {
        tasksIdInTeam.push(user.tasks);
      });

    if (processedData.length > 0) {
      tasksIdInTeam = removeDuplicates(tasksIdInTeam.flat());

      for (var i = 0; i < tasksIdInTeam.length; i++) {
        tasksInTeam = await apolloServer.executeOperation({
          query:
            "query GetTaskById($id: ID!) {getTaskById(ID: $id) {name description status githubUrl}}",
          variables: { id: tasksIdInTeam[i] },
        });

        processedTasksInTeam.push(
          JSON.parse(JSON.stringify(tasksInTeam.data)).getTaskById
        );
      }
    }
  }
  try {
    await DBOperations();
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send(processedTasksInTeam);
  return 0;
});

//CHANGE TASK STATU:
app.put("/changeTaskStatus", async (req, res) => {
  //DataBase operations:
  async function DBOperations() {
    await apolloServer.executeOperation({
      query:
        "mutation UpdateTask($updateTaskId: ID!, $status: String) {updateTask(id: $updateTaskId, status: $status)}",
      variables: { updateTaskId: req.body.taskId, status: "Completed" },
    });
  }
  try {
    await DBOperations();
  } catch (err) {
    res.send({ status: false });

    return 0;
  }

  res.send({ status: true });
});

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});
