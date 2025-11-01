# Database Port Configuration

## Important Note

The PostgreSQL database is running on port **54320** instead of the default 5432.

This is because port 5432 was already in use on your system. Using port 54320 avoids conflicts and allows the Docker container to run smoothly.

### Connection Details

- **Host**: localhost
- **Port**: 54320 (not the default 5432)
- **Database**: voxarena_dev
- **User**: voxarena
- **Password**: voxarena_dev_password

### Connection String

```
DATABASE_URL="postgresql://voxarena:voxarena_dev_password@localhost:54320/voxarena_dev"
```

### If You Want to Use Port 5432

If you want to use the standard PostgreSQL port 5432, you'll need to:

1. **Find what's using port 5432:**
```bash
lsof -i :5432
```

2. **Stop that service** (if it's safe to do so)

3. **Update docker-compose.yml:**
```yaml
ports:
  - "5432:5432"  # Change from 54320:5432
```

4. **Update .env and .env.local:**
```bash
DATABASE_URL="postgresql://voxarena:voxarena_dev_password@localhost:5432/voxarena_dev"
```

5. **Restart the container:**
```bash
npm run db:reset
```

### No Action Required

The current setup with port 54320 works perfectly. This is just a note for your reference.

---

**Current Status:** ✅ Database running successfully on port 54320
