export default interface ISetupDb {
    setup(): Promise<void>;
}