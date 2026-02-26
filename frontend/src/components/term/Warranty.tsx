import "./Warranty.scss";

const Warranty = () => {
    return (
        <div className="warranty-pager">
            <h1>Chính Sách Bảo Hành</h1>

            <p className="intro">
                Tất cả sản phẩm kinh doanh tại <strong>TechZone</strong> đều là sản phẩm chính hãng
                và được bảo hành theo đúng chính sách của nhà sản xuất (*). Ngoài ra, TechZone hỗ trợ
                gửi bảo hành miễn phí cho cả sản phẩm được mua tại TechZone và sản phẩm từ các hệ thống bán lẻ khác.
            </p>

            <section className="warranty-section">
                <h2>Quyền Lợi Khi Mua Hàng Tại TechZone</h2>
                <ul className="bullet-list">
                    <li>Bảo hành đổi sản phẩm mới ngay tại shop trong 30 ngày nếu có lỗi NSX (**).</li>
                    <li>Gửi bảo hành chính hãng không mất phí vận chuyển (***).</li>
                    <li>Theo dõi tiến độ bảo hành qua hotline.</li>
                    <li>TechZone hỗ trợ làm việc với hãng để xử lý các phát sinh trong quá trình bảo hành.</li>
                </ul>
            </section>

            <section className="warranty-section">
                <h2>Các Trường Hợp Không Thuộc Phạm Vi Bảo Hành</h2>
                <ul className="bullet-list warning">
                    <li>Sản phẩm hết hạn bảo hành.</li>
                    <li>Sản phẩm đã sửa chữa tại nơi không phải trung tâm bảo hành uỷ quyền.</li>
                    <li>Sản phẩm lắp đặt, sử dụng sai hướng dẫn của nhà sản xuất.</li>
                    <li>Sản phẩm lỗi do ngấm nước, chất lỏng, bụi bẩn hoặc các yếu tố môi trường.</li>
                    <li>Sản phẩm nứt vỡ, biến dạng, móp méo do tác động vật lý hoặc nhiệt.</li>
                    <li>Sản phẩm bị mốc, oxy hóa, han rỉ, ăn mòn hóa chất.</li>
                    <li>Sản phẩm hư hại do thiên tai, hỏa hoạn, côn trùng, động vật.</li>
                    <li>Thiết bị bị khóa bởi tài khoản cá nhân: iCloud, Samsung Cloud, Xiaomi Cloud, Gmail…</li>
                    <li>Khách hàng sử dụng phần mềm không bản quyền.</li>
                    <li>Màn hình có tối đa 04 điểm chết trở xuống.</li>
                </ul>
            </section>

            <section className="warranty-section">
                <h2>Lưu Ý</h2>
                <ul className="bullet-list note">
                    <li>Chính sách bảo hành bắt đầu có hiệu lực từ lúc xuất hóa đơn.</li>
                    <li>Mỗi dòng sản phẩm có chính sách bảo hành khác nhau theo hãng quy định.</li>
                    <li>Vui lòng liên hệ CSKH TechZone: <strong>1800 1234</strong> để biết chi tiết.</li>
                    <li>Dữ liệu trên thiết bị có thể bị xóa khi bảo hành — vui lòng sao lưu trước khi gửi.</li>
                    <li>Vui lòng tắt mật khẩu bảo vệ thiết bị. TechZone từ chối tiếp nhận nếu thiết bị bị khóa.</li>
                </ul>
            </section>

            <p className="small-print">
                (*) Áp dụng với sản phẩm mới hoặc sản phẩm đã qua sử dụng nhưng còn thời hạn bảo hành mặc định.<br />
                (**) Áp dụng với các sản phẩm thuộc diện đổi mới 30 ngày theo chính sách đổi trả.<br />
                (***) Trừ sản phẩm có chính sách bảo hành tại nhà hoặc sản phẩm cồng kềnh.
            </p>
        </div>
    );
};

export default Warranty;
