# 🎯 Cursor Rules for Error Prevention

## 📋 Overview

This document contains rules to prevent common errors encountered during development. Follow these rules strictly to maintain code quality and avoid runtime issues.

---

## 🔧 Rule 1: Prisma Client Import Consistency

### ❌ NEVER DO THIS:

```typescript
import { PrismaClient } from "@prisma/client";
```

### ✅ ALWAYS DO THIS:

```typescript
import { PrismaClient } from "@/generated/prisma";
```

### 🔍 Verification Steps:

1. Check existing API routes for import pattern
2. Use `@/generated/prisma` consistently across ALL files
3. After schema changes: `npx prisma generate`
4. Restart dev server after Prisma changes
5. Clear cache: `Remove-Item -Recurse -Force .next`

### 📁 Files to Check:

- `src/app/api/*/route.ts`
- `src/app/api/*/[id]/route.ts`
- Any file using PrismaClient

---

## 🔧 Rule 2: HTML Structure Validation

### ❌ NEVER DO THIS:

```jsx
<CardDescription>
  <div>content</div> {/* ❌ div inside p element */}
</CardDescription>
```

### ✅ ALWAYS DO THIS:

```jsx
<div className="mt-2">
  <div>content</div> {/* ✅ div inside div */}
</div>
```

### 🔍 Component HTML Rendering:

- `CardDescription` → renders as `<p>` → cannot contain `<div>`
- `CardTitle` → renders as `<h3>` → can contain inline elements
- `CardContent` → renders as `<div>` → can contain anything

### 📋 Validation Checklist:

- [ ] No `<div>` inside `<p>` elements
- [ ] No `<div>` inside `<span>` elements
- [ ] Use browser dev tools to verify HTML structure
- [ ] Check component documentation for rendered HTML

---

## 🔧 Rule 3: Select Component Value Validation

### ❌ NEVER DO THIS:

```jsx
<SelectItem value="">All Items</SelectItem>  {/* ❌ Empty string */}
<SelectItem value={""}>All Items</SelectItem>  {/* ❌ Empty string */}
```

### ✅ ALWAYS DO THIS:

```jsx
<SelectItem value="all">All Items</SelectItem>  {/* ✅ Valid value */}
<SelectItem value="none">None</SelectItem>  {/* ✅ Valid value */}
```

### 🔍 Implementation Steps:

1. Use meaningful non-empty values: `"all"`, `"none"`, `"default"`
2. Update filter logic to handle new values
3. Update default state values
4. Update "clear" functionality

### 📋 Example Implementation:

```typescript
// State initialization
const [filter, setFilter] = useState("all"); // ✅ Not empty string

// Filter logic
const matchesFilter = !filter || filter === "all" || item.type === filter;

// Clear function
const clearFilters = () => {
  setFilter("all"); // ✅ Set to valid value
};
```

---

## 🔧 Rule 4: Next.js Dynamic Route Params

### ❌ NEVER DO THIS:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // ❌ Not Promise
) {
  const id = params.id; // ❌ Not awaited
}
```

### ✅ ALWAYS DO THIS:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise type
) {
  const { id } = await params; // ✅ Await params
}
```

### 🔍 Pattern for All Dynamic Routes:

```typescript
// Single parameter
const { id } = await params;

// Multiple parameters
const { id, slug } = await params;

// Nested parameters
const { id } = await params;
const { subId } = await params.subParams;
```

### 📁 Files to Check:

- `src/app/api/*/[id]/route.ts`
- `src/app/api/*/[slug]/route.ts`
- Any dynamic route handler

---

## 🔧 Rule 5: Database Schema Field References

### ❌ NEVER DO THIS:

```typescript
// If specialty is in Profile model, not User model
mentor: {
  select: {
    specialty: true,  // ❌ Field doesn't exist on User
  },
}
```

### ✅ ALWAYS DO THIS:

```typescript
mentor: {
  select: {
    profile: {
      select: {
        specialty: true,  // ✅ Correct nested path
      },
    },
  },
}
```

### 🔍 Verification Steps:

1. Check `prisma/schema.prisma` for exact field locations
2. Verify relationships between models
3. Use correct nested paths for related fields
4. Test queries in Prisma Studio first

### 📋 Common Field Locations:

```typescript
// User model fields
firstName, lastName, email, role;

// Profile model fields (related to User)
bio, location, avatar, resume, specialty, workplace;

// Accessing related fields
user.profile.specialty; // ✅ Correct
user.specialty; // ❌ Wrong
```

---

## 🔧 Rule 6: API Route Error Handling

### ❌ NEVER DO THIS:

```typescript
export async function GET(request: NextRequest) {
  const data = await prisma.user.findMany(); // ❌ No error handling
  return NextResponse.json({ data });
}
```

### ✅ ALWAYS DO THIS:

