import mongoose from "mongoose";

const connectDB = async () => {
  try{
        await mongoose.connect(process.env.DB_URL)
        console.log("Database is connected")
    }catch(err){
        console.log(`There is something error in connecting ${err}`)
        process.exit(1); // Exit process with failure
    }
}

export default connectDB;
