import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import path from "path";
import glob from "glob-promise";
import { Register } from "./register";
import { BaseEvent } from "./base-event";
import { logger } from "../helpers/logger";
import { BaseCommand } from "./base-command";

export class Ignitor {
  public client: Client;
  public commands: Collection<string, BaseCommand> = new Collection();

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
  private async resolveFiles(): Promise<string[]> {
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
        this.client.on(metadata.eventName, (...args) => new eventClass().execute(args));
        eventCount++;
      } catch (error) {
        logger.error(`Error registering event from file ${file}`, error);
      }
    }

    logger.info(`${eventCount} events registered`);
  }

  private async registerCommands(): Promise<void> {
    const files = await this.resolveFiles();

    for (const file of files) {
      try {
        const commandClass = await import(file).then((module) => module.default);
        if (!commandClass || !(commandClass.prototype instanceof BaseCommand)) continue;
        const metadata = Register.getMetadata(commandClass.prototype, "execute");
        if (!metadata || metadata.type !== "command") continue;
        this.commands.set(metadata.command.name, new commandClass());
      } catch (error) {
        logger.error(`Error registering command from file ${file}`, error);
      }
    }

    logger.info(`${this.commands.size} commands registered`);
  }

  public async init() {
    logger.info("Initializing bot...");
    await this.registerEvents();
    await this.registerCommands();
    this.client.login(process.env.TOKEN);
  }
}
