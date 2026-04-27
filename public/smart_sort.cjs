const fs = require('fs');
const path = require('path');


const filePath = path.join(__dirname, 'shops.json');


if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: File shops.json tidak ditemukan di: ${filePath}`);
    process.exit(1);
}


const rawData = fs.readFileSync(filePath, 'utf8');
let shops = JSON.parse(rawData);

console.log(`🔄 Memproses ${shops.length} toko...`);


const updatedShops = shops.map(shop => {
    
    let generatedRating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);

    
    let newType = "Fotokopi"; 
    const nameLower = shop.name.toLowerCase();

    if (nameLower.includes("24 jam") || nameLower.includes("24 hour")) {
        newType = "24 Jam";
    } else if (nameLower.includes("jilid") || nameLower.includes("hardcover")) {
        newType = "Jilid Hardcover";
    } else if (nameLower.includes("kilat") || nameLower.includes("express") || nameLower.includes("digital") || nameLower.includes("print")) {
        newType = "Express";
    }

    if (parseFloat(generatedRating) >= 4.8) {
        newType = "Recommended";
    }
// D. Return Data Baru
    return {
        ...shop,
        price: shop.price || Math.floor(Math.random() * (500 - 150 + 1) + 150),
        rating: generatedRating,
        type: newType
    };
});


fs.writeFileSync(filePath, JSON.stringify(updatedShops, null, 2));

console.log("============================================");
console.log("✅ SUKSES! Data berhasil di-update.");
console.log("--------------------------------------------");
console.log(`⭐ Jumlah Toko 'Recommended': ${updatedShops.filter(s => s.type === 'Recommended').length}`);
console.log(`🌙 Jumlah Toko '24 Jam': ${updatedShops.filter(s => s.type === '24 Jam').length}`);
console.log("============================================");