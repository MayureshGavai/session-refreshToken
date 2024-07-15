import express from 'express';
import { fetchDataController } from '../controllers/data.controller.js';
import { validateSession } from '../middlewares/session.middleware.js';

const router = express.Router();

router.get('/data', validateSession, fetchDataController);


export default router;
