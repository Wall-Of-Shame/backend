import { Router } from "express";

import auth from "./auth/routes";
import challenges from "./challenges/routes";
import { users, self, friends } from "./users/routes";

const router = Router();
router.use("/auth", auth);
router.use("/self", self);
router.use("/friends", friends);
router.use("/users", users);
router.use("/challenges", challenges);

export default router;
