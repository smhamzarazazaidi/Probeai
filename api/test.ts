import express from 'express';
const app = express();
app.get('/api/test', (req, res) => res.json({ message: 'Minimal API is working!' }));
export default app;
