const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { pathToFileURL } = require("node:url");

process.noDeprecation = true;

const ROOT = __dirname;
const CLIENT_DIR = path.join(ROOT, "dist", "client");
const CLIENT_ASSETS_DIR = path.join(CLIENT_DIR, "assets");

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
const DB_HOST = process.env.DB_HOST ?? "";
const DB_PORT = parsePort(process.env.DB_PORT) ?? 3306;
const DB_USER = process.env.DB_USER ?? "";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME ?? "";
const ACCESS_TTL_SECONDS = 60 * 60 * 24 * 7;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;

let mysqlPoolFactory = null;
try {
  ({ createPool: mysqlPoolFactory } = require("mysql2/promise"));
} catch {
  mysqlPoolFactory = null;
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
      })
    : null;

function getEnvDebugSnapshot() {
  return {
    cwd: process.cwd(),
    root: ROOT,
    hasDotEnv: fs.existsSync(path.join(ROOT, ".env")),
    hasDotEnvLocal: fs.existsSync(path.join(ROOT, ".env.local")),
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
    return { configured: false, healthy: false };
  }

  try {
    await dbPool.query("SELECT 1 AS ok");
    return { configured: true, healthy: true };
  } catch (error) {
    console.warn("[health] database check failed:", error.message);
    return { configured: true, healthy: false };
  }
}

function safeWriteJson(filePath, value) {
  void filePath;
  void value;
}

function defaultData() {
  const superAdminPassword = hashPassword("Admin@12345");
  const hostelAdminPassword = hashPassword("Hostel@12345");
  const securityPassword = hashPassword("Security@12345");
  const studentPassword = hashPassword("Student@12345");

  const hostelId = uuid("hostel");
  const superAdminId = uuid("user");
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
        email: "admin@hostelhub.local",
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
        student_id: student1Id,
        reason: "Family function",
        from_date: new Date().toISOString().slice(0, 10),
        to_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        out_time: "09:00",
        return_time: "18:00",
        parent_status: "APPROVED",
        hostel_status: "APPROVED",
        final_status: "APPROVED",
        created_at: nowIso(),
        note: "Seeded approved leave",
      },
      {
        id: leave2Id,
        student_id: student2Id,
        reason: "Medical appointment",
        from_date: new Date().toISOString().slice(0, 10),
        to_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        out_time: "10:00",
        return_time: "17:00",
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
        status: "ISSUED",
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
        actor_role: "SYSTEM",
        meta: { message: "Initial seed data created" },
        created_at: nowIso(),
      },
    ],
    refreshTokens: [],
  };
}

function loadData() {
  return defaultData();
}

let db = loadData();

function persist() {
  return db;
}

function addAudit(action, entity, entityId, actor, meta = {}) {
  db.auditLogs.unshift({
    id: uuid("audit"),
    action,
    entity,
    entity_id: entityId ?? null,
    actor_id: actor?.id ?? null,
    actor_role: actor?.role ?? "SYSTEM",
    meta,
    created_at: nowIso(),
  });
  db.auditLogs = db.auditLogs.slice(0, 500);
  persist();
}

function findHostelById(hostelId) {
  return db.hostels.find((hostel) => hostel.id === hostelId) ?? null;
}

function findUserByEmail(email, role) {
  const normalized = String(email ?? "").trim().toLowerCase();
  return (
    db.users.find((user) => user.email.toLowerCase() === normalized && (!role || user.role === role)) ?? null
  );
}

function findUserById(id) {
  return db.users.find((user) => user.id === id) ?? null;
}

function serializeProfile(user) {
  return {
    id: user.id,
    role: user.role,
    hostelId: user.hostelId ?? null,
    email: user.email ?? null,
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
    expiresAt: Date.now() + REFRESH_TTL_SECONDS * 1000,
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

function revokeRefreshToken(refreshTokenValue) {
  const payload = verifyToken(refreshTokenValue);
  if (!payload || payload.kind !== "refresh") return false;
  const entry = db.refreshTokens.find((token) => token.jti === payload.jti);
  if (!entry) return false;
  entry.revokedAt = nowIso();
  persist();
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
    created_at: user.created_at,
  };
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
    status: "ISSUED",
    created_at: nowIso(),
  };
  db.gatePasses.push(gatePass);
  return gatePass;
}

