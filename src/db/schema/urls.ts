import { sql } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const urlsTable = sqliteTable('URLs', {
  slug: text('slug', { length: 16 }).primaryKey().notNull().unique(),
  destination: text('destination', { length: 2048 }).notNull(),
  createdAt: text('createdAt', { length: 32 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
