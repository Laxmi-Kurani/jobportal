
import mongoose from "mongoose";

const userschema=new mongoose.Schema({
    profilepic:{type:String},
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    phoneNumber:{type:Number},
    resume:{type:String},
    highestdegree:{type:String},
    skills:[],
    experience:{type:String},
    currentcompany:{type:String},
    currentrole:{type:String},
    currentlocation:{type:String},
    noticeperiod:{type:Number},
    prefferedlocation:{type:String},
    currentctc:{type:Number},
    expectedctc:{type:Number},
    isadmin:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

const usermodel=mongoose.model("users",userschema);
export default usermodel
