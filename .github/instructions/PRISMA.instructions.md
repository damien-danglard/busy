---
applyTo: "**/prisma/migrations/*/*.sql"
---

# Prisma Migration Management Instructions

## Database Migration Management

When working with database schema changes in this repository:

- **Always use Prisma CLI commands** instead of manually creating or editing SQL migration files
- Use `npx prisma migrate dev --name <migration-name>` to create a new migration in development
- Use `npx prisma migrate deploy` to apply migrations in production
- Use `npx prisma migrate reset` to reset the database and reapply all migrations
- Use `npx prisma db push` for prototyping schema changes without creating migrations
- Never manually create or edit files in `prisma/migrations/` directories

## Rationale

Manual edits to migration files can:
- Break migration history and database state tracking
- Create inconsistencies between schema and applied migrations
- Lead to deployment failures in production environments
- Make it impossible to rollback or replay migrations reliably
- Cause conflicts when multiple developers work on schema changes

## Workflow

1. Update your `schema.prisma` file with the desired changes
2. Run `npx prisma migrate dev --name descriptive_name` to generate the migration
3. Review the generated SQL in the migration file
4. Test the migration locally
5. Commit both the schema and migration files together

## Exceptions

You may manually edit migration files only when:
- Fixing a critical bug in production with DBA supervision
- Adding custom SQL that Prisma cannot generate (e.g., triggers, functions, indexes with specific options)
- In these cases, document the changes thoroughly in comments

Always consult with the team before manually editing migration files.
