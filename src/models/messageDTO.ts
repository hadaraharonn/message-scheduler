import { v4 as uuidv4 } from 'uuid';

export default class MessageDTO {
  public id: string;
  public message: string;
  public timestamp: Date;

  constructor(message: string, timestamp: Date) {
    this.id = uuidv4();
    this.message = message;
    this.timestamp = timestamp;
  }
}
