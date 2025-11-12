import { PrismaClient } from './prisma/generated/index.js';

const connectionString = "postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public&connect_timeout=30";

console.log('Testing connection to:', connectionString.replace(/:[^:@]+@/, ':***@'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

async function test() {
  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL version:', result);
    
    await prisma.$disconnect();
    console.log('✅ Disconnected cleanly');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

test();
