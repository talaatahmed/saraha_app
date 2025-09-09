import { Router } from "express";
import * as messageService from "./Services/message.service.js";
const router = new Router();

router.post("/send-message/:receiverId", messageService.sendMessageService);
router.get("/all-messages", messageService.getAllMessage);
router.get("/user-messages/:receiverId", messageService.getUserMessage);

export default router;
