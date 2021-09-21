import { Request, Response } from "express";

import { Payload } from "../../common/middlewares/checkToken";
import { ErrorCode } from "../../common/types";
import { ChallengeId } from "../../common/types/challenges";
import { ProofPath } from "../../common/types/proofs";
import {
  handleKnownError,
  CustomError,
  handleServerError,
} from "../../common/utils/errors";
import prisma from "../../prisma";

// submit proof
export async function submitProof(
  request: Request<ChallengeId, any, any, any>,
  response: Response<ProofPath, Payload>
): Promise<void> {
  try {
    const { challengeId } = request.params;
    const { userId } = response.locals.payload;

    const uploadInfo = request.file;
    if (!uploadInfo) {
      handleKnownError(
        request,
        response,
        new CustomError(ErrorCode.INVALID_REQUEST, "Missing key.")
      );
      return;
    }

    const { path } = uploadInfo;

    await prisma.participant.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      data: {
        evidence_link: path,
      },
    });

    response.status(200).send({
      proofPath: path,
    });
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
