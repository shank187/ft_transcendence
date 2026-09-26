import { Link } from 'react-router-dom';

function Root() {
    return (
        <div>
            <h1>Welcome</h1>
            <p>
                <Link to="/login">Log In</Link>
            </p>
            <p>
                <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Root;