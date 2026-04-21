# QuickBooks Online Sync Engine (Supabase Edge Functions)

A robust backend architecture for connecting modern applications with QuickBooks Online (QBO). This system handles the entire lifecycle of financial data synchronization, from secure OAuth 2.0 authorization to automated event-driven communication.

## Key Components

1. **Secure OAuth 2.0 Flow:** Server-side token exchange and automated refresh logic (every 15 mins) to prevent session expiration.
2. **Data Integrity:** Strict mapping between internal database entities (Profiles, Invoices) and QBO objects (Customers, Items).
3. **Event-Driven Communications:** Automated transaction-triggered emails via Mailgun to notify users of successful sync and accounting rules.
4. **Environment Isolation:** Zero hardcoded secrets; all sensitive keys are managed via Supabase Vault/Env variables.

## Architecture Logic
The system is built on **Deno** and **TypeScript**, ensuring high performance and security at the edge. By offloading financial logic from the mobile frontend to the backend, we ensure that tax calculations and record creation are 100% accurate even if the user's device is offline.
