import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { 
  addFavorite, 
  removeFavorite, 
  listFavorites, 
  checkFavorite 
} from '../../controllers/favorite.controller.js';

const router = express.Router();

router.post('/favorites/:jobId', auth, checkRole('student'), addFavorite);
router.delete('/favorites/:jobId', auth, checkRole('student'), removeFavorite);
router.get('/favorites', auth, checkRole('student'), listFavorites);
router.get('/favorites/check/:jobId', auth, checkRole('student'), checkFavorite);

export default router;

