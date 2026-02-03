import { Router } from "express";
import { devLogin } from "../services/dev.service";

const devRouter = Router();

devRouter.post("/api/dev/login", devLogin);


export default devRouter;
