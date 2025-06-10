-- database/schema.sql

CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    contact_number VARCHAR(20),
    head_user_id INTEGER REFERENCES users(user_id),
    logo BYTEA,
    logo_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'gso_staff', 'department_rep')),
    department_id INTEGER REFERENCES departments(department_id),
    profile_picture BYTEA,
    profile_picture_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_permissions (
    permission_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    module VARCHAR(100) NOT NULL,
    is_granted BOOLEAN DEFAULT FALSE,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_at TIMESTAMP,
    granted_by INTEGER REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(20),
    condition VARCHAR(50) DEFAULT 'new',
    status VARCHAR(50) DEFAULT 'available',
    expiration_date DATE,
    department_id INTEGER REFERENCES departments(department_id),
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS procurement_requests (
    request_id SERIAL PRIMARY KEY,
    requested_by INTEGER REFERENCES users(user_id),
    department_id INTEGER REFERENCES departments(department_id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    justification TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    required_by_date DATE,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id),
    reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_items (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES procurement_requests(request_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES inventory_items(item_id),
    quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS incident_reports (
    report_id SERIAL PRIMARY KEY,
    reported_by INTEGER REFERENCES users(user_id),
    item_id INTEGER REFERENCES inventory_items(item_id),
    custom_item VARCHAR(100),
    type VARCHAR(50) NOT NULL CHECK (type IN ('damage', 'loss', 'maintenance')),
    description TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_by INTEGER REFERENCES users(user_id),
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'action')),
    category VARCHAR(50) DEFAULT 'system',
    action_url TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    target_table VARCHAR(100),
    target_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    notification_settings JSONB DEFAULT '{"email": true, "push": true}',
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    ip_address VARCHAR(45),
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    location_region VARCHAR(100),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL CHECK (expires_at > CURRENT_TIMESTAMP),
    CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically clean up expired sessions
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_sessions()
RETURNS trigger AS $$
BEGIN
    PERFORM cleanup_expired_sessions();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_sessions_trigger
    AFTER INSERT ON user_sessions
    EXECUTE FUNCTION trigger_cleanup_expired_sessions();
