import { Router } from "express";
import {handleLogin, handleRegister} from "@/controllers/auth.controller.js";

const router = Router();

//Authentication Routes

router.post('/login', handleLogin);
router.post('/register', handleRegister);


export default router