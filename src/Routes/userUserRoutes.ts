import { Router } from "express";
import { changeLoginCredentials, changeLoginCredentialsSendAuthCode, logoutUser, updateApplication, updateStudentInfo } from "../Controller/userController";
import { TokenAuth } from "../Config/TokenAuth";
import { validate } from "../Zod/Validator";
import { changeLoginCredentialsSendAuthCodeZodSchema, logoutZodSchema, updateApplicationZodSchema, updateStudentInfoZodSchema } from "../Zod/ZodSchemaUserUser";
import upload from "../Config/upload";

const UserUserRoutes = Router();

UserUserRoutes.use(TokenAuth);
UserUserRoutes.post("/logout", validate(logoutZodSchema), logoutUser);
UserUserRoutes.post("/updateStudentInfo", upload.any(), validate(updateStudentInfoZodSchema), updateStudentInfo)
UserUserRoutes.post("/updateApplication", upload.any(), validate(updateApplicationZodSchema), updateApplication)
UserUserRoutes.post("/changeLoginCredentialsSendAuthCode", validate(changeLoginCredentialsSendAuthCodeZodSchema), changeLoginCredentialsSendAuthCode)
UserUserRoutes.post("/changeLoginCredentials", validate(changeLoginCredentialsSendAuthCodeZodSchema), changeLoginCredentials)

export default UserUserRoutes