const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'vault_storage/' });

// Ensure storage folder exists
if (!fs.existsSync('vault_storage')) {
  fs.mkdirSync('vault_storage');
}

app.use(express.static('public'));

// 1. Upload Encrypted .vault File to Server
app.post('/api/vault/upload', upload.single('vaultFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const vaultId = req.file.filename;
  res.json({ success: true, vaultId, originalSize: req.file.size });
});

// 2. List All Vault Items
app.get('/api/vault/items', (req, res) => {
  fs.readdir('vault_storage', (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list vault' });
    const items = files.map(file => ({
      id: file,
      size: fs.statSync(path.join('vault_storage', file)).size
    }));
    res.json(items);
  });
});

// 3. Download Encrypted .vault File
app.get('/api/vault/download/:id', (req, res) => {
  const filePath = path.join(__dirname, 'vault_storage', req.params.id);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Vault file not found' });
  }
  res.download(filePath, `${req.params.id}.vault`);
});

app.listen(3000, () => console.log('🔒 Vault Server running on http://localhost:3000'));