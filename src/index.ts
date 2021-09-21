import { ApiServer } from "./server";

const apiServer = new ApiServer();
apiServer.initialize((process.env.PORT as any) ?? 3001);
