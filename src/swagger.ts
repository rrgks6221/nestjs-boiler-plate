import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerUiOptions } from '@nestjs/swagger/dist/interfaces/swagger-ui-options.interface';

export class SwaggerConfig {
  private static readonly VERSION = '0.1';

  static setup(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('nestjs cqrs boiler plate')
      .setDescription('nestjs cqrs boiler plate API')
      .setVersion('0.1')
      .addCookieAuth('access_token', undefined, 'cookie-auth')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const GLOBAL_PREFIX = process.env.SWAGGER_GLOBAL_PREFIX;

    if (GLOBAL_PREFIX) {
      document.servers = [{ url: `/${GLOBAL_PREFIX}` }];
    }

    SwaggerModule.setup('swagger', app, document, {
      swaggerOptions: this.swaggerOptions,
    });
  }

  static get defaultDocumentConfig() {
    return new DocumentBuilder().setVersion(this.VERSION).addBearerAuth();
  }

  static get swaggerOptions(): SwaggerUiOptions {
    return {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: (a: Map<string, string>, b: Map<string, string>) => {
        const order = {
          post: '0',
          get: '1',
          put: '2',
          patch: '3',
          delete: '4',
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return order[a.get('method') as string].localeCompare(
          order[b.get('method') as string],
        );
      },
    };
  }
}
