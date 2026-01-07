const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Servir les fichiers statiques du dossier 'front'
app.use(express.static(path.join(__dirname, 'front')));

// Route catch-all pour servir index.html pour les routes SPA
// Doit être en dernier pour ne pas intercepter les fichiers statiques
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

