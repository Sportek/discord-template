import { ApplicationCommandType, CommandInteraction } from "discord.js";
import { BaseCommand } from "../core/base-command";
import { Register } from "../core/register";

export default class PingCommand extends BaseCommand {
  @Register.command({
    name: "ping",
    description: "Ping the bot",
    type: ApplicationCommandType.ChatInput,
  })
  public async execute(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  }
}
