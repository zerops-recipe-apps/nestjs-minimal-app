import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Zerops L7 balancer terminates SSL and forwards via reverse
  // proxy — trust proxy headers so req.ip and req.protocol
  // reflect the real client, not the balancer.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // Bind 0.0.0.0 — L7 LB routes to the container VXLAN IP.
  // Binding localhost causes 502 errors.
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
