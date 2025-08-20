import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3849;

// Middleware
app.use(cors());
app.use(express.json());

// Test route first
app.get('/', (req, res) => {
  res.json({
    message: 'Quantumania Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Test import of quantum routes
import quantumRoutes from './routers/quantumRoutes.js';
app.use('/api/quantum', quantumRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
