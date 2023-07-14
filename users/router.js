import * as express from 'express';
import { listUsers, getUser, createUser } from './controller';
import { validateSchema } from '../shared/middleware/validateSchema';
import { getUserSchema, addUserSchema } from '../shared/schema/users';

const usersRouter = express.Router();

usersRouter.get('/', listUsers);
usersRouter.get('/:id', validateSchema(getUserSchema), getUser);
usersRouter.post('/', validateSchema(addUserSchema), createUser);

// eslint-disable-next-line import/prefer-default-export
export { usersRouter };
