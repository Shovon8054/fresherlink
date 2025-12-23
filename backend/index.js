import express from "express";
const app = express();
import path from "path";
import mongoose from "mongoose";
import cors from "cors";  // Add this line
import authRoutes from "./routes/auth/auth.routes.js";
import profileRoutes from "./routes/profiles/profile.routes.js";
import jobRoutes from "./routes/jobs/job.routes.js";
import applicationRoutes from "./routes/applications/application.routes.js";
import favoriteRoutes from "./routes/favorites/favorite.routes.js";
import commentRoutes from "./routes/comments/comment.routes.js";

//==================================database connection========================
main()
    .then(() => {
        console.log("database connected")
    })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/fresherlink');
}

//===============================================================================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const apiRouter = express.Router();
// Public / auth
apiRouter.use('/', authRoutes); // keeps /login, /signup, etc.
// Profile routes
apiRouter.use('/profile', profileRoutes);
// Job routes
apiRouter.use('/jobs', jobRoutes);
// Applications
apiRouter.use('/applications', applicationRoutes);
// Favorites
apiRouter.use('/favorites', favoriteRoutes);
// Comments
apiRouter.use('/comments', commentRoutes);
// Notifications
import notificationRoutes from "./routes/notifications/notification.routes.js";
apiRouter.use('/notifications', notificationRoutes);

// Social Feed
import postRoutes from "./routes/posts/post.routes.js";
import userRoutes from "./routes/users/user.routes.js";
apiRouter.use('/posts', postRoutes);
apiRouter.use('/users', userRoutes);

app.use('/api', apiRouter);

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));