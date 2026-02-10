import { defineConfig } from 'prisma/config'
import { getDatabaseUrl } from '../../lib/database-url'

export default defineConfig({
    schema: 'schema.prisma',
    migrations: {
        path: 'migrations',
    },
    datasource: {
        url: getDatabaseUrl('IDENTITY_DB'),
    },
})
