import { User } from "./User";

export const resolvers = {
    Query: {
        Name:() => 'teste',
        Users: () => User.find()
    },
    Mutation: {
        createUser: async(_, { email, password }) => {
            const newUser = new User({ email, password });
            await newUser.save();
            return newUser;
        }
    }
}