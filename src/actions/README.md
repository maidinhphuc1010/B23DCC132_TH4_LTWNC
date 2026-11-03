# Server Actions

Chưa triển khai đăng nhập hoặc CRUD ở bước nền tảng này. Khi thêm action, xác thực session và kiểm tra quyền ở phía server trước khi gọi repository. userId của completion phải lấy từ session, không tin giá trị do client gửi.


## Authorization contract

Authentication and route guards are implemented. Every future Server Action must independently call `requirePermission(action)` (or `requireAdmin()` / `requireUser()`) from `@/lib/require-auth` before accessing protected data. Do not assume that Proxy matched the action request. Use `deadline:create`, `deadline:delete`, or `completion:update` from the centralized matrix. For completions, take userId only from the returned authenticated user. Validate all other input server-side. Revalidate public deadline pages only after a successful authorized write. Never catch and swallow Next.js redirect exceptions in a broad mutation catch block.

