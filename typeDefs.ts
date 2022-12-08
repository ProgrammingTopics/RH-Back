import { gql } from "apollo-server-express";

export const typeDefs = gql`

type Query {
    Name: String!
    Users: [User!]!
    getUserById(ID: ID!): User!
}

type User {
    id: ID!
    email: String!
    password: String!
    role: String!
    team: String!
    userType: Int!
    fullName: String!
    valuePerHour: Int!
}

type Mutation {
    createUser(email: String!, password: String!, role: String!, team: String!, userType: Int!, fullName: String!, valuePerHour: Int!): User!
}

`;