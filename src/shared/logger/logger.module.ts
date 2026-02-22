import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Logger, LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LevelWithSilent } from 'pino';

import { ENV_KEY } from '@common/factories/config-module.factory';

export const LOGGER = Symbol('LOGGER');

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const IS_PRODUCTION =
          configService.getOrThrow<string>(ENV_KEY.NODE_ENV) === 'production';
        const LOGGER_LEVEL: LevelWithSilent =
          configService.getOrThrow<LevelWithSilent>(ENV_KEY.LOGGER_LEVEL);

        return {
          pinoHttp: {
            level: LOGGER_LEVEL,
            autoLogging: {
              ignore: (req) => req.url?.startsWith('/health') ?? false,
            },
            transport: IS_PRODUCTION
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:HH:MM:ss.l o',
                    ignore:
                      'pid,hostname,req.headers,res.headers,req.params,req.query,req.body,res.body',
                    messageFormat:
                      '{req.method} {req.url} {res.statusCode} ({responseTime}ms) - {msg}',
                    singleLine: false,
                  },
                },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: LOGGER,
      useClass: Logger,
    },
  ],
  exports: [LOGGER],
})
export class LoggerModule {}
