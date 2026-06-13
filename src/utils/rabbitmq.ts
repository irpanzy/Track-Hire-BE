import * as amqp from "amqplib";
import { env } from "../config/env";

class RabbitMQClient {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  async connect() {
    try {
      const conn = await amqp.connect(env.RABBITMQ_URL);
      this.connection = conn;

      conn.on("error", (err: Error) => {
        console.error("RabbitMQ Connection Error:", err);
        this.isConnected = false;
      });

      conn.on("close", () => {
        console.log("⚠️  RabbitMQ connection closed");
        this.isConnected = false;
      });

      const ch = await conn.createChannel();
      this.channel = ch;

      ch.on("error", (err: Error) => {
        console.error("RabbitMQ Channel Error:", err);
      });

      ch.on("close", () => {
        console.log("⚠️  RabbitMQ channel closed");
      });

      console.log("✅ RabbitMQ connected successfully");
      this.isConnected = true;
    } catch (error) {
      console.error("❌ Failed to connect to RabbitMQ:", error);
      this.connection = null;
      this.channel = null;
      this.isConnected = false;

      if (env.isProduction) {
        throw error;
      }

      console.warn("⚠️  Running without RabbitMQ in development mode");
    }
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log("RabbitMQ connection closed");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
    }
  }

  private ensureConnection(): boolean {
    if (!this.channel || !this.isConnected) {
      if (env.isProduction) {
        throw new Error("RabbitMQ is not connected in production mode");
      }
      return false;
    }
    return true;
  }

  async assertQueue(queueName: string) {
    if (!this.ensureConnection()) {
      return;
    }

    try {
      await this.channel!.assertQueue(queueName, {
        durable: true,
      });
    } catch (error) {
      console.error(`Failed to assert queue ${queueName}:`, error);
      throw error;
    }
  }

  async publishToQueue(queueName: string, message: any): Promise<boolean> {
    if (!this.ensureConnection()) {
      if (env.isProduction) {
        throw new Error("RabbitMQ is not connected");
      }

      console.warn(
        `⚠️  RabbitMQ unavailable in dev mode. Would have published to ${queueName}:`,
        message
      );
      return false;
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));

      await this.assertQueue(queueName);

      const published = this.channel!.sendToQueue(queueName, messageBuffer, {
        persistent: true,
      });

      if (!published) {
        console.warn(`⚠️  Queue ${queueName} is full, message buffered`);
      }

      return published;
    } catch (error) {
      console.error(`Failed to publish to queue ${queueName}:`, error);

      if (env.isProduction) {
        throw error;
      }

      return false;
    }
  }

  async consume(queueName: string, callback: (message: any) => Promise<void>) {
    if (!this.ensureConnection()) {
      console.warn(
        `⚠️  Cannot consume from ${queueName}: RabbitMQ not connected`
      );
      return;
    }

    try {
      await this.assertQueue(queueName);

      await this.channel!.prefetch(1);

      await this.channel!.consume(
        queueName,
        async (msg: any) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);

            this.channel!.ack(msg);
          } catch (error) {
            console.error(`Error processing message from ${queueName}:`, error);

            this.channel!.nack(msg, false, false);
          }
        },
        {
          noAck: false,
        }
      );

      console.log(`📨 Consuming messages from queue: ${queueName}`);
    } catch (error) {
      console.error(`Failed to consume from queue ${queueName}:`, error);
      throw error;
    }
  }

  getChannel(): any {
    return this.channel;
  }

  getConnection(): any {
    return this.connection;
  }
}

export const rabbitmqClient = new RabbitMQClient();

export const QUEUES = {
  EMAIL_JOBS: "email_jobs",
} as const;

export const publishToQueue = (queueName: string, message: any) =>
  rabbitmqClient.publishToQueue(queueName, message);

export const consumeQueue = (
  queueName: string,
  callback: (message: any) => Promise<void>
) => rabbitmqClient.consume(queueName, callback);
