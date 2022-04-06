const router = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const e = require("express")

//Update a user's info
router.put("/:id", async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt);
                console.log("hehheheh")
            } catch (e) {
                return res.status(500).json(e)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {$set: req.body})
            res.status(200).json("Account has been updated.")
        } catch (e) {
            return res.status(500).json(e)
        }
    } else {
        return res.status(403).json("You can only update your own account!")
    }
})

//Delete a user
router.delete("/:id", async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Account has been deleted.")
        } catch (e) {
            return res.status(500).json(e)
        }
    } else {
        return res.status(403).json("You can only delete your own account!")
    }
})

//Get a user
router.get("/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        res.status(200).json(user)
    } catch (e) {
        res.status(500).json(e)
    }
})

//follow a user
router.put("/:id/follow",async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({$push: {followers: req.body.userId}})
                await currentUser.updateOne({$push: {following: req.params.id}})
                res.status(200).json("Followed successfully")
            } else {
                res.status(403).json("You already follow this user")
            }
        } catch (e) {
            res.status(500).json(e) 
        }
    } else {
        res.status(400).json("You cant follow yourself")
    }
})

//unfollow a user
router.put("/:id/unfollow",async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({$pull: {followers: req.body.userId}})
                await currentUser.updateOne({$pull: {following: req.params.id}})
                res.status(200).json("Unfollowed successfully")
            } else {
                res.status(403).json("You already unfollow this user")
            }
        } catch (e) {
            res.status(500).json(e) 
        }
    } else {
        res.status(400).json("You cant unfollow yourself")
    }
})





module.exports = router