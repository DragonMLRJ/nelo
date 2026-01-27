# Nelo Marketplace Security Audit & Hardening Report

This document details the comprehensive security audit and subsequent patching efforts performed on the Nelo Marketplace codebase. The primary goal was to elevate the platform's security posture to a market-ready, robust condition.

---

## 1. Core Vulnerabilities Audited & Patched

### Authentication & Authorization
*   **IDOR (Account Takeover):** Patched in `api/auth/index.php`. `updateProfile` now enforces `JWT.sub` for user identification, preventing unauthorized profile updates.
*   **Spoofing (Admin Impersonation):** Patched in `api/messages/sendMessage`. `senderId` is strictly enforced from the JWT token.
*   **Admin Privilege Escalation:** Addressed via `AdminMiddleware.php` and `api/admin/index.php`. Admins are verified against the database (`is_admin` flag) on every privileged action.

### Product Management
*   **Overselling:** Patched in `api/orders/index.php` using database row locking (`FOR UPDATE`) and atomic decrements.
*   **Negative Quantity Exploit:** Patched with strict input validation (`> 0`).
*   **Currency Mixing:** Enforced single currency per order logic.
*   **Self-Dealing:** Prevented sellers from purchasing their own products.
*   **Moderation Bypass:** Addressed via Supabase trigger (`force_product_moderation`) ensuring new products start as `pending`.
*   **Product Deletion:** Added secure admin functionality for forced deletion.

### Cart & Reviews
*   **Cart Sabotage (IDOR):** Patched in `api/cart/index.php` by enforcing JWT `userId`.
*   **Review Integrity:** `api/reviews/index.php` now verifies users have purchased the item before reviewing.

---

## 2. Infrastructure & Tooling

### New Admin Capabilities
*   **Centralized Admin API:** secure endpoint `api/admin/index.php` for user bans, forced product deletion, and refunds.
*   **Audit Logging:** Immutable `admin_audit_logs` table (migration `009`) tracks all admin actions.
*   **RLS "God Mode":** Updated Supabase policies (`010_admin_god_mode.sql`) granting admins full CRUD access.

### Security Layers Implemented
*   **Defense in Depth:** Combined JWT auth, strict server-side validation, DB constraints, RLS policies, and API middleware.
*   **Principle of Least Privilege:** Regular users restricted to owned data; Admins elevated safely.
*   **Rate Limiting:** Implemented on login endpoints.
*   **Content Security Policy (CSP):** Strict CSP in `index.html`.

---

## 3. Pending Concerns
*   **Advanced Features:** Lack of dispute resolution, analytics, and global tax compliance compared to major competitors (e.g., eBay).
*   **Performance:** Complex queries and search (currently SQL-based) may need optimization (e.g., Elasticsearch/Meilisearch) for scale.
