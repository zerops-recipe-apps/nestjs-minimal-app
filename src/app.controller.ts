import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getDashboard(@Res() res: Response) {
    const greetings = await this.appService.findAllGreetings();
    const html = this.renderDashboard(greetings);
    res.type('html').send(html);
  }

  @Post('/greetings')
  async createGreeting(
    @Body() body: { message: string; language: string },
    @Res() res: Response,
  ) {
    await this.appService.createGreeting(body.message, body.language);
    res.redirect('/');
  }

  @Post('/greetings/delete')
  async deleteGreeting(@Body() body: { id: string }, @Res() res: Response) {
    await this.appService.deleteGreeting(parseInt(body.id, 10));
    res.redirect('/');
  }

  @Get('/api/health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('/api/status')
  async getStatus() {
    const dbStatus = await this.appService.checkDbConnection();
    return {
      status: dbStatus.connected ? 'ok' : 'degraded',
      services: { database: dbStatus },
      timestamp: new Date().toISOString(),
    };
  }

  private renderDashboard(
    greetings: Array<{
      id: number;
      message: string;
      language: string;
      createdAt: Date;
    }>,
  ): string {
    const rows = greetings
      .map(
        (g) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;color:#6b7280">${g.id}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${this.escapeHtml(g.message)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${this.escapeHtml(g.language || '')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280">${this.timeAgo(g.createdAt)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">
          <form method="POST" action="/greetings/delete" style="margin:0">
            <input type="hidden" name="id" value="${g.id}">
            <button type="submit" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:13px;padding:2px 6px;border-radius:4px" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">Delete</button>
          </form>
        </td>
      </tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NestJS Minimal — Zerops Recipe</title>
</head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;color:#111827">
  <div style="max-width:720px;margin:0 auto;padding:32px 16px">
    <header style="margin-bottom:32px">
      <h1 style="margin:0 0 4px;font-size:24px;font-weight:600">NestJS Minimal</h1>
      <p style="margin:0;color:#6b7280;font-size:14px">Zerops Recipe — PostgreSQL database integration</p>
    </header>

    <section style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:20px">
      <h2 style="margin:0 0 16px;font-size:16px;font-weight:600">Greetings</h2>

      <form method="POST" action="/greetings" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <input name="message" placeholder="Message" required
          style="flex:1;min-width:200px;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;transition:border-color .15s"
          onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#d1d5db'">
        <input name="language" placeholder="Language"
          style="width:120px;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;transition:border-color .15s"
          onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#d1d5db'">
        <button type="submit"
          style="padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;transition:background .15s"
          onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">Add</button>
      </form>

      ${
        greetings.length > 0
          ? `<div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="text-align:left">
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:500;font-size:12px;text-transform:uppercase">ID</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:500;font-size:12px;text-transform:uppercase">Message</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:500;font-size:12px;text-transform:uppercase">Language</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:500;font-size:12px;text-transform:uppercase">Created</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
          : `<p style="color:#6b7280;font-size:14px;text-align:center;padding:24px 0;margin:0">No greetings yet — add one above.</p>`
      }
    </section>

    <section style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
      <h2 style="margin:0 0 12px;font-size:16px;font-weight:600">Service Status</h2>
      <div id="status" style="font-size:14px;color:#6b7280">Loading...</div>
    </section>
  </div>

  <script>
    fetch('/api/status')
      .then(r => r.json())
      .then(data => {
        const el = document.getElementById('status');
        const db = data.services.database;
        const dot = db.connected ? '\\u25CF' : '\\u25CB';
        const color = db.connected ? '#22c55e' : '#ef4444';
        const latency = db.latencyMs != null ? db.latencyMs + ' ms' : 'n/a';
        el.innerHTML = '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="color:' + color + ';font-size:18px">' + dot + '</span>' +
          '<span><strong>PostgreSQL</strong> — ' +
          (db.connected ? 'Connected (' + latency + ')' : 'Disconnected: ' + (db.error || 'unknown')) +
          '</span></div>';
      })
      .catch(() => {
        document.getElementById('status').textContent = 'Failed to load status';
      });
  </script>
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private timeAgo(date: Date): string {
    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000,
    );
    if (seconds < 60) return seconds + 's ago';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
  }
}
