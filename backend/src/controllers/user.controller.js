const userService=require('../services/user.service');
const {userSchema}=require('../schema/user.schema');
exports.syncUser = async (req, res) => {
    try {
        const { uid, email, name } = req.user; // From middleware
        // efficient update-or-create (upsert)
        const user = await ((await require('../models/user.model')).findOneAndUpdate(
            { firebaseUid: uid },
            { 
                firebaseUid: uid, 
                email: email, 
                name: name || email.split('@')[0] // Fallback name
            },
            { new: true, upsert: true }
        ));
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
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