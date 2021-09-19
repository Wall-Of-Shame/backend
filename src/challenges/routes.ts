import { Router } from "express";

import { checkValidToken } from "../common/middlewares/checkToken";
import { create, show } from "./controllers";

const router = Router();
router.use(checkValidToken);

router.post("/accept");
router.post("/reject");
router.post("/complete");
router.post("/:challengeId/proofs");
router.post("", create);

router.get("/:challengeId", show);
router.get("");

router.patch("/:challengeId");

router.delete("/:challengeId");

export default router;
