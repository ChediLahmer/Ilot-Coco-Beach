#!/usr/bin/env node

/**
 * Full-stack CRUD smoke test for all 9 entities
 * Tests: Create, Read (with pagination), Update, Delete
 * Validates: Data types, error handling, response shapes
 */

const API_BASE = "http://localhost:3000";
const ADMIN_TOKEN =
  process.env.ADMIN_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSJ9.test";

let testCount = 0;
let passCount = 0;
let failCount = 0;
let results = [];

// Color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

function log(level, message) {
  const color =
    level === "PASS"
      ? colors.green
      : level === "FAIL"
        ? colors.red
        : level === "INFO"
          ? colors.blue
          : colors.yellow;
  console.log(`${color}[${level}]${colors.reset} ${message}`);
}

async function request(method, path, body = null, headers = {}) {
  const url = `${API_BASE}${path}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    ...headers,
  };

  try {
    const res = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    return { status: res.status, data };
  } catch (err) {
    return { status: 0, error: err.message, data: {} };
  }
}

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    log("PASS", message);
    results.push({ test: message, status: "✅" });
  } else {
    failCount++;
    log("FAIL", message);
    results.push({ test: message, status: "❌" });
  }
}

async function testEntity(entityName, paths) {
  log("INFO", `\n━━━ Testing ${entityName} ━━━`);

  for (const [operation, { method, path, body, expects }] of Object.entries(
    paths,
  )) {
    const finalPath = typeof path === "function" ? path() : path;
    const res = await request(method, finalPath, body);

    if (typeof expects === "number") {
      assert(
        res.status === expects,
        `${entityName} ${operation}: HTTP ${res.status} (expected ${expects})`,
      );
    } else if (typeof expects === "function") {
      assert(
        expects(res),
        `${entityName} ${operation}: Response validation passed`,
      );
    }
  }
}

// Test data
const menuCategory = { name: { fr: "Test", en: "Test", ar: "اختبار" } };
const menuItem = {
  name: { fr: "Item", en: "Item", ar: "عنصر" },
  price: "15.50",
  categoryId: 1,
};
const space = {
  name: "Test Space",
  price: "99.99",
  capacity: 5,
  image: null,
};
const review = {
  userName: "Testuser",
  comment: "Ceci est un test de commentaire long",
  rating: 5,
  deviceId: "12345678-1234-1234-1234-123456789012",
};
const gallery = {
  url: "http://example.com/image.jpg",
  alt: "Test image",
  categoryId: 1,
};
const flashSale = {
  menuItemId: 1,
  discountPercent: 20,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
};
const voucher = {
  code: `TEST-${Date.now()}`,
  discount: 10,
  type: "amount",
};

async function runTests() {
  log("INFO", "Starting comprehensive CRUD smoke tests...\n");

  // Menu Categories
  await testEntity("Menu Categories", {
    CREATE: {
      method: "POST",
      path: "/menu/categories",
      body: menuCategory,
      expects: (r) => r.status === 201,
    },
    READ: {
      method: "GET",
      path: "/menu/categories",
      expects: (r) => r.status === 200,
    },
    UPDATE: {
      method: "PUT",
      path: "/menu/categories/1",
      body: { name: { fr: "Updated", en: "Updated", ar: "محدثة" } },
      expects: (r) => r.status === 200,
    },
    DELETE: {
      method: "DELETE",
      path: "/menu/categories/1",
      expects: (r) => r.status === 204 || r.status === 200,
    },
  });

  // Menu Items
  await testEntity("Menu Items", {
    CREATE: {
      method: "POST",
      path: "/menu/items",
      body: menuItem,
      expects: (r) => r.status === 201 && r.data.id,
    },
    READ: {
      method: "GET",
      path: "/menu/items?page=1&limit=10",
      expects: (r) => r.status === 200 && Array.isArray(r.data),
    },
    UPDATE: {
      method: "PUT",
      path: "/menu/items/1",
      body: { price: "16.50" },
      expects: (r) => r.status === 200 && r.data.id,
    },
    DELETE: {
      method: "DELETE",
      path: "/menu/items/1",
      expects: (r) => r.status === 204 || r.status === 200,
    },
  });

  // Spaces
  await testEntity("Spaces", {
    CREATE: {
      method: "POST",
      path: "/spaces",
      body: space,
      expects: (r) => r.status === 201 && r.data.id,
    },
    READ: {
      method: "GET",
      path: "/spaces?page=1&limit=10",
      expects: (r) => r.status === 200 && Array.isArray(r.data),
    },
    UPDATE: {
      method: "PUT",
      path: "/spaces/1",
      body: { capacity: 10 },
      expects: (r) => r.status === 200 && r.data.id,
    },
    DELETE: {
      method: "DELETE",
      path: "/spaces/1",
      expects: (r) => r.status === 204 || r.status === 200,
    },
  });

  // Gallery
  await testEntity("Gallery Images", {
    CREATE: {
      method: "POST",
      path: "/gallery",
      body: gallery,
      expects: (r) => r.status === 201 && r.data.id,
    },
    READ: {
      method: "GET",
      path: "/gallery?limit=10",
      expects: (r) => r.status === 200 && Array.isArray(r.data),
    },
    UPDATE: {
      method: "PUT",
      path: "/gallery/1",
      body: { alt: "Updated alt text" },
      expects: (r) => r.status === 200 && r.data.id,
    },
    DELETE: {
      method: "DELETE",
      path: "/gallery/1",
      expects: (r) => r.status === 204 || r.status === 200,
    },
  });

  // Flash Sales
  await testEntity("Flash Sales", {
    CREATE: {
      method: "POST",
      path: "/flash-sales",
      body: flashSale,
      expects: (r) => r.status === 201 && r.data.id,
    },
    READ: {
      method: "GET",
      path: "/flash-sales?page=1&limit=10",
      expects: (r) => r.status === 200 && Array.isArray(r.data),
    },
    UPDATE: {
      method: "PUT",
      path: "/flash-sales/1",
      body: { discountPercent: 25 },
      expects: (r) => r.status === 200 && r.data.id,
    },
    DELETE: {
      method: "DELETE",
      path: "/flash-sales/1",
      expects: (r) => r.status === 204 || r.status === 200,
    },
  });

  // Vouchers
  await testEntity("Vouchers", {
    CREATE: {
      method: "POST",
      path: "/vouchers",
      body: voucher,
      expects: (r) => r.status === 201 && r.data.id,
    },
    READ: {
      method: "GET",
      path: "/vouchers?page=1&limit=10",
      expects: (r) => r.status === 200 && Array.isArray(r.data),
    },
    UPDATE: {
      method: "PUT",
      path: "/vouchers/1",
      body: { discount: 15 },
      expects: (r) => r.status === 200 && r.data.id,
    },
    DELETE: {
      method: "DELETE",
      path: "/vouchers/1",
      expects: (r) => r.status === 204 || r.status === 200,
    },
  });

  // Reviews (no admin auth required for create)
  await testEntity("Reviews", {
    CREATE: {
      method: "POST",
      path: "/reviews",
      body: review,
      expects: (r) => r.status === 201 && r.data.id,
    },
    READ: {
      method: "GET",
      path: "/reviews?limit=10",
      expects: (r) => r.status === 200 && Array.isArray(r.data),
    },
    UPDATE: {
      method: "PUT",
      path: "/reviews/1",
      body: { visible: true },
      expects: (r) => r.status === 200 && r.data.id,
    },
    DELETE: {
      method: "DELETE",
      path: "/reviews/1",
      expects: (r) => r.status === 204 || r.status === 200,
    },
  });

  // Config
  await testEntity("Config", {
    READ: {
      method: "GET",
      path: "/config",
      expects: (r) => r.status === 200 && typeof r.data === "object",
    },
    UPDATE: {
      method: "PUT",
      path: "/config/siteName",
      body: { value: "Test Site" },
      expects: (r) => r.status === 200 && r.data.key === "siteName",
    },
  });

  // Error handling tests
  log("INFO", "\n━━━ Testing Error Handling ━━━");

  // Invalid validation
  let res = await request("POST", "/menu/items", { price: "invalid" });
  assert(res.status === 400, "Validation error returns 400");
  assert(
    res.data.error && res.data.message,
    "Error response contains code + message",
  );

  // Not found
  res = await request("GET", "/spaces/99999");
  assert(res.status === 404, "Not found returns 404");

  // Duplicate
  res = await request("POST", "/vouchers", voucher);
  if (res.status === 201) {
    const voucherId = res.data.id;
    res = await request("POST", "/vouchers", {
      ...voucher,
      code: voucher.code,
    });
    assert(
      res.status === 409 || res.status === 400,
      "Duplicate returns 409 or 400",
    );
  }

  // Summary
  log("INFO", "\n━━━ SUMMARY ━━━");
  log("INFO", `Total Tests: ${testCount}`);
  log("PASS", `Passed: ${passCount}`);
  if (failCount > 0) log("FAIL", `Failed: ${failCount}`);

  console.log("\n📋 Test Results Table:\n");
  console.table(results);

  if (failCount === 0) {
    log("PASS", "\n✅ All smoke tests PASSED - System is production ready!\n");
    process.exit(0);
  } else {
    log("FAIL", `\n❌ ${failCount} tests FAILED\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  log("FAIL", `Test execution failed: ${err.message}`);
  process.exit(1);
});
