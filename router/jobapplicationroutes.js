import express from 'express'

const router=express.Router();
import {applyjob, getapplicationsoflogineduser, getapplicationofparticularjob, updateapplication, deleteapplication} from '../controller/jobapplicationcontroller.js';


router.post('/apply/:jobid/:userid',applyjob);
router.get('/apply/:userid',getapplicationsoflogineduser);
router.get('/applicationsbyjobid/:jobid',getapplicationofparticularjob);
router.put('/applications/:id',updateapplication);
router.delete('/applications/:id',deleteapplication);

export default router