import { Router } from "express";
import auth from "./auth/routes";
import users from "./users/routes";
import challenges from "./challenges/routes";
import proofs from "./proofs/routes";

const router = Router();
router.use("/auth", auth);
router.use("/users", users);
router.use("/challenges", challenges);
router.use("/proofs", proofs);

export default router;
