import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter, { requireAdmin } from "./auth";
import menuRouter from "./menu";
import customersRouter from "./customers";
import ordersRouter from "./orders";
import ingredientsRouter from "./ingredients";
import recipesRouter from "./recipes";
import reviewsRouter from "./reviews";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(menuRouter);
router.use(requireAdmin, customersRouter);
router.use(requireAdmin, ordersRouter);
router.use(requireAdmin, ingredientsRouter);
router.use(requireAdmin, recipesRouter);
router.use(reviewsRouter);
router.use(requireAdmin, settingsRouter);
router.use(requireAdmin, dashboardRouter);

export default router;
