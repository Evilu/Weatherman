import { Controller, Sse, Req, Query, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { NotificationService, AlertNotification } from '../common/notification.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Server-Sent Events stream for real-time alert notifications' })
  @ApiQuery({ name: 'token', required: true, description: 'JWT token for authentication' })
  streamNotifications(@Query('token') token: string, @Req() request: Request): Observable<MessageEvent> {
    this.logger.log('SSE connection attempt');

    if (!token) {
      this.logger.error('No token provided in query');
      throw new Error('Token required for SSE authentication');
    }

    let user: any;
    try {
      // Verify and decode JWT token
      user = this.jwtService.verify(token);
      this.logger.log(`JWT verification successful for user: ${user?.sub || user?.id}`);
    } catch (error) {
      this.logger.error(`Invalid JWT token for SSE: ${error.message}`);
      throw new Error('Invalid token');
    }

    const userId = user?.sub || user?.id;

    if (!userId) {
      this.logger.error('No user ID found in token');
      throw new Error('User not authenticated');
    }

    this.logger.log(`Starting SSE stream for user: ${userId}`);

    return this.notificationService.getUserNotifications(userId).pipe(
      map((notification: AlertNotification) => {
        this.logger.log(`Sending SSE to user ${userId}: ${notification.type}`);
        return {
          data: JSON.stringify({
            type: notification.type,
            alertId: notification.alertId,
            alertName: notification.alertName,
            location: notification.location,
            parameter: notification.parameter,
            value: notification.value,
            threshold: notification.threshold,
            timestamp: notification.timestamp,
          }),
          type: notification.type,
        } as MessageEvent;
      }),
    );
  }
}
