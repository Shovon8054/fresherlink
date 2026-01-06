import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { 
  addFavorite, 
  removeFavorite, 
  listFavorites, 
  checkFavorite 
} from '../../controllers/favorite.controller.js';

const router = express.Router();

router.post('/:jobId', auth, checkRole('student'), addFavorite);
router.delete('/:jobId', auth, checkRole('student'), removeFavorite);
router.get('/', auth, checkRole('student'), listFavorites);
router.get('/check/:jobId', auth, checkRole('student'), checkFavorite);

export default router;