```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Token verification
    const payload = await verifyEdgeToken(token, process.env.JWT_SECRET!);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. Role verification (if needed)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });
    if (!user || user.role !== "MENTEE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 4. Database operation
    const data = await prisma.user.findMany();

    // 5. Success response
    return NextResponse.json({ data });
  } catch (error) {
    // 6. Error handling
    console.error("Error description:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 📋 Error Handling Checklist:

- [ ] Authentication check
- [ ] Token verification
- [ ] Role-based access control
- [ ] Input validation
- [ ] Database error handling
- [ ] Appropriate HTTP status codes
- [ ] Error logging for debugging

---

## 🔧 Rule 7: Component State Management

### ❌ NEVER DO THIS:

```typescript
const [filter, setFilter] = useState(""); // ❌ Empty string default
const [selected, setSelected] = useState(""); // ❌ Empty string default
```

### ✅ ALWAYS DO THIS:

```typescript
const [filter, setFilter] = useState("all"); // ✅ Valid default
const [selected, setSelected] = useState("none"); // ✅ Valid default
```

### 🔍 State Management Checklist:

- [ ] Use meaningful default values
- [ ] Ensure defaults match Select component values
- [ ] Update clear/reset functions accordingly
- [ ] Test state transitions
- [ ] Handle loading and error states

### 📋 Example State Management:

```typescript
// Initial state
const [searchTerm, setSearchTerm] = useState("");
const [locationFilter, setLocationFilter] = useState("");
const [experienceFilter, setExperienceFilter] = useState("all");
const [typeFilter, setTypeFilter] = useState("all");

// Clear function
const clearFilters = () => {
  setSearchTerm("");
  setLocationFilter("");
  setExperienceFilter("all");
  setTypeFilter("all");
};
```

---

## 🔧 Rule 8: File Import Verification

### ❌ NEVER DO THIS:

```typescript
import { Button } from "../components/ui/button"; // ❌ Relative path
import { PrismaClient } from "@prisma/client"; // ❌ Wrong path
```

### ✅ ALWAYS DO THIS:

```typescript
import { Button } from "@/components/ui/button"; // ✅ Absolute path
import { PrismaClient } from "@/generated/prisma"; // ✅ Correct path
```

### 🔍 Import Verification Checklist:

- [ ] Check existing similar files for import patterns
- [ ] Use consistent import paths across the project
- [ ] Use absolute imports with `@/` prefix
- [ ] Verify all imports resolve correctly
- [ ] Check for circular dependencies

### 📋 Common Import Patterns:

```typescript
// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Prisma
import { PrismaClient } from "@/generated/prisma";

// Utilities
import { verifyEdgeToken } from "@/lib/edge-auth";

// Types
import { User, Profile } from "@/types";
```

---

## 🔧 Rule 9: Development Workflow

### 🔄 After Schema Changes:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Clear Next.js cache
Remove-Item -Recurse -Force .next

# 3. Restart development server
npm run dev

# 4. Test affected functionality
# 5. Check browser console for errors
```

### 🔄 After Fixing Errors:

```bash
# 1. Test the complete user flow
# 2. Verify no regressions in other features
# 3. Check all related API endpoints
# 4. Validate UI components work correctly
# 5. Clear browser cache and test again
```

### 📋 Development Checklist:

- [ ] Prisma client regenerated after schema changes
- [ ] Next.js cache cleared after major changes
- [ ] Development server restarted
- [ ] All affected functionality tested
- [ ] No console errors
- [ ] No runtime errors
- [ ] Complete user flow works

---

## 🔧 Rule 10: Error Prevention Checklist

### ✅ Before Committing Changes:

- [ ] All Prisma imports use `@/generated/prisma`
- [ ] No empty string values in Select components
- [ ] No invalid HTML nesting (div inside p)
- [ ] All dynamic route params are awaited
- [ ] Database field references are correct
- [ ] State has valid default values
- [ ] Error handling is implemented
- [ ] All imports resolve correctly
- [ ] Development server restarted after schema changes
- [ ] Complete user flow tested

### ✅ Before Creating New Files:

- [ ] Check existing similar files for patterns
- [ ] Use consistent import paths
- [ ] Follow established naming conventions
- [ ] Implement proper error handling
- [ ] Test the new functionality

### ✅ Before Modifying Existing Files:

- [ ] Understand the current implementation
- [ ] Check for dependencies
- [ ] Test the changes thoroughly
- [ ] Ensure no regressions
- [ ] Update related files if needed

---

## 🚨 Common Error Patterns to Avoid

### 1. Prisma Client Errors:

```
Error: @prisma/client did not initialize yet
```

**Solution:** Use `@/generated/prisma` import path

### 2. React Hydration Errors:

```
Error: In HTML, <div> cannot be a descendant of <p>
```

**Solution:** Check component HTML rendering and avoid invalid nesting

### 3. Select Component Errors:

```
Error: Select.Item must have a value prop that is not an empty string
```

**Solution:** Use non-empty values like "all", "none", "default"

### 4. Next.js Dynamic Route Errors:

```
Error: params should be awaited before using its properties
```

**Solution:** Use `const { id } = await params;`

### 5. Database Field Errors:

```
Error: Object literal may only specify known properties
```

**Solution:** Check schema.prisma for correct field paths

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🎯 Quick Reference

| Error Type       | Quick Fix                  |
| ---------------- | -------------------------- |
| Prisma Client    | Use `@/generated/prisma`   |
| HTML Nesting     | Avoid `<div>` inside `<p>` |
| Select Values    | Use non-empty strings      |
| Dynamic Params   | `await params`             |
| Field References | Check schema.prisma        |

---

**Remember: Prevention is better than fixing! Follow these rules consistently to avoid errors and maintain code quality.**
