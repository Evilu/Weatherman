// services/backend/src/webhook/webhook.controller.ts
import { Body, Controller, Logger, Post } from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    @Post()
    handleRawWebhook(@Body() payload: any): { ok: boolean } {
        this.logger.log(`Got webhook payload: ${JSON.stringify(payload)}`);
        return { ok: true };
    }
}