function createStudentRecord(hostelId, payload, actor) {
  const studentId = String(payload.student_id ?? "").trim();
  const name = String(payload.name ?? "").trim();
  const roomNumber = String(payload.room_number ?? "").trim();
  const mobile = String(payload.mobile ?? "").trim();
  const parentMobile = String(payload.parent_mobile ?? "").trim();
  const password = String(payload.password ?? "Student@12345");

  if (!studentId || !name || !roomNumber || !mobile || !parentMobile) {
    throw new Error("student_id, name, room_number, mobile and parent_mobile are required");
  }
  if (db.students.some((student) => student.hostel_id === hostelId && student.student_id === studentId)) {
    const error = new Error("Student ID already exists");
    error.statusCode = 409;
    throw error;
  }

  const createdAt = nowIso();
  const student = {
    id: uuid("student"),
    hostel_id: hostelId,
    student_id: studentId,
    name,
    room_number: roomNumber,
    mobile,
    parent_mobile: parentMobile,
    profile_photo: null,
    password_hash: hashPassword(password),
    status: "ACTIVE",
    created_at: createdAt,
  };
  db.students.push(student);

  let parent = db.parents.find((item) => item.hostel_id === hostelId && item.mobile === parentMobile);
  if (!parent) {
    parent = {
      id: uuid("parent"),
      hostel_id: hostelId,
      mobile: parentMobile,
      password_hash: hashPassword(password),
      created_at: createdAt,
    };
    db.parents.push(parent);
  }

  addAudit("CREATE", "STUDENT", student.id, actor, {
    student_id: student.student_id,
    name: student.name,
  });

  persist();
  return student;
}

function createStaffRecord(hostelId, payload, actor) {
  const role = normalizeRole(payload.role);
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "Staff@12345");

  if (!role || !name || !email) {
    const error = new Error("role, name and email are required");
    error.statusCode = 400;
    throw error;
  }

  if (db.users.some((user) => user.email.toLowerCase() === email)) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const createdAt = nowIso();
  const user = {
    id: uuid("user"),
    hostelId,
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

  persist();
  return user;
}

