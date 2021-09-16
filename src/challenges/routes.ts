import { Router } from "express";

const router = Router();

router.post("/accept");
router.post("/reject");
router.post("/complete");
router.post("/:challengeId/proofs");
router.post("");

router.get("/:challengeId");
router.get("");

router.patch("/:challengeId");

router.delete("/:challengeId");

export default router;
