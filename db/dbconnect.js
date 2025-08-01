import mongoose from "mongoose";
const connectdb=async()=>{
    try {
        await mongoose.connect(process.env.mongodb_uri);
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
}

export default connectdb