function linkHostelAdmin(hostel, payload, actor) {
  const adminName = String(payload.admin_name ?? "Hostel Admin").trim();
  const adminEmail = String(payload.admin_email ?? hostel.email).trim().toLowerCase();
  const adminPassword = String(payload.admin_password ?? payload.password ?? "Admin@12345");
  if (!adminName || !adminEmail) {
    const error = new Error("admin_name and admin_email are required");
    error.statusCode = 400;
    throw error;
  }
  if (db.users.some((user) => user.email.toLowerCase() === adminEmail)) {
    const error = new Error("Admin email already exists");
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

function createHostelRecord(payload, actor) {
  const hostelName = String(payload.hostel_name ?? "").trim();
  const hostelEmail = String(payload.email ?? "").trim().toLowerCase();
  if (!hostelName || !hostelEmail) {
    const error = new Error("hostel_name and email are required");
    error.statusCode = 400;
    throw error;
  }

  if (db.hostels.some((hostel) => hostel.email.toLowerCase() === hostelEmail)) {
    const error = new Error("Hostel email already exists");
    error.statusCode = 409;
    throw error;
  }

  const createdAt = nowIso();
  const hostel = {
    id: uuid("hostel"),
    hostel_name: hostelName,
    email: hostelEmail,
    password_hash: hashPassword(String(payload.password ?? payload.admin_password ?? "Hostel@12345")),
    status: "ACTIVE",
    created_at: createdAt,
  };
  db.hostels.push(hostel);
  const admin = linkHostelAdmin(hostel, payload, actor);

  addAudit("CREATE", "HOSTEL", hostel.id, actor, {
    hostel_name: hostel.hostel_name,
    email: hostel.email,
    admin_id: admin.id,
  });

  persist();
  return { hostel, admin };
}

function loginHostelAdmin(identifier, payload) {
  const hostelEmail = String(payload.hostelEmail ?? "").trim().toLowerCase();
  const hostelId = String(payload.hostelId ?? "").trim();
  const normalized = String(identifier ?? "").trim().toLowerCase();

  const candidates = db.users.filter((user) => user.role === "HOSTEL_ADMIN" && user.status === "ACTIVE");
  const matched = candidates.find((user) => {
    const hostel = user.hostelId ? findHostelById(user.hostelId) : null;
    const byIdentifier =
      user.email.toLowerCase() === normalized ||
      user.name.toLowerCase() === normalized ||
      (hostel && hostel.email.toLowerCase() === normalized) ||
      (hostel && hostel.hostel_name.toLowerCase() === normalized);
    const byHostelEmail = !hostelEmail || (hostel && hostel.email.toLowerCase() === hostelEmail);
    const byHostelId = !hostelId || user.hostelId === hostelId;
    return byIdentifier && byHostelEmail && byHostelId;
  });
  return matched ?? null;
}

function loginSuperAdmin(identifier) {
  const normalized = String(identifier ?? "").trim().toLowerCase();
  return db.users.find(
    (user) => user.role === "SUPER_ADMIN" && user.status === "ACTIVE" && user.email.toLowerCase() === normalized,
  ) ?? null;
}

function updateHostelStatus(hostelId, status, actor) {
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
  persist();
  return hostel;
}

function setStudentPhoto(studentId, file, actor) {
  const student = studentById(studentId);
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  const mimeType = String(file.contentType ?? "image/jpeg").toLowerCase();
  student.profile_photo = `data:${mimeType};base64,${file.data.toString("base64")}`;
  addAudit("UPDATE", "STUDENT_PHOTO", student.id, actor, { profile_photo: student.profile_photo });
  persist();
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

function handleLogin(req, res, body) {
  const type = normalizeRole(body.type);
  const identifier = String(body.identifier ?? "").trim();
  const password = String(body.password ?? "");

  if (!type || !identifier || !password) {
    return sendJson(res, 400, { error: "type, identifier and password are required" });
  }

  let user = null;
  if (type === "SUPER_ADMIN") {
    user = loginSuperAdmin(identifier);
  } else if (type === "HOSTEL_ADMIN") {
    user = loginHostelAdmin(identifier, body);
  } else {
    return sendJson(res, 400, { error: "Unsupported login type" });
  }

  if (!user) {
    return sendJson(res, 401, { error: "Invalid credentials" });
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return sendJson(res, 401, { error: "Invalid credentials" });
  }

  const session = issueSession(user);
  addAudit("LOGIN", "AUTH", user.id, user, { role: user.role });
  persist();
  return sendJson(res, 200, session);
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

function handleLogout(req, res, body) {
  const token = String(body.refreshToken ?? "").trim();
  if (token) revokeRefreshToken(token);
  return sendJson(res, 200, { message: "Logged out" });
}

function handleChangePassword(req, res, body) {
  const user = requireAuth(req, res);
  if (!user) return;
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  if (!currentPassword || !newPassword) return sendJson(res, 400, { error: "currentPassword and newPassword are required" });
  if (!verifyPassword(currentPassword, user.passwordHash)) return sendJson(res, 401, { error: "Current password is incorrect" });
  user.passwordHash = hashPassword(newPassword);
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  db.refreshTokens.forEach((entry) => {
    if (entry.userId === user.id && !entry.revokedAt) entry.revokedAt = nowIso();
  });
  addAudit("UPDATE", "PASSWORD", user.id, user);
  persist();
  return sendJson(res, 200, { message: "Password changed successfully" });
}

function handleSuperHostels(req, res) {
  const user = requireAuth(req, res, ["SUPER_ADMIN"]);
  if (!user) return;
  const data = db.hostels.map((hostel) => {
    const counts = computeHostelCounts(hostel.id);
    return {
      ...hostel,
      _count: counts,
    };
  });
  return sendJson(res, 200, { data });
}

function handleCreateHostel(req, res, body) {
  const user = requireAuth(req, res, ["SUPER_ADMIN"]);
  if (!user) return;
  try {
    const created = createHostelRecord(body, user);
    return sendJson(res, 200, {
      data: {
        hostel: created.hostel,
        admin: serializeProfile(created.admin),
      },
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

function handleUpdateHostel(req, res, hostelId, body) {
  const user = requireAuth(req, res, ["SUPER_ADMIN"]);
  if (!user) return;
  const hostel = findHostelById(hostelId);
  if (!hostel) return sendJson(res, 404, { error: "Hostel not found" });
  if (body.hostel_name != null) hostel.hostel_name = String(body.hostel_name).trim();
  if (body.email != null) hostel.email = String(body.email).trim().toLowerCase();
  if (body.password != null && String(body.password).trim()) hostel.password_hash = hashPassword(String(body.password));
  addAudit("UPDATE", "HOSTEL", hostel.id, user, { hostel_name: hostel.hostel_name, email: hostel.email });
  persist();
  return sendJson(res, 200, { data: hostel });
}

function handleHostelStatus(req, res, hostelId, body) {
  const user = requireAuth(req, res, ["SUPER_ADMIN"]);
  if (!user) return;
  const status = String(body.status ?? "").toUpperCase();
  if (!["ACTIVE", "DISABLED"].includes(status)) return sendJson(res, 400, { error: "Invalid status" });
  try {
    const hostel = updateHostelStatus(hostelId, status, user);
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
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const counts = computeHostelCounts(user.hostelId);
  const studentIds = new Set(db.students.filter((student) => student.hostel_id === user.hostelId).map((student) => student.id));
  const leaveCounts = computeStudentLeaveCounts(studentIds);
  return sendJson(res, 200, {
    data: {
      students: counts.students,
      parents: counts.parents,
      staff: counts.staff,
      pendingLeaves: leaveCounts.pendingLeaves,
      approvedLeaves: leaveCounts.approvedLeaves,
    },
  });
}

function handleHostelStudents(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const students = db.students
    .filter((student) => student.hostel_id === user.hostelId)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sendJson(res, 200, { data: students });
}

function handleCreateStudent(req, res, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const student = createStudentRecord(user.hostelId, body, user);
    return sendJson(res, 200, { data: student });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

function handleImportStudents(req, res, data) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const rows = data.kind === "multipart" ? parseStudentImportRows(data.value, Buffer.alloc(0)) : [];
    let imported = 0;
    for (const row of rows) {
      const mapped = {
        student_id: row.student_id || row.studentid || row.id || row.student || row.admission_no,
        name: row.name || row.student_name,
        room_number: row.room_number || row.roomno || row.room || "",
        mobile: row.mobile || row.student_mobile || row.phone || "",
        parent_mobile: row.parent_mobile || row.parentmobile || row.parent_phone || "",
        password: row.password || row.password_hash || "Student@12345",
      };
      if (!mapped.student_id || !mapped.name || !mapped.room_number || !mapped.mobile || !mapped.parent_mobile) {
        continue;
      }
      try {
        createStudentRecord(user.hostelId, mapped, user);
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

function handleUploadStudentPhoto(req, res, studentId, data) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const student = studentById(studentId);
  if (!student || student.hostel_id !== user.hostelId) return sendJson(res, 404, { error: "Student not found" });
  if (data.kind !== "multipart" || !data.value.files.photo) return sendJson(res, 400, { error: "photo file required" });
  try {
    const file = data.value.files.photo;
    const mimeType = String(file.contentType ?? "image/jpeg").toLowerCase();
    student.profile_photo = `data:${mimeType};base64,${file.data.toString("base64")}`;
    addAudit("UPDATE", "STUDENT_PHOTO", student.id, user, { profile_photo: student.profile_photo });
    persist();
    return sendJson(res, 200, { data: student });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

function handleHostelStaff(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const staff = db.staff
    .filter((item) => item.hostel_id === user.hostelId)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sendJson(res, 200, { data: staff });
}

function handleCreateStaff(req, res, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  try {
    const created = createStaffRecord(user.hostelId, body, user);
    return sendJson(res, 200, { data: created });
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message });
  }
}

function handleLeaveRequests(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const leaveRequests = leaveRequestsForHostel(user.hostelId)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((leave) => ({
      ...leave,
      student:
        db.students.find((student) => student.id === leave.student_id) ?? null,
      gatePass: gatePassByLeaveId(leave.id) ?? null,
    }));
  return sendJson(res, 200, { data: leaveRequests });
}

function handleReviewLeaveRequest(req, res, leaveRequestId, body) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const leave = db.leaveRequests.find((item) => item.id === leaveRequestId);
  if (!leave) return sendJson(res, 404, { error: "Leave request not found" });
  const student = studentById(leave.student_id);
  if (!student || student.hostel_id !== user.hostelId) return sendJson(res, 403, { error: "Forbidden" });

  const status = String(body.status ?? "").toUpperCase();
  if (!["APPROVED", "REJECTED"].includes(status)) return sendJson(res, 400, { error: "Invalid status" });

  leave.hostel_status = status;
  if (status === "REJECTED") {
    leave.final_status = "REJECTED";
    const gatePass = gatePassByLeaveId(leave.id);
    if (gatePass) gatePass.status = "CANCELLED";
  } else {
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
  persist();
  return sendJson(res, 200, { data: leave });
}

function handleReports(req, res) {
  const user = requireAuth(req, res, ["HOSTEL_ADMIN"]);
  if (!user) return;
  const leaveRequests = leaveRequestsForHostel(user.hostelId);
  const studentIds = new Set(db.students.filter((student) => student.hostel_id === user.hostelId).map((student) => student.id));
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
  try {
    if (pathname === "/api/health" && req.method === "GET") {
      const dbState = await pingDatabase();
      return sendJson(res, 200, { ok: true, dbConfigured: dbState.configured, dbHealthy: dbState.healthy });
    }

    if (pathname === "/api/debug-env" && req.method === "GET") {
      return sendJson(res, 200, { ok: true, data: getEnvDebugSnapshot() });
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

    if (pathname === "/api/hostel-admin/staff" && req.method === "GET") {
      return handleHostelStaff(req, res);
    }

    if (pathname === "/api/hostel-admin/staff" && req.method === "POST") {
      const data = await readRequestData(req);
      return handleCreateStaff(req, res, data.kind === "json" ? data.value : {});
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

if (typeof LISTEN_TARGET === "number") {
  server.listen(LISTEN_TARGET, HOST);
} else {
  server.listen(LISTEN_TARGET);
}
