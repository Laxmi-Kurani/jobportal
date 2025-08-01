import usermodel from '../models/usermodel.js';
import bcrypt, { hash } from 'bcryptjs'

export const register=async(req,res)=>{
    try {
        const {username,email,password}=req.body;
        console.log(req.body);
        if(!username || !email || !password){
            return res.status(400).json({error:'email,username and password are required'});
        }
        const userexist=await usermodel.findOne({email});
        
        if(userexist){
            return res.status(400).json({error:'user already exist'});
        }
        req.body.password=await bcrypt.hash(password,10);
        let newuser=new usermodel(req.body);
        await newuser.save();
        return res.status(200).json({message:"user registered successfully",user:newuser});

    } catch (error) {
        return res.status(500).json({error:'internal server error'+error.message});
    }
}

export const login=async(req,res)=>{
    try {
        //step 1:read email and password
        const {email,password}=req.body;
        //step 2:check if email,password given or not using if statement
        if(!email || !password){
            return res.status(400).json({error:'email and password are required'});
        }

        //step 3: check with that email user exist in db or not
        const user=await usermodel.findOne({email});// it will find user in db with that email then if user exist we will get user details else we will null
        //if we are getting null means user not exist may be email is wrong  (!user)-->true
        //if user exist we will {username,email,password...}.  --false
        if(!user){

           return res.status(400).json({error:'user not found'});
        }

        //step 4:check password
        const ispasswordmatched=await bcrypt.compare(password,user.password);
        if(!ispasswordmatched){
            return res.status(400).json({error:'password not matched'});
        }
        return res.status(200).json({message:"user logged in successfully",user:user});

        
    } catch (error) {
        return res.status(500).json({error:'internal server error'+error.message});
    }
}

export const getallusers=async (req,res)=>{
    try {
        let users=await usermodel.find().select('-password');
        return res.status(200).json({message:"users fetched successfully",users:users})
    } catch (error) {
        return res.status(500).json({error:"internal server error"+error})
    }
}

export const updateuser=async (req,res)=>{
    try {
           let id=req.params.id;
           if(!id){
            return res.status(400).json({error:'id is required'});
           }
           if(req.body.password){
            req.body.password=await bcrypt.hash(req.body.password,10)
           }
          let updateduser= await usermodel.findByIdAndUpdate(id,req.body);//old data not exist means null
          if(!updateduser){
            return res.status(404).json({error:"user not found updated failed"})
          }
          return res.status(200).json({message:"user updated successfully",user:updateduser})
    } catch (error) {
          return res.status(500).json({error:"internal server error"+error})
    }
}

export const forgotpassword=async (req,res)=>{
    try {
        let id=req.params.id;
        if(!id){
            return res.status(400).json({error:'id is required'});
        }
        let user=await usermodel.findById(id);
        if(!user){
            return res.status(404).json({error:"user not found"})
        }
        if(!req.body.password){
            return res.status(400).json({error:'password is required'});
        }
        let hashedpassword=await bcrypt.hash(req.body.password,10);
        let updateduser={...user,password:hashedpassword}
        updateduser= await usermodel.findByIdAndUpdate(id,updateduser);//old data not exist means null
        return res.status(200).json({message:"user updated successfully",user:updateduser})
    } catch (error) {
        return res.status(500).json({error:"internal server error"+error})
    }
}

export const deleteuser=async(req,res)=>{
   try {
     const id=req.params.id;
     if(!id){
         return res.status(400).json({error:'id is required'});
     }
     let deleteduser=await usermodel.findByIdAndDelete(id);
     if(!deleteduser){
        return res.status(404).json({error:"user not found deleted failed"})
     }

     return res.status(200).json({message:"user deleted successfully",user:deleteduser})
   } catch (error) {
    
   }
}

