// ============================================================================
// DATABASE.JS - DATABASE PEGAWAI TERPUSAT & KONFIGURASI CLOUD FIREBASE
// SATKER PELAKSANAAN JALAN NASIONAL WILAYAH III PROV. SULAWESI SELATAN
// Digunakan bersama oleh Modul Surat Tugas & Modul SPJ Perjalanan Dinas
// ============================================================================

const FIREBASE_DATABASE_URL = "https://surat-tugas-pjn3-default-rtdb.asia-southeast1.firebasedatabase.app/";
const SURAT_TUGAS_FIREBASE_URL = "https://surat-tugas-pjn3-default-rtdb.asia-southeast1.firebasedatabase.app";

const DEFAULT_DATABASE_PEGAWAI = [
  {
    "no": 1,
    "nama": "Malik, ST., MM",
    "nip": "NIP 197012312007011017",
    "pangkat": "Pembina / IV-a",
    "jabatan": "Kepala Satuan Kerja"
  },
  {
    "no": 2,
    "nama": "Nixon Soplantila, SE",
    "nip": "NIP 197006152008121001",
    "pangkat": "Penata / III-c",
    "jabatan": "Pejabat Penandatanganan SPM"
  },
  {
    "no": 3,
    "nama": "Wahyuni, SE",
    "nip": "NIP 197605152014102001",
    "pangkat": "Penata / III-c",
    "jabatan": "Bendahara Pengeluaran"
  },
  {
    "no": 4,
    "nama": "Suarni Awing, S.T., M.T",
    "nip": "NIP 197701152009112001",
    "pangkat": "Penata Tk. I / III-d",
    "jabatan": "Asisten Keuangan, Umum & Pelaporan"
  },
  {
    "no": 5,
    "nama": "Muhammad Ridha, S.E",
    "nip": "NIP 198307132014101001",
    "pangkat": "Penata Muda Tk. I / III-b",
    "jabatan": "Asisten Pengelolaan BMN"
  },
  {
    "no": 6,
    "nama": "Inayah, ST",
    "nip": "NIP 199504132018022003",
    "pangkat": "Penata Muda Tk. I / III-b",
    "jabatan": "Asisten Pelaksanaan & Pengawasan"
  },
  {
    "no": 7,
    "nama": "Hendra, ST",
    "nip": "NIP 198701152010121004",
    "pangkat": "Penata / III-c",
    "jabatan": "Asisten Program, Rencana & Adm. Teknis"
  },
  {
    "no": 8,
    "nama": "Yuni Harjani H, ST. MT",
    "nip": "NIP 197106071999032008",
    "pangkat": "Pembina / IV-a",
    "jabatan": "Petugas Data Teknis Jalan & Jembatan"
  },
  {
    "no": 9,
    "nama": "Tirana Novitri, ST",
    "nip": "NIP 199511062020122007",
    "pangkat": "Penata Muda / III-a",
    "jabatan": "Petugas Data Teknis Jalan & Jembatan"
  },
  {
    "no": 10,
    "nama": "Eri Roki Natanael, ST",
    "nip": "NIP 199608252022031009",
    "pangkat": "Penata Muda / III-a",
    "jabatan": "Petugas Pemantauan Progres Lapangan"
  },
  {
    "no": 11,
    "nama": "A. Baso Asrul Djamil",
    "nip": "NIP 198005132014121003",
    "pangkat": "Pengatur Muda Tk. I / II-b",
    "jabatan": "Petugas Pengawasan Desain Teknik"
  },
  {
    "no": 12,
    "nama": "Yumi Yurinda, SE, MM",
    "nip": "NIP 197905172007012020",
    "pangkat": "Penata Tk. I / III-d",
    "jabatan": "Pengelola Barang Milik Negara"
  },
  {
    "no": 13,
    "nama": "Solihin, AR",
    "nip": "NIP 198101042014101001",
    "pangkat": "Pengatur Muda Tk. I / II-b",
    "jabatan": "Petugas Unit Akuntansi KPA"
  },
  {
    "no": 14,
    "nama": "Sitti Khadijah Niode, SE",
    "nip": "NIP 197403192008122001",
    "pangkat": "Penata Tk. I / III-d",
    "jabatan": "Petugas Pembukuan dan Pembayaran"
  },
  {
    "no": 15,
    "nama": "Henny Taro, S. Sos",
    "nip": "NIP 197808202009112001",
    "pangkat": "Penata / III-c",
    "jabatan": "Petugas E-Monitoring, SiPP & Lakip"
  },
  {
    "no": 16,
    "nama": "Sherly Rauf, S.Sos",
    "nip": "NIP 197206162014122001",
    "pangkat": "Penata / III-c",
    "jabatan": "Petugas Administrasi, Umum, Hukum & Rumah Tangga"
  },
  {
    "no": 17,
    "nama": "Rosmawati Abdullah, Amd",
    "nip": "NIP 196712092009112001",
    "pangkat": "Penata Muda Tk. I / III-b",
    "jabatan": "Petugas Sub Urusan Keuangan"
  },
  {
    "no": 18,
    "nama": "Muhammad Rizal Tutu, SH, MH",
    "nip": "NIP NRP D16121989092018002",
    "pangkat": "Substantif / III-a",
    "jabatan": "Analis Hukum Ahli Pertama"
  },
  {
    "no": 19,
    "nama": "Aqieraah Islamsyah Razak, SH",
    "nip": "NIP 199104022025212049",
    "pangkat": "Golongan IX",
    "jabatan": "Analis Hukum Ahli Pertama"
  },
  {
    "no": 20,
    "nama": "Iswahyudi Kasim Dm, SE",
    "nip": "NIP 197209062025211021",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 21,
    "nama": "Andi Nurhaedah, ST",
    "nip": "NIP 197603022025212014",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 22,
    "nama": "Rachmatia, SE",
    "nip": "NIP 197808042025212013",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 23,
    "nama": "Enysiswari Yusuf, ST",
    "nip": "NIP 198106042025212028",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 24,
    "nama": "Taufik Hariono, SE",
    "nip": "NIP 198107292025211037",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 25,
    "nama": "Ahmad Mahfud, S.Kom",
    "nip": "NIP 197712042025211017",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 26,
    "nama": "Muhammad Takdir, S.Kom",
    "nip": "NIP 198610152025211052",
    "pangkat": "Golongan IX",
    "jabatan": "Pranata Komputer Ahli Pertama"
  },
  {
    "no": 27,
    "nama": "Jeanny Imelda Pattikayhatu, S.Si",
    "nip": "NIP 197506282025212006",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 28,
    "nama": "Herman, SE",
    "nip": "NIP 197806082025211028",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 29,
    "nama": "Roslinda Baso, S.E",
    "nip": "NIP 197901282025212013",
    "pangkat": "Golongan IX",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 30,
    "nama": "Riko",
    "nip": "NIP 197912122025211033",
    "pangkat": "Golongan V",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 31,
    "nama": "Sulham",
    "nip": "NIP 198009022025211022",
    "pangkat": "Golongan V",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 32,
    "nama": "Murdianto, A.Md",
    "nip": "NIP 197609202025211018",
    "pangkat": "Golongan VII",
    "jabatan": "Pengelola Layanan Operasional"
  },
  {
    "no": 33,
    "nama": "Riskianto",
    "nip": "NIP 199608312025211027",
    "pangkat": "Golongan V",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 34,
    "nama": "Muhammad Basir",
    "nip": "NIP 197709102025211034",
    "pangkat": "Golongan V",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 35,
    "nama": "Harmes",
    "nip": "NIP 198106152025211045",
    "pangkat": "Golongan V",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 36,
    "nama": "Akbar",
    "nip": "NIP 197408062025211025",
    "pangkat": "Golongan V",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 37,
    "nama": "Seniati Allo Samuel, SE",
    "nip": "NIP NRP D18061977092018001",
    "pangkat": "Substantif / III-a",
    "jabatan": "Penata Keuangan"
  },
  {
    "no": 38,
    "nama": "Hasbudi",
    "nip": "NIP NRP D06061979092018002",
    "pangkat": "Pendukung / II-a",
    "jabatan": "Operator Alat Berat"
  },
  {
    "no": 39,
    "nama": "Irwan AR, ST, MT",
    "nip": "NIP 198301022010121001",
    "pangkat": "Penata Tk. I / III-d",
    "jabatan": "Pejabat Pembuat Komitmen 3.1 Prov. SulSel"
  },
  {
    "no": 40,
    "nama": "Ismail Rahim, ST. MT",
    "nip": "NIP 197903062010121002",
    "pangkat": "Penata / III-c",
    "jabatan": "Pejabat Pembuat Komitmen 3.2 Prov. SulSel"
  },
  {
    "no": 41,
    "nama": "Roslina Tahir, ST, MT",
    "nip": "NIP 197710242009012001",
    "pangkat": "Penata Tk. I / III-d",
    "jabatan": "Pejabat Pembuat Komitmen 3.3 Prov. SulSel"
  },
  {
    "no": 42,
    "nama": "Muh. Alamsyah Irianto Kasim, ST",
    "nip": "NIP 198602052010121002",
    "pangkat": "Penata / III-c",
    "jabatan": "Pejabat Pembuat Komitmen 3.4 Prov. SulSel"
  },
  {
    "no": 43,
    "nama": "Yumi Yurinda, SE",
    "nip": "NIP 197905172007012020",
    "pangkat": "-",
    "jabatan": "Pengelola Layanan Operasional"
  },
  {
    "no": 44,
    "nama": "Andi Baso Asrul Djamil",
    "nip": "NIP 198005132014121003",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 45,
    "nama": "Muhammad Basir. T",
    "nip": "NIP 197709102025211034",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 46,
    "nama": "Eri Roki Natanael, S.T.",
    "nip": "NIP 199608252022031009",
    "pangkat": "-",
    "jabatan": "Kepala Urusan Tata Usaha"
  },
  {
    "no": 47,
    "nama": "Saharullah, ST",
    "nip": "NIP 197604082008121001",
    "pangkat": "-",
    "jabatan": "Pelaksana (Koordinator Pengawas Lapangan)"
  },
  {
    "no": 48,
    "nama": "ST. Salmah, SS",
    "nip": "NIP 196810202007012001",
    "pangkat": "-",
    "jabatan": "Pengelola Layanan Operasional"
  },
  {
    "no": 49,
    "nama": "Hujerah, S.Sos",
    "nip": "NIP 196811182008122001",
    "pangkat": "-",
    "jabatan": "Pengelola Layanan Operasional"
  },
  {
    "no": 50,
    "nama": "Marliah",
    "nip": "NIP 197405052009112001",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 51,
    "nama": "Ikhwan",
    "nip": "NIP 197204152014121004",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 52,
    "nama": "Sukmawaty Sahabuddin",
    "nip": "NIP 197211092009112001",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 53,
    "nama": "Rudy Hendra Wijaya, ST",
    "nip": "NIP 197310192025211012",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 54,
    "nama": "Muhammad Rusdy, ST",
    "nip": "NIP 198203032025211047",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 55,
    "nama": "Charles Niku, ST",
    "nip": "NIP 198303292025211037",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 56,
    "nama": "Andi Sarimustika Muin, ST",
    "nip": "NIP 199106072025212046",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 57,
    "nama": "M. Suratman M, A.Md.",
    "nip": "NIP 198108122024211003",
    "pangkat": "-",
    "jabatan": "Penata Laksana Jalan dan Jembatan Terampil"
  },
  {
    "no": 58,
    "nama": "Jeson Ruga, A.Md",
    "nip": "NIP 198708112025211037",
    "pangkat": "-",
    "jabatan": "Penata Laksana Jalan Dan Jembatan Terampil"
  },
  {
    "no": 59,
    "nama": "Irfan Afandy, SE",
    "nip": "NIP 197911062025211018",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 60,
    "nama": "Nur Suhastini MS, SE",
    "nip": "NIP 199112092025212046",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 61,
    "nama": "Febrianty Parastuti, SE",
    "nip": "NIP 199802232025212025",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 62,
    "nama": "Muhammad Rio Andhika Noor",
    "nip": "NIP 198206212025211026",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 63,
    "nama": "Subair",
    "nip": "NIP 197103152025211010",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 64,
    "nama": "Andi Pamil",
    "nip": "NIP 197804302025211009",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 65,
    "nama": "Roby Sumarlam",
    "nip": "NIP 198006092025211028",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 66,
    "nama": "Asdar M",
    "nip": "NIP 198109262025211030",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 67,
    "nama": "Ronald Haris",
    "nip": "NIP 198704292025211034",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 68,
    "nama": "Ari Wibowo",
    "nip": "NIP 199009022025211030",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 69,
    "nama": "Khairul Arief",
    "nip": "NIP 198807122025211065",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 70,
    "nama": "Muhtar",
    "nip": "NIP 198508092025211043",
    "pangkat": "-",
    "jabatan": "Pengelola Umum Operasional"
  },
  {
    "no": 71,
    "nama": "Anastasia Mani Sarungallo, ST, MT",
    "nip": "NIP 199110102015032006",
    "pangkat": "-",
    "jabatan": "Asisten Program, Rencana dan Adm. Teknis"
  },
  {
    "no": 72,
    "nama": "Tirana Novitri S, S.T., M.Eng.",
    "nip": "NIP 199511062020122007",
    "pangkat": "-",
    "jabatan": "Kepala Urusan Tata Usaha"
  },
  {
    "no": 73,
    "nama": "Kamal Makkulau, ST",
    "nip": "NIP 196904102007011001",
    "pangkat": "-",
    "jabatan": "Pelaksana (Koordinator Pengawas Lapangan)"
  },
  {
    "no": 74,
    "nama": "Andi Nilawati, SE",
    "nip": "NIP 197606192009112001",
    "pangkat": "-",
    "jabatan": "Pengelola Layanan Operasional"
  },
  {
    "no": 75,
    "nama": "Lukman Hakim",
    "nip": "NIP 196905212009111001",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 76,
    "nama": "Chalifahtuddin Sabri",
    "nip": "NIP 197103242007011002",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 77,
    "nama": "Iskandar",
    "nip": "NIP 197508092009111001",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 78,
    "nama": "Ilham",
    "nip": "NIP 196812042014121003",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 79,
    "nama": "Sarman, ST",
    "nip": "NIP 197808092025211011",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 80,
    "nama": "Andi Wahyudi, ST",
    "nip": "NIP 198006052025211043",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 81,
    "nama": "Novita Sari, SE",
    "nip": "NIP 198411102025212038",
    "pangkat": "-",
    "jabatan": "Analis Sumber Daya Manusia Aparatur Ahli Pertama"
  },
  {
    "no": 82,
    "nama": "Nurul Indra Sujabdi, ST",
    "nip": "NIP 199107232025212043",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 83,
    "nama": "Mulia Mustamin, ST",
    "nip": "NIP 198107262025211026",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 84,
    "nama": "Hilda Rukmana Arsyad, ST",
    "nip": "NIP 198701272025212040",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 85,
    "nama": "Rizwan Setyawan, S. Kom",
    "nip": "NIP 199112292025211039",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 86,
    "nama": "Syahruddin, SE",
    "nip": "NIP 198808162025211049",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 87,
    "nama": "Hasim",
    "nip": "NIP 198006022025211034",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 88,
    "nama": "Harianto",
    "nip": "NIP 198202032025211026",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 89,
    "nama": "Sardi",
    "nip": "NIP 198307072025211044",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 90,
    "nama": "Amrullah",
    "nip": "NIP 198508282025211039",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 91,
    "nama": "Zubair",
    "nip": "NIP 198602252025211031",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 92,
    "nama": "Musyawwir",
    "nip": "NIP 199409102025211046",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 93,
    "nama": "Azis",
    "nip": "NIP 197512012025211018",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 94,
    "nama": "Jaharuddin",
    "nip": "NIP 197701122025211019",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 95,
    "nama": "Nasrul",
    "nip": "NIP 198606182025211046",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 96,
    "nama": "Rusdy Hasan YP",
    "nip": "NIP 198312152014121002",
    "pangkat": "-",
    "jabatan": "Kepala Urusan Tata Usaha"
  },
  {
    "no": 97,
    "nama": "Mursalim, ST",
    "nip": "NIP 197203072007011002",
    "pangkat": "-",
    "jabatan": "Pelaksana (Koordinator Pengawas Lapangan)"
  },
  {
    "no": 98,
    "nama": "Jumriany Bachrun, SE",
    "nip": "NIP 197310092008122001",
    "pangkat": "-",
    "jabatan": "Pengelola Layanan Operasional"
  },
  {
    "no": 99,
    "nama": "Noerfajri, ST",
    "nip": "NIP 198510272014122003",
    "pangkat": "-",
    "jabatan": "Pengelola Layanan Operasional"
  },
  {
    "no": 100,
    "nama": "Eddy Adriyanto Kasdjuri, S.Sos",
    "nip": "NIP 196809072007011001",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 101,
    "nama": "Maksum Sultan",
    "nip": "NIP 197307232008121001",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 102,
    "nama": "Hermin",
    "nip": "NIP 197204202008122001",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 103,
    "nama": "Jennie Lefina",
    "nip": "NIP 197101312008122001",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 104,
    "nama": "Nana Ruslana Astuty Asyhab, ST",
    "nip": "NIP 198201312025212029",
    "pangkat": "-",
    "jabatan": "Penata Kelola Jalan Dan Jembatan Ahli Pertama"
  },
  {
    "no": 105,
    "nama": "Iswan, SE",
    "nip": "NIP 198009022025211025",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 106,
    "nama": "Andi Suri Enryani, SE",
    "nip": "NIP 198012302025212019",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 107,
    "nama": "Hamka Samsuddin, S.Sos",
    "nip": "NIP 198307152025211046",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 108,
    "nama": "Juslan, S.Sos",
    "nip": "NIP 199201012025211074",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 109,
    "nama": "Muhlisyam, S.Sos",
    "nip": "NIP 199204272025211041",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 110,
    "nama": "Muhammad Dahlan A, SE",
    "nip": "NIP 196910152025211017",
    "pangkat": "-",
    "jabatan": "Penata Layanan Operasional"
  },
  {
    "no": 111,
    "nama": "Wahyudi Djalil",
    "nip": "NIP 197810292025211012",
    "pangkat": "-",
    "jabatan": "Penata Laksana Jalan Dan Jembatan Pemula"
  },
  {
    "no": 112,
    "nama": "Habibi Alfian",
    "nip": "NIP 198805142025211038",
    "pangkat": "-",
    "jabatan": "Penata Laksana Jalan Dan Jembatan Pemula"
  },
  {
    "no": 113,
    "nama": "Laupe",
    "nip": "NIP 198002102025211032",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 114,
    "nama": "Iwan Kurniawan",
    "nip": "NIP 198212062025211031",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 115,
    "nama": "Ardiansyah",
    "nip": "NIP 198305252025211042",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 116,
    "nama": "Muhammad Fajrin",
    "nip": "NIP 198605042025211048",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 117,
    "nama": "Budi Darman",
    "nip": "NIP 198801212025211037",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 118,
    "nama": "Hulki",
    "nip": "NIP 199504192025211037",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 119,
    "nama": "Wira Pratama",
    "nip": "NIP 199507052025211052",
    "pangkat": "-",
    "jabatan": "Operator Layanan Operasional"
  },
  {
    "no": 120,
    "nama": "Muhammad Fadli Alkausar",
    "nip": "NIP 199004032025211036",
    "pangkat": "-",
    "jabatan": "Pengadministrasi Perkantoran"
  },
  {
    "no": 121,
    "nama": "Haris",
    "nip": "NIP 198406032025211031",
    "pangkat": "-",
    "jabatan": "Pengelola Umum Operasional"
  }
];

// Alias kompatibilitas untuk Modul Surat Tugas
let dbPegawai = DEFAULT_DATABASE_PEGAWAI;

const DEFAULT_PEJABAT_REF = [
  {
    "peran": "Kepala Satuan Kerja",
    "sub_jabatan": "",
    "nama": "Malik, ST., MM",
    "nip": "NIP 197012312007011017"
  },
  {
    "peran": "An. Kepala Satuan Kerja",
    "sub_jabatan": "Asisten Keuangan, Umum & Pelaporan",
    "nama": "Suarni Awing, ST, MT",
    "nip": "NIP 197701152009112001"
  }
];
