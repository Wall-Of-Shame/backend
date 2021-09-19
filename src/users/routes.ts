import { Router } from "express";

const router = Router();

router.get("/:userId/friends");
router.get("/:userId");
router.get("");

router.patch("/:userId");

export default router;
