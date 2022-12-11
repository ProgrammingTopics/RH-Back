import { Task } from "./Task";
import { Team } from "./Team";
import { User } from "./User";

export const resolvers = {
    Query: {                // Searchs in DB
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
    
    Mutation: {         //Modifications in DB
         async createUser(_, { email, password, role, team, userType, fullName, valuePerHour, lastTimeStamp, hoursWorked}){
            const newUser = new User({ email, password, role, team, userType, fullName, valuePerHour, lastTimeStamp, hoursWorked });
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

        async setTimeStamp(_,{id,lastTimeStamp}){
            const updated = (await User.updateOne({_id: id}, {lastTimeStamp: lastTimeStamp})).modifiedCount;
            return updated;
        },

        async giveUserTask(_,{userID, taskID}){         //Insert a new task in User.tasks and a new assign in Task.assigns
            const newTask = (await Task.findById(taskID));
            const newUser = (await User.findById(userID));
            const updated_user = (await User.updateOne({_id: userID},{$push:{tasks: taskID}})).modifiedCount;
            const updated_task = (await Task.updateOne({_id: taskID}, {$push:{assigns: newUser._id}})).modifiedCount;

            return (updated_task && updated_user);
        },

        async createTeam(_, {name, RHManager}){
            const newTeam = new Team({name, RHManager});
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

        async newMemberTeam(_,{teamID, userID}){        //Insert a new User in Team.members and update Team.team

            const newMember = (await User.findById(userID));
            const newTeam = (await Team.findById(teamID));
            const updated_team = (await Team.updateOne({_id: teamID}, 
                {$push:{members: newMember._id}})).modifiedCount;
            const updated_user = (await User.updateOne({_id: userID}, {team: teamID})).modifiedCount;
            return (updated_team && updated_user);
        },

        async defineTechLead(_,{teamID,techID}){    //Verify if the User is a team's member before set him as TechLead
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
        },

        async createTask(_,{name}){
            const newTask = new Task({name});
            await newTask.save();
            return newTask;

        },

        async deleteTask(_,{id}){
            const deleted = (await Task.deleteOne({_id: id})).deletedCount;
            return deleted;
        },

        async updateTask(_, {id,name, description,status, github_url}){
            const updated = (await Task.updateOne({_id: id}, {name: name, description: description, 
                status: status, github_url: github_url})).modifiedCount;
            return updated;
        },

        async setTimeHoursWorked(_,{id,hoursWorked}){
            const updated = (await User.updateOne({_id: id}, {hoursWorked: hoursWorked})).modifiedCount;
            return updated;
        },
    }
}