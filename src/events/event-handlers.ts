import { EventEmitter } from 'events'
import { inject, injectable } from 'inversify';
import { TYPES } from '../dependency-injection/types';
import { IEventHandler } from './contracts/event-handler.contract';
import logger from '../helpers/logger';

@injectable()
export class EventHandlers {

    private eventEmitter: EventEmitter;
    private handlers: Map<string, IEventHandler>;

    constructor(
        @inject(TYPES.EventEmmiter) eventEmitter: EventEmitter,
        @inject(TYPES.CreateUserSendEmailHandler) createUserSendEmailHandler: IEventHandler,
        @inject(TYPES.ChangePasswordSendEmailHandler) changePasswordSendEmailHandler: IEventHandler,
        @inject(TYPES.ResetPasswordSendEmailHandler) resetPasswordSendEmailHandler: IEventHandler
    ) {
        this.eventEmitter = eventEmitter;

        this.handlers = new Map<string, IEventHandler>([
            ['CreateUserSendEmail', createUserSendEmailHandler],
            ['PasswordChanged', changePasswordSendEmailHandler],
            ['ResetPasswordRequestSendEmail', resetPasswordSendEmailHandler]
        ]);
    }

    registerEventHandlers() {

        this.handlers.forEach((handler, eventName) => {
            this.eventEmitter.on(eventName, async (event) => {
                try {
                    logger.debug('Event Fired:', eventName)
                    handler.handle(event)
                }
                catch (error) {
                    logger.error('An error occured while handling event', eventName)
                }
            });
        });

        logger.info('Events Loaded')
    }

}