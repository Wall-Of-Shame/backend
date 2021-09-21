import { Router } from "express";

import { checkValidToken } from "../common/middlewares/checkToken";
import { index, indexFriends, show, update } from "./controllers";

export const users = Router();

users.get("", index);

export const self = Router();

self.use(checkValidToken);
self.get("", show);
self.patch("", update);

export const friends = Router();

friends.use(checkValidToken);
friends.get("", indexFriends);
