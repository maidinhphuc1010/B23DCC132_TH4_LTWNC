This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## GitHub OAuth (Auth.js)

Credentials vẫn hoạt động song song với GitHub. Tạo OAuth App trong GitHub →
Settings → Developer settings → OAuth Apps. Khi chạy local:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Đặt `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` và `AUTH_SECRET` trong `.env.local`
ở thư mục gốc (hoặc secret manager trên production). Sinh AUTH_SECRET bằng
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
Không đưa secret vào biến `NEXT_PUBLIC_*`, mã nguồn, log hoặc commit.
`.env.local` đã được `.gitignore` loại trừ. Khởi động lại server sau khi cấu hình.
Trên production, dùng HTTPS và callback URL đúng domain triển khai; nên tạo
OAuth App riêng cho local và production.

Tại `/login`, chọn **Đăng nhập bằng GitHub** rồi cấp quyền. `next`/`callbackUrl`
chỉ chấp nhận đường dẫn nội bộ, mặc định OAuth chuyển về `/dashboard`.
Lỗi/hủy OAuth được hiển thị tại `/login`, có thể thử lại. Đăng xuất dùng nút
**Đăng xuất** hiện có cho cả hai phương thức.

### Danh tính và phân quyền

- ID ổn định: `github:<GitHub account ID>`, không dựa trên username/email.
- GitHub luôn có role `user`; không nhận role từ client hoặc profile GitHub.
- Không liên kết bằng email, kể cả email trùng admin. Hai tài khoản Credentials
  demo không bị ghi đè. GitHub không có mật khẩu và không thể dùng Credentials.
- JSON lưu user bằng khóa ghi hiện có; session chứa `id`, `name`, `email`, `role`.
  Email ẩn được lưu `null` trong JSON và biểu diễn bằng chuỗi rỗng trong session.
- `can()` và kiểm tra user trong repository áp dụng cho cả hai provider:
  dashboard/completion được phép, admin bị chuyển `/403`.
- JSON cần filesystem ghi được, bền vững, một instance như kiến trúc hiện tại;
  không phù hợp filesystem tạm thời/serverless nhiều instance.

### Kiểm tra OAuth thực tế sau khi cấu hình

1. Đăng nhập admin và sinh viên bằng Credentials.
2. Đăng nhập GitHub từ `/login?next=/dashboard`, xác nhận session role `user`.
3. Đánh dấu/bỏ đánh dấu hoàn thành, tải lại để xác nhận dữ liệu được lưu.
4. Truy cập `/admin`: phải chuyển `/403`.
5. Đăng xuất, xác nhận `/dashboard` yêu cầu đăng nhập lại.
6. Hủy cấp quyền GitHub và kiểm tra thông báo lỗi/thử lại.

Unit test GitHub kiểm tra email trùng admin, ID ổn định, email ẩn, chống role giả
và xung đột ID. Đây không thay thế kiểm thử cấp quyền trực tiếp trên GitHub với
Client ID/Secret hợp lệ.

## Class Deadline Hub — Unit test phân quyền (Jest)

Cấu hình Jest dùng `next/jest` để biên dịch TypeScript bằng Next.js Compiler,
`testEnvironment: "node"` cho hàm thuần và alias `@/*` → `src/*` giống TypeScript.
Jest chỉ tìm các file `src/**/*.test.ts` và `src/**/*.test.tsx`; các bài kiểm thử
Node trong `scripts/` được chạy riêng để tránh xung đột test runner.

Bộ kiểm thử gọi trực tiếp `can(role, action)` hiện có, sử dụng đúng type `Role`
và `Action`, không mock và không thay đổi logic phân quyền.

| Role | `deadline:read` | `completion:update` | `deadline:create` | `deadline:delete` |
| --- | --- | --- | --- | --- |
| guest | Cho phép | Từ chối | Từ chối | Từ chối |
| user | Cho phép | Cho phép | Từ chối | Từ chối |
| admin | Cho phép | Cho phép | Cho phép | Cho phép |

### Chạy kiểm thử

```bash
npm test
npm run test:watch
npm run test:node
npm run build
```

`test:watch` dành cho chạy tương tác khi phát triển. `test:node` giữ các kiểm thử
storage và countdown đã có trong dự án.

### Kết quả đã xác minh

```text
PASS src/lib/permissions.test.ts
PASS src/lib/github-user.test.ts
Test Suites: 2 passed, 2 total
Tests:       17 passed, 17 total
Snapshots:   0 total
```

- `npm run test:node`: 3/3 test PASS (storage và countdown).
- `npm run lint`: PASS.
- `npm run build`: PASS, bao gồm bước kiểm tra TypeScript.
- Chiến lược rendering giữ nguyên: trang chủ/môn học SSG, deadline ISR 60 giây,
  dashboard/admin SSR. Không thay đổi chức năng chính hoặc chính sách phân quyền.
