import { User } from "./User";

export const resolvers = {
    Query: {
        Name:() => 'RHDB',
        async Users() { 
            return await User.find()
        },

        async getUserById(_, {ID}) {
            return await User.findById(ID)
        }
    },
    
    Mutation: {
        createUser: async(_, { email, password, role, team, userType, fullName, valuePerHour }) => {
            const newUser = new User({ email, password, role, team, userType, fullName, valuePerHour });
            await newUser.save();
            return newUser;
        }
    }
}