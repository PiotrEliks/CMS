import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './sequelize.js';
import { User } from '../models/user.model.js';
import { Role, Permission, RolePermission, Content, Media } from '../models/index.js';
import { keyValueService } from '../services/keyValue.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_IMAGES_SOURCE = process.env.SEED_IMAGES_PATH || path.join(__dirname, '../../../public-site/public/images');
const UPLOADS_DIR = path.join(__dirname, '../../uploads/seed');

const PERMISSIONS_SEED: { code: string; description: string }[] = [
  { code: 'system.access_admin_panel', description: 'Dostęp do panelu administracyjnego' },
  { code: 'system.manage_settings', description: 'Zarządzanie ustawieniami systemowymi' },

  { code: 'media.read', description: 'Podgląd plików' },
  { code: 'media.upload', description: 'Przesyłanie plików' },
  { code: 'media.replace', description: 'Nadpisywanie istniejących plików' },
  { code: 'media.delete', description: 'Usuwanie plików' },

  { code: 'content.read', description: 'Podgląd treści' },
  { code: 'content.create', description: 'Tworzenie treści' },
  { code: 'content.update_own', description: 'Edycja własnych treści' },
  { code: 'content.update_any', description: 'Edycja dowolnej treści' },
  { code: 'content.delete_own', description: 'Usuwanie własnych treści' },
  { code: 'content.delete_any', description: 'Usuwanie dowolnej treści' },
  { code: 'content.publish', description: 'Publikacja treści' },

  { code: 'users.read', description: 'Podgląd użytkowników' },
  { code: 'users.create', description: 'Tworzenie użytkowników' },
  { code: 'users.update', description: 'Edycja użytkowników' },
  { code: 'users.delete', description: 'Usuwanie użytkowników' },
  { code: 'users.change_password', description: 'Zmiana hasła użytkownika' },
  { code: 'users.change_roles', description: 'Zmiana ról użytkowników' },

  { code: 'roles.read', description: 'Podgląd ról' },
  { code: 'roles.create', description: 'Tworzenie ról' },
  { code: 'roles.update', description: 'Edycja ról' },
  { code: 'roles.delete', description: 'Usuwanie ról' },
  { code: 'roles.assign_permissions', description: 'Zarządzanie uprawnieniami ról' },
];

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
    await Media.create({
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
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@admin.com';
  const adminPlain = process.env.ADMIN_PASSWORD ?? 'admin!';

  const moderatorEmail = process.env.MODERATOR_EMAIL ?? 'moderator@admin.com';
  const moderatorPlain = process.env.MODERATOR_PASSWORD ?? 'moderator!';

  await sequelize.transaction(async (t) => {
    for (const permDef of PERMISSIONS_SEED) {
      await Permission.findOrCreate({
        where: { code: permDef.code },
        defaults: {
          code: permDef.code,
          description: permDef.description,
        },
        transaction: t,
      });
    }

    const allPermissions = await Permission.findAll({ transaction: t });

    const [adminRole] = await Role.findOrCreate({
      where: { type: 'admin' },
      defaults: {
        type: 'admin',
        display_name: 'Administrator',
        status: true,
      },
      transaction: t,
    });

    const [moderatorRole] = await Role.findOrCreate({
      where: { type: 'moderator' },
      defaults: {
        type: 'moderator',
        display_name: 'Moderator',
        status: true,
      },
      transaction: t,
    });

    for (const perm of allPermissions) {
      await RolePermission.findOrCreate({
        where: {
          role_id: adminRole.role_id,
          permission_id: perm.permission_id,
        },
        defaults: {
          role_id: adminRole.role_id,
          permission_id: perm.permission_id,
        },
        transaction: t,
      });
    }

    const moderatorPermissions = allPermissions.filter((perm: any) => {
      const code: string = perm.code;
      if (!code) return false;
      if (code.startsWith('users.')) return false;
      if (code.startsWith('roles.')) return false;
      return true;
    });

    for (const perm of moderatorPermissions) {
      await RolePermission.findOrCreate({
        where: {
          role_id: moderatorRole.role_id,
          permission_id: perm.permission_id,
        },
        defaults: {
          role_id: moderatorRole.role_id,
          permission_id: perm.permission_id,
        },
        transaction: t,
      });
    }

    const existingAdmin = await User.findOne({
      where: { email: adminEmail },
      transaction: t,
    });

    if (!existingAdmin) {
      const password_hash = await bcrypt.hash(adminPlain, 10);

      await User.create(
        {
          email: adminEmail,
          password_hash,
          display_name: 'Jan Nowak',
          role_id: adminRole.role_id,
          last_access: null,
          status: true,
        },
        { transaction: t }
      );

      console.log(`✅ Seeded admin: ${adminEmail} / ${adminPlain}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }

    const existingModerator = await User.findOne({
      where: { email: moderatorEmail },
      transaction: t,
    });

    if (!existingModerator) {
      const password_hash = await bcrypt.hash(moderatorPlain, 10);

      await User.create(
        {
          email: moderatorEmail,
          password_hash,
          display_name: 'Adam Kowalski',
          role_id: moderatorRole.role_id,
          last_access: null,
          status: true,
        },
        { transaction: t }
      );

      console.log(`✅ Seeded moderator: ${moderatorEmail} / ${moderatorPlain}`);
    } else {
      console.log(`ℹ️ Moderator already exists: ${moderatorEmail}`);
    }
  });
}

export async function ensureSiteSettingsSeed() {
  await keyValueService.ensureDefaultSettings();
  console.log('✅ Site settings initialized');
}
