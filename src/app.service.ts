import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Greeting } from './entities/greeting.entity.js';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Greeting)
    private greetingRepo: Repository<Greeting>,
    private dataSource: DataSource,
  ) {}

  findAllGreetings(): Promise<Greeting[]> {
    return this.greetingRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createGreeting(message: string, language: string): Promise<Greeting> {
    const greeting = this.greetingRepo.create({ message, language });
    return this.greetingRepo.save(greeting);
  }

  async deleteGreeting(id: number): Promise<void> {
    await this.greetingRepo.delete(id);
  }

  async checkDbConnection(): Promise<{
    connected: boolean;
    latencyMs?: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      return { connected: true, latencyMs: Date.now() - start };
    } catch (err) {
      return { connected: false, error: (err as Error).message };
    }
  }
}
