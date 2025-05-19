import { Inject, Injectable } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";

@Injectable()
export class EventBusService {
  private readonly client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://guest:guest@localhost:5672"],
        queue: "socialhub_main_queue",
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  publish<T>(pattern: string, payload: T) {
    return this.client.emit(pattern, payload);
  }

  // Optional: method for sending messages that require a response
  send<T, R>(pattern: string, payload: T) {
    return this.client.send<R, T>(pattern, payload);
  }

  // Ensure the client connection is established
  async onModuleInit() {
    await this.client.connect();
  }

  // Properly close the connection when the module is destroyed
  async onModuleDestroy() {
    await this.client.close();
  }
}
