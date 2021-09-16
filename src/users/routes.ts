import { Router } from "express";

const router = Router();
router.post("");

router.get("/:userId/friends");
router.get("/:userId");
router.get("");

router.patch("/:userId");

export default router;
