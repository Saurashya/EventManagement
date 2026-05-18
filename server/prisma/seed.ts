import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventpro.com' },
    update: {},
    create: {
      email: 'admin@eventpro.com',
      name: 'System Admin',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Create Organizer
  const orgPassword = await bcrypt.hash('organizer123', 12);
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventpro.com' },
    update: {},
    create: {
      email: 'organizer@eventpro.com',
      name: 'Jane Organizer',
      password: orgPassword,
      role: 'ORGANIZER',
      company: 'EventPro Inc.',
      isVerified: true,
    },
  });

  // Create Attendee
  const attPassword = await bcrypt.hash('attendee123', 12);
  const attendee = await prisma.user.upsert({
    where: { email: 'attendee@eventpro.com' },
    update: {},
    create: {
      email: 'attendee@eventpro.com',
      name: 'Sam Attendee',
      password: attPassword,
      role: 'ATTENDEE',
      isVerified: true,
    },
  });

  // Create Events
  const event1 = await prisma.event.upsert({
    where: { slug: 'global-tech-summit-2026' },
    update: {},
    create: {
      title: 'Global Tech Summit 2026',
      slug: 'global-tech-summit-2026',
      description: 'The largest technology conference in South Asia featuring world-class speakers, workshops, and networking opportunities.',
      shortDesc: 'South Asia\'s biggest tech event',
      startDate: new Date('2026-07-15T09:00:00Z'),
      endDate: new Date('2026-07-17T18:00:00Z'),
      venue: 'Hyatt Regency',
      address: 'Taragaon, Boudha',
      city: 'Kathmandu',
      country: 'Nepal',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      capacity: 500,
      category: 'Technology',
      tags: ['tech', 'conference', 'startup', 'AI'],
      organizerId: organizer.id,
      ticketTiers: {
        create: [
          { name: 'Free Pass', price: 0, quantity: 100, type: 'FREE', sortOrder: 0 },
          { name: 'Standard', price: 2500, quantity: 200, type: 'PAID', currency: 'NPR', sortOrder: 1 },
          { name: 'VIP', price: 7500, quantity: 50, type: 'PAID', currency: 'NPR', sortOrder: 2 },
        ],
      },
      sessions: {
        create: [
          {
            title: 'Opening Keynote: Future of AI',
            speaker: 'Dr. Aarav Sharma',
            speakerBio: 'AI Research Lead at Google DeepMind',
            room: 'Main Hall',
            startTime: new Date('2026-07-15T09:30:00Z'),
            endTime: new Date('2026-07-15T10:30:00Z'),
          },
          {
            title: 'Workshop: Building with Next.js 15',
            speaker: 'Priya Patel',
            speakerBio: 'Senior Developer Advocate at Vercel',
            room: 'Workshop Room A',
            startTime: new Date('2026-07-15T11:00:00Z'),
            endTime: new Date('2026-07-15T13:00:00Z'),
          },
        ],
      },
    },
  });

  const event2 = await prisma.event.upsert({
    where: { slug: 'design-thinking-workshop' },
    update: {},
    create: {
      title: 'Design Thinking Workshop',
      slug: 'design-thinking-workshop',
      description: 'A hands-on workshop exploring design thinking methodologies for product innovation.',
      startDate: new Date('2026-08-10T10:00:00Z'),
      endDate: new Date('2026-08-10T17:00:00Z'),
      venue: 'Innovation Hub',
      city: 'Kathmandu',
      country: 'Nepal',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      capacity: 30,
      category: 'Design',
      tags: ['design', 'workshop', 'UX'],
      organizerId: organizer.id,
      ticketTiers: {
        create: [
          { name: 'General', price: 1500, quantity: 30, type: 'PAID', currency: 'NPR', sortOrder: 0 },
        ],
      },
    },
  });

  console.log('✅ Seed completed!');
  console.log(`  Admin: admin@eventpro.com / admin123`);
  console.log(`  Organizer: organizer@eventpro.com / organizer123`);
  console.log(`  Attendee: attendee@eventpro.com / attendee123`);
  console.log(`  Events: ${event1.title}, ${event2.title}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
