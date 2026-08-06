-- Hostel Leave Management System live schema
-- Matches the current phpMyAdmin database structure.

CREATE DATABASE IF NOT EXISTS mayur_hostelhub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mayur_hostelhub;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS gate_passes;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS hostels;
DROP TABLE IF EXISTS super_admins;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE super_admins (
  id VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_super_admins_email (email)
) ENGINE=InnoDB;

CREATE TABLE hostels (
  id VARCHAR(64) NOT NULL,
  hostel_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hostels_email (email)
) ENGINE=InnoDB;

CREATE TABLE students (
  id VARCHAR(64) NOT NULL,
  hostel_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  room_number VARCHAR(100) NOT NULL,
  mobile VARCHAR(30) NOT NULL,
  parent_mobile VARCHAR(30) NOT NULL,
  profile_photo LONGTEXT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_hostel_student_id (hostel_id, student_id),
  KEY idx_students_hostel_mobile (hostel_id, mobile),
  CONSTRAINT fk_students_hostel
    FOREIGN KEY (hostel_id) REFERENCES hostels(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE parents (
  id VARCHAR(64) NOT NULL,
  hostel_id VARCHAR(64) NOT NULL,
  mobile VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  profile_photo LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_parents_hostel_mobile (hostel_id, mobile),
  CONSTRAINT fk_parents_hostel
    FOREIGN KEY (hostel_id) REFERENCES hostels(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE staff (
  id VARCHAR(64) NOT NULL,
  hostel_id VARCHAR(64) NOT NULL,
  role ENUM('HOSTEL_ADMIN','SECURITY_GUARD','HOSTEL_STAFF') NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  profile_photo LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_staff_hostel_email (hostel_id, email),
  KEY idx_staff_hostel_role (hostel_id, role),
  CONSTRAINT fk_staff_hostel
    FOREIGN KEY (hostel_id) REFERENCES hostels(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE leave_requests (
  id VARCHAR(64) NOT NULL,
  hostel_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  from_date DATETIME NOT NULL,
  to_date DATETIME NOT NULL,
  out_time DATETIME NOT NULL,
  return_time DATETIME NOT NULL,
  parent_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  hostel_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  final_status ENUM('PENDING','APPROVED','REJECTED','RETURNED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  parent_reject_reason TEXT NULL,
  hostel_reject_reason TEXT NULL,
  student_lat DOUBLE NULL,
  student_lng DOUBLE NULL,
  parent_lat DOUBLE NULL,
  parent_lng DOUBLE NULL,
  hostel_lat DOUBLE NULL,
  hostel_lng DOUBLE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_leave_requests_hostel_final (hostel_id, final_status),
  KEY idx_leave_requests_student_created (student_id, created_at),
  CONSTRAINT fk_leave_requests_hostel
    FOREIGN KEY (hostel_id) REFERENCES hostels(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_leave_requests_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE gate_passes (
  id VARCHAR(64) NOT NULL,
  leave_request_id VARCHAR(64) NOT NULL,
  qr_code VARCHAR(255) NOT NULL,
  out_time_actual DATETIME NULL,
  in_time_actual DATETIME NULL,
  status ENUM('APPROVED','OUT','RETURNED') NOT NULL DEFAULT 'APPROVED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_gate_passes_leave_request_id (leave_request_id),
  UNIQUE KEY uq_gate_passes_qr_code (qr_code),
  CONSTRAINT fk_gate_passes_leave_request
    FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id VARCHAR(64) NOT NULL,
  hostel_id VARCHAR(64) NULL,
  actor_role ENUM('SUPER_ADMIN','HOSTEL_ADMIN','STUDENT','PARENT','SECURITY_GUARD','HOSTEL_STAFF','SYSTEM') NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  channel ENUM('PUSH','EMAIL','SMS') NOT NULL DEFAULT 'PUSH',
  recipient VARCHAR(255) NOT NULL,
  meta_json JSON NULL,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_hostel_actor (hostel_id, actor_role)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id VARCHAR(64) NOT NULL,
  hostel_id VARCHAR(64) NULL,
  actor_role ENUM('SUPER_ADMIN','HOSTEL_ADMIN','STUDENT','PARENT','SECURITY_GUARD','HOSTEL_STAFF','SYSTEM') NOT NULL,
  actor_id VARCHAR(64) NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(64) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_hostel_created (hostel_id, created_at),
  CONSTRAINT fk_audit_logs_hostel
    FOREIGN KEY (hostel_id) REFERENCES hostels(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_role ENUM('SUPER_ADMIN','HOSTEL_ADMIN','STUDENT','PARENT','SECURITY_GUARD','HOSTEL_STAFF','SYSTEM') NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_refresh_tokens_user (user_id),
  KEY idx_refresh_tokens_expires (expires_at)
) ENGINE=InnoDB;
