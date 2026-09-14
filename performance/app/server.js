const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory products dataset (around 20-50 products)
const products = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  description: `This is the description for Product ${i + 1}`,
  price: (Math.random() * 100 + 10).toFixed(2),
}));

// GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  res.status(200).json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
