import mongoose from 'mongoose';

const jobschema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Full Time", "Part Time", "Internship"],
        required: true
    },
    minsalaryrange: { 
        type: Number, 
        required: true 
    },
    maxsalaryrange: { 
        type: Number,
         required: true 
        },
    requiredexperience: { 
        type: String, 
        required: true 
    },
    requireddegree:[],
    company: { 
        type: String, 
        required: true 
    },
    shifts: { 
        type: String, 
        enum: ["Day", "Night", "Both"], 
        required: true 
    },
    requiredskills: [],
    applyLink: {
        type: String,
        required: true
    },
    userid:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const jobmodel = mongoose.model("jobs", jobschema);
export default jobmodel