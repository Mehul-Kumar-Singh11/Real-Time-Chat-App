import mongoose from "mongoose";

const connectDb = async() => {
    const url = process.env.MONGO_URI;

    if(!url) {
        throw new Error('MONGO_URI is not defined in environment variables.')
    }

    try{
        await mongoose.connect(url, {
            dbName: "ChatAppMicroservice"
        })
        console.log("Connected to MongoDb");
    }
    catch(error) {
        console.error("Error while connecting to Mongodb: ", error);
        process.exit(1);
    }
}

export default connectDb;