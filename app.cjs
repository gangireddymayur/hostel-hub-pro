const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { pathToFileURL } = require("node:url");

process.noDeprecation = true;

const ROOT = __dirname;
const CLIENT_DIR = path.join(ROOT, "dist", "client");
const CLIENT_ASSETS_DIR = path.join(CLIENT_DIR, "assets");
const VENDOR_NODE_MODULES = path.join(ROOT, "vendor", "node_modules");
const MYSQL2_PROMISE_PATH = path.join(VENDOR_NODE_MODULES, "mysql2", "promise.js");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key || process.env[key] != null) continue;

    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

for (const candidate of [
  path.join(ROOT, ".env"),
  path.join(ROOT, ".env.local"),
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), ".env.local"),
]) {
  loadEnvFile(candidate);
}

const LISTEN_TARGET = getListenTarget();
const HOST = process.env.HOST ?? "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-plesk-env";
let DB_HOST = process.env.DB_HOST ?? "";
if (DB_HOST.toLowerCase() === "localhost") {
  DB_HOST = "127.0.0.1";
}
const DB_PORT = parsePort(process.env.DB_PORT) ?? 3306;
const DB_USER = process.env.DB_USER ?? "";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME ?? "";
const ACCESS_TTL_SECONDS = 60 * 60 * 24 * 7;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_SUPER_ADMIN_ID = "super_admin_87a9d497-8b89-47a9-8923-34c9da59d427";
const DEFAULT_SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "admin@hostelhub.local";

let mysqlPoolFactory = null;
let mysqlLoadError = null;
let vendoredMysqlLoadError = null;
try {
  ({ createPool: mysqlPoolFactory } = require(MYSQL2_PROMISE_PATH));
} catch (error) {
  vendoredMysqlLoadError = error;
  try {
    ({ createPool: mysqlPoolFactory } = require("mysql2/promise"));
  } catch (error) {
    mysqlLoadError = error;
    mysqlPoolFactory = null;
  }
}

const dbPool =
  mysqlPoolFactory && DB_HOST && DB_USER && DB_PASSWORD && DB_NAME
    ? mysqlPoolFactory({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      dateStrings: true,
    })
    : null;

const sseClients = new Set();

function getEnvDebugSnapshot() {
  const vendorMysql2Path = path.join(VENDOR_NODE_MODULES, "mysql2", "promise.js");
  const vendorSqlEscaperPath = path.join(VENDOR_NODE_MODULES, "sql-escaper", "lib", "index.js");
  const vendorSaferBufferPath = path.join(VENDOR_NODE_MODULES, "safer-buffer", "safer.js");

  return {
    cwd: process.cwd(),
    root: ROOT,
    hasDotEnv: fs.existsSync(path.join(ROOT, ".env")),
    hasDotEnvLocal: fs.existsSync(path.join(ROOT, ".env.local")),
    vendorDirExists: fs.existsSync(path.join(ROOT, "vendor")),
    vendorNodeModulesExists: fs.existsSync(VENDOR_NODE_MODULES),
    mysql2FileExists: fs.existsSync(vendorMysql2Path),
    sqlEscaperFileExists: fs.existsSync(vendorSqlEscaperPath),
    saferBufferFileExists: fs.existsSync(vendorSaferBufferPath),
    vendoredMysqlLoadError: vendoredMysqlLoadError ? `${vendoredMysqlLoadError.name}: ${vendoredMysqlLoadError.message}` : null,
    mysqlLoadError: mysqlLoadError ? `${mysqlLoadError.name}: ${mysqlLoadError.message}` : null,
    dbHostSet: Boolean(DB_HOST),
    dbPortSet: Boolean(String(process.env.DB_PORT ?? "").trim()),
    dbUserSet: Boolean(DB_USER),
    dbPasswordSet: Boolean(DB_PASSWORD),
    dbNameSet: Boolean(DB_NAME),
    jwtSecretSet: Boolean(JWT_SECRET && JWT_SECRET !== "change-me-in-plesk-env"),
    mysqlAvailable: Boolean(mysqlPoolFactory),
    dbPoolConfigured: Boolean(dbPool),
  };
}

let ssrServerPromise = null;
let lastHydrateError = null;
let lastPersistError = null;


async function getSsrServer() {
  if (!ssrServerPromise) {
    const ssrEntryPath = path.join(ROOT, "dist", "server", "server.mjs");
    ssrServerPromise = import(pathToFileURL(ssrEntryPath).href).then((module) => module.default ?? module);
  }
  return ssrServerPromise;
}

function parsePort(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed < 65536 ? parsed : undefined;
}

function getListenTarget() {
  const raw = process.env.PORT ?? process.env.NODE_PORT ?? process.env.IISNODE_PORT;
  const parsed = parsePort(raw);
  return parsed ?? raw ?? 3000;
}

function nowIso() {
  return new Date().toISOString();
}

