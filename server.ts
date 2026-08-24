import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DADU API Backend',
      version: '1.2.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Secure Server-side Admin Bootstrap Verification Endpoint
  app.post('/api/admin/bootstrap-status', (req: Request, res: Response) => {
    const hasAdminSecret = Boolean(process.env.DADU_ADMIN_BOOTSTRAP_SECRET);
    res.json({
      status: 'ready',
      bootstrapSecretConfigured: hasAdminSecret,
      note: 'Admin bootstrap is managed securely without client-side privilege escalation.',
    });
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DADU application server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
