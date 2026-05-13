# IMPLEMENTATION PLAN: Web Penyemangat (Scroll Time-of-Day)

## 1. Ringkasan Proyek
Proyek ini adalah sebuah website *one-page* statis (HTML, CSS, JS) yang dirancang secara khusus untuk tampilan **mobile-first**. Tujuannya sangat sederhana: menyemangati pacar user. 

Fitur utamanya adalah animasi interaktif berbasis **scroll**: 
Ketika pengguna melakukan *scroll* halaman ke bawah, suasana (latar belakang, palet warna, benda langit) akan bertransisi secara **sangat, sangat halus** seiring waktu, merepresentasikan:
**Pagi ☀️ -> Siang ☁️ -> Sore 🌅 -> Malam 🌙**

## 2. Arsitektur & Teknologi
Untuk memastikan transisi *super mulus* dan responsivitas, berikut adalah *tech stack* yang wajib digunakan:
- **HTML5**: File `index.html`.
- **CSS3**: File `style.css` (Gunakan Vanilla CSS. Sangat disarankan memakai *CSS Variables* untuk mengontrol perubahan warna).
- **JavaScript (GSAP)**: File `script.js`. **SANGAT PENTING**: Gunakan *library* **GSAP** (GreenSock) beserta plugin **ScrollTrigger** via CDN. GSAP adalah standar industri untuk mengikat animasi kompleks dengan aktivitas *scroll* secara presisi dan tanpa patah-patah (*lag/stuttering*).
- **Google Fonts**: Import font 'Poppins' atau 'Quicksand' melalui CDN agar terlihat modern, empuk, dan elegan.
- **Aset (SVG)**: SVG lebih diutamakan dibanding gambar biasa (PNG/JPG) karena ukurannya kecil, *scalable*, dan mudah dianimasikan.

## 3. Struktur File
Direkomendasikan agar *developer/agent* membuat struktur direktori sebagai berikut:
```text
/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── sun.svg
    ├── moon.svg
    ├── stars.svg
    └── clouds.svg
```

---

## 4. Panduan Langkah-demi-Langkah (Step-by-Step)

### Step 1: Inisialisasi Kerangka HTML (`index.html`)
1. Buat kerangka dasar dokumen HTML5.
2. Tambahkan tag meta viewport: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
3. Import Google Fonts (contoh: Poppins bobot 400, 600, 700).
4. Import CDN GSAP sebelum akhir body:
   - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`
   - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js`
5. Susunan Struktur DOM:
   - Sebuah elemen `<div id="sky-container">` yang memuat latar belakang langit dan diletakkan **fixed** di belakang konten (`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1;`).
   - Di dalam langit tersebut, sisipkan tag `<img>` atau elemen objek untuk aset `sun.svg`, `moon.svg`, `stars.svg`, dan `clouds.svg` (beri posisi `absolute`).
   - Sebuah `<main>` yang menampung 4 buah `<section>`. Setiap section memiliki ID spesifik: `#pagi`, `#siang`, `#sore`, `#malam`.
   - Pastikan setiap section punya minimal tinggi `100vh` agar memiliki ruang yang cukup untuk *scroll*.

### Step 2: Styling Dasar & Palet CSS (`style.css`)
1. Lakukan reset CSS (`margin: 0; padding: 0; box-sizing: border-box;`).
2. Definisikan `font-family: 'Poppins', sans-serif;` ke seluruh teks.
3. Tetapkan **CSS Variables** di `:root` untuk palet warna pagi (karena ini *default* sebelum discroll).
4. Buat kontainer section memusatkan konten ke tengah halaman menggunakan `display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;`.
5. Beri gaya tipografi yang manis pada judul dan pesan.
6. Aset benda langit (matahari, bulan) disembunyikan / ditempatkan di koordinat Y tertentu (misalnya, bulan di bawah layar, dan bintang dalam keadaan `opacity: 0`).

### Step 3: Membuat Konten Teks Penyemangat
Sisipkan teks ini ke dalam masing-masing section:
- **Pagi (`#pagi`)**: "Selamat Pagi! ☀️ Awali harimu dengan senyuman yang manis."
- **Siang (`#siang`)**: "Wah, Udah Siang Nih! ☁️ Jangan lupa makan siang dan rehat sejenak ya."
- **Sore (`#sore`)**: "Selamat Sore! 🌅 Hebat banget udah bertahan sejauh ini. Sebentar lagi selesai!"
- **Malam (`#malam`)**: "Selamat Malam! 🌙 Terima kasih untuk hari ini. Waktunya istirahat, mimpi indah!"

*(Tambahkan efek text-shadow lembut agar teks tetap terbaca dengan jelas apapun warna background-nya)*.

### Step 4: Menambahkan Logika Animasi Scroll (`script.js`)
Ini adalah inti dari interaksi:
1. Registrasi ScrollTrigger: `gsap.registerPlugin(ScrollTrigger);`
2. Buat sebuah Master Timeline yang dihubungkan dengan `ScrollTrigger`. Area trigger-nya adalah mulai dari puncak halaman hingga ke ujung halaman.
3. **Animasi Warna Langit (`backgroundColor`)**:
   - Pagi (0%): Biru muda pucat/lembut.
   - Siang (33%): Biru laut cerah / biru terik terang.
   - Sore (66%): Gradasi / warna Oranye Jingga keunguan.
   - Malam (100%): Biru gelap kehitaman.
   *(GSAP bisa mentransisi perpindahan warna HEX/RGB dengan sangat lembut)*.
4. **Animasi Aset (Posisi dan Opacity)**:
   - **Matahari**: Bergerak naik (`y: -...`) di pagi menuju siang, lalu bergerak turun tenggelam di sore hari.
   - **Bulan & Bintang**: *Opacity*-nya adalah `0` di pagi dan siang. Ketika sore masuk ke malam, matahari menghilang (*opacity* `0`), lalu bulan bergerak naik dengan *opacity* menjadi `1`. Bintang juga perlahan menyala.
5. **Animasi Teks**: Secara opsional, ubah warna teks dari gelap ke terang perlahan saat transisi sore ke malam.

### Step 5: Pengujian Responsivitas Mobile
- Pastikan tidak ada *horizontal scroll*.
- Animasi harus berjalan dengan optimasi perangkat keras dengan memastikan atribut animasi hanya menggunakan `transform` (`x`, `y`, `scale`) dan `opacity`.
- Font teks tidak boleh terpotong saat layar disempitkan.

---

## 5. Pembuatan File Aset
Beberapa file *asset* SVG sudah dibuat di folder `/assets` untuk membantu developer mengeksekusi proyek ini lebih cepat. Aset yang dibuat meliputi matahari bercahaya, bulan sabit dengan *glow*, hamparan bintang, dan awan sederhana.
