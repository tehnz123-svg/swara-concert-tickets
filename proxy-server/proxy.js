const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(express.json());

app.post('/proxy/tickets', async (req, res) => {
  try {
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbyLFJOebiOiym8EcGXfFG3F-Z1hyYfRxgrgTADA0_mpWeF9X9dy1hMZdMexsTOpUmvk/exec',
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});