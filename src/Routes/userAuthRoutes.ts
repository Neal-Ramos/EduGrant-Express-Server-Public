import { Router } from "express";
import {registerAccount, loginAccounts, sendAuthCodeRegister, tokenValidation, sendAuthCodeLogin} from "../Controller/authControllers";
import { validate } from "../Zod/Validator";
import { loginAccountsZodSchema, registerAccountZodSchema, sendAuthCodeLoginZodSchema, sendAuthCodeRegisterZodSchema, tokenValidationZodSchema } from "../Zod/ZodSchemaUserAuth";
const UserAuthRoutes = Router();

UserAuthRoutes.post("/registerAccount", validate(registerAccountZodSchema), registerAccount);
UserAuthRoutes.post("/loginAccounts", validate(loginAccountsZodSchema), loginAccounts);
UserAuthRoutes.post("/sendAuthCodeRegister", validate(sendAuthCodeRegisterZodSchema), sendAuthCodeRegister); 
UserAuthRoutes.post("/sendAuthCodeLogin", validate(sendAuthCodeLoginZodSchema), sendAuthCodeLogin)

UserAuthRoutes.get("/tokenValidation", validate(tokenValidationZodSchema), tokenValidation);

export default UserAuthRoutes