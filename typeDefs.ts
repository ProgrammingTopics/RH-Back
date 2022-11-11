import { gql } from "apollo-server-express";

export const typeDefs = gql`

type Query {
    Name: String!
    Users: [User!]!
}

type User {
    id: ID!
    email: String!
    password: String!
}

type Mutation {
    createUser(email: String!, password: String!): User!
}

`;