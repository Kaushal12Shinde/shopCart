const express = require('express');
const User = require('../Model/User')
const router = express.Router();
const sendToken = require('../Utility/sendToken');
const authFetch = require('../Middleware/authFetch');
const ApiFeatures = require('../Utility/ApiFeatures');
const checkAdmin = require('../Middleware/checkAdmin')


//ErrorHandling Remaining

//1-> 
    
    router.post('/register', async(req,res,next)=>{
        const user = await User.create(req.body);
        sendToken(user,201,res);
    });

//2->

    router.post('/login',async(req,res,next)=>{
        
        const user = await User.findOne({email}).select('+password');
        
        if(!user)
            return res.status(400).json({message:'user Not Found'});
        
        const hash = await user.compareHash(password);
        
        if(!hash)
            return res.status(500).send("Invalid User Details")
        
        sendToken(user,200,res);
    });

//3->

    router.post('/logout',async(req,res)=>{

        res.cookie('token',null,{
            expires:new Date(Date.now()),
            httpOnly:true
        });
        
        res.status(200).json({message:"Logged Out"})
    })

//4->

    router.put('/editMyDetails', authFetch ,async(req,res)=>{

        const user = await User.findByIdAndUpdate(req.userId,req.body,{
            new:true
        });
        res.status(200).json({
            success:true,
            user
        })
    })

//5-> 

    router.get('/myDetails', authFetch , async(req,res)=>{

        const user = await User.findById(req.userId);
        res.status(200).json({
            success:true,
            user
        })

    })

//6->(admin)function

    router.get('/searchUsers', authFetch , checkAdmin , async(req,res)=>{
        
        const executeList = new ApiFeatures(User.find(), req.query).search();
        const userList = await executeList.query;
        res.status(200).json({
            success:true,
            userList,
            totalUsers : userList?.length || 0
        });

    });

//7->(admin)function

    router.get('/userDetails/:id', authFetch , checkAdmin , async(req,res)=>{
        
        const user = await User.findById(req.params.id);
        
        if(!user){
            return res.status(400).json({
                message:'User not found'
            })
        }

        res.status(200).json({
            success : true, 
            user
        })
        
    });

//8 ->(admin)Function 

    router.put('/updateUserDetails/:id', authFetch , checkAdmin , async(req,res)=>{

        const user = await User.findByIdAndUpdate(req.params.id,req.body,{
            new:true
        });

        res.status(200).json({
            success:true,
            user
        })

    })


module.exports = router
