import { Repository, DataSource } from 'typeorm';
import { Greeting } from './entities/greeting.entity';
export declare class AppService {
    private greetingRepo;
    private dataSource;
    constructor(greetingRepo: Repository<Greeting>, dataSource: DataSource);
    findAllGreetings(): Promise<Greeting[]>;
    createGreeting(message: string, language: string): Promise<Greeting>;
    deleteGreeting(id: number): Promise<void>;
    checkDbConnection(): Promise<{
        connected: boolean;
        latencyMs?: number;
        error?: string;
    }>;
}