function uuid(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function b64url(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

function hmac(input) {
  return crypto.createHmac("sha256", JWT_SECRET).update(input).digest("base64url");
}

function signToken(payload, ttlSeconds) {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const unsigned = `${b64url(header)}.${b64url(fullPayload)}`;
  return `${unsigned}.${hmac(unsigned)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const [headerPart, payloadPart, signature] = token.split(".");
  if (!headerPart || !payloadPart || !signature) return null;
  const unsigned = `${headerPart}.${payloadPart}`;
  if (hmac(unsigned) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 120000;
  const key = crypto.pbkdf2Sync(String(password), salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2$sha256$${iterations}$${salt}$${key}`;
}

function verifyPassword(password, hash) {
  if (!hash || typeof hash !== "string") return false;
  const parts = hash.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") return false;
  const iterations = Number(parts[2]);
  const salt = parts[3];
  const key = parts[4];
  const next = crypto.pbkdf2Sync(String(password), salt, iterations, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(next, "hex"), Buffer.from(key, "hex"));
}

async function pingDatabase() {
  if (!dbPool) {
    return { configured: false, healthy: false, error: "Database pool is not configured" };
  }

  try {
    await dbPool.query("SELECT 1 AS ok");
    return { configured: true, healthy: true, error: null };
  } catch (error) {
    console.warn("[health] database check failed:", error.message);
    return { configured: true, healthy: false, error: `${error.name}: ${error.message}` };
  }
}

function safeWriteJson(filePath, value) {
  void filePath;
  void value;
}

function defaultData() {
  const superAdminPassword = hashPassword(process.env.SUPER_ADMIN_PASSWORD ?? "Admin@12345");
  const hostelAdminPassword = hashPassword("Hostel@12345");
  const securityPassword = hashPassword("Security@12345");
  const studentPassword = hashPassword("Student@12345");

  const hostelId = uuid("hostel");
  const superAdminId = DEFAULT_SUPER_ADMIN_ID;
  const hostelAdminId = uuid("user");
  const securityUserId = uuid("user");
  const staffId = uuid("staff");
  const student1Id = uuid("student");
  const student2Id = uuid("student");
  const parent1Id = uuid("parent");
  const parent2Id = uuid("parent");
  const leave1Id = uuid("leave");
  const leave2Id = uuid("leave");
  const gatePass1Id = uuid("gate");

  return {
    hostels: [
      {
        id: hostelId,
        hostel_name: "Hostel Hub Demo",
        email: "hostel@hostelhub.local",
        password_hash: hostelAdminPassword,
        status: "ACTIVE",
        created_at: nowIso(),
      },
    ],
    users: [
      {
        id: superAdminId,
        hostelId: null,
        role: "SUPER_ADMIN",
        name: "Super Admin",
        email: DEFAULT_SUPER_ADMIN_EMAIL,
        passwordHash: superAdminPassword,
        status: "ACTIVE",
        tokenVersion: 0,
        created_at: nowIso(),
      },
      {
        id: hostelAdminId,
        hostelId,
        role: "HOSTEL_ADMIN",
        name: "Hostel Admin",
        email: "hosteladmin@hostelhub.local",
        passwordHash: hostelAdminPassword,
        status: "ACTIVE",
        tokenVersion: 0,
        created_at: nowIso(),
      },
      {
        id: securityUserId,
        hostelId,
        role: "SECURITY_GUARD",
        name: "Security Guard",
        email: "security@hostelhub.local",
        passwordHash: securityPassword,
        status: "ACTIVE",
        tokenVersion: 0,
        created_at: nowIso(),
      },
    ],
    parents: [
      {
        id: parent1Id,
        hostel_id: hostelId,
        mobile: "9000000001",
        password_hash: studentPassword,
        created_at: nowIso(),
      },
      {
        id: parent2Id,
        hostel_id: hostelId,
        mobile: "9000000002",
        password_hash: studentPassword,
        created_at: nowIso(),
      },
    ],
    students: [
      {
        id: student1Id,
        hostel_id: hostelId,
        student_id: "STU-1001",
        name: "Aarav Shah",
        room_number: "A-101",
        mobile: "8000000001",
        parent_mobile: "9000000001",
        profile_photo: null,
        password_hash: studentPassword,
        status: "ACTIVE",
        student_year: "1st Year",
        created_at: nowIso(),
      },
      {
        id: student2Id,
        hostel_id: hostelId,
        student_id: "STU-1002",
        name: "Mira Patel",
        room_number: "A-102",
        mobile: "8000000002",
        parent_mobile: "9000000002",
        profile_photo: null,
        password_hash: studentPassword,
        status: "ACTIVE",
        student_year: "2nd Year",
        created_at: nowIso(),
      },
    ],
    staff: [
      {
        id: staffId,
        hostel_id: hostelId,
        role: "HOSTEL_ADMIN",
        name: "Hostel Admin",
        email: "hosteladmin@hostelhub.local",
        password_hash: hostelAdminPassword,
        created_at: nowIso(),
      },
      {
        id: uuid("staff"),
        hostel_id: hostelId,
        role: "SECURITY_GUARD",
        name: "Security Guard",
        email: "security@hostelhub.local",
        password_hash: securityPassword,
        created_at: nowIso(),
      },
    ],
    leaveRequests: [
      {
        id: leave1Id,
        hostel_id: hostelId,
        student_id: student1Id,
        reason: "Family function",
        from_date: nowIso(),
        to_date: new Date(Date.now() + 86400000).toISOString(),
        out_time: new Date(`${new Date().toISOString().slice(0, 10)}T09:00:00.000Z`).toISOString(),
        return_time: new Date(`${new Date().toISOString().slice(0, 10)}T18:00:00.000Z`).toISOString(),
        parent_status: "APPROVED",
        hostel_status: "APPROVED",
        final_status: "APPROVED",
        created_at: nowIso(),
        note: "Seeded approved leave",
      },
      {
        id: leave2Id,
        hostel_id: hostelId,
        student_id: student2Id,
        reason: "Medical appointment",
        from_date: nowIso(),
        to_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        out_time: new Date(`${new Date().toISOString().slice(0, 10)}T10:00:00.000Z`).toISOString(),
        return_time: new Date(`${new Date().toISOString().slice(0, 10)}T17:00:00.000Z`).toISOString(),
        parent_status: "PENDING",
        hostel_status: "PENDING",
        final_status: "PENDING",
        created_at: nowIso(),
        note: "Seeded pending leave",
      },
    ],
    gatePasses: [
      {
        id: gatePass1Id,
        leave_request_id: leave1Id,
        qr_code: `GP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
        out_time_actual: null,
        in_time_actual: null,
        status: "APPROVED",
        created_at: nowIso(),
      },
    ],
    auditLogs: [
      {
        id: uuid("audit"),
        action: "SEED",
        entity: "SYSTEM",
        entity_id: null,
        actor_id: null,
        actor_role: "SUPER_ADMIN",
        meta: { message: "Initial seed data created" },
        created_at: nowIso(),
      },
    ],
    refreshTokens: [],
  };
}

const DB_FILE = path.join(ROOT, "db.json");

function loadData() {
  let parsed = null;
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf8");
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("[db] failed to read db.json, falling back to default data:", error.message);
    }
  }
  if (!parsed) {
    parsed = defaultData();
  }
  if (parsed.hostels) {
    const parentHostels = parsed.hostels.filter(h => !h.parent_hostel_id && !h.id.endsWith("_ALL"));
    parentHostels.forEach((parent) => {
      const virtualId = `${parent.id}_ALL`;
      const exists = parsed.hostels.some(h => h.id === virtualId);
      if (!exists) {
        parsed.hostels.push({
          id: virtualId,
          hostel_name: "All Hostels (all branches)",
          email: `all_hostels_${parent.id}@hostelhub.local`,
          password_hash: "VIRTUAL_HOSTEL_HASH",
          status: "ACTIVE",
          parent_hostel_id: parent.id,
          created_at: nowIso(),
          updated_at: nowIso(),
        });
      }
    });
  }
  return parsed;
}

let db = loadData();

function normalizeDateTime(value) {
  if (!value) return nowIso();
  if (value instanceof Date) return value.toISOString();
  const text = String(value);
  const normalized = text.includes("T") ? text : `${text.replace(" ", "T")}Z`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString();
}

function normalizeDateOnly(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value);
  return text.includes("T") ? text.slice(0, 10) : text.slice(0, 10);
}

function toSqlDateTime(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())} ${pad(parsed.getUTCHours())}:${pad(parsed.getUTCMinutes())}:${pad(parsed.getUTCSeconds())}`;
}


function parseJsonMaybe(value) {
  if (value == null || value === "") return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function ensureProfilePhotoColumn() {
  if (!dbPool) return;
  try {
    const [columns] = await dbPool.query("SHOW COLUMNS FROM students LIKE 'profile_photo'");
    if (columns.length === 0) {
      console.log("Auto-Migration: Adding 'profile_photo' column to 'students' table...");
      await dbPool.query("ALTER TABLE students ADD COLUMN profile_photo LONGTEXT NULL");
      console.log("Auto-Migration: Column 'profile_photo' added successfully!");
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or add 'profile_photo' column:", error.message);
  }
}

async function ensureLocationColumns() {
  if (!dbPool) return;
  try {
    const [lrCols] = await dbPool.query("SHOW COLUMNS FROM leave_requests LIKE 'student_lat'");
    if (lrCols.length === 0) {
      console.log("Auto-Migration: Adding student location columns to leave_requests table...");
      await dbPool.query("ALTER TABLE leave_requests ADD COLUMN student_lat DOUBLE NULL, ADD COLUMN student_lng DOUBLE NULL");
      console.log("Auto-Migration: Location columns student_lat, student_lng added successfully!");
    }

    const [lrParentCols] = await dbPool.query("SHOW COLUMNS FROM leave_requests LIKE 'parent_lat'");
    if (lrParentCols.length === 0) {
      console.log("Auto-Migration: Adding parent and staff location columns to leave_requests table...");
      await dbPool.query("ALTER TABLE leave_requests ADD COLUMN parent_lat DOUBLE NULL, ADD COLUMN parent_lng DOUBLE NULL, ADD COLUMN hostel_lat DOUBLE NULL, ADD COLUMN hostel_lng DOUBLE NULL");
      console.log("Auto-Migration: Location columns parent_lat, parent_lng, hostel_lat, hostel_lng added successfully!");
    }

    const [gpCols] = await dbPool.query("SHOW COLUMNS FROM gate_passes LIKE 'out_guard_lat'");
    if (gpCols.length === 0) {
      console.log("Auto-Migration: Adding guard location columns to gate_passes table...");
      await dbPool.query("ALTER TABLE gate_passes ADD COLUMN out_guard_lat DOUBLE NULL, ADD COLUMN out_guard_lng DOUBLE NULL, ADD COLUMN in_guard_lat DOUBLE NULL, ADD COLUMN in_guard_lng DOUBLE NULL");
      console.log("Auto-Migration: Location columns for guard (exit and entry) added successfully!");
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or add location columns:", error.message);
  }
}

async function ensureStatusColumns() {
  if (!dbPool) return;
  const tables = ["hostels", "students", "parents", "staff"];
  for (const table of tables) {
    try {
      const [columns] = await dbPool.query(`SHOW COLUMNS FROM ${table} LIKE 'status'`);
      if (columns.length === 0) {
        console.log(`Auto-Migration: Adding 'status' column to '${table}' table...`);
        await dbPool.query(`ALTER TABLE ${table} ADD COLUMN status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE'`);
        console.log(`Auto-Migration: Column 'status' added to '${table}' successfully!`);
      }
    } catch (error) {
      console.error(`Auto-Migration Error: Failed to check or add 'status' column to '${table}' table:`, error.message);
    }
  }
}

async function ensureRefreshTokenColumnLength() {
  if (!dbPool) return;
  try {
    const [columns] = await dbPool.query("SHOW COLUMNS FROM refresh_tokens LIKE 'token_hash'");
    if (columns[0]) {
      const type = String(columns[0].Type).toLowerCase();
      if (type.includes("varchar(255)")) {
        console.log("Auto-Migration: Altering 'token_hash' column to TEXT...");
        await dbPool.query("ALTER TABLE refresh_tokens MODIFY COLUMN token_hash TEXT NOT NULL");
        console.log("Auto-Migration: Column 'token_hash' altered to TEXT successfully!");
      }
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or alter 'token_hash' column:", error.message);
  }
}

async function ensureParentHostelIdColumn() {
  if (!dbPool) return;
  try {
    const [columns] = await dbPool.query("SHOW COLUMNS FROM hostels LIKE 'parent_hostel_id'");
    if (columns.length === 0) {
      console.log("Auto-Migration: Adding 'parent_hostel_id' column to 'hostels' table...");
      await dbPool.query("ALTER TABLE hostels ADD COLUMN parent_hostel_id VARCHAR(64) NULL");
      console.log("Auto-Migration: Column 'parent_hostel_id' added successfully!");
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or add 'parent_hostel_id' column:", error.message);
  }
}

async function ensureStaffProfilePhotoColumn() {
  if (!dbPool) return;
  try {
    const [columns] = await dbPool.query("SHOW COLUMNS FROM staff LIKE 'profile_photo'");
    if (columns.length === 0) {
      console.log("Auto-Migration: Adding 'profile_photo' column to 'staff' table...");
      await dbPool.query("ALTER TABLE staff ADD COLUMN profile_photo LONGTEXT NULL");
      console.log("Auto-Migration: Column 'profile_photo' added successfully!");
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or add 'profile_photo' column to staff:", error.message);
  }
}

async function ensureParentProfilePhotoColumn() {
  if (!dbPool) return;
  try {
    const [columns] = await dbPool.query("SHOW COLUMNS FROM parents LIKE 'profile_photo'");
    if (columns.length === 0) {
      console.log("Auto-Migration: Adding 'profile_photo' column to 'parents' table...");
      await dbPool.query("ALTER TABLE parents ADD COLUMN profile_photo LONGTEXT NULL");
      console.log("Auto-Migration: Column 'profile_photo' added to 'parents' successfully!");
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or add 'profile_photo' column to parents:", error.message);
  }
}

async function ensureBaseTables() {
  if (!dbPool) return;
  try {
    const [tables] = await dbPool.query("SHOW TABLES LIKE 'hostels'");
    if (tables.length === 0) {
      console.log("Auto-Migration: Base tables are missing. Initializing database from schema.sql...");
      const schemaPath = path.join(ROOT, "db", "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, "utf8");
        const queries = schemaSql
          .split(";")
          .map((q) => q.trim())
          .filter((q) => q.length > 0 && !q.startsWith("CREATE DATABASE") && !q.startsWith("USE"));
        
        for (const query of queries) {
          const cleaned = query
            .split("\n")
            .filter((line) => !line.trim().startsWith("--"))
            .join("\n")
            .trim();
          if (cleaned) {
            await dbPool.query(cleaned);
          }
        }
        console.log("Auto-Migration: Database schema initialized successfully!");
      } else {
        console.warn("Auto-Migration Warning: schema.sql not found at", schemaPath);
      }
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to initialize database tables:", error.message);
  }
}

async function ensureStudentYearColumn() {
  if (!dbPool) return;
  try {
    const [columns] = await dbPool.query("SHOW COLUMNS FROM students LIKE 'student_year'");
    if (columns.length === 0) {
      console.log("Auto-Migration: Adding 'student_year' column to 'students' table...");
      await dbPool.query("ALTER TABLE students ADD COLUMN student_year VARCHAR(50) NULL");
      console.log("Auto-Migration: Column 'student_year' added successfully!");
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or add 'student_year' column to students:", error.message);
  }
}

async function ensureRejectReasonColumns() {
  if (!dbPool) return;
  try {
    const [columns] = await dbPool.query("SHOW COLUMNS FROM leave_requests LIKE 'parent_reject_reason'");
    if (columns.length === 0) {
      console.log("Auto-Migration: Adding reject reason columns to leave_requests table...");
      await dbPool.query("ALTER TABLE leave_requests ADD COLUMN parent_reject_reason TEXT NULL, ADD COLUMN hostel_reject_reason TEXT NULL");
      console.log("Auto-Migration: Reject reason columns added successfully!");
    }
  } catch (error) {
    console.error("Auto-Migration Error: Failed to check or add reject reason columns:", error.message);
  }
}

let migrationsRun = false;
let hasHydrated = false;
let lastHydrateAttemptTime = 0;
const HYDRATE_RETRY_COOLDOWN_MS = 15000; // 15 seconds cooldown

async function runMigrations() {
  if (migrationsRun) return;
  await ensureBaseTables();
  await Promise.all([
    ensureProfilePhotoColumn(),
    ensureStaffProfilePhotoColumn(),
    ensureParentProfilePhotoColumn(),
    ensureLocationColumns(),
    ensureStatusColumns(),
    ensureRefreshTokenColumnLength(),
    ensureParentHostelIdColumn(),
    ensureStudentYearColumn(),
    ensureRejectReasonColumns(),
  ]);
  migrationsRun = true;
}

async function hydrateDataFromDatabase() {
  if (!dbPool) {
    db = loadData();
    return db;
  }

  if (hasHydrated) {
    return db;
  }

  // If a hydration attempt failed recently, don't block current request with another slow connection attempt.
  // Instead, immediately fall back to the last known memory state (db).
  if (Date.now() - lastHydrateAttemptTime < HYDRATE_RETRY_COOLDOWN_MS) {
    return db;
  }

  lastHydrateAttemptTime = Date.now();
  await runMigrations();

  try {
    const [
      [hostels],
      [superAdmins],
      [staffRows],
      [parents],
      [students],
      [leaveRequests],
      [gatePasses],
      [auditLogs],
      [refreshTokens],
    ] = await Promise.all([
      dbPool.query("SELECT * FROM hostels ORDER BY created_at ASC"),
      dbPool.query("SELECT * FROM super_admins ORDER BY created_at ASC"),
      dbPool.query("SELECT * FROM staff ORDER BY created_at ASC"),
      dbPool.query("SELECT * FROM parents ORDER BY created_at ASC"),
      dbPool.query("SELECT * FROM students ORDER BY created_at ASC"),
      dbPool.query("SELECT * FROM leave_requests ORDER BY created_at ASC"),
      dbPool.query("SELECT * FROM gate_passes ORDER BY created_at ASC"),
      dbPool.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500"),
      dbPool.query("SELECT * FROM refresh_tokens WHERE revoked_at IS NULL AND expires_at > NOW() ORDER BY created_at ASC"),
    ]);

    const users = [
      ...superAdmins.map((row) => ({
        id: String(row.id),
        hostelId: null,
        role: "SUPER_ADMIN",
        name: String(row.name ?? "Super Admin"),
        email: String(row.email ?? "").toLowerCase(),
        passwordHash: String(row.password_hash ?? ""),
        status: "ACTIVE",
        tokenVersion: 0,
        created_at: normalizeDateTime(row.created_at),
      })),
      ...staffRows.map((row) => ({
        id: String(row.id),
        hostelId: String(row.hostel_id ?? ""),
        role: String(row.role ?? "HOSTEL_STAFF"),
        name: String(row.name ?? ""),
        email: String(row.email ?? "").toLowerCase(),
        passwordHash: String(row.password_hash ?? ""),
        status: "ACTIVE",
        profile_photo: row.profile_photo ?? null,
        tokenVersion: 0,
        created_at: normalizeDateTime(row.created_at),
      })),
    ];

    db = {
      hostels: hostels.map((row) => ({
        id: String(row.id),
        hostel_name: String(row.hostel_name ?? ""),
        email: String(row.email ?? "").toLowerCase(),
        password_hash: String(row.password_hash ?? ""),
        status: String(row.status ?? "ACTIVE"),
        parent_hostel_id: row.parent_hostel_id ? String(row.parent_hostel_id) : null,
        created_at: normalizeDateTime(row.created_at),
      })),
      users,
      parents: parents.map((row) => ({
        id: String(row.id),
        hostel_id: String(row.hostel_id ?? ""),
        mobile: String(row.mobile ?? ""),
        password_hash: String(row.password_hash ?? ""),
        status: String(row.status ?? "ACTIVE"),
        profile_photo: row.profile_photo ?? null,
        created_at: normalizeDateTime(row.created_at),
      })),
      students: students.map((row) => ({
        id: String(row.id),
        hostel_id: String(row.hostel_id ?? ""),
        student_id: String(row.student_id ?? ""),
        name: String(row.name ?? ""),
        room_number: String(row.room_number ?? ""),
        mobile: String(row.mobile ?? ""),
        parent_mobile: String(row.parent_mobile ?? ""),
        profile_photo: row.profile_photo ?? null,
        password_hash: String(row.password_hash ?? ""),
        status: String(row.status ?? "ACTIVE"),
        student_year: row.student_year ? String(row.student_year) : null,
        created_at: normalizeDateTime(row.created_at),
      })),
      staff: staffRows.map((row) => ({
        id: String(row.id),
        hostel_id: String(row.hostel_id ?? ""),
        role: String(row.role ?? "HOSTEL_STAFF"),
        name: String(row.name ?? ""),
        email: String(row.email ?? "").toLowerCase(),
        password_hash: String(row.password_hash ?? ""),
        profile_photo: row.profile_photo ?? null,
        created_at: normalizeDateTime(row.created_at),
      })),
      leaveRequests: leaveRequests.map((row) => ({
        id: String(row.id),
        hostel_id: String(row.hostel_id ?? ""),
        student_id: String(row.student_id ?? ""),
        reason: String(row.reason ?? ""),
        from_date: normalizeDateTime(row.from_date),
        to_date: normalizeDateTime(row.to_date),
        out_time: normalizeDateTime(row.out_time),
        return_time: normalizeDateTime(row.return_time),
        parent_status: String(row.parent_status ?? "PENDING"),
        hostel_status: String(row.hostel_status ?? "PENDING"),
        final_status: String(row.final_status ?? "PENDING"),
        request_type: String(row.request_type ?? "LEAVE"),
        note: row.note ?? null,
        parent_reject_reason: row.parent_reject_reason ? String(row.parent_reject_reason) : null,
        hostel_reject_reason: row.hostel_reject_reason ? String(row.hostel_reject_reason) : null,
        student_lat: row.student_lat != null ? Number(row.student_lat) : null,
        student_lng: row.student_lng != null ? Number(row.student_lng) : null,
        parent_lat: row.parent_lat != null ? Number(row.parent_lat) : null,
        parent_lng: row.parent_lng != null ? Number(row.parent_lng) : null,
        hostel_lat: row.hostel_lat != null ? Number(row.hostel_lat) : null,
        hostel_lng: row.hostel_lng != null ? Number(row.hostel_lng) : null,
        created_at: normalizeDateTime(row.created_at),
      })),
      gatePasses: gatePasses.map((row) => ({
        id: String(row.id),
        leave_request_id: String(row.leave_request_id ?? ""),
        qr_code: String(row.qr_code ?? ""),
        out_time_actual: row.out_time_actual ? normalizeDateTime(row.out_time_actual) : null,
        in_time_actual: row.in_time_actual ? normalizeDateTime(row.in_time_actual) : null,
        status: String(row.status ?? "APPROVED"),
        out_guard_lat: row.out_guard_lat != null ? Number(row.out_guard_lat) : null,
        out_guard_lng: row.out_guard_lng != null ? Number(row.out_guard_lng) : null,
        in_guard_lat: row.in_guard_lat != null ? Number(row.in_guard_lat) : null,
        in_guard_lng: row.in_guard_lng != null ? Number(row.in_guard_lng) : null,
        created_at: normalizeDateTime(row.created_at),
      })),
      auditLogs: auditLogs.map((row) => ({
        id: String(row.id),
        action: String(row.action ?? ""),
        entity: String(row.entity ?? ""),
        entity_id: row.entity_id ?? null,
        actor_id: row.actor_id ?? null,
        actor_role: String(row.actor_role ?? "SYSTEM"),
        hostel_id: row.hostel_id ?? null,
        meta: parseJsonMaybe(row.metadata),
        created_at: normalizeDateTime(row.created_at),
      })),
      refreshTokens: refreshTokens.map((row) => ({
        jti: String(row.id ?? ""),
        userId: String(row.user_id ?? ""),
        userRole: String(row.user_role ?? "HOSTEL_STAFF"),
        tokenHash: String(row.token_hash ?? ""),
        expiresAt: normalizeDateTime(row.expires_at),
        revokedAt: row.revoked_at ? normalizeDateTime(row.revoked_at) : null,
        createdAt: normalizeDateTime(row.created_at),
      })),
    };

    // Ensure virtual _ALL hostels exist for each parent hostel
    const parentHostels = db.hostels.filter(h => !h.parent_hostel_id && !h.id.endsWith("_ALL"));
    for (const parent of parentHostels) {
      const virtualId = `${parent.id}_ALL`;
      const exists = db.hostels.some(h => h.id === virtualId);
      if (!exists) {
        const virtualRecord = {
          id: virtualId,
          hostel_name: "All Hostels (all branches)",
          email: `all_hostels_${parent.id}@hostelhub.local`,
          password_hash: "VIRTUAL_HOSTEL_HASH",
          status: "ACTIVE",
          parent_hostel_id: parent.id,
          created_at: nowIso(),
          updated_at: nowIso(),
        };

        if (dbPool) {
          try {
            await dbPool.query(
              "INSERT INTO hostels (id, hostel_name, email, password_hash, status, parent_hostel_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                virtualRecord.id,
                virtualRecord.hostel_name,
                virtualRecord.email,
                virtualRecord.password_hash,
                virtualRecord.status,
                virtualRecord.parent_hostel_id,
                virtualRecord.created_at,
                virtualRecord.updated_at,
              ]
            );
            console.log(`[db] Created virtual hostel for parent ${parent.id}`);
          } catch (err) {
            console.error(`[db] Failed to insert virtual hostel for parent ${parent.id}:`, err.message);
          }
        }

        db.hostels.push(virtualRecord);
      }
    }

    hasHydrated = true;
    return db;
  } catch (error) {
    lastHydrateError = error.message;
    console.warn("[db] hydrate failed, using local seed:", error.message);
    db = loadData();
    return db;
  }
}

async function persist() {
  if (!dbPool) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
    } catch (error) {
      console.error("[db] failed to write db.json:", error.message);
    }
    return db;
  }

  const conn = await dbPool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("DELETE FROM refresh_tokens");
    await conn.query("DELETE FROM audit_logs");
    await conn.query("DELETE FROM gate_passes");
    await conn.query("DELETE FROM leave_requests");
    await conn.query("DELETE FROM students");
    await conn.query("DELETE FROM parents");
    await conn.query("DELETE FROM staff");
    await conn.query("DELETE FROM super_admins");
    await conn.query("DELETE FROM hostels");

    if (db.hostels.length > 0) {
      const values = db.hostels.map((h) => [
        h.id,
        h.hostel_name,
        h.email,
        h.password_hash,
        h.status ?? "ACTIVE",
        h.parent_hostel_id ?? null,
        toSqlDateTime(h.created_at),
        toSqlDateTime(h.updated_at ?? h.created_at),
      ]);
      await conn.query(
        "INSERT INTO hostels (id, hostel_name, email, password_hash, status, parent_hostel_id, created_at, updated_at) VALUES ?",
        [values]
      );
    }

    const superAdmins = db.users.filter((item) => item.role === "SUPER_ADMIN");
    if (superAdmins.length > 0) {
      const values = superAdmins.map((u) => [
        u.id,
        u.email,
        u.passwordHash,
        u.name,
        toSqlDateTime(u.created_at),
        toSqlDateTime(u.updated_at ?? u.created_at),
      ]);
      await conn.query(
        "INSERT INTO super_admins (id, email, password_hash, name, created_at, updated_at) VALUES ?",
        [values]
      );
    }

    const staffMembers = db.users.filter((item) => item.role !== "SUPER_ADMIN");
    if (staffMembers.length > 0) {
      const values = staffMembers.map((u) => [
        u.id,
        u.hostelId,
        u.role,
        u.name,
        u.email,
        u.passwordHash,
        u.status ?? "ACTIVE",
        u.profile_photo ?? null,
        toSqlDateTime(u.created_at),
        toSqlDateTime(u.updated_at ?? u.created_at),
      ]);
      await conn.query(
        "INSERT INTO staff (id, hostel_id, role, name, email, password_hash, status, profile_photo, created_at, updated_at) VALUES ?",
        [values]
      );
    }

    if (db.parents.length > 0) {
      const values = db.parents.map((p) => [
        p.id,
        p.hostel_id,
        p.mobile,
        p.password_hash,
        p.status ?? "ACTIVE",
        p.profile_photo ?? null,
        toSqlDateTime(p.created_at),
        toSqlDateTime(p.updated_at ?? p.created_at),
      ]);
      await conn.query(
        "INSERT INTO parents (id, hostel_id, mobile, password_hash, status, profile_photo, created_at, updated_at) VALUES ?",
        [values]
      );
    }

    if (db.students.length > 0) {
      const values = db.students.map((s) => [
        s.id,
        s.hostel_id,
        s.student_id,
        s.name,
        s.room_number,
        s.mobile,
        s.parent_mobile,
        s.profile_photo,
        s.password_hash,
        s.status ?? "ACTIVE",
        s.student_year ?? null,
        toSqlDateTime(s.created_at),
        toSqlDateTime(s.updated_at ?? s.created_at),
      ]);
      await conn.query(
        "INSERT INTO students (id, hostel_id, student_id, name, room_number, mobile, parent_mobile, profile_photo, password_hash, status, student_year, created_at, updated_at) VALUES ?",
        [values]
      );
    }

    if (db.leaveRequests.length > 0) {
      const values = db.leaveRequests.map((leave) => [
        leave.id,
        leave.hostel_id ?? studentById(leave.student_id)?.hostel_id ?? null,
        leave.student_id,
        leave.reason,
        toSqlDateTime(leave.from_date),
        toSqlDateTime(leave.to_date),
        toSqlDateTime(leave.out_time),
        toSqlDateTime(leave.return_time),
        leave.parent_status,
        leave.hostel_status,
        leave.final_status,
        leave.student_lat ?? null,
        leave.student_lng ?? null,
        leave.parent_lat ?? null,
        leave.parent_lng ?? null,
        leave.hostel_lat ?? null,
        leave.hostel_lng ?? null,
        leave.parent_reject_reason ?? null,
        leave.hostel_reject_reason ?? null,
        toSqlDateTime(leave.created_at),
        toSqlDateTime(leave.updated_at ?? leave.created_at),
      ]);
      await conn.query(
        "INSERT INTO leave_requests (id, hostel_id, student_id, reason, from_date, to_date, out_time, return_time, parent_status, hostel_status, final_status, student_lat, student_lng, parent_lat, parent_lng, hostel_lat, hostel_lng, parent_reject_reason, hostel_reject_reason, created_at, updated_at) VALUES ?",
        [values]
      );
    }

    if (db.gatePasses.length > 0) {
      const values = db.gatePasses.map((gp) => [
        gp.id,
        gp.leave_request_id,
        gp.qr_code,
        toSqlDateTime(gp.out_time_actual),
        toSqlDateTime(gp.in_time_actual),
        gp.status ?? "APPROVED",
        gp.out_guard_lat ?? null,
        gp.out_guard_lng ?? null,
        gp.in_guard_lat ?? null,
        gp.in_guard_lng ?? null,
        toSqlDateTime(gp.created_at),
        toSqlDateTime(gp.updated_at ?? gp.created_at),
      ]);
      await conn.query(
        "INSERT INTO gate_passes (id, leave_request_id, qr_code, out_time_actual, in_time_actual, status, out_guard_lat, out_guard_lng, in_guard_lat, in_guard_lng, created_at, updated_at) VALUES ?",
        [values]
      );
    }

    if (db.auditLogs.length > 0) {
      const values = db.auditLogs.map((log) => [
        log.id,
        log.hostel_id ?? null,
        log.actor_role,
        log.actor_id,
        log.action,
        log.entity,
        log.entity_id,
        log.meta != null ? JSON.stringify(log.meta) : null,
        toSqlDateTime(log.created_at),
      ]);
      await conn.query(
        "INSERT INTO audit_logs (id, hostel_id, actor_role, actor_id, action, entity, entity_id, metadata, created_at) VALUES ?",
        [values]
      );
    }

    if (db.refreshTokens.length > 0) {
      const values = db.refreshTokens.map((token) => [
        token.jti,
        token.userId,
        token.userRole ?? "HOSTEL_STAFF",
        token.tokenHash ?? "",
        toSqlDateTime(token.expiresAt),
        toSqlDateTime(token.revokedAt),
        toSqlDateTime(token.createdAt),
      ]);
      await conn.query(
        "INSERT INTO refresh_tokens (id, user_id, user_role, token_hash, expires_at, revoked_at, created_at) VALUES ?",
        [values]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    lastPersistError = error.message;
    console.warn("[db] persist failed, resetting hydration flag:", error.message);
    hasHydrated = false;
    throw error;
  } finally {
    conn.release();
  }
  return db;
}

function addAudit(action, entity, entityId, actor, meta = {}) {
  db.auditLogs.unshift({
    id: uuid("audit"),
    hostel_id: actor?.hostelId ?? null,
    action,
    entity,
    entity_id: entityId ?? null,
    actor_id: actor?.id ?? null,
    actor_role: actor?.role ?? "SUPER_ADMIN",
    meta,
    created_at: nowIso(),
  });
  db.auditLogs = db.auditLogs.slice(0, 500);
  // NOTE: persist() is NOT called here — callers must await persist() themselves
}

function findHostelById(hostelId) {
  return db.hostels.find((hostel) => hostel.id === hostelId) ?? null;
}

function getAccessibleHostelIds(user) {
  if (!user || !user.hostelId) return [];

  if (user.hostelId.endsWith("_ALL")) {
    const parentId = user.hostelId.replace(/_ALL$/, "");
    const ids = [parentId];
    db.hostels.forEach((h) => {
      if (h.parent_hostel_id === parentId && !h.id.endsWith("_ALL")) {
        ids.push(h.id);
      }
    });
    if (!ids.includes(user.hostelId)) {
      ids.push(user.hostelId);
    }
    return ids;
  }

  const ids = [user.hostelId];
  // Only admins can see child hostels; staff/wardens see only their own hostel
  if (user.role === "HOSTEL_ADMIN" || user.role === "SUPER_ADMIN") {
    db.hostels.forEach((h) => {
      if (h.parent_hostel_id === user.hostelId && !h.id.endsWith("_ALL")) {
        ids.push(h.id);
      }
    });
    // Add virtual ALL counterpart if user's hostelId is a parent hostel
    const targetHostel = db.hostels.find((h) => h.id === user.hostelId);
    if (targetHostel && !targetHostel.parent_hostel_id) {
      ids.push(`${user.hostelId}_ALL`);
    }
  }
  return ids;
}

function findUserByEmail(email, role) {
  const normalized = String(email ?? "").trim().toLowerCase();
  return (
    db.users.find((user) => user.email.toLowerCase() === normalized && (!role || user.role === role)) ?? null
  );
}

function findUserById(id) {
  const staffOrAdmin = db.users.find((user) => user.id === id);
  if (staffOrAdmin) return staffOrAdmin;

  const student = db.students.find((s) => s.id === id);
  if (student) {
    return {
      id: student.id,
      hostelId: student.hostel_id,
      role: "STUDENT",
      name: student.name,
      email: student.mobile,
      passwordHash: student.password_hash,
      status: student.status,
      tokenVersion: 0,
      created_at: student.created_at,
    };
  }

  const parent = db.parents.find((p) => p.id === id);
  if (parent) {
    return {
      id: parent.id,
      hostelId: parent.hostel_id,
      role: "PARENT",
      name: `Parent of ${parent.mobile}`,
      email: parent.mobile,
      passwordHash: parent.password_hash,
      status: parent.status,
      tokenVersion: 0,
      created_at: parent.created_at,
    };
  }

  return null;
}

async function getStudentByIdDb(id) {
  if (dbPool) {
    const [rows] = await dbPool.query("SELECT * FROM students WHERE id = ? LIMIT 1", [id]);
    return rows[0] ? {
      id: String(rows[0].id),
      hostel_id: String(rows[0].hostel_id),
      student_id: String(rows[0].student_id),
      name: String(rows[0].name),
      room_number: String(rows[0].room_number),
      mobile: String(rows[0].mobile),
      parent_mobile: String(rows[0].parent_mobile),
      profile_photo: rows[0].profile_photo ?? null,
      password_hash: String(rows[0].password_hash),
      status: String(rows[0].status),
      student_year: rows[0].student_year ? String(rows[0].student_year) : null,
      created_at: normalizeDateTime(rows[0].created_at),
    } : null;
  }
  return db.students.find((s) => s.id === id) ?? null;
}

async function loginStudentDb(identifier, hostelEmail) {
  const normalizedIdentifier = String(identifier ?? "").trim();
  const normalizedHostelEmail = String(hostelEmail ?? "").trim().toLowerCase();

  if (dbPool) {
    const [rows] = await dbPool.query(
      `SELECT s.* FROM students s
       JOIN hostels h ON s.hostel_id = h.id
       WHERE (s.student_id = ? OR s.mobile = ?) AND LOWER(h.email) = ? LIMIT 1`,
      [normalizedIdentifier, normalizedIdentifier, normalizedHostelEmail]
    );
    if (rows[0]) {
      return {
        id: String(rows[0].id),
        hostelId: String(rows[0].hostel_id),
        role: "STUDENT",
        name: String(rows[0].name),
        email: String(rows[0].mobile),
        passwordHash: String(rows[0].password_hash),
        status: String(rows[0].status),
        tokenVersion: 0,
        created_at: normalizeDateTime(rows[0].created_at),
      };
    }
    return null;
  }

  const hostel = db.hostels.find((h) => h.email.toLowerCase() === normalizedHostelEmail);
  if (!hostel) return null;
  const student = db.students.find(
    (s) =>
      s.hostel_id === hostel.id &&
      (s.student_id === normalizedIdentifier || s.mobile === normalizedIdentifier)
  );
  if (student) {
    return {
      id: student.id,
      hostelId: student.hostel_id,
      role: "STUDENT",
      name: student.name,
      email: student.mobile,
      passwordHash: student.password_hash,
      status: student.status,
      tokenVersion: 0,
      created_at: student.created_at,
    };
  }
  return null;
}

async function loginParentDb(identifier, hostelEmail) {
  const normalizedIdentifier = String(identifier ?? "").trim();
  const normalizedHostelEmail = String(hostelEmail ?? "").trim().toLowerCase();

  if (dbPool) {
    const [rows] = await dbPool.query(
      `SELECT p.* FROM parents p
       JOIN hostels h ON p.hostel_id = h.id
       WHERE p.mobile = ? AND LOWER(h.email) = ? LIMIT 1`,
      [normalizedIdentifier, normalizedHostelEmail]
    );
    if (rows[0]) {
      return {
        id: String(rows[0].id),
        hostelId: String(rows[0].hostel_id),
        role: "PARENT",
        name: `Parent of ${rows[0].mobile}`,
        email: String(rows[0].mobile),
        passwordHash: String(rows[0].password_hash),
        status: String(rows[0].status),
        tokenVersion: 0,
        created_at: normalizeDateTime(rows[0].created_at),
      };
    }
    return null;
  }

  const hostel = db.hostels.find((h) => h.email.toLowerCase() === normalizedHostelEmail);
  if (!hostel) return null;
  const parent = db.parents.find((p) => p.hostel_id === hostel.id && p.mobile === normalizedIdentifier);
  if (parent) {
    return {
      id: parent.id,
      hostelId: parent.hostel_id,
      role: "PARENT",
      name: `Parent of ${parent.mobile}`,
      email: parent.mobile,
      passwordHash: parent.password_hash,
      status: parent.status,
      tokenVersion: 0,
      created_at: parent.created_at,
    };
  }
  return null;
}

async function loginStaffDb(identifier, role, hostelEmail) {
  const normalizedIdentifier = String(identifier ?? "").trim().toLowerCase();
  const normalizedHostelEmail = String(hostelEmail ?? "").trim().toLowerCase();
  const normalizedRole = normalizeRole(role);

  if (dbPool) {
    const [rows] = await dbPool.query(
      `SELECT s.* FROM staff s
       JOIN hostels h ON s.hostel_id = h.id
       WHERE LOWER(s.email) = ? AND s.role = ? AND LOWER(h.email) = ? LIMIT 1`,
      [normalizedIdentifier, normalizedRole, normalizedHostelEmail]
    );
    if (rows[0]) {
      return {
        id: String(rows[0].id),
        hostelId: String(rows[0].hostel_id),
        role: String(rows[0].role),
        name: String(rows[0].name),
        email: String(rows[0].email).toLowerCase(),
        passwordHash: String(rows[0].password_hash),
        status: String(rows[0].status ?? "ACTIVE"),
        tokenVersion: 0,
        created_at: normalizeDateTime(rows[0].created_at),
      };
    }
    return null;
  }

  const hostel = db.hostels.find((h) => h.email.toLowerCase() === normalizedHostelEmail);
  if (!hostel) return null;
  const staff = db.staff.find(
    (s) =>
      s.hostel_id === hostel.id &&
      s.email.toLowerCase() === normalizedIdentifier &&
      normalizeRole(s.role) === normalizedRole
  );
  if (staff) {
    return {
      id: staff.id,
      hostelId: staff.hostel_id,
      role: staff.role,
      name: staff.name,
      email: staff.email,
      passwordHash: staff.password_hash,
      status: "ACTIVE",
      tokenVersion: 0,
      created_at: staff.created_at,
    };
  }
  return null;
}

function serializeProfile(user) {
  const hostel = user.hostelId ? findHostelById(user.hostelId) : null;
  return {
    id: user.id,
    role: user.role,
    hostelId: user.hostelId ?? null,
    email: user.email ?? null,
    name: user.name ?? null,
    hostelName: hostel ? hostel.hostel_name : null,
    profilePhoto: user.profile_photo ?? null,
  };
}

function issueSession(user) {
  const refreshJti = uuid("refresh");
  const refreshToken = signToken(
    {
      kind: "refresh",
      jti: refreshJti,
      sub: user.id,
      role: user.role,
      hostelId: user.hostelId ?? null,
      email: user.email ?? null,
      tokenVersion: user.tokenVersion ?? 0,
    },
    REFRESH_TTL_SECONDS,
  );
  db.refreshTokens.push({
    jti: refreshJti,
    userId: user.id,
    userRole: user.role,
    tokenHash: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000).toISOString(),
    revokedAt: null,
    createdAt: nowIso(),
  });

  return {
    accessToken: signToken(
      {
        kind: "access",
        sub: user.id,
        role: user.role,
        hostelId: user.hostelId ?? null,
        email: user.email ?? null,
        tokenVersion: user.tokenVersion ?? 0,
      },
      ACCESS_TTL_SECONDS,
    ),
    refreshToken,
    profile: serializeProfile(user),
  };
}

async function revokeRefreshToken(refreshTokenValue) {
  const payload = verifyToken(refreshTokenValue);
  if (!payload || payload.kind !== "refresh") return false;
  const entry = db.refreshTokens.find((token) => token.jti === payload.jti);
  if (!entry) return false;
  entry.revokedAt = nowIso();
  await persist();
  return true;
}

function currentUserFromRequest(req) {
  const header = String(req.headers.authorization ?? "");
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload || payload.kind !== "access") return null;
  const user = findUserById(payload.sub);
  if (!user || user.status !== "ACTIVE") return null;
  if ((user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) return null;
  return user;
}

function requireAuth(req, res, roles = null) {
  const user = currentUserFromRequest(req);
  if (!user) {
    sendJson(res, 401, { error: "Unauthorized" });
    return null;
  }
  if (roles && !roles.includes(user.role)) {
    sendJson(res, 403, { error: "Forbidden" });
    return null;
  }
  return user;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendPhotoResponse(res, base64String) {
  try {
    const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Content-Length": buffer.length,
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      });
      res.end(buffer);
      return;
    }
  } catch (e) {
    console.error("Error sending photo response", e);
  }
  return sendJson(res, 400, { error: "Invalid photo format" });
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType, "Cache-Control": "no-store" });
  res.end(text);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    if (Buffer.isBuffer(chunk)) chunks.push(chunk);
    else if (typeof chunk === "string") chunks.push(Buffer.from(chunk));
    else if (chunk instanceof Uint8Array) chunks.push(Buffer.from(chunk));
  }
  return chunks.length ? Buffer.concat(chunks) : Buffer.alloc(0);
}

function parseJsonBody(buffer) {
  if (!buffer || buffer.length === 0) return {};
  return JSON.parse(buffer.toString("utf8"));
}

function parseUrlEncodedBody(buffer) {
  const params = new URLSearchParams(buffer.toString("utf8"));
  return Object.fromEntries(params.entries());
}

function parseContentDisposition(value) {
  const params = {};
  for (const part of value.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rest.length) continue;
    const key = rawKey.toLowerCase();
    let raw = rest.join("=");
    if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
    params[key] = raw;
  }
  return params;
}

function parseMultipartBody(buffer, contentType) {
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!boundaryMatch) return { fields: {}, files: {} };
  const boundary = boundaryMatch[1] ?? boundaryMatch[2];
  const raw = buffer.toString("latin1");
  const delimiter = `--${boundary}`;
  const segments = raw.split(delimiter);
  const fields = {};
  const files = {};

  for (let segment of segments) {
    if (!segment || segment === "--" || segment === "--\r\n") continue;
    if (segment.startsWith("\r\n")) segment = segment.slice(2);
    if (segment.endsWith("\r\n")) segment = segment.slice(0, -2);
    if (segment === "--") continue;
    const headerEnd = segment.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;
    const headerText = segment.slice(0, headerEnd);
    let bodyText = segment.slice(headerEnd + 4);
    if (bodyText.endsWith("\r\n")) bodyText = bodyText.slice(0, -2);

    const headers = headerText.split("\r\n");
    const disposition = headers.find((line) => /^content-disposition:/i.test(line));
    if (!disposition) continue;
    const cdValue = disposition.split(":").slice(1).join(":").trim();
    const cd = parseContentDisposition(cdValue);
    const name = cd.name;
    if (!name) continue;
    const fileHeader = headers.find((line) => /^content-type:/i.test(line));
    const fileContentType = fileHeader ? fileHeader.split(":").slice(1).join(":").trim() : "application/octet-stream";
    const filename = cd.filename || null;

    if (filename) {
      files[name] = {
        filename,
        contentType: fileContentType,
        data: Buffer.from(bodyText, "latin1"),
      };
    } else {
      fields[name] = bodyText;
    }
  }

  return { fields, files };
}

async function readRequestData(req) {
  const buffer = await readBody(req);
  const contentType = String(req.headers["content-type"] ?? "").toLowerCase();
  if (contentType.includes("application/json")) {
    return { kind: "json", value: parseJsonBody(buffer) };
  }
  if (contentType.includes("multipart/form-data")) {
    return { kind: "multipart", value: parseMultipartBody(buffer, String(req.headers["content-type"] ?? "")) };
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return { kind: "form", value: parseUrlEncodedBody(buffer) };
  }
  return { kind: "raw", value: buffer };
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

function normalizeRole(role) {
  const value = String(role ?? "").trim().toUpperCase();
  if (value === "SUPER" || value === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (value === "HOSTEL_ADMIN" || value === "ADMIN") return "HOSTEL_ADMIN";
  if (value === "SECURITY_GUARD" || value === "SECURITY") return "SECURITY_GUARD";
  return value;
}

function userToStaffRecord(user) {
  return {
    id: user.id,
    hostel_id: user.hostelId ?? null,
    role: user.role,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    profile_photo: user.profile_photo ?? null,
    created_at: user.created_at,
  };
}

function slugifyHostelName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function studentById(studentId) {
  return db.students.find((student) => student.id === studentId) ?? null;
}

function gatePassByLeaveId(leaveRequestId) {
  return db.gatePasses.find((gatePass) => gatePass.leave_request_id === leaveRequestId) ?? null;
}

function leaveRequestsForHostel(hostelId) {
  const studentIds = new Set(db.students.filter((student) => student.hostel_id === hostelId).map((student) => student.id));
  return db.leaveRequests.filter((leave) => studentIds.has(leave.student_id));
}

function countByMonth(items, dateField, monthKey) {
  return items.filter((item) => monthKey(new Date(item[dateField]))).length;
}

function monthLabel(date) {
  return date.toLocaleString("en-US", { month: "short" });
}

function isoDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthWindow(count = 6) {
  const items = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    items.push({ key: monthKey(date), label: monthLabel(date) });
  }
  return items;
}

function getWeekWindow(count = 7) {
  const items = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    items.push({
      key: isoDateKey(date),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return items;
}

function issueGatePass(leaveRequest) {
  let gatePass = gatePassByLeaveId(leaveRequest.id);
  if (gatePass) return gatePass;
  gatePass = {
    id: uuid("gate"),
    leave_request_id: leaveRequest.id,
    qr_code: `GP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    out_time_actual: null,
    in_time_actual: null,
    status: "APPROVED",
    created_at: nowIso(),
  };
  db.gatePasses.push(gatePass);
  return gatePass;
}

async function createStudentRecord(hostelId, payload, actor) {
  const targetHostelId = payload.hostel_id || hostelId;
  const allowedHostelIds = getAccessibleHostelIds(actor);
  if (actor.role !== "SUPER_ADMIN" && !allowedHostelIds.includes(targetHostelId)) {
    const error = new Error("Forbidden: You do not have access to this hostel/branch");
    error.statusCode = 403;
    throw error;
  }
  const studentId = String(payload.student_id ?? "").trim();
  const name = String(payload.name ?? "").trim();
  const roomNumber = String(payload.room_number ?? "").trim();
  const mobile = String(payload.mobile ?? "").trim();
  const parentMobile = String(payload.parent_mobile ?? "").trim();
  const password = String(payload.password ?? "Student@12345");
  const parentPassword = String(payload.parent_password ?? payload.password ?? "Student@12345");
  const studentYear = payload.student_year ? String(payload.student_year).trim() : null;

  if (!studentId || !name || !roomNumber || !mobile || !parentMobile) {
    throw new Error("student_id, name, room_number, mobile and parent_mobile are required");
  }
  if (db.students.some((student) => student.hostel_id === targetHostelId && student.student_id === studentId)) {
    const error = new Error("Student ID already exists");
    error.statusCode = 409;
    throw error;
  }
  if (db.students.some((student) => student.hostel_id === targetHostelId && student.mobile === mobile)) {
    const error = new Error("Student mobile number already exists in this hostel");
    error.statusCode = 409;
    throw error;
  }

  const createdAt = nowIso();
  const student = {
    id: uuid("student"),
    hostel_id: targetHostelId,
    student_id: studentId,
    name,
    room_number: roomNumber,
    mobile,
    parent_mobile: parentMobile,
    profile_photo: null,
    password_hash: hashPassword(password),
    status: "ACTIVE",
    student_year: studentYear,
    created_at: createdAt,
  };
  db.students.push(student);

  let parent = db.parents.find((item) => item.mobile === parentMobile);
  if (!parent) {
    parent = {
      id: uuid("parent"),
      hostel_id: targetHostelId,
      mobile: parentMobile,
      password_hash: hashPassword(parentPassword),
      created_at: createdAt,
    };
    db.parents.push(parent);
  } else if (payload.parent_password) {
    parent.password_hash = hashPassword(payload.parent_password);
  }

  addAudit("CREATE", "STUDENT", student.id, actor, {
    student_id: student.student_id,
    name: student.name,
  });

  await persist();
  return student;
}

async function createStaffRecord(hostelId, payload, actor) {
  const targetHostelId = payload.hostel_id || hostelId;
  const allowedHostelIds = getAccessibleHostelIds(actor);
  if (actor.role !== "SUPER_ADMIN" && !allowedHostelIds.includes(targetHostelId)) {
    const error = new Error("Forbidden: You do not have access to this hostel/branch");
    error.statusCode = 403;
    throw error;
  }
  const role = normalizeRole(payload.role);
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const defaultPassword = role === "SECURITY_GUARD" ? "Security@12345" : "Staff@12345";
  const password = String(payload.password ?? defaultPassword);

  if (!role || !name || !email) {
    const error = new Error("role, name and email are required");
    error.statusCode = 400;
    throw error;
  }

  if (db.users.some((user) => user.email.toLowerCase() === email && (user.role === "SUPER_ADMIN" || user.hostelId === targetHostelId))) {
    const error = new Error("Email already exists in this hostel");
    error.statusCode = 409;
    throw error;
  }

  const createdAt = nowIso();
  const user = {
    id: uuid("user"),
    hostelId: targetHostelId,
    role,
    name,
    email,
    passwordHash: hashPassword(password),
    status: "ACTIVE",
    tokenVersion: 0,
    created_at: createdAt,
  };
  db.users.push(user);
  db.staff.push(userToStaffRecord(user));

  addAudit("CREATE", "STAFF", user.id, actor, {
    role,
    email,
  });

  await persist();
  return user;
}

function linkHostelAdmin(hostel, password, actor) {
  const adminEmail = String(hostel.email ?? "").trim().toLowerCase();
  const adminName = String(hostel.hostel_name ?? "Hostel Admin").trim() || "Hostel Admin";
  const adminPassword = String(password ?? "Hostel@12345");
  if (db.users.some((user) => user.email.toLowerCase() === adminEmail && (user.role === "SUPER_ADMIN" || user.hostelId === hostel.id))) {
    const error = new Error("Admin email already exists for this hostel");
    error.statusCode = 409;
    throw error;
  }

  const createdAt = nowIso();
  const user = {
    id: uuid("user"),
    hostelId: hostel.id,
    role: "HOSTEL_ADMIN",
    name: adminName,
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    status: "ACTIVE",
    tokenVersion: 0,
    created_at: createdAt,
  };
  db.users.push(user);
  db.staff.push(userToStaffRecord(user));
  return user;
}

async function createHostelRecord(payload, actor) {
  const hostelName = String(payload.hostel_name ?? "").trim();
  if (!hostelName) {
    const error = new Error("hostel_name is required");
    error.statusCode = 400;
    throw error;
  }

  let hostelEmail = String(payload.email ?? "").trim().toLowerCase();
  if (!hostelEmail) {
    const cleanName = hostelName.toLowerCase().replace(/[^a-z0-9]/g, "");
    let candidate = `${cleanName}@hostelhub.local`;
    let counter = 1;
    while (db.hostels.some((h) => h.email.toLowerCase() === candidate)) {
      candidate = `${cleanName}${counter}@hostelhub.local`;
      counter++;
    }
    hostelEmail = candidate;
  }

  if (db.hostels.some((hostel) => hostel.email.toLowerCase() === hostelEmail)) {
    const error = new Error("Hostel email already exists");
    error.statusCode = 409;
    throw error;
  }

  const createdAt = nowIso();
  const password = String(payload.password ?? payload.admin_password ?? "Hostel@12345");
  const hostel = {
    id: uuid("hostel"),
    hostel_name: hostelName,
    email: hostelEmail,
    password_hash: hashPassword(password),
    status: "ACTIVE",
    parent_hostel_id: actor.role === "HOSTEL_ADMIN" ? actor.hostelId : null,
    created_at: createdAt,
  };
  db.hostels.push(hostel);

  let admin = null;
  if (actor.role === "SUPER_ADMIN") {
    admin = linkHostelAdmin(hostel, password, actor);
  }

  addAudit("CREATE", "HOSTEL", hostel.id, actor, {
    hostel_name: hostel.hostel_name,
    email: hostel.email,
    admin_id: admin ? admin.id : null,
  });

  await persist();
  return {
    hostel,
    admin,
    credentials: {
      hostel_email: hostel.email,
      password,
    },
  };
}

async function loginHostelAdmin(identifier) {
  const normalized = String(identifier ?? "").trim().toLowerCase();

  if (dbPool) {
    // Query MySQL directly (same as loginSuperAdmin) — ensures live data
    const [rows] = await dbPool.query(
      "SELECT id, hostel_id, role, name, email, password_hash FROM staff WHERE LOWER(email) = ? AND role = 'HOSTEL_ADMIN' LIMIT 1",
      [normalized],
    );
    if (rows[0]) {
      return {
        id: String(rows[0].id),
        hostelId: String(rows[0].hostel_id ?? ""),
        role: "HOSTEL_ADMIN",
        name: String(rows[0].name ?? ""),
        email: String(rows[0].email ?? "").toLowerCase(),
        passwordHash: String(rows[0].password_hash ?? ""),
        status: "ACTIVE",
        tokenVersion: 0,
        created_at: nowIso(),
      };
    }
    return null;
  }

  // Fallback: search in-memory db.users when no DB pool
  return (
    db.users.find(
      (user) => user.role === "HOSTEL_ADMIN" && user.status === "ACTIVE" && user.email.toLowerCase() === normalized,
    ) ?? null
  );
}

function mapSuperAdminRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    hostelId: null,
    role: "SUPER_ADMIN",
    name: String(row.name ?? "Super Admin"),
    email: String(row.email ?? "").toLowerCase(),
    passwordHash: String(row.password_hash ?? ""),
    status: "ACTIVE",
    tokenVersion: 0,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
  };
}

async function loginSuperAdmin(identifier) {
  const normalized = String(identifier ?? "").trim().toLowerCase();
  if (dbPool) {
    const [rows] = await dbPool.query(
      "SELECT id, email, password_hash, name, created_at FROM super_admins WHERE LOWER(email) = ? LIMIT 1",
      [normalized],
    );
    return mapSuperAdminRow(rows[0] ?? null);
  }

  return (
    db.users.find(
      (user) => user.role === "SUPER_ADMIN" && user.status === "ACTIVE" && user.email.toLowerCase() === normalized,
    ) ?? null
  );
}

async function updateHostelStatus(hostelId, status, actor) {
  const hostel = findHostelById(hostelId);
  if (!hostel) {
    const error = new Error("Hostel not found");
    error.statusCode = 404;
    throw error;
  }
  hostel.status = status;
  db.users.forEach((user) => {
    if (user.hostelId === hostelId && user.role !== "SUPER_ADMIN") {
      user.status = status === "ACTIVE" ? "ACTIVE" : "DISABLED";
      user.tokenVersion += 1;
    }
  });
  addAudit("UPDATE", "HOSTEL_STATUS", hostel.id, actor, { status });
  await persist();
  return hostel;
}

async function setStudentPhoto(studentId, file, actor) {
  const student = studentById(studentId);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  const mimeType = String(file.contentType ?? "image/jpeg").toLowerCase();
  student.profile_photo = `data:${mimeType};base64,${file.data.toString("base64")}`;
  addAudit("UPDATE", "STUDENT_PHOTO", student.id, actor, { profile_photo: student.profile_photo });
  await persist();
  return student;
}

function parseStudentImportRows(multipart, bodyFallback) {
  if (multipart?.files?.file) {
    const filename = String(multipart.files.file.filename ?? "").toLowerCase();
    if (filename.endsWith(".csv") || filename.endsWith(".txt")) {
      return parseCsv(multipart.files.file.data.toString("utf8"));
    }
    const error = new Error("Excel files are not parsed in this build. Export as CSV from Excel and upload that file.");
    error.statusCode = 400;
    throw error;
  }
  if (multipart?.fields?.csv) {
    return parseCsv(multipart.fields.csv);
  }
  if (bodyFallback && bodyFallback.length) {
    return parseCsv(bodyFallback.toString("utf8"));
  }
  return [];
}

function computeHostelCounts(hostelId) {
  const students = db.students.filter((student) => student.hostel_id === hostelId);
  const parents = db.parents.filter((parent) => parent.hostel_id === hostelId);
  const staff = db.staff.filter((item) => item.hostel_id === hostelId);
  const leaveRequests = leaveRequestsForHostel(hostelId);
  return {
    students: students.length,
    parents: parents.length,
    staff: staff.length,
    leaveRequests: leaveRequests.length,
  };
}

function computeStudentLeaveCounts(studentIds) {
  const leaveRequests = db.leaveRequests.filter((leave) => studentIds.has(leave.student_id));
  return {
    pendingLeaves: leaveRequests.filter((leave) => leave.final_status === "PENDING").length,
    approvedLeaves: leaveRequests.filter((leave) => leave.final_status === "APPROVED").length,
  };
}

function computeSuperAnalytics() {
  const monthWindows = getMonthWindow(6);
  const weekWindows = getWeekWindow(7);
  return {
    hostels: db.hostels.length,
    students: db.students.length,
    leaveRequests: db.leaveRequests.length,
    monthlyGrowth: monthWindows.map((window) => ({
      month: window.label,
      hostels: db.hostels.filter((hostel) => monthKey(new Date(hostel.created_at)) === window.key).length,
      students: db.students.filter((student) => monthKey(new Date(student.created_at)) === window.key).length,
    })),
    weeklyLeaves: weekWindows.map((window) => ({
      day: window.label,
      requests: db.leaveRequests.filter((leave) => isoDateKey(new Date(leave.created_at)) === window.key).length,
      approved: db.leaveRequests.filter(
        (leave) => isoDateKey(new Date(leave.created_at)) === window.key && leave.final_status === "APPROVED",
      ).length,
    })),
  };
}

async function handleLogin(req, res, body) {
  const identifier = String(body.identifier ?? "").trim();
  const password = String(body.password ?? "");

  if (!identifier || !password) {
    return sendJson(res, 400, { error: "identifier and password are required" });
  }

  let user = null;

  // 1. Try Super Admin (by email)
  user = await loginSuperAdmin(identifier);
  if (user && verifyPassword(password, user.passwordHash)) {
    const session = issueSession(user);
    addAudit("LOGIN", "AUTH", user.id, user, { role: user.role });
    await persist();
    return sendJson(res, 200, session);
  }

  // 2. Try Staff (by email)
  if (dbPool) {
    const [rows] = await dbPool.query(
      "SELECT id, hostel_id, role, name, email, password_hash, status FROM staff WHERE LOWER(email) = ? LIMIT 1",
      [identifier.toLowerCase()]
    );
    if (rows[0] && verifyPassword(password, String(rows[0].password_hash))) {
      user = {
        id: String(rows[0].id),
        hostelId: String(rows[0].hostel_id),
        role: String(rows[0].role),
        name: String(rows[0].name),
        email: String(rows[0].email).toLowerCase(),
        passwordHash: String(rows[0].password_hash),
        status: String(rows[0].status ?? "ACTIVE"),
        tokenVersion: 0,
        created_at: nowIso(),
      };
    }
  } else {
    const staff = db.staff.find((s) => s.email.toLowerCase() === identifier.toLowerCase());
    if (staff && verifyPassword(password, staff.password_hash)) {
      user = {
        id: staff.id,
        hostelId: staff.hostel_id,
        role: staff.role,
        name: staff.name,
        email: staff.email,
        passwordHash: staff.password_hash,
        status: "ACTIVE",
        tokenVersion: 0,
        created_at: staff.created_at,
      };
    }
  }

  if (user) {
    const session = issueSession(user);
    addAudit("LOGIN", "AUTH", user.id, user, { role: user.role });
    await persist();
    return sendJson(res, 200, session);
  }

  // 3. Try Student (by student_id or mobile)
  if (dbPool) {
    const [rows] = await dbPool.query(
      "SELECT * FROM students WHERE student_id = ? OR mobile = ? LIMIT 1",
      [identifier, identifier]
    );
    if (rows[0] && verifyPassword(password, String(rows[0].password_hash))) {
      user = {
        id: String(rows[0].id),
        hostelId: String(rows[0].hostel_id),
        role: "STUDENT",
        name: String(rows[0].name),
        email: String(rows[0].mobile),
        passwordHash: String(rows[0].password_hash),
        status: String(rows[0].status),
        tokenVersion: 0,
        created_at: nowIso(),
      };
    }
  } else {
    const student = db.students.find((s) => s.student_id === identifier || s.mobile === identifier);
    if (student && verifyPassword(password, student.password_hash)) {
      user = {
        id: student.id,
        hostelId: student.hostel_id,
        role: "STUDENT",
        name: student.name,
        email: student.mobile,
        passwordHash: student.password_hash,
        status: student.status,
        tokenVersion: 0,
        created_at: student.created_at,
      };
    }
  }

  if (user) {
    const session = issueSession(user);
    addAudit("LOGIN", "AUTH", user.id, user, { role: user.role });
    await persist();
    return sendJson(res, 200, session);
  }

  // 4. Try Parent (by mobile)
  if (dbPool) {
    const [rows] = await dbPool.query(
      "SELECT * FROM parents WHERE mobile = ? ORDER BY created_at ASC",
      [identifier]
    );
    const parentRow = rows.find((r) => verifyPassword(password, String(r.password_hash)));
    if (parentRow) {
      user = {
        id: String(parentRow.id),
        hostelId: String(parentRow.hostel_id),
        role: "PARENT",
        name: `Parent of ${parentRow.mobile}`,
        email: String(parentRow.mobile),
        passwordHash: String(parentRow.password_hash),
        status: String(parentRow.status),
        profile_photo: parentRow.profile_photo ?? null,
        tokenVersion: 0,
        created_at: nowIso(),
      };
    }
  } else {
    const parentList = db.parents.filter((p) => p.mobile === identifier);
    const parent = parentList.find((p) => verifyPassword(password, p.password_hash));
    if (parent) {
      user = {
        id: parent.id,
        hostelId: parent.hostel_id,
        role: "PARENT",
        name: `Parent of ${parent.mobile}`,
        email: parent.mobile,
        passwordHash: parent.password_hash,
        status: parent.status,
        profile_photo: parent.profile_photo ?? null,
        tokenVersion: 0,
        created_at: parent.created_at,
      };
    }
  }

  if (user) {
    const session = issueSession(user);
    addAudit("LOGIN", "AUTH", user.id, user, { role: user.role });
    await persist();
    return sendJson(res, 200, session);
  }

  return sendJson(res, 401, { error: "Invalid credentials or password" });
}

function handleRefresh(req, res, body) {
  const token = String(body.refreshToken ?? "").trim();
  if (!token) return sendJson(res, 400, { error: "refreshToken is required" });
  const payload = verifyToken(token);
  if (!payload || payload.kind !== "refresh") return sendJson(res, 401, { error: "Invalid refresh token" });
  const stored = db.refreshTokens.find((entry) => entry.jti === payload.jti && !entry.revokedAt);
  if (!stored) return sendJson(res, 401, { error: "Refresh token revoked" });
  const user = findUserById(payload.sub);
  if (!user || user.status !== "ACTIVE") return sendJson(res, 401, { error: "Invalid credentials" });
  if ((user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) return sendJson(res, 401, { error: "Session expired" });
  return sendJson(res, 200, {
    accessToken: signToken(
      {
        kind: "access",
        sub: user.id,
        role: user.role,
        hostelId: user.hostelId ?? null,
        email: user.email ?? null,
        tokenVersion: user.tokenVersion ?? 0,
      },
      ACCESS_TTL_SECONDS,
    ),
  });
}

async function handleLogout(req, res, body) {
  const token = String(body.refreshToken ?? "").trim();
  if (token) await revokeRefreshToken(token);
  return sendJson(res, 200, { message: "Logged out" });
}

async function handleChangePassword(req, res, body) {
  const user = requireAuth(req, res);
  if (!user) return;
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  if (!currentPassword || !newPassword) return sendJson(res, 400, { error: "currentPassword and newPassword are required" });
  if (!verifyPassword(currentPassword, user.passwordHash)) return sendJson(res, 401, { error: "Current password is incorrect" });

  const hash = hashPassword(newPassword);

  const dbUser = db.users.find((u) => u.id === user.id);
  if (dbUser) {
    dbUser.passwordHash = hash;
    dbUser.tokenVersion = (dbUser.tokenVersion ?? 0) + 1;
  }
  const dbStudent = db.students.find((s) => s.id === user.id);
  if (dbStudent) {
    dbStudent.password_hash = hash;
  }
  const dbParent = db.parents.find((p) => p.id === user.id);
  if (dbParent) {
    dbParent.password_hash = hash;
  }

  // Also sync db.staff record for staff members
  const dbStaff = db.staff.find((s) => s.id === user.id);
  if (dbStaff) {
    dbStaff.password_hash = hash;
  }

  // Revoke refresh tokens
  db.refreshTokens.forEach((entry) => {
    if (entry.userId === user.id && !entry.revokedAt) entry.revokedAt = nowIso();
  });
  addAudit("UPDATE", "PASSWORD", user.id, user);
  await persist();
  return sendJson(res, 200, { message: "Password changed successfully" });
}

function handleSuperHostels(req, res) {
  const user = requireAuth(req, res, ["SUPER_ADMIN", "HOSTEL_ADMIN"]);
  if (!user) return;

  let list = db.hostels.filter(h => !h.id.endsWith("_ALL"));
  if (user.role === "HOSTEL_ADMIN") {
    const adminHostelId = user.hostelId.replace(/_ALL$/, "");
    list = db.hostels.filter(
      (h) => (h.id === adminHostelId || h.parent_hostel_id === adminHostelId) && !h.id.endsWith("_ALL")
    );
  }

  const data = list.map((hostel) => {
    const counts = computeHostelCounts(hostel.id);
    return {
      ...hostel,
      _count: counts,
    };
  });
  return sendJson(res, 200, { data });
}

async function handleCreateHostel(req, res, body) {
  const user = requireAuth(req, res, ["SUPER_ADMIN", "HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const created = await createHostelRecord(body, user);
    return sendJson(res, 200, {
      data: {
        hostel: created.hostel,
        admin: created.admin ? serializeProfile(created.admin) : null,
        credentials: created.admin ? created.credentials : null,
      },
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

async function handleDeleteHostel(req, res, hostelId) {
  const user = requireAuth(req, res, ["SUPER_ADMIN", "HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const hostel = findHostelById(hostelId);
    if (!hostel) return sendJson(res, 404, { error: "Hostel not found" });

    if (user.role === "HOSTEL_ADMIN" && hostel.parent_hostel_id !== user.hostelId) {
      return sendJson(res, 403, { error: "Forbidden: You can only delete your own branches" });
    }

    const parentId = hostel.parent_hostel_id || user.hostelId;

    db.students.forEach((student) => {
      if (student.hostel_id === hostelId) {
        student.hostel_id = parentId;
      }
    });

    db.users.forEach((u) => {
      if (u.hostelId === hostelId) {
        u.hostelId = parentId;
      }
    });
    db.staff.forEach((s) => {
      if (s.hostel_id === hostelId) {
        s.hostel_id = parentId;
      }
    });

    db.parents.forEach((p) => {
      if (p.hostel_id === hostelId) {
        p.hostel_id = parentId;
      }
    });

    db.hostels = db.hostels.filter((h) => h.id !== hostelId);

    addAudit("DELETE", "HOSTEL", hostelId, user, {
      hostel_name: hostel.hostel_name,
    });

    await persist();
    return sendJson(res, 200, { message: "Branch deleted successfully" });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

async function handleUpdateHostel(req, res, hostelId, body) {
  const user = requireAuth(req, res, ["SUPER_ADMIN", "HOSTEL_ADMIN"]);
  if (!user) return;
  const hostel = findHostelById(hostelId);
  if (!hostel) return sendJson(res, 404, { error: "Hostel not found" });
  const nextName = body.hostel_name != null ? String(body.hostel_name).trim() : hostel.hostel_name;
  const nextEmail = body.email != null ? String(body.email).trim().toLowerCase() : hostel.email;
  const nextPassword = body.password != null && String(body.password).trim() ? String(body.password).trim() : null;

  if (body.email != null && nextEmail !== hostel.email) {
    const conflict = db.hostels.some((item) => item.id !== hostel.id && item.email.toLowerCase() === nextEmail);
    if (conflict) return sendJson(res, 409, { error: "Hostel email already exists" });
  }

  hostel.hostel_name = nextName;
  hostel.email = nextEmail;
  if (nextPassword) hostel.password_hash = hashPassword(nextPassword);

  // Sync db.staff record
  const admin = db.staff.find((item) => item.hostel_id === hostel.id && item.role === "HOSTEL_ADMIN");
  if (admin) {
    admin.name = nextName;
    admin.email = nextEmail;
    if (nextPassword) admin.password_hash = hashPassword(nextPassword);
  }
  // Also sync db.users record (needed for login to work)
  const adminUser = db.users.find((u) => u.hostelId === hostel.id && u.role === "HOSTEL_ADMIN");
  if (adminUser) {
    adminUser.name = nextName;
    adminUser.email = nextEmail;
    if (nextPassword) adminUser.passwordHash = hashPassword(nextPassword);
  }
  addAudit("UPDATE", "HOSTEL", hostel.id, user, { hostel_name: hostel.hostel_name, email: hostel.email });
  await persist();
  return sendJson(res, 200, { data: hostel });
}

async function handleHostelStatus(req, res, hostelId, body) {
  const user = requireAuth(req, res, ["SUPER_ADMIN", "HOSTEL_ADMIN"]);
  if (!user) return;
  const status = String(body.status ?? "").toUpperCase();
  if (!["ACTIVE", "DISABLED"].includes(status)) return sendJson(res, 400, { error: "Invalid status" });
  try {
    const hostel = await updateHostelStatus(hostelId, status, user);
    return sendJson(res, 200, { data: hostel });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message });
  }
}

function handleSuperAnalytics(req, res) {
  const user = requireAuth(req, res, ["SUPER_ADMIN"]);
  if (!user) return;
  return sendJson(res, 200, { data: computeSuperAnalytics() });
}

function handleSuperAuditLogs(req, res) {
  const user = requireAuth(req, res, ["SUPER_ADMIN"]);
  if (!user) return;
  return sendJson(res, 200, { data: db.auditLogs.slice(0, 200) });
}

function handleHostelDashboard(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN", "HOSTEL_STAFF"]);
  if (!user) return;
  const allowedHostelIds = getAccessibleHostelIds(user);
  const allowedSet = new Set(allowedHostelIds);
  
  const students = db.students.filter((student) => allowedSet.has(student.hostel_id));
  const parents = db.parents.filter((parent) => allowedSet.has(parent.hostel_id));
  const staff = db.staff.filter((item) => allowedSet.has(item.hostel_id));
  
  const studentIds = new Set(students.map((student) => student.id));
  const leaveCounts = computeStudentLeaveCounts(studentIds);
  return sendJson(res, 200, {
    data: {
      students: students.length,
      parents: parents.length,
      staff: staff.length,
      pendingLeaves: leaveCounts.pendingLeaves,
      approvedLeaves: leaveCounts.approvedLeaves,
    },
  });
}

function handleHostelStudents(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const allowedHostelIds = getAccessibleHostelIds(user);
  const students = db.students
    .filter((student) => allowedHostelIds.includes(student.hostel_id))
    .map((student) => {
      const h = db.hostels.find((x) => x.id === student.hostel_id);
      const parent = db.parents.find((p) => p.hostel_id === student.hostel_id && p.mobile === student.parent_mobile);
      return {
        ...student,
        hostel_name: h ? h.hostel_name : "",
        parent_profile_photo: parent ? parent.profile_photo : null,
      };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sendJson(res, 200, { data: students });
}

async function handleUpdateStudent(req, res, studentId, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const student = db.students.find((item) => item.id === studentId);
    if (!student) return sendJson(res, 404, { error: "Student not found" });

    const allowedHostelIds = getAccessibleHostelIds(user);
    if (!allowedHostelIds.includes(student.hostel_id)) {
      return sendJson(res, 403, { error: "Forbidden: You do not have access to this student" });
    }
    if (body.hostel_id && !allowedHostelIds.includes(body.hostel_id)) {
      return sendJson(res, 403, { error: "Forbidden: Target hostel is not accessible" });
    }

    const oldParentMobile = student.parent_mobile;
    const oldHostelId = student.hostel_id;

    const student_id = body.student_id ? String(body.student_id).trim() : student.student_id;
    const name = body.name ? String(body.name).trim() : student.name;
    const room_number = body.room_number ? String(body.room_number).trim() : student.room_number;
    const mobile = body.mobile ? String(body.mobile).trim() : student.mobile;
    const parent_mobile = body.parent_mobile ? String(body.parent_mobile).trim() : student.parent_mobile;
    const status = body.status ? String(body.status).trim().toUpperCase() : student.status;
    const hostel_id = body.hostel_id ? String(body.hostel_id).trim() : student.hostel_id;
    const student_year = body.student_year !== undefined ? (body.student_year ? String(body.student_year).trim() : null) : student.student_year;

    if (!student_id || !name || !room_number || !mobile || !parent_mobile) {
      return sendJson(res, 400, { error: "student_id, name, room_number, mobile and parent_mobile cannot be empty" });
    }

    if (student_id !== student.student_id) {
      if (db.students.some((s) => s.hostel_id === hostel_id && s.student_id === student_id && s.id !== student.id)) {
        return sendJson(res, 409, { error: "Student ID already exists" });
      }
    }

    if (mobile !== student.mobile) {
      if (db.students.some((s) => s.hostel_id === hostel_id && s.mobile === mobile && s.id !== student.id)) {
        return sendJson(res, 409, { error: "Student mobile number already exists in this hostel" });
      }
    }

    student.student_id = student_id;
    student.name = name;
    student.room_number = room_number;
    student.mobile = mobile;
    student.parent_mobile = parent_mobile;
    student.status = status;
    student.hostel_id = hostel_id;
    student.student_year = student_year;

    if (body.password) {
      student.password_hash = hashPassword(body.password);
    }

    // Update corresponding parent mobile/hostel if needed
    let parent = db.parents.find((item) => item.mobile === parent_mobile);
    if (!parent) {
      const parentFallbackPass = body.parent_password ? body.parent_password : (body.password ? body.password : "Student@12345");
      parent = {
        id: uuid("parent"),
        hostel_id: hostel_id,
        mobile: parent_mobile,
        password_hash: hashPassword(parentFallbackPass),
        created_at: nowIso(),
      };
      db.parents.push(parent);
    } else {
      parent.hostel_id = hostel_id;
      if (body.parent_password) {
        parent.password_hash = hashPassword(body.parent_password);
      }
    }

    // Clean up old parent account if the mobile number changed and it is no longer shared by any student
    if (oldParentMobile !== parent_mobile) {
      const parentMobileShared = db.students.some((s) => s.id !== student.id && s.parent_mobile === oldParentMobile);
      if (!parentMobileShared) {
        db.parents = db.parents.filter((p) => p.mobile !== oldParentMobile);
      }
    }

    addAudit("UPDATE", "STUDENT", student.id, user, { student_id, name, room_number });
    await persist();
    return sendJson(res, 200, { data: student });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

async function handleCreateStudent(req, res, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const student = await createStudentRecord(user.hostelId, body, user);
    return sendJson(res, 200, { data: student });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

async function handleDeleteStudent(req, res, studentId) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const student = db.students.find((s) => s.id === studentId);
    if (!student) return sendJson(res, 404, { error: "Student not found" });

    const allowedHostelIds = getAccessibleHostelIds(user);
    if (!allowedHostelIds.includes(student.hostel_id)) {
      return sendJson(res, 403, { error: "Forbidden: You do not have access to this student" });
    }

    const studentLeaveRequests = db.leaveRequests.filter((leave) => leave.student_id === studentId);
    const leaveRequestIds = new Set(studentLeaveRequests.map((leave) => leave.id));

    db.gatePasses = db.gatePasses.filter((gp) => !leaveRequestIds.has(gp.leave_request_id));
    db.leaveRequests = db.leaveRequests.filter((leave) => leave.student_id !== studentId);
    db.students = db.students.filter((s) => s.id !== studentId);

    const parentMobile = student.parent_mobile;
    const parentMobileShared = db.students.some((s) => s.hostel_id === student.hostel_id && s.parent_mobile === parentMobile);
    if (!parentMobileShared) {
      db.parents = db.parents.filter((p) => !(p.hostel_id === student.hostel_id && p.mobile === parentMobile));
    }

    db.refreshTokens = db.refreshTokens.filter((token) => token.userId !== studentId);

    addAudit("DELETE", "STUDENT", studentId, user, {
      student_id: student.student_id,
      name: student.name,
    });

    await persist();
    return sendJson(res, 200, { message: "Student deleted successfully" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

async function handleDeleteStaff(req, res, staffId) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const staffRow = db.staff.find((item) => item.id === staffId);
    if (!staffRow) return sendJson(res, 404, { error: "Staff member not found" });

    const allowedHostelIds = getAccessibleHostelIds(user);
    if (!allowedHostelIds.includes(staffRow.hostel_id)) {
      return sendJson(res, 403, { error: "Forbidden: You do not have access to this staff member" });
    }

    if (staffRow.id === user.id) {
      return sendJson(res, 400, { error: "You cannot delete your own account" });
    }

    db.staff = db.staff.filter((item) => item.id !== staffId);
    db.users = db.users.filter((u) => u.id !== staffId);
    db.refreshTokens = db.refreshTokens.filter((token) => token.userId !== staffId);

    addAudit("DELETE", "STAFF", staffId, user, {
      name: staffRow.name,
      email: staffRow.email,
      role: staffRow.role,
    });

    await persist();
    return sendJson(res, 200, { message: "Staff member deleted successfully" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

async function handleImportStudents(req, res, data) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const rows = data.kind === "multipart" ? parseStudentImportRows(data.value, Buffer.alloc(0)) : [];
    let imported = 0;
    for (const row of rows) {
      let resolvedHostelId = user.hostelId;
      const hostelNameVal = String(row.hostel || row.hostel_name || row.hostel_id || "").trim();
      if (hostelNameVal) {
        const matchedHostel = db.hostels.find(h =>
          h.hostel_name.toLowerCase() === hostelNameVal.toLowerCase() ||
          h.id === hostelNameVal ||
          h.email.toLowerCase() === hostelNameVal.toLowerCase()
        );
        if (matchedHostel) {
          resolvedHostelId = matchedHostel.id;
        }
      }

      const mapped = {
        student_id: row.student_id || row.studentid || row.id || row.student || row.admission_no,
        name: row.name || row.student_name,
        room_number: row.room_number || row.roomno || row.room || "",
        mobile: row.mobile || row.student_mobile || row.phone || "",
        parent_mobile: row.parent_mobile || row.parentmobile || row.parent_phone || "",
        password: row.password || row.password_hash || "Student@12345",
        hostel_id: resolvedHostelId,
        student_year: row.student_year || row.studentyear || row.year || row.class || row.student_class || null,
      };
      if (!mapped.student_id || !mapped.name || !mapped.room_number || !mapped.mobile || !mapped.parent_mobile) {
        continue;
      }
      try {
        await createStudentRecord(resolvedHostelId, mapped, user);
        imported += 1;
      } catch {
        // Skip duplicates / bad rows.
      }
    }
    return sendJson(res, 200, { data: { imported } });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

async function handleUploadStudentPhoto(req, res, studentId, data) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const student = studentById(studentId);
  const allowedHostelIds = getAccessibleHostelIds(user);
  if (!student || !allowedHostelIds.includes(student.hostel_id)) return sendJson(res, 404, { error: "Student not found" });
  if (data.kind !== "multipart" || !data.value.files.photo) return sendJson(res, 400, { error: "photo file required" });
  try {
    const file = data.value.files.photo;
    const mimeType = String(file.contentType ?? "image/jpeg").toLowerCase();
    student.profile_photo = `data:${mimeType};base64,${file.data.toString("base64")}`;
    addAudit("UPDATE", "STUDENT_PHOTO", student.id, user, { profile_photo: student.profile_photo });
    await persist();
    return sendJson(res, 200, { data: student });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

async function handleUploadParentPhoto(req, res, studentId, data) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const student = studentById(studentId);
  const allowedHostelIds = getAccessibleHostelIds(user);
  if (!student || !allowedHostelIds.includes(student.hostel_id)) return sendJson(res, 404, { error: "Student not found" });
  if (data.kind !== "multipart" || !data.value.files.photo) return sendJson(res, 400, { error: "photo file required" });
  try {
    const file = data.value.files.photo;
    const mimeType = String(file.contentType ?? "image/jpeg").toLowerCase();
    const photoBase64 = `data:${mimeType};base64,${file.data.toString("base64")}`;
    
    let parent = db.parents.find((p) => p.hostel_id === student.hostel_id && p.mobile === student.parent_mobile);
    if (!parent) {
      parent = {
        id: uuid("parent"),
        hostel_id: student.hostel_id,
        mobile: student.parent_mobile,
        password_hash: hashPassword("Parent@12345"),
        status: "ACTIVE",
        profile_photo: null,
        created_at: nowIso(),
      };
      db.parents.push(parent);
    }
    parent.profile_photo = photoBase64;
    addAudit("UPDATE", "PARENT_PHOTO", parent.id, user, { profile_photo: photoBase64 });
    await persist();
    return sendJson(res, 200, { data: parent });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

async function handleUploadStaffPhoto(req, res, staffId, data) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const staffRow = db.staff.find((item) => item.id === staffId);
  const allowedHostelIds = getAccessibleHostelIds(user);
  if (!staffRow || !allowedHostelIds.includes(staffRow.hostel_id)) return sendJson(res, 404, { error: "Staff member not found" });
  if (data.kind !== "multipart" || !data.value.files.photo) return sendJson(res, 400, { error: "photo file required" });
  try {
    const file = data.value.files.photo;
    const mimeType = String(file.contentType ?? "image/jpeg").toLowerCase();
    const photoBase64 = `data:${mimeType};base64,${file.data.toString("base64")}`;
    staffRow.profile_photo = photoBase64;
    const userRow = db.users.find((u) => u.id === staffId);
    if (userRow) {
      userRow.profile_photo = photoBase64;
    }
    addAudit("UPDATE", "STAFF_PHOTO", staffRow.id, user, { profile_photo: photoBase64 });
    await persist();
    return sendJson(res, 200, { data: staffRow });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

function handleHostelStaff(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const allowedHostelIds = getAccessibleHostelIds(user);
  const staff = db.staff
    .filter((item) => allowedHostelIds.includes(item.hostel_id))
    .map((item) => {
      const h = db.hostels.find((x) => x.id === item.hostel_id);
      return {
        ...item,
        hostel_name: h ? h.hostel_name : "",
      };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sendJson(res, 200, { data: staff });
}

async function handleCreateStaff(req, res, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const created = await createStaffRecord(user.hostelId, body, user);
    return sendJson(res, 200, { data: created });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

async function handleUpdateStaff(req, res, staffId, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const staffRow = db.staff.find((item) => item.id === staffId);
    if (!staffRow) return sendJson(res, 404, { error: "Staff member not found" });

    const allowedHostelIds = getAccessibleHostelIds(user);
    if (!allowedHostelIds.includes(staffRow.hostel_id)) {
      return sendJson(res, 403, { error: "Forbidden: You do not have access to this staff member" });
    }
    if (body.hostel_id && !allowedHostelIds.includes(body.hostel_id)) {
      return sendJson(res, 403, { error: "Forbidden: Target hostel is not accessible" });
    }

    const role = body.role ? normalizeRole(body.role) : staffRow.role;
    const name = body.name ? String(body.name).trim() : staffRow.name;
    const email = body.email ? String(body.email).trim().toLowerCase() : staffRow.email;
    const hostel_id = body.hostel_id ? String(body.hostel_id).trim() : staffRow.hostel_id;

    if (!role || !name || !email) {
      return sendJson(res, 400, { error: "role, name and email cannot be empty" });
    }

    if (email !== staffRow.email) {
      if (db.users.some((u) => u.email.toLowerCase() === email && u.id !== staffId)) {
        return sendJson(res, 409, { error: "Email already exists" });
      }
    }

    staffRow.role = role;
    staffRow.name = name;
    staffRow.email = email;
    staffRow.hostel_id = hostel_id;
    if (body.password) {
      staffRow.password_hash = hashPassword(body.password);
    }

    const userRow = db.users.find((u) => u.id === staffId);
    if (userRow) {
      userRow.role = role;
      userRow.name = name;
      userRow.email = email;
      userRow.hostelId = hostel_id;
      if (body.password) {
        userRow.passwordHash = staffRow.password_hash;
      }
    }

    addAudit("UPDATE", "STAFF", staffRow.id, user, { role, email, hostel_id });
    await persist();
    return sendJson(res, 200, { data: staffRow });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

function handleLeaveRequests(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN", "HOSTEL_STAFF", "SECURITY_GUARD"]);
  if (!user) return;

  let baseRequests;
  if (user.role === "SUPER_ADMIN") {
    baseRequests = db.leaveRequests;
  } else {
    const allowedHostelIds = getAccessibleHostelIds(user);
    baseRequests = db.leaveRequests.filter((leave) => {
      const student = db.students.find((s) => s.id === leave.student_id);
      return student && allowedHostelIds.includes(student.hostel_id);
    });
  }

  const leaveRequests = baseRequests
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((leave) => {
      const student = db.students.find((student) => student.id === leave.student_id) ?? null;
      let studentWithHostel = null;
      if (student) {
        const hostel = findHostelById(student.hostel_id);
        studentWithHostel = {
          ...student,
          hostel_name: hostel ? hostel.hostel_name : "",
        };
      }
      return {
        ...leave,
        student: studentWithHostel,
        gatePass: gatePassByLeaveId(leave.id) ?? null,
      };
    });
  return sendJson(res, 200, { data: leaveRequests });
}

async function handleReviewLeaveRequest(req, res, leaveRequestId, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN", "HOSTEL_STAFF"]);
  if (!user) return;
  const leave = db.leaveRequests.find((item) => item.id === leaveRequestId);
  if (!leave) return sendJson(res, 404, { error: "Leave request not found" });
  const student = studentById(leave.student_id);
  const allowedHostelIds = getAccessibleHostelIds(user);
  if (!student || !allowedHostelIds.includes(student.hostel_id)) return sendJson(res, 403, { error: "Forbidden" });

  const status = String(body.status ?? "").toUpperCase();
  if (!["APPROVED", "REJECTED"].includes(status)) return sendJson(res, 400, { error: "Invalid status" });

  const hostel_lat = body.hostel_lat != null ? Number(body.hostel_lat) : (body.staff_lat != null ? Number(body.staff_lat) : (body.lat != null ? Number(body.lat) : null));
  const hostel_lng = body.hostel_lng != null ? Number(body.hostel_lng) : (body.staff_lng != null ? Number(body.staff_lng) : (body.lng != null ? Number(body.lng) : null));

  if (hostel_lat === null || hostel_lng === null || Number.isNaN(hostel_lat) || Number.isNaN(hostel_lng)) {
    return sendJson(res, 400, { error: "Location permission is compulsory for staff to approve or reject permission requests. Please enable location services on your device." });
  }

  if (status === "APPROVED" && leave.parent_status !== "APPROVED") {
    return sendJson(res, 400, { error: "Cannot approve request. Waiting for parent approval." });
  }

  leave.hostel_status = status;
  leave.hostel_lat = hostel_lat;
  leave.hostel_lng = hostel_lng;
  if (status === "REJECTED") {
    leave.hostel_reject_reason = body.hostel_reject_reason ? String(body.hostel_reject_reason).trim() : null;
    leave.final_status = "REJECTED";
    const gatePass = gatePassByLeaveId(leave.id);
    if (gatePass) {
      db.gatePasses = db.gatePasses.filter((item) => item.id !== gatePass.id);
    }
  } else {
    leave.hostel_reject_reason = null;
    if (leave.parent_status === "APPROVED") {
      leave.final_status = "APPROVED";
      issueGatePass(leave);
    } else if (leave.parent_status === "REJECTED") {
      leave.final_status = "REJECTED";
    } else {
      leave.final_status = "PENDING";
    }
  }

  addAudit("UPDATE", "LEAVE_REQUEST", leave.id, user, {
    hostel_status: leave.hostel_status,
    final_status: leave.final_status,
  });
  await persist();
  return sendJson(res, 200, { data: leave });
}

async function handleBulkReviewLeaveRequests(req, res, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN", "HOSTEL_STAFF"]);
  if (!user) return;
  const ids = body.ids;
  const status = String(body.status ?? "").toUpperCase();
  if (!Array.isArray(ids)) {
    return sendJson(res, 400, { error: "ids must be an array of strings" });
  }
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return sendJson(res, 400, { error: "Invalid status" });
  }

  const allowedHostelIds = getAccessibleHostelIds(user);
  let updatedCount = 0;
  const hostel_lat = body.hostel_lat != null ? Number(body.hostel_lat) : (body.staff_lat != null ? Number(body.staff_lat) : (body.lat != null ? Number(body.lat) : null));
  const hostel_lng = body.hostel_lng != null ? Number(body.hostel_lng) : (body.staff_lng != null ? Number(body.staff_lng) : (body.lng != null ? Number(body.lng) : null));

  if (hostel_lat === null || hostel_lng === null || Number.isNaN(hostel_lat) || Number.isNaN(hostel_lng)) {
    return sendJson(res, 400, { error: "Location permission is compulsory for staff to approve or reject permission requests. Please enable location services on your device." });
  }
  for (const leaveId of ids) {
    const leave = db.leaveRequests.find((item) => item.id === leaveId);
    if (!leave) continue;

    const student = studentById(leave.student_id);
    if (!student) continue;
    if (!allowedHostelIds.includes(student.hostel_id)) {
      continue;
    }

    if (status === "APPROVED" && leave.parent_status !== "APPROVED") {
      continue;
    }

    leave.hostel_status = status;
    if (status === "REJECTED") {
      leave.hostel_reject_reason = body.hostel_reject_reason ? String(body.hostel_reject_reason).trim() : null;
      leave.final_status = "REJECTED";
      const gatePass = gatePassByLeaveId(leave.id);
      if (gatePass) {
        db.gatePasses = db.gatePasses.filter((item) => item.id !== gatePass.id);
      }
    } else {
      leave.hostel_reject_reason = null;
      if (leave.parent_status === "APPROVED") {
        leave.final_status = "APPROVED";
        issueGatePass(leave);
      } else if (leave.parent_status === "REJECTED") {
        leave.final_status = "REJECTED";
      } else {
        leave.final_status = "PENDING";
      }
    }

    addAudit("UPDATE", "LEAVE_REQUEST", leave.id, user, {
      hostel_status: leave.hostel_status,
      final_status: leave.final_status,
    });
    updatedCount++;
  }

  await persist();
  return sendJson(res, 200, { message: `Successfully updated ${updatedCount} request(s)` });
}

function handleReports(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const allowedHostelIds = getAccessibleHostelIds(user);
  const allowedSet = new Set(allowedHostelIds);
  const studentIds = new Set(db.students.filter((student) => allowedSet.has(student.hostel_id)).map((student) => student.id));
  const leaveRequests = db.leaveRequests.filter((leave) => studentIds.has(leave.student_id));
  const gatePasses = db.gatePasses.filter((gatePass) => {
    const leave = db.leaveRequests.find((item) => item.id === gatePass.leave_request_id);
    return leave ? studentIds.has(leave.student_id) : false;
  });
  return sendJson(res, 200, {
    data: {
      totalRequests: leaveRequests.length,
      approved: leaveRequests.filter((leave) => leave.final_status === "APPROVED").length,
      rejected: leaveRequests.filter((leave) => leave.final_status === "REJECTED").length,
      returned: gatePasses.filter((gatePass) => gatePass.status === "RETURNED").length,
      pending: leaveRequests.filter((leave) => leave.final_status === "PENDING").length,
      gatePasses: gatePasses.length,
    },
  });
}

async function handleStudentUploadSelfPhoto(req, res, data) {
  return sendJson(res, 403, { error: "Forbidden: Students are not allowed to update their own photo. Please contact the hostel admin." });
}

async function handleCreateLeaveRequest(req, res, body) {
  const user = requireAuth(req, res, ["STUDENT"]);
  if (!user) return;

  const reason = String(body.reason ?? "").trim();
  const from_date = String(body.from_date ?? "").trim();
  const to_date = String(body.to_date ?? "").trim();
  const out_time = String(body.out_time ?? "").trim();
  const return_time = String(body.return_time ?? "").trim();
  const student_lat = body.student_lat != null ? Number(body.student_lat) : (body.lat != null ? Number(body.lat) : null);
  const student_lng = body.student_lng != null ? Number(body.student_lng) : (body.lng != null ? Number(body.lng) : null);
  const request_type = String(body.request_type ?? "LEAVE").trim().toUpperCase();

  if (student_lat === null || student_lng === null || Number.isNaN(student_lat) || Number.isNaN(student_lng)) {
    return sendJson(res, 400, { error: "Location permission is compulsory to submit permission requests. Please enable location services on your device." });
  }

  if (!reason || !from_date || !to_date || !out_time || !return_time) {
    return sendJson(res, 400, { error: "reason, from_date, to_date, out_time, and return_time are required" });
  }

  if (request_type === "PERMISSION") {
    const start = getCombinedDateTime(from_date, out_time);
    const end = getCombinedDateTime(to_date, return_time);
    const now = new Date();

    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return sendJson(res, 400, { error: "Invalid date or time formats provided for Permission" });
    }

    const durationMs = end.getTime() - start.getTime();
    if (durationMs <= 0) {
      return sendJson(res, 400, { error: "Permission return time must be after exit time" });
    }
    if (durationMs > 24 * 60 * 60 * 1000) {
      return sendJson(res, 400, { error: "Permission request duration cannot exceed 24 hours" });
    }

    const timeToStartMs = start.getTime() - now.getTime();
    // Allow up to 10 minutes grace period for drift
    if (timeToStartMs < -10 * 60 * 1000) {
      return sendJson(res, 400, { error: "Permission exit time cannot be in the past" });
    }
    if (timeToStartMs > 24 * 60 * 60 * 1000) {
      return sendJson(res, 400, { error: "Permission exit time must start within the next 24 hours" });
    }
  }

  const student = db.students.find((s) => s.id === user.id);
  if (!student) return sendJson(res, 404, { error: "Student not found" });

  const newLeave = {
    id: uuid("leave"),
    hostel_id: student.hostel_id,
    student_id: student.id,
    reason,
    from_date: normalizeDateTime(from_date),
    to_date: normalizeDateTime(to_date),
    out_time: normalizeDateTime(out_time),
    return_time: normalizeDateTime(return_time),
    request_type,
    parent_status: "PENDING",
    hostel_status: "PENDING",
    final_status: "PENDING",
    student_lat,
    student_lng,
    created_at: nowIso(),
  };

  db.leaveRequests.push(newLeave);
  addAudit("CREATE", "LEAVE_REQUEST", newLeave.id, user, { reason, student_lat, student_lng });
  await persist();

  return sendJson(res, 200, {
    data: {
      ...newLeave,
      student,
      gatePass: null,
    }
  });
}

function handleGetStudentLeaveRequests(req, res) {
  const user = requireAuth(req, res, ["STUDENT"]);
  if (!user) return;

  const student = db.students.find((s) => s.id === user.id);
  if (!student) return sendJson(res, 404, { error: "Student not found" });

  const leaves = db.leaveRequests
    .filter((leave) => leave.student_id === student.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((leave) => {
      const hostel = findHostelById(student.hostel_id);
      return {
        ...leave,
        student: {
          ...student,
          hostel_name: hostel ? hostel.hostel_name : "",
        },
        gatePass: gatePassByLeaveId(leave.id) ?? null,
      };
    });

  return sendJson(res, 200, { data: leaves });
}

async function handleGetParentRequests(req, res) {
  const user = requireAuth(req, res, ["PARENT"]);
  if (!user) return;

  const parentMobile = String(user.email ?? "").trim();

  if (dbPool) {
    try {
      const [rows] = await dbPool.query(
        `SELECT lr.*, s.name as student_name, s.room_number, s.student_id as student_code, s.mobile as student_mobile, s.parent_mobile, s.hostel_id, h.hostel_name
         FROM leave_requests lr
         JOIN students s ON lr.student_id = s.id
         LEFT JOIN hostels h ON s.hostel_id = h.id
         WHERE s.parent_mobile = ?
         ORDER BY lr.created_at DESC`,
        [parentMobile]
      );
      const leaves = rows.map((row) => ({
        id: String(row.id),
        hostel_id: String(row.hostel_id ?? ""),
        student_id: String(row.student_id ?? ""),
        reason: String(row.reason ?? ""),
        from_date: normalizeDateTime(row.from_date),
        to_date: normalizeDateTime(row.to_date),
        out_time: normalizeDateTime(row.out_time),
        return_time: normalizeDateTime(row.return_time),
        parent_status: String(row.parent_status ?? "PENDING"),
        hostel_status: String(row.hostel_status ?? "PENDING"),
        final_status: String(row.final_status ?? "PENDING"),
        parent_reject_reason: row.parent_reject_reason ? String(row.parent_reject_reason) : null,
        hostel_reject_reason: row.hostel_reject_reason ? String(row.hostel_reject_reason) : null,
        created_at: normalizeDateTime(row.created_at),
        student: {
          id: String(row.student_id),
          name: String(row.student_name),
          room_number: String(row.room_number),
          student_id: String(row.student_code),
          mobile: String(row.student_mobile),
          parent_mobile: String(row.parent_mobile),
          hostel_name: String(row.hostel_name ?? ""),
        },
        gatePass: gatePassByLeaveId(String(row.id)) ?? null,
      }));
      return sendJson(res, 200, { data: leaves });
    } catch (err) {
      console.error("Error fetching parent requests from dbPool:", err.message);
    }
  }

  const studentIds = new Set(
    db.students
      .filter((s) => s.parent_mobile.trim() === parentMobile)
      .map((s) => s.id)
  );

  const leaves = db.leaveRequests
    .filter((leave) => studentIds.has(leave.student_id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((leave) => {
      const student = db.students.find((s) => s.id === leave.student_id);
      let studentWithHostel = null;
      if (student) {
        const hostel = findHostelById(student.hostel_id);
        studentWithHostel = {
          ...student,
          hostel_name: hostel ? hostel.hostel_name : "",
        };
      }
      return {
        ...leave,
        student: studentWithHostel,
        gatePass: gatePassByLeaveId(leave.id) ?? null,
      };
    });

  return sendJson(res, 200, { data: leaves });
}

async function handleReviewParentRequest(req, res, leaveRequestId, body) {
  const user = requireAuth(req, res, ["PARENT"]);
  if (!user) return;

  const leave = db.leaveRequests.find((item) => item.id === leaveRequestId);
  if (!leave) return sendJson(res, 404, { error: "Leave request not found" });

  const student = db.students.find((s) => s.id === leave.student_id);
  if (!student || student.parent_mobile !== user.email) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  const status = String(body.status ?? "").toUpperCase();
  if (!["APPROVED", "REJECTED"].includes(status)) return sendJson(res, 400, { error: "Invalid status" });

  const parent_lat = body.parent_lat != null ? Number(body.parent_lat) : (body.lat != null ? Number(body.lat) : null);
  const parent_lng = body.parent_lng != null ? Number(body.parent_lng) : (body.lng != null ? Number(body.lng) : null);

  if (parent_lat === null || parent_lng === null || Number.isNaN(parent_lat) || Number.isNaN(parent_lng)) {
    return sendJson(res, 400, { error: "Location permission is compulsory for parents to accept or reject permission requests. Please enable location services on your device." });
  }

  leave.parent_status = status;
  leave.parent_lat = parent_lat;
  leave.parent_lng = parent_lng;
  if (body.note) {
    leave.note = String(body.note).trim();
  }

  if (status === "REJECTED") {
    leave.parent_reject_reason = body.parent_reject_reason ? String(body.parent_reject_reason).trim() : null;
    leave.final_status = "REJECTED";
    const gatePass = gatePassByLeaveId(leave.id);
    if (gatePass) {
      db.gatePasses = db.gatePasses.filter((item) => item.id !== gatePass.id);
    }
  } else {
    leave.parent_reject_reason = null;
    if (leave.hostel_status === "APPROVED") {
      leave.final_status = "APPROVED";
      issueGatePass(leave);
    } else if (leave.hostel_status === "REJECTED") {
      leave.final_status = "REJECTED";
    } else {
      leave.final_status = "PENDING";
    }
  }

  addAudit("UPDATE", "LEAVE_REQUEST", leave.id, user, {
    parent_status: leave.parent_status,
    final_status: leave.final_status,
  });
  await persist();

  return sendJson(res, 200, {
    data: {
      ...leave,
      student,
      gatePass: gatePassByLeaveId(leave.id) ?? null,
    }
  });
}

function handleGuardToday(req, res) {
  const user = requireAuth(req, res, ["SECURITY_GUARD"]);
  if (!user) return;

  const allowedHostelIds = getAccessibleHostelIds(user);
  const studentIds = new Set(
    db.students
      .filter((student) => allowedHostelIds.includes(student.hostel_id))
      .map((student) => student.id)
  );

  const todayPart = nowIso().split("T")[0];

  const leaves = db.leaveRequests
    .filter((leave) => studentIds.has(leave.student_id))
    .map((leave) => {
      const student = db.students.find((s) => s.id === leave.student_id);
      return {
        ...leave,
        student: student ? { ...student, hostel_name: (db.hostels.find((h) => h.id === student.hostel_id)?.hostel_name ?? '') } : null, // include photo for guard scan screen
        gatePass: gatePassByLeaveId(leave.id) ?? null,
      };
    })
    .filter((leave) => {
      if (leave.gatePass === null) return false;

      const fromPart = String(leave.from_date).split("T")[0].split(" ")[0];
      const toPart = String(leave.to_date).split("T")[0].split(" ")[0];

      // Filter: only show if today is within the leave request's scheduled date range
      return todayPart >= fromPart && todayPart <= toPart;
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return sendJson(res, 200, { data: leaves });
}

function getCombinedDateTime(dateVal, timeVal) {
  try {
    const dStr = String(dateVal).split('T')[0];
    let tStr = '00:00:00.000';
    if (String(timeVal).includes('T')) {
      tStr = String(timeVal).split('T')[1];
    } else if (String(timeVal).includes(' ')) {
      tStr = String(timeVal).split(' ')[1];
    } else {
      tStr = String(timeVal);
    }
    // Clean any Z or offset suffix and treat the time as local IST (+05:30)
    tStr = tStr.replace(/[Zz]/g, '').split('+')[0].split('-')[0];
    const combinedStr = `${dStr}T${tStr.slice(0, 8)}+05:30`;
    const parsed = new Date(combinedStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (_) {}
  return null;
}

async function handleGuardScan(req, res, body) {
  const user = requireAuth(req, res, ["SECURITY_GUARD"]);
  if (!user) return;

  const qrCode = String(body.qr_code ?? "").trim();
  const guard_lat = body.guard_lat != null ? Number(body.guard_lat) : (body.out_guard_lat != null ? Number(body.out_guard_lat) : (body.in_guard_lat != null ? Number(body.in_guard_lat) : (body.lat != null ? Number(body.lat) : null)));
  const guard_lng = body.guard_lng != null ? Number(body.guard_lng) : (body.out_guard_lng != null ? Number(body.out_guard_lng) : (body.in_guard_lng != null ? Number(body.in_guard_lng) : (body.lng != null ? Number(body.lng) : null)));

  if (guard_lat === null || guard_lng === null || Number.isNaN(guard_lat) || Number.isNaN(guard_lng)) {
    return sendJson(res, 400, { error: "Location permission is compulsory for security guards to scan gate passes. Please enable location services on your device." });
  }

  if (!qrCode) return sendJson(res, 400, { error: "qr_code is required" });

  const gatePass = db.gatePasses.find((gp) => gp.qr_code === qrCode);
  if (!gatePass) return sendJson(res, 404, { error: "Gate pass not found" });

  const leave = db.leaveRequests.find((l) => l.id === gatePass.leave_request_id);
  if (!leave) return sendJson(res, 404, { error: "Associated leave request not found" });

  const student = db.students.find((s) => s.id === leave.student_id);
  if (!student) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  // Cross-branch detection: warn if guard's assigned hostel differs from student's hostel
  // A guard assigned to the parent hostel (getAccessibleHostelIds returns all branches) → no warning
  const guardAllowedHostelIds = getAccessibleHostelIds(user);
  const studentHostel = db.hostels.find((h) => h.id === student.hostel_id);
  const isFromDifferentBranch = !guardAllowedHostelIds.includes(student.hostel_id);
  // If guard doesn't even have access via allowed IDs, still allow scan but warn
  const branchWarning = isFromDifferentBranch
    ? { hostel_name: studentHostel?.hostel_name ?? "Unknown Branch" }
    : null;

  if (gatePass.status === "APPROVED") {
    const start = getCombinedDateTime(leave.from_date, leave.out_time);
    const end = getCombinedDateTime(leave.to_date, leave.return_time);
    const now = new Date();

    if (start && now < start) {
      return sendJson(res, 400, { error: "Exit permitted only during leave window. Code activates at " + start.toISOString() });
    }
    if (end && now > end) {
      return sendJson(res, 400, { error: "Exit denied. The leave request permission window has expired." });
    }

    gatePass.status = "OUT";
    gatePass.out_time_actual = nowIso();
    gatePass.out_guard_lat = guard_lat;
    gatePass.out_guard_lng = guard_lng;
    // Invalidate the old exit QR by generating a new entry QR
    const newQr = `GP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    gatePass.qr_code = newQr;
    addAudit("SCAN_OUT", "GATE_PASS", gatePass.id, user, { qr_code: qrCode, guard_lat, guard_lng });
  } else if (gatePass.status === "OUT") {
    // 1-Minute Scan Cooldown check
    if (gatePass.out_time_actual) {
      const outTime = new Date(gatePass.out_time_actual);
      const now = new Date();
      const diffMs = now.getTime() - outTime.getTime();
      if (diffMs < 60000) {
        return sendJson(res, 400, { error: "Please wait at least 1 minute after exit before checking back in." });
      }
    }
    gatePass.status = "RETURNED";
    gatePass.in_time_actual = nowIso();
    gatePass.in_guard_lat = guard_lat;
    gatePass.in_guard_lng = guard_lng;
    leave.final_status = "RETURNED";
    addAudit("SCAN_IN", "GATE_PASS", gatePass.id, user, { qr_code: qrCode, guard_lat, guard_lng });
  } else if (gatePass.status === "RETURNED") {
    return sendJson(res, 400, { error: "Gate pass already scanned and returned" });
  }

  await persist();

  // Broadcast status update over Server-Sent Events (SSE)
  const sseData = {
    ...leave,
    student: {
      ...student,
      profile_photo: null,
    },
    gatePass: gatePass,
  };
  for (const client of sseClients) {
    if (client.studentId === student.id) {
      try {
        client.res.write(`data: ${JSON.stringify(sseData)}\n\n`);
      } catch (_) {}
    }
  }

  return sendJson(res, 200, { data: gatePass, branch_warning: branchWarning });
}

function serveStaticFile(res, filePath) {
  const stream = fs.createReadStream(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".js"
      ? "application/javascript; charset=utf-8"
      : ext === ".css"
        ? "text/css; charset=utf-8"
        : ext === ".html"
          ? "text/html; charset=utf-8"
          : ext === ".json"
            ? "application/json; charset=utf-8"
            : ext === ".svg"
              ? "image/svg+xml"
              : ext === ".png"
                ? "image/png"
                : ext === ".jpg" || ext === ".jpeg"
                  ? "image/jpeg"
                  : ext === ".webp"
                    ? "image/webp"
                    : ext === ".ico"
                      ? "image/x-icon"
                      : "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": filePath.includes(`${path.sep}assets${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });

  stream.on("error", (error) => {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Internal Server Error");
  });

  stream.pipe(res);
}

function serveAppShell(res) {
  const indexPath = path.join(CLIENT_DIR, "index.html");
  if (fs.existsSync(indexPath)) {
    serveStaticFile(res, indexPath);
    return;
  }
  sendText(res, 500, "Build output not found. Run `npm run build` before deploying to Plesk.");
}

async function delegateToSsr(req, res) {
  try {
    const handler = await getSsrServer();
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value == null) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item != null) headers.append(key, String(item));
        }
      } else {
        headers.set(key, String(value));
      }
    }

    const method = String(req.method ?? "GET").toUpperCase();
    const init = {
      method,
      headers,
    };

    if (method !== "GET" && method !== "HEAD") {
      const body = await readBody(req);
      init.body = body.length ? body : undefined;
    }

    const request = new Request(`http://localhost${req.url ?? "/"}`, init);
    const response = await handler.fetch(request, {}, {});
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    res.writeHead(response.status, responseHeaders);
    if (method === "HEAD") {
      res.end();
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    console.error("[ssr error]", error);
    if (!res.headersSent) {
      sendText(res, 500, "Internal Server Error");
      return;
    }
    res.end();
  }
}

async function handleApi(req, res, pathname) {
  await hydrateDataFromDatabase();
  try {
    if (pathname === "/api/leave-requests/events" && req.method === "GET") {
      const url = new URL(req.url ?? "/", "http://localhost");
      const studentId = url.searchParams.get("studentId");
      
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      });
      
      const client = { res, studentId };
      sseClients.add(client);
      
      res.write("data: connected\n\n");
      
      req.on("close", () => {
        sseClients.delete(client);
      });
      return;
    }

    if (pathname.startsWith("/api/profile-photo/") && req.method === "GET") {
      const match = pathname.match(/^\/api\/profile-photo\/([^/]+)$/);
      if (match) {
        const userId = decodeURIComponent(match[1]);
        const student = db.students.find((s) => s.id === userId);
        if (student && student.profile_photo) {
          return sendPhotoResponse(res, student.profile_photo);
        }
        const staffMember = db.staff.find((s) => s.id === userId);
        if (staffMember && staffMember.profile_photo) {
          return sendPhotoResponse(res, staffMember.profile_photo);
        }
        const user = db.users.find((u) => u.id === userId);
        if (user && user.profile_photo) {
          return sendPhotoResponse(res, user.profile_photo);
        }
        const parent = db.parents.find((p) => p.id === userId);
        if (parent && parent.profile_photo) {
          return sendPhotoResponse(res, parent.profile_photo);
        }
        return sendJson(res, 404, { error: "Photo not found" });
      }
    }

    if (pathname === "/api/health" && req.method === "GET") {
      const dbState = await pingDatabase();
      return sendJson(res, 200, {
        ok: true,
        dbConfigured: dbState.configured,
        dbHealthy: dbState.healthy,
        dbError: dbState.error,
        lastHydrateError,
        lastPersistError,
      });
    }

    if (pathname === "/api/debug-env" && req.method === "GET") {
      return sendJson(res, 200, { ok: true, data: getEnvDebugSnapshot() });
    }

    if (pathname === "/api/debug-db-describe" && req.method === "GET") {
      if (!dbPool) {
        return sendJson(res, 200, { error: "dbPool is null" });
      }
      const results = {};
      for (const table of ["hostels", "students", "parents", "staff", "super_admins"]) {
        try {
          const [schema] = await dbPool.query(`DESCRIBE ${table}`);
          const [rows] = await dbPool.query(`SELECT * FROM ${table}`);
          results[table] = { ok: true, schema, rowsCount: rows.length, rows };
        } catch (err) {
          results[table] = { ok: false, error: err.message, stack: err.stack };
        }
      }
      return sendJson(res, 200, results);
    }

    if (pathname === "/api/auth/login" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleLogin(req, res, data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/auth/refresh" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleRefresh(req, res, data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/auth/logout" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleLogout(req, res, data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/auth/change-password" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleChangePassword(req, res, data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/super-admin/hostels" && req.method === "GET") {
      return handleSuperHostels(req, res);
    }

    if (pathname === "/api/super-admin/hostels" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleCreateHostel(req, res, data.kind === "json" ? data.value : {});
    }

    let match = pathname.match(/^\/api\/super-admin\/hostels\/([^/]+)$/);
    if (match && req.method === "PATCH") {
      const data = await readRequestData(req);
      return handleUpdateHostel(req, res, decodeURIComponent(match[1]), data.kind === "json" ? data.value : {});
    }

    if (match && req.method === "DELETE") {
      return handleDeleteHostel(req, res, decodeURIComponent(match[1]));
    }

    match = pathname.match(/^\/api\/super-admin\/hostels\/([^/]+)\/status$/);
    if (match && req.method === "PATCH") {
      const data = await readRequestData(req);
      return handleHostelStatus(req, res, decodeURIComponent(match[1]), data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/super-admin/analytics" && req.method === "GET") {
      return handleSuperAnalytics(req, res);
    }

    if (pathname === "/api/super-admin/audit-logs" && req.method === "GET") {
      return handleSuperAuditLogs(req, res);
    }

    if (pathname === "/api/hostel-admin/dashboard" && req.method === "GET") {
      return handleHostelDashboard(req, res);
    }

    if (pathname === "/api/hostel-admin/students" && req.method === "GET") {
      return handleHostelStudents(req, res);
    }

    if (pathname === "/api/hostel-admin/students" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleCreateStudent(req, res, data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/hostel-admin/students/import" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleImportStudents(req, res, data);
    }

    match = pathname.match(/^\/api\/hostel-admin\/students\/([^/]+)\/photo$/);
    if (match && req.method === "POST") {
      const data = await readRequestData(req);
      return handleUploadStudentPhoto(req, res, decodeURIComponent(match[1]), data);
    }

    match = pathname.match(/^\/api\/hostel-admin\/students\/([^/]+)\/parent-photo$/);
    if (match && req.method === "POST") {
      const data = await readRequestData(req);
      return handleUploadParentPhoto(req, res, decodeURIComponent(match[1]), data);
    }

    match = pathname.match(/^\/api\/hostel-admin\/students\/([^/]+)$/);
    if (match && req.method === "PATCH") {
      const data = await readRequestData(req);
      return handleUpdateStudent(req, res, decodeURIComponent(match[1]), data.kind === "json" ? data.value : {});
    }

    if (match && req.method === "DELETE") {
      return handleDeleteStudent(req, res, decodeURIComponent(match[1]));
    }

    if (pathname === "/api/hostel-admin/staff" && req.method === "GET") {
      return handleHostelStaff(req, res);
    }

    if (pathname === "/api/hostel-admin/staff" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleCreateStaff(req, res, data.kind === "json" ? data.value : {});
    }

    match = pathname.match(/^\/api\/hostel-admin\/staff\/([^/]+)$/);
    if (match && req.method === "PATCH") {
      const data = await readRequestData(req);
      return handleUpdateStaff(req, res, decodeURIComponent(match[1]), data.kind === "json" ? data.value : {});
    }

    if (match && req.method === "DELETE") {
      return handleDeleteStaff(req, res, decodeURIComponent(match[1]));
    }

    match = pathname.match(/^\/api\/hostel-admin\/staff\/([^/]+)\/photo$/);
    if (match && req.method === "POST") {
      const data = await readRequestData(req);
      return handleUploadStaffPhoto(req, res, decodeURIComponent(match[1]), data);
    }

    if (pathname === "/api/hostel-admin/leave-requests" && req.method === "GET") {
      return handleLeaveRequests(req, res);
    }

    match = pathname.match(/^\/api\/hostel-admin\/leave-requests\/([^/]+)\/review$/);
    if (match && req.method === "PATCH") {
      const data = await readRequestData(req);
      return handleReviewLeaveRequest(req, res, decodeURIComponent(match[1]), data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/hostel-admin/reports" && req.method === "GET") {
      return handleReports(req, res);
    }

    if (pathname === "/api/hostels" && req.method === "GET") {
      const user = requireAuth(req, res, ["SUPER_ADMIN", "HOSTEL_ADMIN", "HOSTEL_STAFF", "SECURITY_GUARD"]);
      if (!user) return;
      let list = db.hostels.filter(h => h.status === "ACTIVE" && !h.id.endsWith("_ALL"));
      if (user.role !== "SUPER_ADMIN") {
        const allowedHostelIds = getAccessibleHostelIds(user);
        list = list.filter(h => allowedHostelIds.includes(h.id));
      }
      const data = list.map(h => ({ id: h.id, hostel_name: h.hostel_name }));
      return sendJson(res, 200, { data });
    }

    if (pathname === "/api/hostel-admin/leave-requests/bulk-review" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleBulkReviewLeaveRequests(req, res, data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/students/me" && req.method === "GET") {
      const user = requireAuth(req, res, ["STUDENT", "PARENT"]);
      if (!user) return;
      let student = null;
      if (user.role === "STUDENT") {
        student = await getStudentByIdDb(user.id);
      } else if (user.role === "PARENT") {
        if (dbPool) {
          const [rows] = await dbPool.query(
            "SELECT * FROM students WHERE parent_mobile = ? LIMIT 1",
            [user.email]
          );
          if (rows[0]) {
            student = {
              id: String(rows[0].id),
              hostel_id: String(rows[0].hostel_id),
              student_id: String(rows[0].student_id),
              name: String(rows[0].name),
              room_number: String(rows[0].room_number),
              mobile: String(rows[0].mobile),
              parent_mobile: String(rows[0].parent_mobile),
              profile_photo: rows[0].profile_photo ?? null,
              password_hash: String(rows[0].password_hash),
              status: String(rows[0].status),
              created_at: normalizeDateTime(rows[0].created_at),
            };
          }
        } else {
          student = db.students.find((s) => s.parent_mobile === user.email);
        }
      }
      if (!student) return sendJson(res, 404, { error: "Student not found" });
      return sendJson(res, 200, { data: student });
    }

    if (pathname === "/api/students/me/photo" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleStudentUploadSelfPhoto(req, res, data);
    }

    if (pathname === "/api/students/leave-requests" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleCreateLeaveRequest(req, res, data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/students/leave-requests" && req.method === "GET") {
      return handleGetStudentLeaveRequests(req, res);
    }

    if (pathname === "/api/parents/requests" && req.method === "GET") {
      return handleGetParentRequests(req, res);
    }

    match = pathname.match(/^\/api\/parents\/requests\/([^/]+)\/review$/);
    if (match && req.method === "PATCH") {
      const data = await readRequestData(req);
      return handleReviewParentRequest(req, res, decodeURIComponent(match[1]), data.kind === "json" ? data.value : {});
    }

    if (pathname === "/api/guards/today" && req.method === "GET") {
      return handleGuardToday(req, res);
    }

    if (pathname === "/api/guards/scan" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleGuardScan(req, res, data.kind === "json" ? data.value : {});
    }

    return sendJson(res, 404, { error: "Not Found" });
  } catch (error) {
    console.error("[api error]", error);
    return sendJson(res, error.statusCode || 500, { error: error.message || "Internal Server Error" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith("/api/")) {
      await handleApi(req, res, pathname);
      return;
    }

    if (pathname.startsWith("/assets/")) {
      const relative = pathname.replace(/^\/assets\//, "");
      const filePath = path.resolve(CLIENT_ASSETS_DIR, relative);
      if (filePath.startsWith(CLIENT_ASSETS_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        serveStaticFile(res, filePath);
        return;
      }
    }

    if (fs.existsSync(path.join(ROOT, "dist", "server", "server.mjs"))) {
      await delegateToSsr(req, res);
      return;
    }

    if (fs.existsSync(path.join(CLIENT_DIR, "index.html"))) {
      serveAppShell(res);
      return;
    }

    sendText(res, 500, "Build output not found. Run `npm run build` before deploying to Plesk.");
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      sendText(res, 500, "Internal Server Error");
    }
  }
});

async function bootstrap() {
  await hydrateDataFromDatabase();

  if (typeof LISTEN_TARGET === "number") {
    server.listen(LISTEN_TARGET, HOST);
  } else {
    server.listen(LISTEN_TARGET);
  }
}

bootstrap().catch((error) => {
  console.error("[startup] failed to initialize app:", error);
  process.exitCode = 1;
});
