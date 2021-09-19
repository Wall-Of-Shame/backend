import { Router } from "express";

import { checkValidToken } from "../common/middlewares/checkToken";
import { update } from "./controllers";

export const users = Router();

users.get("");

export const self = Router();

self.get("/friends");
self.use(checkValidToken);
self.get("");

self.patch("", update);
