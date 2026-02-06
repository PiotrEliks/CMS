import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { sequelize } from './sequelize.js'
import { User } from '../models/user.model.js'
import {
  Role,
  Permission,
  RolePermission,
  Content,
  Media,
  PageComponent,
  Menu,
  MenuItem,
} from '../models/index.js'
import { keyValueService } from '../services/keyValue.service.js'
import { siteSettingsService } from '../services/siteSettings.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SEED_IMAGES_SOURCE =
  process.env.SEED_IMAGES_PATH ||
  path.join(__dirname, '../../../public-site/public/images')
const UPLOADS_DIR = path.join(__dirname, '../../uploads/seed')

const PERMISSIONS_SEED: { code: string; description: string }[] = [
  {
    code: 'system.access_admin_panel',
    description: 'Dostęp do panelu administracyjnego',
  },
  {
    code: 'system.manage_settings',
    description: 'Zarządzanie ustawieniami systemowymi',
  },

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

  { code: 'category.read', description: 'Podgląd kategorii' },
  { code: 'category.create', description: 'Tworzenie kategorii' },
  { code: 'category.update_own', description: 'Edycja własnych kategorii' },
  { code: 'category.update_any', description: 'Edycja dowolnej kategorii' },
  { code: 'category.delete_own', description: 'Usuwanie własnych kategorii' },
  { code: 'category.delete_any', description: 'Usuwanie dowolnej kategorii' },

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
  {
    code: 'roles.assign_permissions',
    description: 'Zarządzanie uprawnieniami ról',
  },
]

interface SeedMedia {
  filename: string
  alt_text: string
  title: string
}

interface MediaRecord {
  media_id: string
  url: string
}

async function ensureSeedMedia(): Promise<Map<string, MediaRecord>> {
  const mediaMap = new Map<string, MediaRecord>()

  const images: SeedMedia[] = [
    {
      filename: 'hero_bg_1.jpg',
      alt_text: 'Hair salon hero background',
      title: 'Hero Background 1',
    },
    {
      filename: 'hero_bg_2.jpg',
      alt_text: 'Hair salon interior',
      title: 'Hero Background 2',
    },
    {
      filename: 'img_1.jpg',
      alt_text: 'Salon service',
      title: 'Salon Image 1',
    },
    {
      filename: 'img_2.jpg',
      alt_text: 'Salon interior',
      title: 'Salon Image 2',
    },
    {
      filename: 'img_3.jpg',
      alt_text: 'Hair styling',
      title: 'Salon Image 3',
    },
    {
      filename: 'person_1.jpg',
      alt_text: 'Client testimonial',
      title: 'Person 1',
    },
    {
      filename: 'person_2.jpg',
      alt_text: 'Team member',
      title: 'Person 2',
    },
    {
      filename: 'person_3.jpg',
      alt_text: 'Team member',
      title: 'Person 3',
    },
    {
      filename: 'person_4.jpg',
      alt_text: 'Team member',
      title: 'Person 4',
    },
  ]

  // Create uploads/seed directory if not exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }

  for (const img of images) {
    // Check if media already exists
    let existing = await Media.findOne({ where: { title: img.title } })

    if (existing) {
      mediaMap.set(img.filename, {
        media_id: existing.media_id,
        url: `/uploads/seed/${img.filename}`,
      })
      continue
    }

    // Copy file from public-site to uploads
    const sourcePath = path.join(SEED_IMAGES_SOURCE, img.filename)
    const destPath = path.join(UPLOADS_DIR, img.filename)

    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath)
    }

    // Create Media record
    const media = await Media.create({
      storage_path: `/uploads/seed/${img.filename}`,
      mime_type: 'image/jpeg',
      alt_text: img.alt_text,
      title: img.title,
      status: true,
    })

    mediaMap.set(img.filename, {
      media_id: media.media_id,
      url: `/uploads/seed/${img.filename}`,
    })
    console.log(`  📷 Created media: ${img.filename}`)
  }

  return mediaMap
}

