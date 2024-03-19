import React from 'react';
import { Link } from 'react-router-dom';
import './Rent.css';

const Home = () => {
    return (
        <div>
            <p>Please visit /rent or /admin</p>
            <Link to="/rent" style={buttonStyle}>/rent</Link>
            <Link to="/admin" style={buttonStyle}>/admin</Link>
        </div>
    );
};

const buttonStyle = {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#00db33',
    color: 'white',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '0 10px',
};

export default Home;