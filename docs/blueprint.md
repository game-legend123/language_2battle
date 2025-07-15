# **App Name**: Song Đấu Ngôn Ngữ

## Core Features:

- Tạo Câu Đố AI: Sinh câu đố đa ngôn ngữ: Sử dụng Gemini API để tạo ra câu đố từ khóa người chơi chọn bằng một ngôn ngữ ngẫu nhiên. Công cụ này sẽ đảm bảo câu đố có ngữ nghĩa và độ khó phù hợp.
- Dịch và Gợi Ý AI: Dịch và gợi ý: Dùng Gemini API để dịch câu đố về tiếng Việt, đồng thời đưa ra các gợi ý (hints) về ngữ cảnh hoặc từ vựng.
- Giao Diện Song Đấu: Giao diện song đấu: Thiết kế giao diện trực quan để hiển thị câu đố, hộp nhập đáp án, thời gian và điểm số của cả hai người chơi.
- Kết Nối Thời Gian Thực: Xử lý thời gian thực: Sử dụng WebSocket hoặc Socket.IO để đảm bảo trải nghiệm chơi game thời gian thực, không giật lag giữa hai người chơi.
- Quản Lý Lượt Chơi: Quản lý lượt chơi: Điều khiển tiến trình trò chơi, từ việc chọn từ khóa, sinh câu đố, dịch, đến kiểm tra đáp án và cập nhật điểm số.
- Bảng Xếp Hạng: Bảng xếp hạng: Lưu điểm số của người chơi và hiển thị bảng xếp hạng toàn cầu.
- Chọn từ khoá: Chọn từ khoá: Cho phép người chơi nhập từ khoá, sau đó xác thực từ khoá này trước khi đưa vào tạo câu đố.

## Style Guidelines:

- Màu chủ đạo: Xanh dương đậm (#2E3192) gợi lên sự tin tưởng, thông thái và tập trung.
- Màu nền: Xanh nhạt (#D4D7FB) là màu xanh dương nhạt, tạo cảm giác dễ chịu và tương phản tốt với các yếu tố khác.
- Màu nhấn: Vàng kim (#B8860B) để làm nổi bật các yếu tố quan trọng, tạo điểm nhấn sang trọng và thu hút sự chú ý.
- Font chữ: 'Inter' (sans-serif) cho cả tiêu đề và nội dung. 
- Sử dụng icon phẳng, đơn giản, thể hiện các chủ đề liên quan đến ngôn ngữ và kiến thức. 
- Bố cục rõ ràng, chia thành các khu vực chính: câu đố, hộp nhập đáp án, thông tin người chơi, bảng xếp hạng.
- Hiệu ứng chuyển động nhẹ nhàng khi hiển thị câu đố, đáp án, hoặc cập nhật điểm số.