import { EventEmitter } from 'events'
import { inject, injectable } from 'inversify';
import { TYPES } from '../dependency-injection/types';
import { IEventHandler } from './contracts/event-handler.contract';


@injectable()
export class EventHandlers {

    private eventEmitter: EventEmitter;
    private handlers: Map<string, IEventHandler>;

    constructor(
        @inject(TYPES.EventEmmiter) eventEmitter: EventEmitter,
        @inject(TYPES.CreateUserSendEmailHandler) createUserSendEmailHandler: IEventHandler
    ) {
        this.eventEmitter = eventEmitter;

        this.handlers = new Map<string, IEventHandler>([
            ['CreateUserSendEmail', createUserSendEmailHandler]
        ]);
    }

    registerEventHandlers() {

        this.handlers.forEach((handler, eventName) => {
            this.eventEmitter.on(eventName, async (event) => {
                try {
                    console.log('Event Fired:', eventName)
                    handler.handle(event)
                }
                catch (error) {
                    console.log('An error occured while handling event', eventName)
                }
            });
        });

        console.log('Events Loaded')
    }

}