import cron from 'node-cron';
import { notificationRegistry } from './registry';
import { notificationService } from './service';

class NotificationScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  start() {
    const scheduledNotifications = notificationRegistry.getScheduledNotifications();

    console.log(`[Notification Scheduler] Starting scheduler for ${scheduledNotifications.length} notifications`);

    for (const notification of scheduledNotifications) {
      if (!notification.schedule) continue;

      try {
        const task = cron.schedule(
          notification.schedule,
          async () => {
            console.log(`[Notification Scheduler] Triggering: ${notification.type}`);
            try {
              const result = await notificationService.sendToAllSubscribers(
                notification.type
              );
              console.log(
                `[Notification Scheduler] ${notification.type} completed: ${result.sent} sent, ${result.failed} failed`
              );
            } catch (error) {
              console.error(
                `[Notification Scheduler] Error sending ${notification.type}:`,
                error
              );
            }
          },
          {
            scheduled: true,
          }
        );

        this.tasks.set(notification.type, task);
        console.log(
          `[Notification Scheduler] Scheduled: ${notification.type} (${notification.schedule})`
        );
      } catch (error) {
        console.error(
          `[Notification Scheduler] Failed to schedule ${notification.type}:`,
          error
        );
      }
    }
  }

  stop() {
    console.log(`[Notification Scheduler] Stopping all scheduled tasks`);
    for (const [type, task] of this.tasks) {
      task.stop();
      console.log(`[Notification Scheduler] Stopped: ${type}`);
    }
    this.tasks.clear();
  }
}

export const notificationScheduler = new NotificationScheduler();
