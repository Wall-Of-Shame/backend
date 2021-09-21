import { Router } from "express";

import uploader from "../cloudinary";
import { checkValidToken } from "../common/middlewares/checkToken";
import {
  acceptChallenge,
  completeChallenge,
  create,
  index,
  rejectChallenge,
  remove,
  show,
  submitProof,
  update,
} from "./controllers";

const router = Router();
router.use(checkValidToken);

router.post("/:challengeId/accept", acceptChallenge);
router.post("/:challengeId/reject", rejectChallenge);
router.post("/:challengeId/complete", completeChallenge);
router.post("/:challengeId/proofs", uploader.single("proof"), submitProof);
router.post("", create);

router.get("/:challengeId", show);
router.get("", index);

router.patch("/:challengeId", update);

router.delete("/:challengeId", remove);

export default router;
