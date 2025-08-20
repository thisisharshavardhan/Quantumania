import express from 'express';

console.log('Testing basic imports...');
const app = express();
console.log('Express imported successfully');

app.get('/', (req, res) => {
  res.json({ message: 'Test successful' });
});

const PORT = 3849;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
