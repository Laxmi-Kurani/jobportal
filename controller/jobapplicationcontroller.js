import jobsapplicationmodel from "../models/jobsapplication.js";
import jobmodel from "../models/jobsmodel.js";
import usermodel from "../models/usermodel.js";


export const applyjob=async(req,res)=>{
    try {
        const jobid=req.params.jobid;
        const userid=req.params.userid;

        if(!jobid || !userid){
            return res.status(400).json({error:"jobid or userid missing in params"})
        }

        //check with that userid user exist or not ,if not exist userid not  valid
        const user=await usermodel.findById(userid);
        if(!user){
            return res.status(404).json({error:"userid in valid"})
        }

        //check with that jobid job exist or not ,if not exist jobid not  valid
        const job=await jobmodel.findById(jobid);
        if(!job){
            return res.status(404).json({error:"jobid in valid"})
        }

        const newappliction=new jobsapplicationmodel({...req.body,jobid:jobid,userid:userid});
        await newappliction.save();
        return res.status(200).json({message:"job applied successfully",application:newappliction});
    } catch (error) {
        return res.status(500).json({error:'internal server error'+error.message});
    }
}

export const getapplicationsoflogineduser=async(req,res)=>{
    try {
        let userid=req.params.userid;
        if(!userid){
            return res.status(400).json({error:"userid missing in params"})
        }
        //check usedr exist db or not
        let user=await usermodel.findById(userid);
        if(!user){
            return res.status(404).json({error:"user not found"})
        }

        let applications=await jobsapplicationmodel.find({userid:userid}).populate('jobid').populate('userid');
        return res.status(200).json({message:"applications fetched successfully",applications:applications})
    } catch (error) {
        return res.status(500).json({error:'internal server error'+error.message});
    }
}

