import express from "express";
const app = express();
import path from "path";
import mongoose from "mongoose";
import cors from "cors";  // Add this line
import routes from "./routes.js";

//==================================database connection========================
main()
    .then(()=>{
        console.log("database connected")
    })
    .catch((err)=>console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/fresherlink');
}

//===============================================================================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', routes);

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));