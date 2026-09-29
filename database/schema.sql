-- ============================================================
-- JAN SETU - PostgreSQL Schema (reference DDL)
-- This mirrors backend/app/models/*.py. In practice, SQLAlchemy
-- (Base.metadata.create_all) or Alembic migrations create these
-- tables automatically on backend startup - this file exists for
-- documentation, manual DB provisioning, and ER-diagram generation.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'citizen',
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    high_contrast_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    last_login_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(20),
    state VARCHAR(60),
    district VARCHAR(60),
    occupation VARCHAR(80),
    annual_income_encrypted VARCHAR(500),
    aadhaar_number_encrypted VARCHAR(500),
    category VARCHAR(20),
    education_level VARCHAR(60),
    disability_status BOOLEAN DEFAULT FALSE,
    disability_type VARCHAR(80),
    is_complete BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    department VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    short_description VARCHAR(300) NOT NULL,
    full_description TEXT NOT NULL,
    benefits TEXT NOT NULL,
    official_link VARCHAR(300),
    icon VARCHAR(50) DEFAULT 'FaLandmark',
    eligibility_rules JSONB NOT NULL DEFAULT '{}',
    required_documents JSONB NOT NULL DEFAULT '[]',
    application_deadline VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES schemes(id),
    status VARCHAR(20) DEFAULT 'draft',
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 4,
    draft_data JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(128) NOT NULL,
    expiry_date TIMESTAMP,
    verification_status VARCHAR(20) DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(60) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(300),
    metadata_json VARCHAR(1000),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    otp_hash VARCHAR(64) NOT NULL,
    purpose VARCHAR(20) DEFAULT 'signup',
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone_number);
