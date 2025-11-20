import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    // Swagger / OpenAPI setup
    const config = new DocumentBuilder()
        .setTitle('Weatherman API')
        .setDescription('API documentation for Weatherman service')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    // Serve Swagger at /api/docs (global prefix is 'api')
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3535;
    await app.listen(port);

    // After the server starts, print helpful links including the Swagger UI and the OpenAPI JSON
    const url = await app.getUrl();
    // Some environments return IPv6-formatted URLs (http://[::1]:3535) which are not clickable
    // in many terminal emulators. Prefer printing a localhost-based URL for clickability.
    const localBase = `http://localhost:${port}`;
    const docsUrlLocal = `${localBase.replace(/\/$/, '')}/api/docs`;
    const jsonUrlLocal = `${localBase.replace(/\/$/, '')}/api/docs-json`;

    console.log(`\n\n  🚀 Weatherman API is running!\n\n  📍 Local (clickable): ${localBase}\n  🌐 Server reported: ${url}\n  📚 Swagger (clickable): ${docsUrlLocal}\n  🔗 OpenAPI JSON (clickable): ${jsonUrlLocal}\n  🔧 Environment: ${process.env.NODE_ENV || 'development'}\n\n`);
}
bootstrap();
