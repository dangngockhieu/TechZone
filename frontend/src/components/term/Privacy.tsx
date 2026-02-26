import "./Privacy.scss";

const Privacy = () => {
    return (
        <div className="privacy-page">
            <div className="container">

                <h1>Chính Sách Bảo Mật</h1>

                <p className="intro">
                    TechZone cam kết bảo mật tuyệt đối thông tin mang tính riêng tư của bạn.
                    Vui lòng đọc kỹ “Chính sách bảo mật” để hiểu rõ những cam kết mà chúng tôi thực hiện,
                    nhằm tôn trọng và bảo vệ quyền lợi của người dùng.
                </p>

                <section className="privacy-section">
                    <h2>1. Mục đích và phạm vi thu thập</h2>
                    <p>
                        Để truy cập và sử dụng một số dịch vụ trên Techzone.com.vn, bạn có thể được
                        yêu cầu cung cấp thông tin cá nhân như: Email, Họ tên, Số điện thoại liên lạc…
                        Các thông tin khai báo phải đảm bảo tính chính xác và hợp pháp.
                    </p>
                    <p>
                        Chúng tôi cũng thu thập thông tin về số lần truy cập, số trang xem, liên kết
                        bạn click và các dữ liệu trình duyệt như: địa chỉ IP, loại trình duyệt, ngôn ngữ,
                        thời gian truy cập và các địa chỉ mà trình duyệt truy xuất đến.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>2. Phạm vi sử dụng thông tin</h2>
                    <p>
                        Techzone.com.vn thu thập và sử dụng thông tin cá nhân với mục đích phù hợp
                        và tuân thủ “Chính sách bảo mật”. Khi cần thiết, chúng tôi có thể liên hệ trực tiếp
                        với bạn qua các hình thức: thư ngỏ, đơn đặt hàng, email, SMS, thông báo kỹ thuật, bảo mật…
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>3. Thời gian lưu trữ thông tin</h2>
                    <p>
                        Dữ liệu cá nhân của thành viên được lưu trữ cho đến khi có yêu cầu hủy bỏ
                        hoặc khi thành viên tự đăng nhập và thực hiện hủy bỏ. Trong mọi trường hợp,
                        thông tin được bảo mật trên hệ thống của Techzone.com.vn.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>4. Đơn vị thu thập và quản lý dữ liệu</h2>
                    <ul className="bullet-list">
                        <li>Công Ty Cổ Phần Bán Lẻ Kỹ Thuật Số TechZone</li>
                        <li>Địa chỉ: 1 - Tạ Quang Bửu, P. Đông Hòa, TP. Hồ Chí Minh</li>
                        <li>Điện thoại: 1800 1234</li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>5. Cách người dùng tiếp cận & chỉnh sửa dữ liệu</h2>
                    <ul className="bullet-list">
                        <li>Liên hệ tổng đài CSKH: <strong>1800 1234</strong>.</li>
                        <li>
                            Gửi góp ý hoặc bình luận trực tiếp trên website Techzone.com.vn để được
                            quản trị viên hỗ trợ.
                        </li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>6. Cam kết bảo mật thông tin cá nhân</h2>
                    <ul className="bullet-list">
                        <li>Bảo mật tuyệt đối theo chính sách bảo vệ dữ liệu cá nhân.</li>
                        <li>Chỉ thu thập/sử dụng khi có sự đồng ý của khách hàng.</li>
                        <li>Không chuyển giao thông tin cho bên thứ ba khi chưa được phép.</li>
                        <li>
                            Nếu hệ thống bị hacker tấn công gây mất mát dữ liệu, TechZone sẽ thông báo
                            cho cơ quan chức năng và khách hàng.
                        </li>
                        <li>
                            Hệ thống thanh toán tuân thủ theo chuẩn bảo mật PCI DSS và chuẩn SSL 256-bit.
                        </li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>7. Quy định bảo mật thanh toán</h2>
                    <p>TechZone áp dụng các tiêu chuẩn:</p>
                    <ul className="bullet-list">
                        <li>SSL 256-bit để mã hóa giao dịch.</li>
                        <li>OTP qua SMS để xác thực người dùng.</li>
                        <li>Không lưu trữ thông tin thẻ thanh toán của khách hàng.</li>
                        <li>
                            Chỉ lưu mã đơn hàng, mã giao dịch và tên ngân hàng đối với thanh toán nội địa.
                        </li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>8. Yêu cầu xóa dữ liệu</h2>
                    <p>
                        Bạn có thể yêu cầu xóa dữ liệu qua email: <strong>laptopshop8386@gmail.com</strong>.
                        Vui lòng mô tả rõ dữ liệu cần xóa. Chúng tôi sẽ tiếp nhận, xử lý và thông báo
                        tiến trình cho bạn.
                    </p>
                </section>

            </div>
        </div>
    );
};

export default Privacy;
