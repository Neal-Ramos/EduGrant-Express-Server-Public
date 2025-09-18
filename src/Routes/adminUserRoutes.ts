import { Router } from "express";
import { adminLogout } from "../Controller/adminUserControllers";
import { AdminTokenAuth } from "../Config/TokenAuth";
import { validate } from "../Zod/Validator";
import { adminLogoutZodSchema } from "../Zod/ZodSchemaAdminUser";

const AdminUserRoutes = Router();

AdminUserRoutes.use(AdminTokenAuth);
AdminUserRoutes.post("/adminLogout", validate(adminLogoutZodSchema), adminLogout);

export default AdminUserRoutes;