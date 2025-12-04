import { Router } from 'express';
import { getAnnouncementsZodSchema } from '../Validator/ZodSchemaUserPost';
import { getAnnouncementsPublic, getScholarshipPublic, uploadWasabi } from '../Controller/publicController';
import { validate } from '../Validator/Validator';
import upload from '../Helper/upload';
import { getScholarshipZodSchema } from '../Validator/ZodSchemaAdminPost';

const PublicRoutes = Router();

PublicRoutes.post('/uploadWasabi', upload.any(), uploadWasabi);

PublicRoutes.get('/getAnnouncementsPublic', validate(getAnnouncementsZodSchema), getAnnouncementsPublic);
PublicRoutes.get('/getScholarshipPublic', validate(getScholarshipZodSchema), getScholarshipPublic);

export default PublicRoutes;
