import mongoose from "mongoose";
import jobmodel from "../models/jobsmodel.js";
import usermodel from "../models/usermodel.js";
import {fetchJobsFromAPI,
  processJobWithAI,
  saveJobToDB,
  fetchProcessAndStoreJobs} from '../services/services.js'
export const postjob=async(req,res)=>{
    try {
        const adminid=req.params.adminid;
        if(!adminid){
            return res.status(400).json({error:'admin id is required'});
        }

        const {title,description,location,type,minsalaryrange,maxsalaryrange,requiredexperience,company,shifts}=req.body;
        if(!title,!description,!location,!type,!minsalaryrange,!maxsalaryrange,!requiredexperience,!company,!shifts){
            return res.status(400).json({error:'all fields are required'});
        }

        const adminuser=await usermodel.findById(adminid);
        if(!adminuser){
            return res.status(404).json({error:'admin user not found'});
        }
        if(adminuser.isadmin!==true){
            return res.status(400).json({error:'only admin can post jobs'});
        }
        const newjob=new jobmodel({...req.body,userid:adminid});
        await newjob.save();
        return res.status(200).json({message:"job posted successfully",job:newjob});

    } catch (error) {
        return res.status(500).json({error:'internal server error'+error.message});
    }
}


export const getalljobs=async(req,res)=>{
    try {
        const jobs=await jobmodel.find();
        return res.status(200).json({message:"jobs fetched successfully",jobs:jobs})
    } catch (error) {
         return res.status(500).json({error:'internal server error'+error.message});
    }
}

export const getjobbyid=async(req,res)=>{
    try {
        const id=req.params.id;
        if(!id){
            return res.status(400).json({error:"id missing in params"})
        }
        let job=await jobmodel.findById(id)
        if(!job){
            return res.status(404).json({error:"job not found"})
        }
        return res.status(200).json({message:"job fetched",job:job})
    } catch (error) {
         return res.status(500).json({error:'internal server error'+error.message});
    }
}



export  const updatejob=async(req,res)=>{
    try {
       let jobid=req.params.id;
       let adminid=req.params.adminid;
       if(!jobid || !adminid){
        return res.status(400).json({error:"id,adminid missing in params"})
       }
       //how is admin or not
       let userdetails=await usermodel.findById(adminid);//null
       if(!userdetails){
        return res.status(404).json({error:"user not found"})  
       }
      if(userdetails.isadmin!==true){
        return res.status(400).json({error:"only admin can update jobs"})
      }

      //this admin and how posted that  particular job,we have to both or same or not 
      let jobdetails=await jobmodel.findById(jobid);
      if(!jobdetails){
        return res.status(404).json({error:"job not found"})
      }

      if(jobdetails.userid._id.toString()!==adminid){
        return res.status(400).json({error:"only admin  how posted that have access"})
      }
      let updatedjob= await jobmodel.findByIdAndUpdate(jobid,req.body);//old data not exist means null
      return res.status(200).json({message:"job updated successfully",job:updatedjob})
    } catch (error) {
        return res.status(500).json({error:'internal server error'+error.message});
    }
}

export  const deletejob=async(req,res)=>{
    try {
       let jobid=req.params.id;
       let adminid=req.params.adminid;
       if(!jobid || !adminid){
        return res.status(400).json({error:"id,adminid missing in params"})
       }
       //how is admin or not
       let userdetails=await usermodel.findById(adminid);//null
       if(!userdetails){
        return res.status(404).json({error:"user not found"})  
       }
      if(userdetails.isadmin!==true){
        return res.status(400).json({error:"only admin can update jobs"})
      }

      //this admin and how posted that  particular job,we have to both or same or not 
      let jobdetails=await jobmodel.findById(jobid);
      if(!jobdetails){
        return res.status(404).json({error:"job not found"})
      }

      if(jobdetails.userid._id.toString()!==adminid){
        return res.status(400).json({error:"only admin  how posted that have access"})
      }
      let daletedjob= await jobmodel.findByIdAndDelete(jobid);//old data not exist means null
      return res.status(200).json({message:"job deleted successfully",job:daletedjob})
    } catch (error) {
        return res.status(500).json({error:'internal server error'+error.message});
    }
}


// In your controller
export const importJobs = async (req, res) => {
  try {
    const results = await fetchProcessAndStoreJobs('6889ee4896956f2ca0c9a512');
    
    if (results.every(r => !r.success)) {
      return res.status(400).json({
        success: false,
        message: 'All jobs failed to process',
        results
      });
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Import jobs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Job import failed'
    });
  }
};