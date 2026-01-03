const userService=require('../services/user.service');
const {userSchema}=require('../schema/user.schema');
exports.createUser=async(req,res)=>{
    try{
        const validated=userSchema.parse(req.body);
        const user= await userService.createUser(validated);
        res.status(201).json(user);
    }catch(err){
        res.status(400).json({error:err.message});
    }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update user
exports.updateUser = async (req, res) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};