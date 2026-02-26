import { Link } from "react-router-dom";
import "./error.scss";
import { BsFastForwardFill } from "react-icons/bs";
const NotFound = () => {
  return (
    <div className="notfound">
      <div className="notfound__content">
        <h1>404</h1>
        <h2>Oops! Page Not Found</h2>
        <p>
          The page you’re looking for doesn’t exist or has been moved.
          <br />
          Please check the URL or go back to the homepage.
        </p>
        <Link to="/" className="notfound__btn">
          <BsFastForwardFill className="icon" />Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
