const User= require("../models/user.model");
// Create User
async function createUser(data){
    return await User.create(data);
}
// Get All Users
async function getUsers(){
    return await User.find();
}

// Update User
async function updateUser(data){
    return await User.findByDataAndUpdate(data,{new:true});
}
// Delete User
async function deleteUser(data){
    return await User.findByDataAndDelete(data);
}
module.exports={
    createUser,
    getUsers,
    updateUser,
    deleteUser
};