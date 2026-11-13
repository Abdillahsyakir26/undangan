import type { SiteConfig } from './types';

export const DEFAULT_CONFIG: SiteConfig = {
  slug: 'undangan',
  siteTitle: 'The Wedding of Abdillah & Zanila',
  weddingDate: '2029-03-12T08:00:00+07:00',
  couple: {
    groom: {
      name: 'Abdillah Syakir', nick: 'Abdillah', photo: '/demo/pria.webp',
      childOrder: 'Putra pertama dari', father: 'Bapak (nama ayah mempelai pria)', mother: 'Ibu (nama ibu mempelai pria)',
    },
    bride: {
      name: 'Zanila Putri', nick: 'Zanila', photo: '/demo/wanita.webp',
      childOrder: 'Putri pertama dari', father: 'Bapak (nama ayah mempelai wanita)', mother: 'Ibu (nama ibu mempelai wanita)',
    },
    description:
      'Dua insan yang dipertemukan oleh takdir, dipersatukan oleh doa, dan menguatkan niat untuk melangkah bersama dalam ikatan suci pernikahan.',
    quote: {
      arab: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
      text:
        'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antara kamu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.',
      source: 'QS. Ar-Rum: 21',
    },
  },
  coverPhoto: '',
  events: [
    {
      id: 'akad', title: 'Akad Nikah', date: '2029-03-12', start: '08:00', end: '10:00', tz: 'WIB',
      venue: 'Nama Tempat Akad', address: 'Alamat lengkap tempat akad nikah (ubah di Admin)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Monas+Jakarta',
    },
    {
      id: 'resepsi', title: 'Resepsi', date: '2029-03-12', start: '11:00', end: '14:00', tz: 'WIB',
      venue: 'Nama Tempat Resepsi', address: 'Alamat lengkap tempat resepsi (ubah di Admin)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Monas+Jakarta',
    },
  ],
  story: [
    { id: 's1', date: '2021', title: 'Awal Pertemuan', text: 'Takdir mempertemukan kami pertama kali lewat sebuah obrolan sederhana yang tak disangka akan berarti begitu banyak.' },
    { id: 's2', date: '2022', title: 'Saling Mengenal', text: 'Hari demi hari kami belajar memahami: tentang mimpi, tentang kebiasaan, dan tentang cara saling menguatkan.' },
    { id: 's3', date: '2024', title: 'Menyatukan Niat', text: 'Dengan restu keluarga, kami memantapkan hati untuk melangkah ke jenjang yang lebih serius.' },
    { id: 's4', date: '2028', title: 'Khitbah / Lamaran', text: 'Dua keluarga bertemu dalam suasana hangat, dan sebuah janji pun diikatkan.' },
    { id: 's5', date: '12 Maret 2029', title: 'Menuju Pernikahan', text: 'Dan kini, dengan penuh syukur, kami siap memulai babak baru kehidupan bersama.' },
  ],
  gallery: [
    { id: 'g1', src: '/demo/g1.webp', thumb: '/demo/g1.webp', alt: 'Foto 1' },
    { id: 'g2', src: '/demo/g2.webp', thumb: '/demo/g2.webp', alt: 'Foto 2' },
    { id: 'g3', src: '/demo/g3.webp', thumb: '/demo/g3.webp', alt: 'Foto 3' },
    { id: 'g4', src: '/demo/g4.webp', thumb: '/demo/g4.webp', alt: 'Foto 4' },
    { id: 'g5', src: '/demo/g5.webp', thumb: '/demo/g5.webp', alt: 'Foto 5' },
    { id: 'g6', src: '/demo/g6.webp', thumb: '/demo/g6.webp', alt: 'Foto 6' },
  ],
  gift: {
    banks: [
      { id: 'b1', bank: 'Bank (contoh) BCA', name: 'Abdillah Syakir', number: '1234567890' },
      { id: 'b2', bank: 'Bank (contoh) Mandiri', name: 'Zanila Putri', number: '0987654321' },
    ],
    qris: '',
    address: 'Alamat pengiriman hadiah (ubah di Admin)',
    addressRecipient: 'Abdillah & Zanila',
    confirmEnabled: true,
  },
  music: { src: '/audio/lagu.mp3', title: 'Kabagyan — Sadewok' },
  theme: {
    gold: '184 134 74', goldDeep: '140 96 48', sage: '135 145 100', sageDeep: '88 99 66',
    cream: '250 243 231', creamDeep: '240 227 206', ink: '62 48 34',
  },
  whatsapp: '6281234567890',
  closing: {
    thanks:
      'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.',
    doa: 'Barakallahu laka wa baraka alaika wa jama’a bainakuma fii khair. Semoga Allah memberkahimu, memberkahi atasmu, dan mempersatukan kalian berdua dalam kebaikan.',
    quote: 'Cinta bukan tentang menemukan seseorang yang sempurna, melainkan belajar mencintai dengan sempurna ketidaksempurnaan.',
  },
};
