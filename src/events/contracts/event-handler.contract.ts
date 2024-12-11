export interface IEventHandler {
    handle(payload: any): void;
}