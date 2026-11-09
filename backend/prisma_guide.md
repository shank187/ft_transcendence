# The Complete Prisma ORM Developer Guide

This guide is designed to teach you the mental model of Prisma so you never have to guess or memorize queries again.

---

## 1. The Core Mental Model

In traditional SQL, you write raw strings:
```sql
SELECT * FROM "Gym" WHERE name ILIKE '%fitness%' AND city = 'rabat';
```

In Prisma, **every query is a JavaScript object with 4 standard sections**:

```ts
const result = await prisma.gym.findMany({
  where:   { /* 1. FILTERING: Which rows do I want? */ },
  select:  { /* 2. FIELDS: Which specific columns do I want back? */ },
  include: { /* 3. RELATIONS: What related tables should I join? */ },
  orderBy: { /* 4. SORTING: In what order? */ },
  skip:    0,  /* 5. PAGINATION: How many to skip? */
  take:    10, /* 5. PAGINATION: How many to take? */
});
```

---

## 2. The Query Methods: When to Use Which

| Method | What it returns | When to use | Example |
| :--- | :--- | :--- | :--- |
| **`findUnique`** | `Object \| null` | When querying by a column with `@id` or `@unique` | Find user by `id` or `email` |
| **`findFirst`** | `Object \| null` | When querying by **any** column, returns first match | Find gym by `name: "R1"` and `city: "rabat"` |
| **`findMany`** | `Array []` | When expecting 0, 1, or many rows | Search gyms, list exercises |
| **`create`** | Created Object | Insert 1 new record | Register user, create plan |
| **`update`** | Updated Object | Modify 1 existing record (requires `@id` or `@unique`) | Update user avatar |
| **`upsert`** | Updated or Created Object | "If exists update, else create" (requires `@unique`) | Seed script idempotency |
| **`delete`** | Deleted Object | Remove 1 record (requires `@id` or `@unique`) | Delete plan |

> [!IMPORTANT]
> **`findUnique` vs `findFirst` rule of thumb:**
> - If the field in `schema.prisma` has `@id` or `@unique` ➔ use `findUnique`.
> - If the field is a normal column (like `city` or `name`) ➔ use `findFirst`.

---

## 3. The `where` Clause & Filter Operators

Every filter rule in Prisma is formatted as:
`fieldName: { operator: value }`

### A. String Operators
```ts
// 1. Case-insensitive substring match (Search)
name: {
  contains: "gold",
  mode: "insensitive" // Matches "Gold", "GOLD", "gold"
}

// 2. Starts with / Ends with
name: { startsWith: "Fit", mode: "insensitive" }
name: { endsWith: "Gym", mode: "insensitive" }

// 3. Exact match
city: { equals: "rabat", mode: "insensitive" }
```

### B. Number & Date Operators
```ts
// Comparison
rating: { gt: 4 }      // Greater than ( > 4 )
rating: { gte: 4 }     // Greater than or equal ( >= 4 )
price:  { lt: 100 }    // Less than ( < 100 )
price:  { lte: 100 }   // Less than or equal ( <= 100 )

// Date range
createdAt: {
  gte: new Date("2026-01-01"),
  lte: new Date("2026-12-31")
}
```

### C. List / Array Operators (`in`)
When checking if a single database value matches **one of several choices**:
```ts
city: {
  in: ["rabat", "casablanca", "khouribga"]
}
```

### D. Boolean & Null Checks
```ts
verified: true              // Matches verified gyms
description: null           // Matches gyms with no description
description: { not: null }  // Matches gyms that have a description
```

---

## 4. Logical Operators: `AND`, `OR`, `NOT`

### `OR` (Any condition can match)
Search for a keyword across name, city, or address:
```ts
where: {
  OR: [
    { name: { contains: query, mode: "insensitive" } },
    { city: { contains: query, mode: "insensitive" } },
    { address: { contains: query, mode: "insensitive" } }
  ]
}
```

### `AND` (All conditions must match)
```ts
where: {
  AND: [
    { verified: true },
    { city: { equals: "rabat", mode: "insensitive" } }
  ]
}
```
*(Tip: In Prisma, writing `{ verified: true, city: "rabat" }` directly inside `where` already acts as an implicit `AND`).*

---

## 5. Filtering on Relations (`some`, `every`, `none`)

When a table is related to another table (e.g. Gym ➔ GymEquipment):

| Relation Operator | Meaning |
| :--- | :--- |
| **`some`** | At least one related item matches |
| **`every`** | All related items must match |
| **`none`** | Zero related items match |

**Example:** Find gyms that have Dumbbells:
```ts
where: {
  equipment: {
    some: {
      equipmentId: "uuid-of-dumbbells"
    }
  }
}
```

---

## 6. Selecting Data: `select` vs `include`

By default, Prisma returns all columns of that model, but **no relations**.

### `include` (Keep all gym fields + join relations)
```ts
const gyms = await prisma.gym.findMany({
  include: {
    equipment: {
      include: {
        equipment: true // Loads the actual Equipment table record
      }
    }
  }
});
```

### `select` (Pick only specific columns to save memory)
```ts
const gyms = await prisma.gym.findMany({
  select: {
    id: true,
    name: true,
    city: true
    // description and coordinates are NOT fetched from the DB
  }
});
```
> [!WARNING]
> You cannot use `select` and `include` at the exact same level! Pick either `include` or `select`.

---

## 7. Pagination & Sorting

```ts
const page = 2;
const pageSize = 10;

const gyms = await prisma.gym.findMany({
  take: pageSize,              // How many to get
  skip: (page - 1) * pageSize, // How many to jump over
  orderBy: {
    createdAt: "desc"          // "asc" for oldest first, "desc" for newest
  }
});
```

---

## 8. The Secret to Never Relying on AI: TypeScript Autocomplete

Prisma generates TypeScript types directly from your schema. If you type your `where` object with `Prisma.GymWhereInput`, **VS Code will show you every valid operator with `Ctrl + Space`**:

```ts
import { Prisma } from "@prisma/client";

// Give your where object this type:
const where: Prisma.GymWhereInput = {};

// Now type "where." and press Ctrl+Space!
// VS Code will autocomplete every single field and operator correctly!
```

---

## 9. Full Real-World Example: Gym Search Service

```ts
import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

interface GymSearchParams {
  search?: string;
  city?: string;
  verified?: boolean;
}

export async function searchGyms({ search, city, verified }: GymSearchParams) {
  // 1. Build dynamic filter
  const where: Prisma.GymWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } }
    ];
  }

  if (city) {
    where.city = { equals: city, mode: "insensitive" };
  }

  if (typeof verified === "boolean") {
    where.verified = verified;
  }

  // 2. Query Database
  return await prisma.gym.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      equipment: {
        include: {
          equipment: true
        }
      }
    }
  });
}
```

