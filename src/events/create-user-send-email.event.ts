import { injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import { User } from "../domain/entities/user";

@injectable()
export class CreateUserSendEmailHandler implements IEventHandler {
    async handle(user: User) {
        console.log('Sending Email to', user.email)
    }
}