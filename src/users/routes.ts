import { Router } from "express";

import { create } from "./controllers";

const router = Router();

router.post("", create);

router.get("/:userId/friends");
router.get("/:userId");
router.get("");

router.patch("/:userId");

export default router;
