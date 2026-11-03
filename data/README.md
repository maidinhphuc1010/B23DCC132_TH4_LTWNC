# JSON storage

Chạy các lệnh từ thư mục gốc dự án:

- `npm run seed`: tạo dữ liệu nếu chưa có, giữ dữ liệu hiện tại khi chạy lại.
- `npm run seed -- --reset`: đặt lại toàn bộ dữ liệu mẫu, xóa tiến độ hiện tại.
- `npm test`: kiểm tra dữ liệu seed, bcrypt, ghi đồng thời và tính toàn vẹn dữ liệu.
- `npm run typecheck`, `npm run lint`, `npm run build`: kiểm tra dự án.

`db.json` chứa 4 môn, 12 deadline, 2 tài khoản demo đã hash bcrypt cost 12. Mật khẩu demo nằm trong seed theo yêu cầu, không nằm trong JSON; không dùng tài khoản này cho production.

Completion chỉ lưu các cặp userId/deadlineId đã hoàn thành cùng completedAt. Không có bản ghi nghĩa là chưa hoàn thành. Action là union quyền thao tác để chuẩn bị phân quyền, không phải nhật ký hoạt động.

Repository đánh dấu `server-only`, không phải API/Server Action. Các module `.mjs` dùng chung với CLI chỉ chạy Node.js; không import vào Client Components. Schema Zod kiểm tra cấu trúc, khóa duy nhất và khóa ngoại trước khi ghi và sau khi đọc.

Ghi có khóa file độc quyền (chờ tối đa khoảng 5 giây), file tạm cùng thư mục, flush và rename. Nếu tiến trình bị dừng đột ngột, có thể còn `.lock`/`.tmp`: chỉ xóa sau khi xác nhận không còn tiến trình ghi. Không tự động bỏ khóa để tránh ghi đè dữ liệu đang cập nhật. File lỗi không tự bị ghi đè bằng dữ liệu rỗng.

Giới hạn: phù hợp demo hoặc một Node server với ổ đĩa bền vững; không phù hợp serverless có filesystem tạm/read-only, nhiều replica dùng ổ riêng hoặc tải ghi lớn. Cần backup; rename không thay thế backup hay bảo đảm chống mọi sự cố mất điện. Chạy seed khi ứng dụng đang dừng.

Dashboard/admin hiện chỉ là trang chuẩn bị, chưa có xác thực/phân quyền. `/403` là trang thông báo, chưa phải cơ chế trả HTTP 403. Chưa cung cấp endpoint ghi dữ liệu. Khi triển khai actions phải kiểm tra session/quyền, lấy userId từ session và không gửi passwordHash ra client.
