CREATE USER sleepiez WITH PASSWORD 'sleepiez_prod_2026';
CREATE DATABASE sleepiez OWNER sleepiez;
\c sleepiez
CREATE EXTENSION IF NOT EXISTS pgcrypto;
