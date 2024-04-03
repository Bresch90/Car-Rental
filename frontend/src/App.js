import './App.css';
import { Component } from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './Home';
import Rent from './Rent';
import Admin from './Admin';

class App extends Component {
	state = {
		message: "If spring backend is running and database is running, then this message should be replaced!"
	};

    componentDidMount() {
		document.title = "Car rental";
	}


	render() {
		return (
            <Router>
                <div className="App">
                    <div className="top-bar">Car rental</div>
                        <Routes>
                            <Route path="/" element={<Home/>} />
                            <Route path="/rent" element={<Rent/>} />
                            <Route path="/admin" element={<Admin/>} />
                        </Routes>
                </div>
            </Router>
		);
	}
}


export default App;