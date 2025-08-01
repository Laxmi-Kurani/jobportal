import mongoose from "mongoose";

const  jobsapplicationschema=new mongoose.Schema({
    jobid:{type:mongoose.Schema.Types.ObjectId,ref:"jobs"},
    userid:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    status:{type:String,
        enum:["applied","selected","rejected","interview","offer","hired","onhold"],
        default:"applied"
    },
    resume:{type:String},
    gitlink:{type:String},
    linkedinlink:{type:String},
    coverletter:{type:String},
    portfolio:{type:String},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

const jobsapplicationmodel=mongoose.model("jobsapplications",jobsapplicationschema);
export default jobsapplicationmodel