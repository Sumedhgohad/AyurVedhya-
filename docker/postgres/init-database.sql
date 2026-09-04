-- 1. Create the 4 Isolated Domain Databases
CREATE DATABASE identity_db;
CREATE DATABASE study_governance_db;
CREATE DATABASE clinical_safety_db;
CREATE DATABASE audit_integrity_db;

-- 2. Enable UUID Extension on each Database
\connect identity_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect study_governance_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect clinical_safety_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect audit_integrity_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";