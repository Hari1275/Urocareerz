# 🚀 Quick Reference - Error Prevention

## 🔥 Most Common Errors & Fixes

### 1. Prisma Client Error

```
❌ Error: @prisma/client did not initialize yet
✅ Fix: import { PrismaClient } from "@/generated/prisma";
```

### 2. React Hydration Error

```
❌ Error: <div> cannot be a descendant of <p>
✅ Fix: Replace CardDescription with <div> for complex content
```

### 3. Select Component Error

```
❌ Error: Select.Item must have a value prop that is not an empty string
✅ Fix: Use "all", "none", "default" instead of empty strings
```

### 4. Next.js Dynamic Route Error

```
❌ Error: params should be awaited before using its properties
✅ Fix: const { id } = await params;
```

### 5. Database Field Error

```
❌ Error: Object literal may only specify known properties
✅ Fix: Check schema.prisma for correct field paths
```

## ⚡ Quick Commands

```bash
# After schema changes
npx prisma generate
Remove-Item -Recurse -Force .next
npm run dev

# Check for errors
grep -r "@prisma/client" src/
grep -r "value=\"\"" src/
grep -r "params\." src/app/api/
```

## 🎯 Before Every Commit

- [ ] All Prisma imports use `@/generated/prisma`
- [ ] No empty Select values
- [ ] No invalid HTML nesting
- [ ] All params are awaited
- [ ] Database fields are correct
- [ ] State has valid defaults
- [ ] Error handling implemented
- [ ] Complete flow tested
