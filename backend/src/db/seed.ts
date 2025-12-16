import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './sequelize.js';
import { User } from '../models/user.model.js';
import { Role } from '../models/role.model.js';
import { Content } from '../models/content.model.js';
import { Media } from '../models/media.model.js';
import { keyValueService } from '../services/keyValue.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_IMAGES_SOURCE = process.env.SEED_IMAGES_PATH || path.join(__dirname, '../../../public-site/public/images');
const UPLOADS_DIR = path.join(__dirname, '../../uploads/seed');

interface SeedMedia {
  filename: string;
  alt_text: string;
  title: string;
}

async function ensureSeedMedia(): Promise<Map<string, string>> {
  const mediaMap = new Map<string, string>();

  const images: SeedMedia[] = [
    { filename: 'hero_bg_1.jpg', alt_text: 'Hero background 1', title: 'Hero Background' },
    { filename: 'hero_bg_2.jpg', alt_text: 'Hero background 2', title: 'Hero Background 2' },
    { filename: 'img_2.jpg', alt_text: 'Salon interior', title: 'Salon Image' },
    { filename: 'person_1.jpg', alt_text: 'Stella Martin', title: 'Testimonial Author' },
  ];

  // Create uploads/seed directory if not exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  for (const img of images) {
    // Check if media already exists
    const existing = await Media.findOne({ where: { title: img.title } });
    if (existing) {
      mediaMap.set(img.filename, `/uploads/seed/${img.filename}`);
      continue;
    }

    // Copy file from public-site to uploads
    const sourcePath = path.join(SEED_IMAGES_SOURCE, img.filename);
    const destPath = path.join(UPLOADS_DIR, img.filename);

    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
    }

    // Create Media record
    const media = await Media.create({
      storage_path: `/uploads/seed/${img.filename}`,
      mime_type: 'image/jpeg',
      alt_text: img.alt_text,
      title: img.title,
      status: true,
    });

    mediaMap.set(img.filename, `/uploads/seed/${img.filename}`);
    console.log(`  📷 Created media: ${img.filename}`);
  }

  return mediaMap;
}

export async function ensureHomepageSeed() {
  const existing = await Content.findOne({ where: { slug: 'home' } });
  if (existing) {
    console.log('✅ Homepage content already exists');
    return;
  }

  // Create media records first
  const mediaUrls = await ensureSeedMedia();

  const getMediaUrl = (filename: string) => mediaUrls.get(filename) || `/images/${filename}`;

  await Content.create({
    slug: 'home',
    title: 'Hair Salon Expert',
    type: 'page',
    status: 'P',
    lead: 'Welcome to Hairsal',
    body: JSON.stringify({
      hero: {
        slides: [
          {
            title: 'Hair Salon Expert',
            subtitle: 'Welcome to Hairsal',
            buttonText: 'Book Now!',
            buttonLink: '/booking',
            backgroundImage: getMediaUrl('hero_bg_1.jpg'),
          },
          {
            title: 'Beautiful Hair, Healthy You!',
            buttonText: 'Book Now!',
            buttonLink: '/booking',
            backgroundImage: getMediaUrl('hero_bg_2.jpg'),
          },
        ],
      },
      welcome: {
        title: 'Hair Salon',
        subtitle: 'Welcome to',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt architecto ab hic rem placeat eius commodi eum eligendi recusandae sed qui cumque quibusdam.',
        image: getMediaUrl('img_2.jpg'),
      },
      openingHours: {
        title: 'Opening Hours',
        hours: [
          { days: 'Mon – Fri', time: '10:00 AM – 8:30 PM' },
          { days: 'Saturday', time: 'Closed' },
          { days: 'Sunday', time: '10:00 AM – 8:30 PM' },
        ],
      },
      services: {
        title: 'Featured Services',
        items: [
          { icon: 'flaticon-razor', name: 'Barber Razor', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', price: '$29' },
          { icon: 'flaticon-shave', name: 'Barber Shave', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', price: '$24' },
          { icon: 'flaticon-location-pin', name: 'Location Pin', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', price: '$46' },
        ],
      },
      testimonial: {
        title: 'New hairstyle!',
        quote: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique dolorem quisquam laudantium.',
        author: 'Stella Martin',
        image: getMediaUrl('person_1.jpg'),
      },
      cta: {
        title: 'Experience Our Outstanding Services',
        backgroundImage: getMediaUrl('hero_bg_2.jpg'),
      },
    }),
    published_at: new Date(),
    meta_title: 'Hairsal - Hair Salon',
    meta_description: 'Professional hair salon services',
  });

  console.log('✅ Seeded homepage content (slug: home)');
}

export async function ensureAdminSeed() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@admin.com';
  const plain = process.env.ADMIN_PASSWORD ?? 'admin!';

  await sequelize.transaction(async (t) => {
    const [adminRole] = await Role.findOrCreate({
      where: { type: 'admin' },
      defaults: {
        type: 'admin',
        display_name: 'Administrator',
      },
      transaction: t,
    });

    const existing = await User.findOne({ where: { email }, transaction: t });
    if (existing) {
      return;
    }

    const password_hash = await bcrypt.hash(plain, 10);

    await User.create(
      {
        email,
        password_hash,
        display_name: 'Administrator',
        role_id: adminRole.role_id,
        last_access: null,
        status: true,
      },
      { transaction: t }
    );

    console.log(`✅ Seeded admin: ${email} / ${plain}`);
  });
}

export async function ensureSiteSettingsSeed() {
  await keyValueService.ensureDefaultSettings();
  console.log('✅ Site settings initialized');
}
