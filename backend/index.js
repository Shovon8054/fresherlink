import express from "express";
const app = express();
import path from "path";
import mongoose from "mongoose";
import cors from "cors";  
import authRoutes from "./routes/auth/auth.routes.js";
import profileRoutes from "./routes/profiles/profile.routes.js";
import jobRoutes from "./routes/jobs/job.routes.js";
import applicationRoutes from "./routes/applications/application.routes.js";
import favoriteRoutes from "./routes/favorites/favorite.routes.js";

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

const apiRouter = express.Router();
apiRouter.use('/', authRoutes);
apiRouter.use('/', profileRoutes);
apiRouter.use('/', jobRoutes);
apiRouter.use('/', applicationRoutes);
apiRouter.use('/', favoriteRoutes);

app.use('/api', apiRouter);

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
