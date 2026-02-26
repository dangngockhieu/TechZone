import Header from "./Header";
import Footer from "./Footer";
import './HomePage.scss';
import { Outlet } from "react-router-dom";
import '../../styles/global.scss';
const Homepage = () => {
    return (
        <div className="app-layout">
            <Header />
            <div className="main-content">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}
export default Homepage;