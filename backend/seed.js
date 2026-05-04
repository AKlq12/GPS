// ============================================
// Database Seed Script
// Membuat tabel users & shops, lalu mengisi data shops
// ============================================
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Data toko dari shops.json
const shopsData = [
  {"id":1,"name":"Fotocopy Cahaya UPN Ring Road","lat":-7.7649088,"lng":110.4111359,"type":"Recommended","price":420,"address":"Jalan Seturan Raya Ruko, Puluhdadi Jl. Raya Seturan No.B24","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.8"},
  {"id":2,"name":"Photo Copy Rahayu","lat":-7.7796707,"lng":110.4165886,"type":"Fotokopi","price":429,"address":"Jl. Babarsari Jl. Tambak Bayan 8 No.6A","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.7"},
  {"id":3,"name":"Excellent Fotocopy Print Jilid Buka 24 jam","lat":-7.7648517,"lng":110.4111754,"type":"24 Jam","price":304,"address":"Alamat tidak tersedia","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.6"},
  {"id":4,"name":"Oke Fotocopy 2","lat":-7.763901,"lng":110.411571,"type":"Fotokopi","price":303,"address":"Jalan Seturan Raya No.399, Puluhdadi, Seturan, Depan UPN pintu Timur","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.7"},
  {"id":5,"name":"Excellent Fotocopy Babarsari","lat":-7.7738076,"lng":110.416013,"type":"Fotokopi","price":392,"address":"6CG8+FCC, Jl. Tambak Bayan","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.5"},
  {"id":6,"name":"Photo Copy Andestal","lat":-7.7749781,"lng":110.415863,"type":"Fotokopi","price":368,"address":"Jl. Babarsari No.23A","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.7"},
  {"id":7,"name":"Sinar Fotocopy \"Sinar Print Copy Center\"","lat":-7.7633418,"lng":110.4067487,"type":"Express","price":230,"address":"Jl. Pintu Selatan UPN","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.5"},
  {"id":8,"name":"Photocopy & Penjilidan ARIES","lat":-7.7785652,"lng":110.4167589,"type":"Jilid Hardcover","price":361,"address":"Jl. Tambak Bayan IX Jl. Babarsari","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.7"},
  {"id":9,"name":"Century Photocopy Center","lat":-7.778758,"lng":110.4167304,"type":"Fotokopi","price":485,"address":"Jl. Tambak Bayan IX No.1c","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.1"},
  {"id":10,"name":"Fotocopy Surya UPN","lat":-7.7635104,"lng":110.4067776,"type":"Fotokopi","price":472,"address":"Jl. Pintu Selatan UPN No.77","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.7"},
  {"id":11,"name":"Agung Digital Printing","lat":-7.782569,"lng":110.4140414,"type":"Express","price":212,"address":"Jl. Babarsari No.5","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.1"},
  {"id":12,"name":"fotocopy Daniswara","lat":-7.7732905,"lng":110.416044,"type":"Fotokopi","price":462,"address":"16 6A, Jl. Babarsari Jl. Tambak Bayan","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.6"},
  {"id":13,"name":"Kurnia Abadi Photo Copy","lat":-7.8031438,"lng":110.4161985,"type":"Fotokopi","price":329,"address":"Jl. Cendrawasih 27 No.222","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.8"},
  {"id":14,"name":"BeOne Photocopy Pusat","lat":-7.7676493,"lng":110.3928901,"type":"Fotokopi","price":229,"address":"Alamat tidak tersedia","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.5"},
  {"id":15,"name":"Excellent Fotocopy Tambakbayan 2","lat":-7.7819295,"lng":110.4162468,"type":"Fotokopi","price":433,"address":"Jl. Babarsari Jl. Tambakbayan III No.9","image":null,"rating":"4.2"},
  {"id":16,"name":"Tsabita Foto Copy","lat":-7.7789758,"lng":110.4154346,"type":"Fotokopi","price":476,"address":"6CC8+C53, Jl. Babarsari","image":null,"rating":"3.7"},
  {"id":17,"name":"Andi Photo Copy","lat":-7.8022951,"lng":110.4029334,"type":"Fotokopi","price":455,"address":"Jl. Wonocatur No.09","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.7"},
  {"id":18,"name":"foto copy 24 jam BERKAH JAYA BERSAMA","lat":-7.7734118,"lng":110.3889855,"type":"24 Jam","price":436,"address":"Alamat tidak tersedia","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.3"},
  {"id":19,"name":"Nologaten Copy Center","lat":-7.778735,"lng":110.4001941,"type":"Fotokopi","price":348,"address":"Jl. Nologaten No.254","image":null,"rating":"4.3"},
  {"id":20,"name":"Global Digital Printing UPN YK buka 24 jam","lat":-7.7648123,"lng":110.4111895,"type":"24 Jam","price":332,"address":"Komplek Ruko, Jl. Seturan Raya Puluhdadi No.b20","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.2"},
  {"id":21,"name":"Difano Jaya Copier","lat":-7.7771379,"lng":110.4082833,"type":"Fotokopi","price":496,"address":"Jl. Kledokan V No.12b","image":null,"rating":"3.8"},
  {"id":22,"name":"DESYA photo Copy & print","lat":-7.7822913,"lng":110.4161938,"type":"Express","price":284,"address":"Jl. Tambak Bayan III No.1","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.8"},
  {"id":23,"name":"Rental, Fotocopy & Service Laptop Sahabat","lat":-7.792282,"lng":110.408736,"type":"Fotokopi","price":280,"address":"Karang Jambe Jalan Janti No.138 Gang Puntodewo Banguntapan","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.0"},
  {"id":24,"name":"Sekar Langit Print & Copy Centre","lat":-7.7743464,"lng":110.4153533,"type":"Express","price":332,"address":"6CG8+749, Jl. Babarsari","image":null,"rating":"4.2"},
  {"id":25,"name":"Foto Copy Sahumpun","lat":-7.7771642,"lng":110.408282,"type":"Fotokopi","price":239,"address":"Jl. Kledokan V No.12b","image":null,"rating":"3.6"},
  {"id":26,"name":"Merkurius Fotokopi","lat":-7.7685152,"lng":110.3892018,"type":"Recommended","price":287,"address":"CTX, Jl. Flamboyan No.11A","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.9"},
  {"id":27,"name":"Putra Fotokopi","lat":-7.7639774,"lng":110.4115393,"type":"Fotokopi","price":422,"address":"Jl. Seturan Raya Gg. Puluhdadi No.399","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.1"},
  {"id":28,"name":"Fotocopy, Printing, Jilid, ATK & Percetakan berkualitas (Fajar Copy Paste) by CV. FAJAR NOESANTARA","lat":-7.7691574,"lng":110.389133,"type":"Jilid Hardcover","price":478,"address":"Karangasem, Jl. Flamboyan CTX No.06","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.7"},
  {"id":29,"name":"Ahza fc","lat":-7.7703178,"lng":110.4238774,"type":"Fotokopi","price":497,"address":"Jl. Nangka III No.44a","image":null,"rating":"4.3"},
  {"id":30,"name":"Almande Foto Copy & Penjilidan","lat":-7.7595275,"lng":110.4239838,"type":"Jilid Hardcover","price":500,"address":"Jl. Timbulrejo","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.1"},
  {"id":31,"name":"Aulia Fotocopy Yogyakarta","lat":-7.7821809,"lng":110.406642,"type":"Fotokopi","price":259,"address":"Jl. Laksda Adisucipto No.20A","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.1"},
  {"id":32,"name":"Fotokopi Restu Abadi","lat":-7.7678355,"lng":110.3958084,"type":"Fotokopi","price":484,"address":"Jl. Tantular No.91","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.5"},
  {"id":33,"name":"Terang Photo Copy","lat":-7.7628349,"lng":110.4064166,"type":"Recommended","price":372,"address":"Ruko Gorongan, Jl. Perumnas No.25","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.9"},
  {"id":34,"name":"Nusa Indah 2 Fotocopy","lat":-7.7598314,"lng":110.4123962,"type":"Fotokopi","price":419,"address":"Jl. Prawiro Kuat","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.1"},
  {"id":35,"name":"Toko Karunia (Fotocopy, ATK, Toserba)","lat":-7.7927493,"lng":110.4015662,"type":"Recommended","price":322,"address":"Jl. Pura Jl. Sorowajan No.190, RT.09/RW.11","image":null,"rating":"4.8"},
  {"id":36,"name":"Arya Shaka","lat":-7.803705,"lng":110.4161226,"type":"Fotokopi","price":259,"address":"Jl. Cendrawasih No.220, Jl. Maguwo No.RT.15","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.5"},
  {"id":37,"name":"Bandicota Fotocopy","lat":-7.7619905,"lng":110.4242034,"type":"Fotokopi","price":244,"address":"Jalan Nangka 2 No.223, Karangnongko","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.5"},
  {"id":38,"name":"HR Foto Copy","lat":-7.7799512,"lng":110.4040363,"type":"Fotokopi","price":338,"address":"Jalan Laksda Adisucipto Km 5 Gang Tempel Caturtunggal Depok Sleman Tempel, 282.rt 08, RT.08/RW.03","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.9"},
  {"id":39,"name":"fotokopi Almande2 Kalasan","lat":-7.7593115,"lng":110.4491885,"type":"Jilid Hardcover","price":213,"address":"Alamat tidak tersedia","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.5"},
  {"id":40,"name":"Excellent Fotocopy Solution (Spesialist Print & Jilid HARDCOVER KILAT 1 JAM)","lat":-7.8142096,"lng":110.3282174,"type":"Jilid Hardcover","price":370,"address":"Jl. Sunan Kudus","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"3.7"},
  {"id":41,"name":"WSR Digital Print","lat":-7.7852359,"lng":110.447327,"type":"Recommended","price":285,"address":"Jl. Jagalan Utara, RT.07/RW.03","image":null,"rating":"4.8"},
  {"id":42,"name":"Ranjana Fotocopy Express","lat":-7.8070041,"lng":110.3392713,"type":"Jilid Hardcover","price":324,"address":"Jl. Sonosewu Baru","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.2"},
  {"id":43,"name":"Fotocopy Flash Net","lat":-7.7488733,"lng":110.4490872,"type":"Fotokopi","price":486,"address":"Jl. Purwomartani Jl. Japlaksari No.15, RT.18/RW.02","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.0"},
  {"id":44,"name":"FotoCopy Surya Jaya","lat":-7.775692,"lng":110.4494023,"type":"Fotokopi","price":485,"address":"Alamat tidak tersedia","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.4"},
  {"id":45,"name":"Fotocopy Kembar","lat":-7.7762418,"lng":110.449476,"type":"Fotokopi","price":291,"address":"Jl. Ukrim Jl. Kadirojo 1 No.69, RT.07/RW.02","image":"https://ssl.gstatic.com/local/servicebusiness/default_user.png","rating":"4.2"}
];

async function seed() {
  let connection;
  
  // Retry logic: tunggu MySQL siap
  for (let i = 0; i < 30; i++) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'printpoint_user',
        password: process.env.DB_PASSWORD || 'userpassword',
        database: process.env.DB_NAME || 'printpoint_db',
        port: process.env.DB_PORT || 3306,
      });
      console.log('✅ Berhasil terhubung ke database!');
      break;
    } catch (err) {
      console.log(`⏳ Menunggu database siap... (${i + 1}/30)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  if (!connection) {
    console.error('❌ Gagal terhubung ke database setelah 30 kali percobaan.');
    process.exit(1);
  }

  try {
    // --- Buat tabel USERS ---
    console.log('📋 Membuat tabel users...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('   ✅ Tabel users berhasil dibuat.');

    // --- Buat tabel SHOPS ---
    console.log('📋 Membuat tabel shops...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        type VARCHAR(100),
        price INT,
        address VARCHAR(500),
        image VARCHAR(500),
        rating VARCHAR(10)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('   ✅ Tabel shops berhasil dibuat.');

    // --- Cek apakah tabel shops sudah ada isinya ---
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM shops');
    if (rows[0].count > 0) {
      console.log(`ℹ️  Tabel shops sudah berisi ${rows[0].count} data. Skip seed.`);
    } else {
      // --- Seed data shops ---
      console.log(`🌱 Mengisi data ${shopsData.length} toko ke database...`);
      for (const shop of shopsData) {
        await connection.query(
          'INSERT INTO shops (id, name, lat, lng, type, price, address, image, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [shop.id, shop.name, shop.lat, shop.lng, shop.type, shop.price, shop.address, shop.image, shop.rating]
        );
      }
      console.log(`   ✅ Berhasil mengisi ${shopsData.length} data toko!`);
    }

    console.log('\n🎉 Seed selesai! Database siap digunakan.');
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
