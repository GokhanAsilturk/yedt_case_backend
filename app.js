const express = require('express');
const app = express();

// Statik dosyaları servis et
app.use(express.static('public'));

// Diğer middleware ve rota tanımları buraya gelecek

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});