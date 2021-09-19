import { Router } from "express";

import { checkValidToken } from "../common/middlewares/checkToken";
import { acceptChallenge, create, rejectChallenge, show } from "./controllers";

const router = Router();
router.use(checkValidToken);

router.post("/:challengeId/accept", acceptChallenge);
router.post("/:challengeId/reject", rejectChallenge);
router.post("/:challengeId/complete");
router.post("/:challengeId/proofs");
router.post("", create);

router.get("/:challengeId", show);
router.get("");

router.patch("/:challengeId");

router.delete("/:challengeId");

export default router;
