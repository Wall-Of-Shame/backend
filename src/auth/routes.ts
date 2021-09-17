import { Router } from "express";
import { loginFacebook, loginGoogle, login } from "./controllers";

const router = Router();

router.post("/facebook", loginFacebook);
router.post("/google", loginGoogle);
router.post("", login);

export default router;
