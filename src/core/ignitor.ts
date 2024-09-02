import { Client, GatewayIntentBits, Partials } from "discord.js";
import path from "path";
import glob from "glob-promise";
import { Register } from "./structure/register";
import { BaseEvent } from "./structure/base-event";

export class Ignitor {
  public client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });
  }

  /**
   * Resolves all files in the src directory
   * @returns {Promise<string[]>}
   */
  private async resolveFiles() {
    const srcPath = path.resolve(__dirname, "..");
    const files = await glob("**/*{.ts,.js}", { cwd: srcPath, absolute: true });
    return files;
  }

  /**
   * Registers all events in the src directory
   * @returns {Promise<void>}
   */
  private async registerEvents(): Promise<void> {
    const files = await this.resolveFiles();
    let eventCount = 0;

    for (const file of files) {
      try {
        const eventClass = await import(file).then((module) => module.default);
        if (!eventClass || !(eventClass.prototype instanceof BaseEvent)) continue;
        const metadata = Register.getMetadata(eventClass.prototype, "execute");
        if (!metadata || metadata.type !== "event") continue;
        const eventInstance = new eventClass();
        this.client.on(metadata.eventName, (...args) => eventInstance.execute(args));
        eventCount++;
      } catch (error) {
        console.error(`Error registering event from file ${file}`, error);
      }
    }

    console.log(`${eventCount} events registered`);
  }

  public async init() {
    console.log("Initializing bot...");
    await this.registerEvents();
    this.client.login(process.env.TOKEN);
  }
}
