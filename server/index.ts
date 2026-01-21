import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setupAuth } from './auth';
import { setupRoutes } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupAuth(app);
setupRoutes(app);

if (process.env.NODE_ENV === 'production') {
  const publicPath = join(__dirname, 'public');
  app.use(express.static(publicPath));

  app.get('*', (req, res) => {
    res.sendFile(join(publicPath, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
