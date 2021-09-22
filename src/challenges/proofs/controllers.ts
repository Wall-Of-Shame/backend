import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

import { Payload } from "../../common/middlewares/checkToken";
import { ErrorCode } from "../../common/types";
import { ChallengeId } from "../../common/types/challenges";
import { ProofData, ProofPath } from "../../common/types/proofs";
import {
  CustomError,
  handleKnownError,
  handleServerError,
} from "../../common/utils/errors";
import prisma from "../../prisma";

// submit proof: to update and submit
export async function submitProof(
  request: Request<ChallengeId, any, ProofData, any>,
  response: Response<ProofPath, Payload>
): Promise<void> {
  try {
    const { challengeId } = request.params;
    const { userId } = response.locals.payload;
    const { data: fileStr } = request.body;

    if (!fileStr) {
      handleKnownError(
        request,
        response,
        new CustomError(ErrorCode.INVALID_REQUEST, "Missing file data.")
      );
      return;
    }

    let uploadResponse: UploadApiResponse | undefined;
    try {
      uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: `${challengeId}`,
      });
    } catch (e) {
      console.log(e);
      handleServerError(request, response);
      return;
    }

    try {
      if (!uploadResponse) {
        handleServerError(request, response);
        return;
      }

      await prisma.participant.update({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
        data: {
          evidence_link: uploadResponse.url,
        },
      });

      response.status(200).send({
        proofPath: uploadResponse.url,
      });
      return;
    } catch (e) {
      console.log(e);
      handleServerError(request, response);
      return;
    }
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

// delete proof
export async function deleteProof(
  request: Request<ChallengeId, any, any, any>,
  response: Response<any, Payload>
): Promise<void> {
  try {
    const { challengeId } = request.params;
    const { userId } = response.locals.payload;

    await prisma.participant.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      data: {
        evidence_link: null,
      },
    });
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
