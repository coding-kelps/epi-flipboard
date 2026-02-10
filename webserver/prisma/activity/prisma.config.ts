import { defineConfig } from 'prisma/config'
import { getDatabaseUrl } from '../../lib/database-url'

export default defineConfig({
    schema: 'schema.prisma',
    datasource: {
        url: getDatabaseUrl('ACTIVITY_DB'),
    },
})
