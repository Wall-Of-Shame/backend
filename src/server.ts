import cors, { CorsOptions } from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from "http";
import routes from "./routes";

const corsOptions: CorsOptions = {
  origin: "*",
};

export class ApiServer {
  server: Server | undefined;

  async initialize(port = 3000): Promise<void> {
    const app = express();
    app.use(express.json({ limit: "20mb" }));
    app.use(express.urlencoded({ extended: true, limit: "20mb" }));
    app.use(cors(corsOptions));
    app.use(helmet());
    app.use("/api/v1", routes);

    this.server = app.listen(port, () =>
      console.log(`Server connected successfully on port ${port}`)
    );
    this.server.timeout = 1200000;
  }

  async close(): Promise<void> {
    this.server && this.server.close();
  }
}
