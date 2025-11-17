import { NestFactory } from '@nestjs/core';
import { AppModule } from './webhook/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    const port = 3535;
    await app.listen(port);
    console.log(`WeatherY listening on http://localhost:${port}`);
}
bootstrap();
