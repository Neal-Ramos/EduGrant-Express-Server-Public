import { Router } from 'express';
import { getAnnouncementsZodSchema } from '../Validator/ZodSchemaUserPost';
import { getAnnouncementsPublic, uploadWasabi } from '../Controller/publicController';
import { validate } from '../Validator/Validator';
import upload from '../Helper/upload';

const PublicRoutes = Router();

PublicRoutes.post('/uploadWasabi', upload.any(), uploadWasabi);

PublicRoutes.get(
  '/getAnnouncementsPublic',
  validate(getAnnouncementsZodSchema),
  getAnnouncementsPublic,
);

export default PublicRoutes;
