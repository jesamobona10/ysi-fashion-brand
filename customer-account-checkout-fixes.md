# Engineering Ticket: Customer Records, Checkout Email Field, and Account/Order Linking

## Context

A query against the `customers` table returned several unexpected records, including test accounts and the super admin account. Separately, the checkout flow appears to be creating a new customer record on every order instead of linking the order to the authenticated user's existing account, resulting in duplicate customer entries.

---

## Issue 1: Stale and Invalid Records in the `customers` Table

**Problem**

The `customers` table currently contains test/seed accounts and the super admin account (`admin@ysi.ng`). An admin should never appear in the `customers` table — admin and customer are distinct roles.

**Required Fix**

1. Delete all rows from `customers` except the record belonging to `jesamobona10@gmail.com`.
2. Remove the super admin record (`admin@ysi.ng`) from the `customers` table entirely.
3. Confirm that the super admin account is provisioned and managed separately (e.g., an `admins` table or a `role` flag), not through the customer signup path.
4. Add a safeguard (constraint, trigger, or application-level check) to prevent an admin-role account from ever being inserted into `customers`.
5. Confirm this system supports exactly one super admin, with no mechanism for additional admins to be created except through an explicit, deliberate action by the super admin.

**Note:** Before deleting, back up the current table (or export the rows) in case any of the removed records are referenced by other tables (e.g., orders, carts).

---

## Issue 2: Editable Email Field on the Checkout Page

**Problem**

The checkout form currently includes an editable email field. Since the customer is already authenticated with an email on file, allowing this field to be edited creates inconsistent data between the account and the order.

**Required Fix**

1. Remove the free-text email input from the checkout form.
2. Replace it with a field that is:
   - Pre-filled with the signed-in customer's account email.
   - Visible to the customer (for confirmation).
   - Disabled/read-only — not editable.
3. Use the authenticated user's email (from the account/session) as the source of truth for the order, not any value submitted from the checkout form.

---

## Issue 3: Duplicate Customer Records Created at Checkout

**Problem**

When a logged-in customer places an order, the checkout form data (name, email, location, etc.) is being written into the `customers` table as a **new** customer record, rather than being associated with the customer's existing account. This produces duplicate customer entries for what is actually a single person, and breaks the ability to view order history per account.

**Likely Root Cause**

The order-placement flow is probably doing an `INSERT` (or an upsert keyed on the wrong field) into `customers` using the checkout form fields, instead of:
- Reading the `customer_id` from the authenticated session, and
- Inserting into an `orders` table with a foreign key reference to that existing `customer_id`.

**Required Fix**

1. **Data model:** Ensure `orders` (and `carts`, if persisted) have a `customer_id` foreign key referencing `customers.id`. Checkout-specific fields that vary per order (e.g., shipping address, delivery notes) should live on the `orders` table — not be used to create or overwrite `customers` rows.
2. **Checkout flow:** When an authenticated customer submits checkout:
   - Do **not** insert or upsert a row into `customers`.
   - Insert a new row into `orders` with `customer_id` set to the logged-in user's existing ID, along with the order-specific details (shipping address, etc.).
3. **Guest checkout (if applicable):** If guest checkout is supported, that is the only case where a new `customers` record should be created — and it should be matched/merged by email to an existing account if one already exists, rather than creating a duplicate.
4. **Order history:** With `orders.customer_id` correctly linked, expose an endpoint/view that returns all orders for the authenticated customer, so they can see their order history.
5. **Cart association:** Ensure carts are similarly tagged to `customer_id` so an in-progress cart is tied to the account, not recreated per session.

**Acceptance Criteria**

- Placing an order while logged in does **not** create a new row in `customers`.
- The new order appears in `orders` with the correct existing `customer_id`.
- The customer can view a list of their past orders tied to their single account.
- No two `customers` rows share the same email address going forward (consider a unique constraint on `customers.email`).

---

## Suggested Follow-Up

- Add a `UNIQUE` constraint on `customers.email` to prevent future duplicates at the database level.
- Add a `role` column (or separate `admins` table) so admin/customer separation is enforced structurally, not just by convention.
- Write a migration script to backfill/repair any existing orders that may be pointing at now-deleted duplicate customer records, so historical order data isn't orphaned.
