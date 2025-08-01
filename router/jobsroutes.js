import express from "express";
import {deletejob, getalljobs, getjobbyid, postjob,updatejob} from '../controller/jobscontroller.js'
const router=express.Router();

//routes
router.post('/jobs/:adminid',postjob);
router.get('/jobs',getalljobs);
router.get('/jobs/:id',getjobbyid)
router.put('/jobs/:id/:adminid',updatejob);
router.delete('/jobs/:id/:adminid',deletejob);
export default router