import { Router } from "express";
import { WelcomeService } from "./Service/welcome.service.js";

const router = Router();

router.get("/", WelcomeService);

export default router;
