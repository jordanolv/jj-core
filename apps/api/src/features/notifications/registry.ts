import { glob } from 'glob';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import type { NotificationDefinition, NotificationRegistryEntry } from './types';

class NotificationRegistry {
  private notifications = new Map<string, NotificationRegistryEntry>();

  async scan() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const rootDir = path.join(__dirname, '../..');
    const pattern = '**/notifications/*.notification.{ts,js}';

    console.log(`[Notification Registry] Scanning for notifications in: ${rootDir}`);

    const files = await glob(pattern, {
      cwd: rootDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**'],
    });

    console.log(`[Notification Registry] Found ${files.length} notification files`);

    for (const file of files) {
      try {
        await this.loadNotificationFile(file);
      } catch (error) {
        console.error(`[Notification Registry] Failed to load ${file}:`, error);
      }
    }

    console.log(`[Notification Registry] Registered ${this.notifications.size} notifications`);
  }

  private async loadNotificationFile(filePath: string) {
    const fileUrl = pathToFileURL(filePath).href;
    const module = await import(fileUrl);

    for (const [key, value] of Object.entries(module)) {
      if (this.isNotificationDefinition(value)) {
        const definition = value as NotificationDefinition;

        const entry: NotificationRegistryEntry = {
          ...definition,
          sourcePath: filePath,
          registeredAt: new Date(),
        };

        this.notifications.set(definition.type, entry);
        console.log(`[Notification Registry] Registered: ${definition.type} from ${path.basename(filePath)}`);
      }
    }
  }

  private isNotificationDefinition(obj: any): obj is NotificationDefinition {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.type === 'string' &&
      typeof obj.label === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.handler === 'function'
    );
  }

  get(type: string): NotificationRegistryEntry | undefined {
    return this.notifications.get(type);
  }

  getAll(): NotificationRegistryEntry[] {
    return Array.from(this.notifications.values());
  }

  getAllByCategory(category: string): NotificationRegistryEntry[] {
    return this.getAll().filter((n) => n.category === category);
  }

  getScheduledNotifications(): NotificationRegistryEntry[] {
    return this.getAll().filter((n) => n.schedule);
  }

  has(type: string): boolean {
    return this.notifications.has(type);
  }

  clear() {
    this.notifications.clear();
  }
}

export const notificationRegistry = new NotificationRegistry();
