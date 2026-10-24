import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Health check endpoint for Cloud Run and container liveness probes
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for Single Page Application client routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build not found. Please run npm run build first.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`PingoNest production server running on port ${port}`);
});
