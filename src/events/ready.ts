import { BaseEvent, EventArgs } from "../core/base-event";
import { Register } from "../core/register";
import { logger } from "../helpers/logger";

export default class ReadyEvent extends BaseEvent {
  @Register.event("ready")
  public async execute([client]: EventArgs<"ready">): Promise<void> {
    logger.info(`Bot is ready as ${client.user.tag}`);
  }
}
