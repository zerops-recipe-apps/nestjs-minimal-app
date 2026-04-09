import type { Response } from 'express';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getDashboard(res: Response): Promise<void>;
    createGreeting(body: {
        message: string;
        language: string;
    }, res: Response): Promise<void>;
    deleteGreeting(body: {
        id: string;
    }, res: Response): Promise<void>;
    getHealth(): {
        status: string;
        timestamp: string;
    };
    getStatusAlias(): Promise<{
        status: string;
        services: {
            database: {
                connected: boolean;
                latencyMs?: number;
                error?: string;
            };
        };
        timestamp: string;
    }>;
    getStatus(): Promise<{
        status: string;
        services: {
            database: {
                connected: boolean;
                latencyMs?: number;
                error?: string;
            };
        };
        timestamp: string;
    }>;
    private renderDashboard;
    private escapeHtml;
    private timeAgo;
}
