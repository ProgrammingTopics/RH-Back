import { Task } from "./Task";
import { Team } from "./Team";
import { User } from "./User";

export const resolvers = {
    Query: {
        Name:() => 'RHDB',
        async Users() { 
            return await User.find()
        },
        async Teams() {
            return await Team.find()
        },

        async Tasks(){
            return await Task.find()
        },

        async getUserById(_, {ID}) {
            return await User.findById(ID)
        },

        async getTeamById(_, {ID}){
            return await Team.findById(ID)
        },

        async getTaskById(_, {ID}){
            return await Task.findById(ID)
        },



    },
    
    Mutation: {
         async createUser(_, { email, password }){
            const newUser = new User({ email, password});
            await newUser.save();
            return newUser;
        },

        async deleteUser(_, {id}) {
            const deleted = (await User.deleteOne({_id: id})).deletedCount;
            return deleted;
            
        } ,       

        async updateUser(_,{id,email, role, team, userType, fullName, valuePerHour} ){
                const updated = (await User.updateOne({_id: id}, {email: email, role: role, team: team, 
                userType: userType, fullName: fullName, valuePerHour: valuePerHour})).modifiedCount;

                return updated; 
              
        },

        async giveUserTask(_,{userID, taskID}){
            const newTask = (await Task.findById(taskID));
            const newUser = (await User.findById(userID));
            const updated_user = (await User.updateOne({_id: userID},{$push:{tasks: {taskName: newTask.name, taskID: taskID}}}));
            const updated_task = (await Task.updateOne({_id: taskID}, {$push:{assigns:{assignName:newUser.fullName, 
                assignID: newUser._id}}})).modifiedCount;

            return (updated_task && updated_user);
        },

        async createTeam(_, {name}){
            const newTeam = new Team({name});
            await newTeam.save();
            return newTeam;
        },

        async deleteTeam(_, {id}){
            const deleted = (await Team.deleteOne({_id: id})).deletedCount;
            return deleted;
        },

        async updateTeam(_, {id, name, RHManager}){
            const updated = (await Team.updateOne({_id: id}, {name: name, 
                RHManager: RHManager})).modifiedCount;

            return updated;
        },

        async newMemberTeam(_,{teamID, userID}){

            const newMember = (await User.findById(userID));
            const newTeam = (await Team.findById(teamID));
            const updated_team = (await Team.updateOne({_id: teamID}, 
                {$push:{members: {memberID: newMember._id, name: newMember.fullName, role: newMember.role}}})).modifiedCount;
            const updated_user = (await User.updateOne({_id: userID}, {team: {teamName: newTeam.name, teamID: teamID}})).modifiedCount;
            return (updated_team && updated_user);
        },

        async defineTechLead(_,{teamID,techID}){
            let isMember = false;
            let updated
            const newTech = techID
            const response = (await Team.findById(teamID,{members: 1}))
            console.log(response);
            response.members.forEach(member => {
                if(newTech == member.memberID)
                   isMember = true; 
            });
            if(isMember)
                updated = (await Team.updateOne({_id: teamID},{techLead: newTech})).modifiedCount;
            else
                updated = false
            return updated;
        }
    }
}