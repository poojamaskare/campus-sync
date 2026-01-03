/**
 * Migration script to sync local PostgreSQL data to Neon
 * 
 * Usage:
 * 1. Make sure your .env has DATABASE_URL pointing to your local Postgres
 * 2. Create a .env.neon file with DATABASE_URL pointing to your Neon database
 * 3. Run: bun run scripts/migrate-to-neon.ts
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })
config({ path: resolve(process.cwd(), '.env.local') })

// Get database URLs
const LOCAL_DB_URL = process.env.DATABASE_URL
const NEON_DB_URL = process.env.NEON_DATABASE_URL

if (!LOCAL_DB_URL) {
  throw new Error('DATABASE_URL not found in .env (should point to local Postgres)')
}

if (!NEON_DB_URL) {
  throw new Error('NEON_DATABASE_URL not found in .env (should point to Neon database)')
}

console.log('📋 Configuration:')
console.log(`   Local DB: ${LOCAL_DB_URL.replace(/:[^:@]+@/, ':****@')}`)
console.log(`   Neon DB: ${NEON_DB_URL.replace(/:[^:@]+@/, ':****@')}\n`)

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: LOCAL_DB_URL,
    },
  },
})

const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DB_URL,
    },
  },
})

async function migrateData() {
  console.log('🚀 Starting migration from local Postgres to Neon...\n')

  try {
    // Test connections
    console.log('📡 Testing database connections...')
    await localPrisma.$connect()
    console.log('✅ Local database connected')
    
    await neonPrisma.$connect()
    console.log('✅ Neon database connected\n')

    // Migrate in order (respecting foreign key constraints)
    console.log('📦 Migrating data...\n')

    // 1. Users (no dependencies)
    console.log('1️⃣  Migrating Users...')
    const users = await localPrisma.user.findMany()
    if (users.length > 0) {
      await neonPrisma.user.createMany({
        data: users,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${users.length} users`)
    } else {
      console.log('   ⏭️  No users to migrate')
    }

    // 2. Subjects (no dependencies)
    console.log('2️⃣  Migrating Subjects...')
    const subjects = await localPrisma.subject.findMany()
    if (subjects.length > 0) {
      await neonPrisma.subject.createMany({
        data: subjects,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${subjects.length} subjects`)
    } else {
      console.log('   ⏭️  No subjects to migrate')
    }

    // 3. Rooms (no dependencies)
    console.log('3️⃣  Migrating Rooms...')
    const rooms = await localPrisma.room.findMany()
    if (rooms.length > 0) {
      await neonPrisma.room.createMany({
        data: rooms,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${rooms.length} rooms`)
    } else {
      console.log('   ⏭️  No rooms to migrate')
    }

    // 4. SlotTypes (no dependencies)
    console.log('4️⃣  Migrating SlotTypes...')
    const slotTypes = await localPrisma.slotType.findMany()
    if (slotTypes.length > 0) {
      await neonPrisma.slotType.createMany({
        data: slotTypes,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${slotTypes.length} slot types`)
    } else {
      console.log('   ⏭️  No slot types to migrate')
    }

    // 5. Batches (no dependencies)
    console.log('5️⃣  Migrating Batches...')
    const batches = await localPrisma.batch.findMany()
    if (batches.length > 0) {
      await neonPrisma.batch.createMany({
        data: batches,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${batches.length} batches`)
    } else {
      console.log('   ⏭️  No batches to migrate')
    }

    // 6. Groups (depends on Users)
    console.log('6️⃣  Migrating Groups...')
    const groups = await localPrisma.group.findMany()
    if (groups.length > 0) {
      await neonPrisma.group.createMany({
        data: groups,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${groups.length} groups`)
    } else {
      console.log('   ⏭️  No groups to migrate')
    }

    // 7. GroupMemberships (depends on Users and Groups)
    console.log('7️⃣  Migrating GroupMemberships...')
    const groupMemberships = await localPrisma.groupMembership.findMany()
    if (groupMemberships.length > 0) {
      await neonPrisma.groupMembership.createMany({
        data: groupMemberships,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${groupMemberships.length} group memberships`)
    } else {
      console.log('   ⏭️  No group memberships to migrate')
    }

    // 8. Timetables (depends on Users)
    console.log('8️⃣  Migrating Timetables...')
    const timetables = await localPrisma.timetable.findMany()
    if (timetables.length > 0) {
      await neonPrisma.timetable.createMany({
        data: timetables,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${timetables.length} timetables`)
    } else {
      console.log('   ⏭️  No timetables to migrate')
    }

    // 9. TimeSlots (depends on Timetables, Subjects, Rooms, SlotTypes, Batches, Users)
    console.log('9️⃣  Migrating TimeSlots...')
    const timeSlots = await localPrisma.timeSlot.findMany()
    if (timeSlots.length > 0) {
      await neonPrisma.timeSlot.createMany({
        data: timeSlots,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${timeSlots.length} time slots`)
    } else {
      console.log('   ⏭️  No time slots to migrate')
    }

    // 10. TimetableGroups (depends on Timetables and Groups)
    console.log('🔟 Migrating TimetableGroups...')
    const timetableGroups = await localPrisma.timetableGroup.findMany()
    if (timetableGroups.length > 0) {
      await neonPrisma.timetableGroup.createMany({
        data: timetableGroups,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${timetableGroups.length} timetable groups`)
    } else {
      console.log('   ⏭️  No timetable groups to migrate')
    }

    // 11. SlotTypePreferences (depends on Users and SlotTypes)
    console.log('1️⃣1️⃣ Migrating SlotTypePreferences...')
    const slotTypePreferences = await localPrisma.slotTypePreference.findMany()
    if (slotTypePreferences.length > 0) {
      await neonPrisma.slotTypePreference.createMany({
        data: slotTypePreferences,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${slotTypePreferences.length} slot type preferences`)
    } else {
      console.log('   ⏭️  No slot type preferences to migrate')
    }

    // 12. BatchPreferences (depends on Users and Batches)
    console.log('1️⃣2️⃣ Migrating BatchPreferences...')
    const batchPreferences = await localPrisma.batchPreference.findMany()
    if (batchPreferences.length > 0) {
      await neonPrisma.batchPreference.createMany({
        data: batchPreferences,
        skipDuplicates: true,
      })
      console.log(`   ✅ Migrated ${batchPreferences.length} batch preferences`)
    } else {
      console.log('   ⏭️  No batch preferences to migrate')
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Update your .env DATABASE_URL to point to Neon')
    console.log('   2. Test your application with the new database')
    console.log('   3. Keep your local database as backup for now\n')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await localPrisma.$disconnect()
    await neonPrisma.$disconnect()
  }
}

// Run migration
migrateData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