export async function ensureHomepageSeed() {
  // Delete existing homepage and its components to reseed
  const existing = await Content.findOne({ where: { slug: 'home' } })
  if (existing) {
    await PageComponent.destroy({ where: { content_id: existing.content_id } })
    await existing.destroy()
    console.log('🗑️  Removed existing homepage for reseeding')
  }

  // Create media records first
  const mediaMap = await ensureSeedMedia()

  const getMediaId = (filename: string) => mediaMap.get(filename)?.media_id

  // Create homepage content
  const homepage = await Content.create({
    slug: 'home',
    title: 'Salon Fryzjerski Expert',
    type: 'page',
    status: 'P',
    lead: 'Witamy w naszym salonie fryzjerskim',
    body: '',
    published_at: new Date(),
    meta_title: 'Salon Fryzjerski Expert - Profesjonalna Pielęgnacja Włosów',
    meta_description: 'Profesjonalny salon fryzjerski oferujący strzyżenie, koloryzację, stylizację i zabiegi pielęgnacyjne. Umów się na wizytę już dziś!',
  })

  // Component 1: Hero Slider
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'hero',
    order_index: 0,
    display_order: 0,
    status: true,
    data: {
      slides: [
        {
          title: 'Salon Fryzjerski Expert',
          subtitle: 'Twoja Piękna Fryzura Zaczyna Się Tutaj',
          description: 'Profesjonalna pielęgnacja włosów w sercu miasta',
          buttonText: 'Umów Wizytę',
          buttonLink: '/kontakt',
          media_id: getMediaId('hero_bg_1.jpg'),
          overlayOpacity: 50,
        },
        {
          title: 'Piękne Włosy, Piękny Ty!',
          subtitle: 'Najnowsze Trendy i Techniki',
          buttonText: 'Zobacz Usługi',
          buttonLink: '/uslugi',
          media_id: getMediaId('hero_bg_2.jpg'),
          overlayOpacity: 50,
        },
      ],
      autoplay: true,
      interval: 5000,
    },
  })

  // Component 2: Services
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'services',
    order_index: 1,
    display_order: 1,
    status: true,
    data: {
      title: 'Nasze Usługi',
      subtitle: 'Co oferujemy',
      layout: 'grid',
      columns: 3,
      items: [
        {
          icon: 'flaticon-scissors',
          name: 'Strzyżenie Damskie',
          description: 'Profesjonalne strzyżenie z myciem i stylizacją. Doradzimy fryzurę idealnie dopasowaną do Twojej twarzy.',
          price: 'od 80 zł',
        },
        {
          icon: 'flaticon-hair-dye',
          name: 'Koloryzacja',
          description: 'Farbowanie, baleyage, ombre i sombre. Używamy najwyższej jakości kosmetyków.',
          price: 'od 150 zł',
        },
        {
          icon: 'flaticon-razor',
          name: 'Strzyżenie Męskie',
          description: 'Klasyczne i nowoczesne strzyżenia męskie. Stylizacja brody w cenie.',
          price: 'od 50 zł',
        },
        {
          icon: 'flaticon-hair-curler',
          name: 'Stylizacja',
          description: 'Upięcia okolicznościowe, fale, loki. Idealna fryzura na każdą okazję.',
          price: 'od 100 zł',
        },
        {
          icon: 'flaticon-treatment',
          name: 'Zabiegi Pielęgnacyjne',
          description: 'Regeneracja, nawilżanie, odbudowa włosów. Keratynowe prostowanie.',
          price: 'od 120 zł',
        },
        {
          icon: 'flaticon-bride',
          name: 'Pakiet Ślubny',
          description: 'Kompleksowa stylizacja panny młodej z próbą. Upięcia, makijaż, manicure.',
          price: 'od 500 zł',
        },
      ],
    },
  })

  // Component 3: Hours
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'hours',
    order_index: 2,
    display_order: 2,
    status: true,
    data: {
      title: 'Godziny Otwarcia',
      hours: [
        { days: 'Poniedziałek - Piątek', time: '9:00 - 19:00' },
        { days: 'Sobota', time: '9:00 - 15:00' },
        { days: 'Niedziela', time: 'Zamknięte', closed: true },
      ],
      specialNote: 'Prosimy o wcześniejszą rezerwację telefoniczną lub online.',
    },
  })

  // Component 4: Testimonials
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'testimonial',
    order_index: 3,
    display_order: 3,
    status: true,
    data: {
      title: 'Opinie Klientów',
      layout: 'slider',
      items: [
        {
          quote: 'Najlepszy salon w mieście! Pani Ania zrobiła mi cudowne baleyage, dokładnie takie jak chciałam. Polecam każdemu!',
          author: 'Katarzyna Nowak',
          role: 'Stała klientka',
          rating: 5,
          media_id: getMediaId('person_1.jpg'),
        },
        {
          quote: 'Chodzę tu od 3 lat i nigdy się nie zawiodłam. Profesjonalna obsługa, miła atmosfera i zawsze wychodzę zadowolona.',
          author: 'Anna Kowalska',
          role: 'Stała klientka',
          rating: 5,
          media_id: getMediaId('person_2.jpg'),
        },
        {
          quote: 'Świetne strzyżenie męskie! W końcu znalazłem fryzjera, który rozumie czego chcę. Będę wracał!',
          author: 'Michał Wiśniewski',
          role: 'Klient',
          rating: 5,
          media_id: getMediaId('person_3.jpg'),
        },
      ],
    },
  })

  // Component 5: Team
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'team',
    order_index: 4,
    display_order: 4,
    status: true,
    data: {
      title: 'Nasz Zespół',
      subtitle: 'Poznaj naszych specjalistów',
      layout: 'grid',
      columns: 4,
      members: [
        {
          name: 'Anna Kowalczyk',
          role: 'Właścicielka & Stylistka',
          bio: '15 lat doświadczenia w branży. Specjalizuje się w koloryzacji i strzyżeniach damskich.',
          media_id: getMediaId('person_1.jpg'),
          social: {
            instagram: 'https://instagram.com',
          },
        },
        {
          name: 'Magdalena Nowak',
          role: 'Stylistka',
          bio: 'Ekspertka od upięć okolicznościowych i stylizacji ślubnych.',
          media_id: getMediaId('person_2.jpg'),
          social: {
            instagram: 'https://instagram.com',
          },
        },
        {
          name: 'Karol Wiśniewski',
          role: 'Barber',
          bio: 'Specjalista od strzyżeń męskich i pielęgnacji brody.',
          media_id: getMediaId('person_3.jpg'),
          social: {
            instagram: 'https://instagram.com',
          },
        },
        {
          name: 'Julia Zielińska',
          role: 'Stylistka Junior',
          bio: 'Młody talent z pasją do najnowszych trendów.',
          media_id: getMediaId('person_4.jpg'),
          social: {
            instagram: 'https://instagram.com',
          },
        },
      ],
    },
  })

  // Component 6: Pricing
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'pricing',
    order_index: 5,
    display_order: 5,
    status: true,
    data: {
      title: 'Cennik',
      subtitle: 'Przejrzyste ceny naszych usług',
      services: [
        { name: 'Strzyżenie damskie z modelowaniem', price: '80 - 120 zł', description: 'W zależności od długości włosów' },
        { name: 'Strzyżenie męskie', price: '50 - 70 zł', description: 'Ze stylizacją' },
        { name: 'Koloryzacja - jednolity kolor', price: '150 - 250 zł', description: 'Cena zależy od długości włosów' },
        { name: 'Baleyage / Ombre', price: '250 - 400 zł', description: 'Efekt naturalnego rozjaśnienia' },
        { name: 'Upięcie okolicznościowe', price: '100 - 200 zł', description: 'Wesela, studniówki, imprezy' },
        { name: 'Keratynowe prostowanie', price: '300 - 500 zł', description: 'Efekt do 4 miesięcy' },
        { name: 'Regeneracja włosów', price: '80 - 150 zł', description: 'Zabieg głęboko odżywczy' },
        { name: 'Pakiet ślubny', price: 'od 500 zł', description: 'Próba + fryzura w dniu ślubu' },
      ],
    },
  })

  // Component 7: Contact Form
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'contact_form',
    order_index: 6,
    display_order: 6,
    status: true,
    data: {
      title: 'Umów Wizytę',
      subtitle: 'Skontaktuj się z nami, aby zarezerwować termin',
      submitText: 'Wyślij Wiadomość',
      successMessage: 'Dziękujemy! Odpowiemy najszybciej jak to możliwe.',
      fields: [
        { type: 'text', name: 'name', label: 'Imię i nazwisko', placeholder: 'Wpisz imię i nazwisko', required: true },
        { type: 'email', name: 'email', label: 'Email', placeholder: 'twoj@email.pl', required: true },
        { type: 'tel', name: 'phone', label: 'Telefon', placeholder: '123 456 789', required: true },
        { type: 'select', name: 'service', label: 'Usługa', required: true, options: ['Strzyżenie damskie', 'Strzyżenie męskie', 'Koloryzacja', 'Stylizacja', 'Zabieg pielęgnacyjny', 'Inne'] },
        { type: 'textarea', name: 'message', label: 'Wiadomość', placeholder: 'Preferowany termin wizyty lub dodatkowe informacje...', required: false },
      ],
    },
  })

  // Component 8: Map
  await PageComponent.create({
    content_id: homepage.content_id,
    component_type: 'map',
    order_index: 7,
    display_order: 7,
    status: true,
    data: {
      title: 'Jak Do Nas Trafić',
      latitude: 52.2297,  // Warsaw coordinates
      longitude: 21.0122,
      zoom: 15,
      marker: true,
      markerTitle: 'Salon Fryzjerski Expert',
      height: '400px',
    },
  })

  console.log('✅ Seeded homepage with components (slug: home)')
}

