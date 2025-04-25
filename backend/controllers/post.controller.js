export const createPost = async (req, res) => {
    try{
        const { title, text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
    }
    }