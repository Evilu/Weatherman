import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface AlertNotification {
  type: 'alert_triggered' | 'alert_resolved' | 'alert_error';
  alertId: string;
  userId: string;
  alertName: string;
  location: any;
  parameter: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly notifications$ = new Subject<AlertNotification>();

  /**
   * Send notification when alert is triggered
   */
  async sendAlertNotification(notification: AlertNotification): Promise<void> {
    this.logger.log(`Sending notification: ${notification.type} for alert ${notification.alertId}`);
    this.notifications$.next(notification);
  }

  /**
   * Get notification stream for a specific user
   */
  getUserNotifications(userId: string): Observable<AlertNotification> {
    return new Observable<AlertNotification>((observer) => {
      const subscription = this.notifications$.subscribe((notification) => {
        if (notification.userId === userId) {
          observer.next(notification);
        }
      });

      return () => subscription.unsubscribe();
    });
  }
}
