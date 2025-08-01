import express from 'express'

const router=express.Router();
import {applyjob, getapplicationsoflogineduser} from '../controller/jobapplicationcontroller.js';


router.post('/apply/:jobid/:userid',applyjob);
router.get('/apply/:userid',getapplicationsoflogineduser);


export default router