import { CommandInteraction } from "discord.js";

export abstract class BaseCommand {
  abstract execute(interaction: CommandInteraction): Promise<void>;
}
