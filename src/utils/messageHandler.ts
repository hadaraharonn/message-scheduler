export interface MessageHandler {
    handleMessage(message: string): Promise<void>;
}

export class ConsoleMessageHandler implements MessageHandler {
    public async handleMessage(message: string): Promise<void> {
        console.log(`${message}`);
    }
}