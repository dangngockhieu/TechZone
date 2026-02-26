import './Footer.scss';
import {Link} from "react-router-dom";
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="container app-footer__inner">
                <div className="app-footer__brand">
                    <span className="app-footer__brand-mark">TechZone</span>
                    <p>
                        Premium laptops and flagship phones with nationwide delivery, financing, and certified
                        after sales support.
                    </p>
                    <div className="app-footer__contact">
                        <span>Hotline: 1800 1234</span>
                        <span>Email: laptopshop8386@laptopshop.vn</span>
                        <span>Showroom: No. 1 Ta Quang Buu Street, Dong Hoa Ward, Ho Chi Minh City, Vietnam</span>
                    </div>
                </div>
                <div className="app-footer__column">
                    <h4>Shop</h4>
                    <div>Performance laptops</div>
                    <div>Flagship phones</div>
                    <div>Bundle deals</div>
                    <div>Services</div>
                </div>
            </div>
            <div className="container app-footer__bottom">
                <span>© {currentYear} TechZone. All rights reserved.</span>
                <div className="app-footer__legal">
                    <Link to="privacy">Privacy Policy</Link>
                    <Link to="warranty">Warranty Policy</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;