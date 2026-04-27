const fs = require('fs');

// Path ke file shops.json Anda
const filePath = './public/shops.json';

// Baca file
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Kategori yang tersedia untuk random jika tidak ada keyword cocok
const randomTypes = ["Fotokopi", "Express", "24 Jam"];

const updatedData = data.map(shop => {
  const name = shop.name.toLowerCase();
  
  let newType = "Fotokopi"; // Default

  // Logika Deteksi Keyword
  if (name.includes('24 jam') || name.includes('24 hour')) {
    newType = "24 Jam";
  } else if (name.includes('jilid') || name.includes('hardcover')) {
    newType = "Jilid Hardcover";
  } else if (name.includes('print') || name.includes('digital') || name.includes('kilat') || name.includes('express')) {
    newType = "Express";
  } else {
    // Jika tidak ada keyword, acak biar filter peta terlihat ramai
    // (Agar saat demo filtering, semua kategori ada isinya)
    newType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
  }

  return { ...shop, type: newType };
});

// Simpan kembali
fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
console.log("✅ Berhasil mengupdate Type toko berdasarkan Nama!");