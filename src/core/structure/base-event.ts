import { ClientEvents } from "discord.js";

export type EventArgs<EventName extends keyof ClientEvents> = ClientEvents[EventName];

export abstract class BaseEvent {
  abstract execute(...args: EventArgs<any>): Promise<void>;
}