export async function ensureMenuSeed() {
  // Check if main menu exists
  const existing = await Menu.findOne({ where: { code: 'main' } })
  if (existing) {
    console.log('✅ Main menu already exists')
    return existing
  }

  // Create main menu
  const menu = await Menu.create({
    code: 'main',
    name: 'Menu Główne',
    status: true,
  })

  // Create homepage if not exists to link in menu
  let homepage = await Content.findOne({ where: { slug: 'home' } })

  // Create menu items
  const menuItems = [
    { label: 'Strona Główna', content_id: homepage?.content_id, order_index: 0 },
    { label: 'Usługi', external_url: '/uslugi', order_index: 1 },
    { label: 'Cennik', external_url: '/cennik', order_index: 2 },
    { label: 'O Nas', external_url: '/o-nas', order_index: 3 },
    { label: 'Kontakt', external_url: '/kontakt', order_index: 4 },
  ]

  for (const item of menuItems) {
    await MenuItem.create({
      menu_id: menu.menu_id,
      label: item.label,
      content_id: item.content_id || null,
      external_url: item.external_url || null,
      order_index: item.order_index,
      status: true,
    })
  }

  console.log('✅ Seeded main menu with items')
  return menu
}

export async function ensureSiteSettingsSeeded() {
  // Set site settings for hair salon
  await siteSettingsService.update('general', {
    site_name: 'Salon Fryzjerski Expert',
    site_tagline: 'Twoja Piękna Fryzura Zaczyna Się Tutaj',
    site_description: 'Profesjonalny salon fryzjerski oferujący strzyżenie, koloryzację, stylizację i zabiegi pielęgnacyjne włosów. Doświadczony zespół, najwyższa jakość usług.',
  })

  await siteSettingsService.update('contact', {
    contact_email: 'kontakt@salon-expert.pl',
    contact_phone: '+48 123 456 789',
    contact_address: 'ul. Piękna 15, 00-001 Warszawa',
  })

  await siteSettingsService.update('social_media', {
    social_media: [
      { platform: 'facebook', url: 'https://facebook.com/salonexpert' },
      { platform: 'instagram', url: 'https://instagram.com/salonexpert' },
    ],
  })

  // Set header menu
  const mainMenu = await Menu.findOne({ where: { code: 'main' } })
  if (mainMenu) {
    await siteSettingsService.update('header', {
      header_menu_id: mainMenu.menu_id,
      header_show_social: true,
    })

    await siteSettingsService.update('footer', {
      footer_menu_id: mainMenu.menu_id,
      footer_show_social: true,
      footer_copyright_text: `© ${new Date().getFullYear()} Salon Fryzjerski Expert. Wszelkie prawa zastrzeżone.`,
      footer_description: 'Profesjonalny salon fryzjerski w centrum Warszawy. Oferujemy strzyżenie, koloryzację, stylizację i zabiegi pielęgnacyjne.',
    })
  }

  console.log('✅ Seeded site settings for hair salon')
}

