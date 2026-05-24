-- ============================================================
--  FoodBridge Database Schema
--  Run this file once to set up your MySQL database
-- ============================================================

CREATE DATABASE IF NOT EXISTS foodbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodbridge;

-- ============================================================
-- USERS TABLE
-- Handles all roles: individual, restaurant, ngo
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  role          ENUM('user', 'restaurant', 'ngo') NOT NULL DEFAULT 'user',
  org_name      VARCHAR(200)  NULL,                   -- for restaurant/ngo
  address       TEXT          NULL,
  city          VARCHAR(100)  NULL,
  is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  avatar_url    VARCHAR(500)  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email  (email),
  INDEX idx_role   (role),
  INDEX idx_city   (city)
);

-- ============================================================
-- REFRESH TOKENS TABLE
-- For secure JWT refresh token rotation
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       VARCHAR(512) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token   (token),
  INDEX idx_user_id (user_id)
);

-- ============================================================
-- DONATIONS TABLE
-- Food items posted by restaurants
-- ============================================================
CREATE TABLE IF NOT EXISTS donations (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id   INT UNSIGNED NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT         NULL,
  food_type       ENUM('veg', 'non-veg', 'both') NOT NULL DEFAULT 'veg',
  quantity        VARCHAR(100) NOT NULL,              -- e.g. "20 meals", "5kg rice"
  serves          INT UNSIGNED NULL,                  -- estimated no. of people
  pickup_address  TEXT         NOT NULL,
  city            VARCHAR(100) NOT NULL,
  pincode         VARCHAR(10)  NULL,
  best_before     DATETIME     NOT NULL,              -- expiry/pickup deadline
  image_url       VARCHAR(500) NULL,
  status          ENUM('available', 'claimed', 'picked_up', 'expired', 'cancelled') NOT NULL DEFAULT 'available',
  claimed_by      INT UNSIGNED NULL,                  -- NGO user id
  claimed_at      TIMESTAMP    NULL,
  picked_up_at    TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (restaurant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (claimed_by)    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status      (status),
  INDEX idx_city        (city),
  INDEX idx_restaurant  (restaurant_id),
  INDEX idx_best_before (best_before)
);

-- ============================================================
-- CLAIMS TABLE
-- Full history of NGO claims on donations
-- ============================================================
CREATE TABLE IF NOT EXISTS claims (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donation_id  INT UNSIGNED NOT NULL,
  ngo_id       INT UNSIGNED NOT NULL,
  status       ENUM('pending', 'confirmed', 'picked_up', 'cancelled') NOT NULL DEFAULT 'pending',
  notes        TEXT NULL,                             -- NGO pickup notes
  claimed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id)      REFERENCES users(id)     ON DELETE CASCADE,
  INDEX idx_donation (donation_id),
  INDEX idx_ngo      (ngo_id),
  INDEX idx_status   (status)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- In-app alerts for restaurants and NGOs
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  type       ENUM('donation_claimed', 'pickup_confirmed', 'new_donation', 'general') NOT NULL DEFAULT 'general',
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  ref_id     INT UNSIGNED NULL,                       -- donation_id or claim_id reference
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id  (user_id),
  INDEX idx_is_read  (is_read)
);

-- ============================================================
-- IMPACT STATS VIEW
-- Easy query for dashboard stats
-- ============================================================
CREATE OR REPLACE VIEW impact_stats AS
SELECT
  COUNT(DISTINCT d.id)                                        AS total_donations,
  COUNT(DISTINCT CASE WHEN d.status = 'picked_up' THEN d.id END) AS completed_donations,
  COALESCE(SUM(CASE WHEN d.status = 'picked_up' THEN d.serves END), 0) AS total_meals_served,
  COUNT(DISTINCT d.restaurant_id)                             AS active_restaurants,
  COUNT(DISTINCT c.ngo_id)                                    AS active_ngos
FROM donations d
LEFT JOIN claims c ON c.donation_id = d.id;
