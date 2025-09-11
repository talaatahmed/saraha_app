import { Router } from "express";
import { WelcomeService } from "./Service/welcome.service";

const router = Router();

router.get("/", WelcomeService);

export default router;