export async function ensureAdminSeed() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@admin.com'
  const adminPlain = process.env.ADMIN_PASSWORD ?? 'admin!'

  const moderatorEmail = process.env.MODERATOR_EMAIL ?? 'moderator@admin.com'
  const moderatorPlain = process.env.MODERATOR_PASSWORD ?? 'moderator!'

  await sequelize.transaction(async (t) => {
    for (const permDef of PERMISSIONS_SEED) {
      await Permission.findOrCreate({
        where: { code: permDef.code },
        defaults: {
          code: permDef.code,
          description: permDef.description,
        },
        transaction: t,
      })
    }

    const allPermissions = await Permission.findAll({ transaction: t })

    const [adminRole] = await Role.findOrCreate({
      where: { type: 'admin' },
      defaults: {
        type: 'admin',
        display_name: 'Administrator',
        status: true,
      },
      transaction: t,
    })

    const [moderatorRole] = await Role.findOrCreate({
      where: { type: 'moderator' },
      defaults: {
        type: 'moderator',
        display_name: 'Moderator',
        status: true,
      },
      transaction: t,
    })

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
      })
    }

    const moderatorPermissions = allPermissions.filter((perm: any) => {
      const code: string = perm.code
      if (!code) return false
      if (code.startsWith('users.')) return false
      if (code.startsWith('roles.')) return false
      return true
    })

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
      })
    }

    const existingAdmin = await User.findOne({
      where: { email: adminEmail },
      transaction: t,
    })

    if (!existingAdmin) {
      const password_hash = await bcrypt.hash(adminPlain, 10)

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
      )

      console.log(`✅ Seeded admin: ${adminEmail} / ${adminPlain}`)
    } else {
      console.log(`ℹ️ Admin already exists: ${adminEmail}`)
    }

    const existingModerator = await User.findOne({
      where: { email: moderatorEmail },
      transaction: t,
    })

    if (!existingModerator) {
      const password_hash = await bcrypt.hash(moderatorPlain, 10)

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
      )

      console.log(`✅ Seeded moderator: ${moderatorEmail} / ${moderatorPlain}`)
    } else {
      console.log(`ℹ️ Moderator already exists: ${moderatorEmail}`)
    }
  })
}

export async function ensureSiteSettingsSeed() {
  await keyValueService.ensureDefaultSettings()
  console.log('✅ Site settings initialized')
}
