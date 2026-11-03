import bcrypt from "bcryptjs";
import { updateDatabase } from "../src/lib/json-store.mjs";

const reset = process.argv.includes("--reset");
const createdAt = "2026-11-01T08:00:00+07:00";
const subjects = [
  { id: "sub-web", slug: "lap-trinh-web-nang-cao", code: "INT1434", name: "Lập trình Web nâng cao", description: "Xây dựng ứng dụng web fullstack với Next.js, xác thực và quản lý dữ liệu." },
  { id: "sub-db", slug: "co-so-du-lieu", code: "INT1313", name: "Cơ sở dữ liệu", description: "Mô hình quan hệ, chuẩn hóa dữ liệu và truy vấn SQL." },
  { id: "sub-network", slug: "mang-may-tinh", code: "INT1336", name: "Mạng máy tính", description: "Kiến trúc TCP/IP, thiết kế mạng và phân tích gói tin." },
  { id: "sub-se", slug: "cong-nghe-phan-mem", code: "INT1340", name: "Công nghệ phần mềm", description: "Phân tích yêu cầu, thiết kế UML và kiểm thử phần mềm." },
];
const assignments = [
  ["sub-web", "Thực hành 4: App Router và layout", "Tạo route groups, layout dùng chung và trang chi tiết động. Nộp liên kết GitHub kèm ảnh chạy ứng dụng.", "2026-11-08"],
  ["sub-web", "Thực hành 5: Server Actions", "Xây dựng biểu mẫu thêm deadline, kiểm tra dữ liệu đầu vào và hiển thị lỗi bằng tiếng Việt.", "2026-11-15"],
  ["sub-web", "Báo cáo dự án Class Deadline Hub", "Hoàn thiện báo cáo kiến trúc, hướng dẫn cài đặt và video demo luồng người dùng, quản trị viên.", "2026-11-29"],
  ["sub-db", "Bài tập mô hình ER quản lý thư viện", "Vẽ thực thể sách, độc giả, phiếu mượn; xác định khóa và lực lượng liên kết. Nộp PDF.", "2026-11-09"],
  ["sub-db", "Thực hành truy vấn SQL", "Viết 15 truy vấn JOIN, GROUP BY và truy vấn lồng trên bộ dữ liệu quản lý sinh viên. Nộp file SQL.", "2026-11-16"],
  ["sub-db", "Bài tập chuẩn hóa lược đồ", "Tìm khóa ứng viên, phụ thuộc hàm và phân rã lược đồ đạt chuẩn 3NF; giải thích từng bước.", "2026-11-23"],
  ["sub-network", "Thực hành chia địa chỉ IPv4", "Chia mạng 192.168.10.0/24 cho bốn phòng máy bằng VLSM. Lập bảng network, broadcast và dải host.", "2026-11-10"],
  ["sub-network", "Phân tích gói tin bằng Wireshark", "Ghi lại quá trình DNS và bắt tay TCP; chú thích các gói tin quan trọng trong báo cáo PDF.", "2026-11-17"],
  ["sub-network", "Thiết kế mạng văn phòng", "Dựng mô hình Packet Tracer gồm VLAN, định tuyến liên VLAN và DHCP. Nộp file pkt và kết quả ping.", "2026-11-24"],
  ["sub-se", "Đặc tả yêu cầu phần mềm", "Viết tài liệu SRS cho hệ thống quản lý deadline: tác nhân, yêu cầu chức năng và phi chức năng.", "2026-11-11"],
  ["sub-se", "Thiết kế biểu đồ UML", "Vẽ use case, biểu đồ lớp và sequence cho luồng đánh dấu hoàn thành deadline. Nộp PDF và file nguồn.", "2026-11-18"],
  ["sub-se", "Lập kế hoạch kiểm thử", "Thiết kế ít nhất 20 test case cho đăng nhập, phân quyền và quản lý deadline, có kết quả mong đợi.", "2026-11-25"],
];
await updateDatabase(async (current) => {
  if (current && !reset) {
    console.log("Dữ liệu đã tồn tại; giữ nguyên. Dùng npm run seed -- --reset để đặt lại.");
    return current;
  }
  const users = await Promise.all([
    ["user-admin", "Quản trị viên", "admin@ptit.edu.vn", "admin123", "admin"],
    ["user-student", "Sinh viên PTIT", "sv@ptit.edu.vn", "sv123456", "user"],
  ].map(async ([id, name, email, password, role]) => ({
    id, name, email, role, passwordHash: await bcrypt.hash(password, 12), createdAt,
  })));
  console.log("Khởi tạo 4 môn học, 12 deadline, 2 tài khoản; completions rỗng.");
  return {
    subjects, users, completions: [],
    deadlines: assignments.map(([subjectId, title, description, due], index) => ({
      id: `dl-${String(index + 1).padStart(3, "0")}`, subjectId, title, description,
      dueAt: `${due}T23:59:00+07:00`, createdAt,
    })),
  };
});
