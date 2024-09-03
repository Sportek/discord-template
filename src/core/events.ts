import { Client, ClientEvents } from "discord.js";
import { resolveFiles } from "../helpers/files";
import { Register } from "./register";
import { logger } from "../helpers/logger";

export type EventArgs<EventName extends keyof ClientEvents> = ClientEvents[EventName];

export abstract class BaseEvent {
  abstract execute(...args: EventArgs<any>): Promise<void>;
}

export class EventManager {
  constructor(private client: Client) {
    this.client = client;
  }

  /**
   * Registers all events in the src directory
   * @returns {Promise<void>}
   */
  private async registerEvents(): Promise<void> {
    const files = await resolveFiles();
    let eventCount = 0;

    for (const file of files) {
      try {
        const eventClass = await import(file).then((module) => module.default);
        if (!eventClass || !(eventClass.prototype instanceof BaseEvent)) continue;
        const metadata = Register.getMetadata(eventClass.prototype, "execute");
        if (!metadata || metadata.type !== "event") continue;
        this.client.on(metadata.eventName, (...args) => new eventClass().execute(args));
        eventCount++;
      } catch (error) {
        logger.error(`Error registering event from file ${file}`, error);
      }
    }

    logger.info(`${eventCount} events registered`);
  }

  public async init(): Promise<void> {
    await this.registerEvents();
  }
}