import fs from 'fs';
import csv from 'csv-parser';

const results = [];
const inputFile = './public/raw_data.csv'; 
const outputFile = './public/shops.json';

if (!fs.existsSync(inputFile)) {
    console.error(`❌ ERROR: File '${inputFile}' tidak ditemukan!`);
    process.exit(1);
}

console.log(`🔄 Sedang memproses ${inputFile}...`);

fs.createReadStream(inputFile)
  .pipe(csv({ headers: false })) // Kita baca tanpa peduli header
  .on('data', (row) => {
    // 1. CARI KOLOM YANG BERISI LINK GOOGLE MAPS
    // Kita cari value di baris ini yang mengandung "google.co.id/maps" atau "google.com/maps"
    const linkValue = Object.values(row).find(val => val && val.includes('/maps/place/'));
    
    // 2. CARI KOLOM NAMA TOKO (Biasanya kolom ke-2 atau setelah link)
    // Jika tidak ketemu, pakai kolom index 1
    const nameValue = Object.values(row)[1]; 

    // 3. CARI ALAMAT (Cari yang mengandung "Jl." atau "Jalan")
    const addressValue = Object.values(row).find(val => val && (val.includes('Jl.') || val.includes('Jalan') || val.includes('Gang')));

    if (linkValue) {
        // Regex untuk menangkap koordinat !3d... !4d...
        const latMatch = linkValue.match(/!3d([-0-9.]+)/);
        const lngMatch = linkValue.match(/!4d([-0-9.]+)/);

        if (latMatch && lngMatch) {
            results.push({
                id: results.length + 1,
                name: nameValue || "Toko Tanpa Nama",
                lat: parseFloat(latMatch[1]),
                lng: parseFloat(lngMatch[1]),
                type: "Fotokopi", 
                price: Math.floor(Math.random() * (500 - 200 + 1) + 200),
                address: addressValue || "Alamat tidak tersedia",
                // Opsional: Ambil link gambar jika ada (biasanya yang akhiran .png/.jpg)
                image: Object.values(row).find(val => val && val.includes('gstatic.com')) || null
            });
        }
    }
  })
  .on('end', () => {
    // Filter duplikat berdasarkan nama toko (karena di data Anda ada yang dobel)
    const uniqueResults = results.filter((v,i,a)=>a.findIndex(v2=>(v2.name===v.name))===i);

    fs.writeFileSync(outputFile, JSON.stringify(uniqueResults, null, 2));
    console.log(`✅ BERHASIL!`);
    console.log(`   Data tersimpan di: ${outputFile}`);
    console.log(`   Total toko unik didapat: ${uniqueResults.length}`);
  });