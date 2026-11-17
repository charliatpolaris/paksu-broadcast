-- Database Schema for PAKSU Christmas WA Broadcast Monitoring

CREATE TABLE IF NOT EXISTS committee_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    group_name VARCHAR(100) DEFAULT 'Panitia',
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS broadcast_waves (
    id SERIAL PRIMARY KEY,
    wave_number INT NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    scheduled_date VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    default_message_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipients (
    id SERIAL PRIMARY KEY,
    no_urut VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    phone_raw VARCHAR(100),
    phone_clean VARCHAR(50),
    assigned_committee_id INT REFERENCES committee_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recipients_committee ON recipients(assigned_committee_id);
CREATE INDEX IF NOT EXISTS idx_recipients_name ON recipients(name);

CREATE TABLE IF NOT EXISTS broadcast_logs (
    id SERIAL PRIMARY KEY,
    recipient_id INT NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    wave_id INT NOT NULL REFERENCES broadcast_waves(id) ON DELETE CASCADE,
    committee_id INT REFERENCES committee_members(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Belum Terkirim',
    notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_recipient_wave UNIQUE (recipient_id, wave_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_logs_status ON broadcast_logs(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_logs_wave ON broadcast_logs(wave_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_logs_recipient ON broadcast_logs(recipient_id);

CREATE TABLE IF NOT EXISTS event_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
