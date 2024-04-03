import './Css/App.css';
import { Component } from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './Components/Home';
import Rent from './Components/Rent';
import Admin from './Components/Admin';

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