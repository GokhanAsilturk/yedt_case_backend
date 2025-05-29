import Course from '../models/Course';

const defaultCourses = [
  {
    name: 'Matematik 101',
    description: 'Temel matematik dersi.'
  },
  {
    name: 'Fizik 101',
    description: 'Fizik bilimine giriş dersi.'
  },
  {
    name: 'Bilgisayar Bilimleri',
    description: 'Bilgisayar bilimi temelleri dersi.'
  },
  {
    name: 'Kimya 101',
    description: 'Genel kimya dersi.'
  },
  {
    name: 'Türkçe Dil ve Edebiyat',
    description: 'Türk dili ve edebiyatı dersi.'
  },
  {
    name: 'İngilizce',
    description: 'İngilizce dil dersi.'
  },
  {
    name: 'Tarih',
    description: 'Türk ve dünya tarihi dersi.'
  },
  {
    name: 'Coğrafya',
    description: 'Beşeri ve fiziki coğrafya dersi.'
  },
  {
    name: 'Biyoloji',
    description: 'Genel biyoloji dersi.'
  },
  {
    name: 'Felsefe',
    description: 'Felsefe düşüncesi ve mantık dersi.'
  },
  {
    name: 'Sosyoloji',
    description: 'Toplum bilimleri dersi.'
  },
  {
    name: 'Psikoloji',
    description: 'Genel psikoloji dersi.'
  },
  {
    name: 'Ekonomi',
    description: 'Temel ekonomi bilgisi dersi.'
  },
  {
    name: 'Muhasebe',
    description: 'Genel muhasebe dersi.'
  },
  {
    name: 'İstatistik',
    description: 'Temel istatistik dersi.'
  },
  {
    name: 'Veri Yapıları',
    description: 'Bilgisayar bilimleri veri yapıları dersi.'
  },
  {
    name: 'Algoritma Analizi',
    description: 'Algoritma tasarımı ve analizi dersi.'
  },
  {
    name: 'Web Programlama',
    description: 'Modern web teknolojileri dersi.'
  },
  {
    name: 'Veritabanı Yönetimi',
    description: 'Veritabanı tasarımı ve yönetimi dersi.'
  },
  {
    name: 'Proje Yönetimi',
    description: 'Yazılım proje yönetimi dersi.'
  }
];

export const seedCourses = async (): Promise<void> => {
  try {
    await Promise.all(defaultCourses.map(course => Course.create(course)));
    console.log('20 courses successfully created');
  } catch (error) {
    console.error('Error creating default courses:', error);
    throw error;
  }
};
