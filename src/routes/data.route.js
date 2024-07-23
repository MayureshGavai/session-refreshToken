import express from 'express';
import { fetchData1Controller1, fetchDataController } from '../controllers/data.controller.js';
import { validateSession, validateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/data', validateSession, validateToken, fetchDataController);
router.get('/data1', validateSession, validateToken, fetchData1Controller1);
// router.get('/data', validateSession, fetchDataController);


export default router;
