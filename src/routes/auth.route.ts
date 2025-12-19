import { Router } from "express";
import {handleLogin, handleLogout, handleRegister} from "@/controllers/auth.controller.js";

const router = Router();

//Authentication Routes

router.post('/login', handleLogin);
router.post('/register', handleRegister);

router.get('/logout', handleLogout);


export default router