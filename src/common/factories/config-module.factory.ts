import { ConfigModule } from '@nestjs/config';

import Joi from 'joi';

export const ENV_KEY = {
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',

  DATABASE_URL: 'DATABASE_URL',

  SALT_ROUND: 'SALT_ROUND',
  JWT_SECRET: 'JWT_SECRET',
  JWT_ISSUER: 'JWT_ISSUER',
  ACCESS_TOKEN_EXPIRES_IN: 'ACCESS_TOKEN_EXPIRES_IN',
  REFRESH_TOKEN_EXPIRES_IN: 'REFRESH_TOKEN_EXPIRES_IN',
} as const;

export const ConfigModuleFactory = () => {
  return ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object({
      [ENV_KEY.PORT]: Joi.number().port().default(3000),
      [ENV_KEY.NODE_ENV]: Joi.string().valid(
        'development',
        'production',
        'test',
      ),

      [ENV_KEY.DATABASE_URL]: Joi.string().required(),

      [ENV_KEY.SALT_ROUND]: Joi.number().required(),
      [ENV_KEY.JWT_SECRET]: Joi.string().required(),
      [ENV_KEY.JWT_ISSUER]: Joi.string().required(),
      [ENV_KEY.ACCESS_TOKEN_EXPIRES_IN]: Joi.string().required(),
      [ENV_KEY.REFRESH_TOKEN_EXPIRES_IN]: Joi.string().required(),
    }),
  });
};
