const router = require("express").Router()
const Post = require("../models/post")
const User = require("../models/user");

//Create a post
router.post("/", async(req,res)=>{
    const newPost = new Post(req.body)
    try{
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (e) {
        res.status(500).json(e)
    }
})

//Update a post
router.put("/:id", async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(post.userId == req.body.userId) {
            await Post.updateOne({$set:req.body})
            res.status(200).json("The post has been updated")
        } else {
            res.status(403).json("You can only update your post")
        }
    } catch(e) {
        res.status(500).json(e)
    }
})

//Delete a post 
router.delete("/:id", async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(post.userId === req.body.userId) {
            await Post.deleteOne()
            res.status(200).json("The post has been deleted")
        } else {
            res.status(403).json("You can only delete your post")
        }
    } catch(e) {
        res.status(500).json(e)
    }
})

router.put("/:id/like", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("The post has been liked");
      } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json("The post has been disliked");
      }
    } catch (err) {
      res.status(500).json(err);
    }
});

router.get("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
router.get("/timeline/all", async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        console.log(currentUser)
        const userPosts = await Post.find({ userId: currentUser._id });
        console.log(userPosts)
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        console.log(friendPosts)
        res.json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router