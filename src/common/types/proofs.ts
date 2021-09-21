import { ParamsDictionary } from "express-serve-static-core";

export interface ProofId extends ParamsDictionary {
  proofId: string;
}

export interface ProofPath {
  proofPath: string;
}
