import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer, Consumer } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private connected = false;

  isAvailable() {
    return this.connected;
  }

  async onModuleInit() {
    const brokers = process.env.KAFKA_BROKERS;
    if (!brokers) {
      this.logger.warn("KAFKA_BROKERS not set — order events use in-process EventEmitter");
      return;
    }

    try {
      this.kafka = new Kafka({
        clientId: "dropmart-api",
        brokers: brokers.split(",").map((b) => b.trim()),
      });
      this.producer = this.kafka.producer();
      await this.producer.connect();
      this.connected = true;
      this.logger.log("Kafka producer connected");
    } catch (err) {
      this.logger.warn(`Kafka unavailable — ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  async publish(topic: string, message: object, key?: string) {
    if (!this.producer) return false;
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(message) }],
      });
      return true;
    } catch (err) {
      this.logger.error(`Kafka publish failed: ${err instanceof Error ? err.message : "unknown"}`);
      return false;
    }
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
  }
}
