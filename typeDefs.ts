import { gql } from "apollo-server-express";

export const typeDefs = gql`

type User {
    id: ID!
    email: String!
    password: String!
    role: String!
    team: String!
    userType: String!
    fullName: String!
    valuePerHour: Int!
    hoursWorked: Int
    lastTimeStamp: Int
    closedTasks: Int
    tasks: [String]
}

type Team{
    id: ID!
    name: String!
    RHManager: String
    techLead: String
    members: [String]
}

type Task{
    id: ID!
    name: String, 
    description: String,
    status: String,
    assigns: [String],
    github_url: String
}

type Query {
    Name: String!
    Users: [User!]!
    Teams: [Team!]!
    Tasks: [Task!]!
    getUserById(ID: ID!): User!
    getTeamById(ID: ID!): Team!
    getTaskById(ID: ID!): Task!

    getTaskByUser(ID: ID): [Task]!
    getMembersByTeam(ID: ID): [User]!
    
}



type Mutation {
    createUser(email: String!, password: String!, role: String!, team: String!, userType: String!, 
        fullName: String!, valuePerHour: Int!): User!
    deleteUser(id: ID!): Boolean
    updateUser(id: ID!, email: String, role: String, team: String, userType: String, 
        fullName: String, valuePerHour: Int): Boolean
    setTimeStamp(id: ID!, lastTimeStamp: Int): Boolean
    giveUserTask(userID: ID!, taskID: ID!): Boolean

    createTeam(name: String!, RHManager: String!): Team!
    deleteTeam(id: ID!): Boolean
    updateTeam(id: ID!, name: String, RHManager: String): Boolean
    newMemberTeam(teamID: ID!, userID: ID!): Boolean
    defineTechLead(teamID: ID!, techID: ID!): Boolean

    createTask(name: String!): Task!
    deleteTask(id: ID!): Boolean
    updateTask(id: ID!, name: String, description: String,status: String, github_url: String): Boolean


}

`;


