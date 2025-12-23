import multer from 'multer';
import path from 'path';
import fs from 'fs';

const folders = {
  logo: 'uploads/logos',
  photo: 'uploads/profile_pictures',
  resume: 'uploads/resumes',
  media: 'uploads/posts'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = folders[file.fieldname] || 'uploads/other';
    // ensure the directory exists
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest + '/');
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

export const profileUpload = multer({ storage });

