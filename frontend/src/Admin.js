import React, { Component } from 'react';
import './Admin.css';

class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ordersById: "",
            adminMessage: "",
            totalRevenue: 0
        };
        this.handleDeleteOrders = this.handleDeleteOrders.bind(this);
    }

    componentDidMount() {
        this.getOrders().then(ordersById => {
            this.setState({ ordersById: ordersById });
        });

        this.interval = setInterval(() => {
            this.getOrders().then(ordersById => {
                this.setState({ ordersById: ordersById });
            });
        }, 10000); 
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }



    async getOrders() {
        const response = await fetch('/admin/getorders');
        const orders = await response.json();
        if (orders.length === 0) { console.log("Got no orders from database, are you sure it is running?") }
        var localRevenue = 0;
        const localOrdersById = {};
        orders.forEach(order => {
            var { id, car, total_price,...rest } = order;
            car = car.split(",")[0];
            localOrdersById[id] = {};
            localOrdersById[id] = {car, total_price, ...rest };
            localRevenue = localRevenue + parseInt(total_price);
        });
        this.setState({totalRevenue: localRevenue})
        return localOrdersById;
    }

    async handleDeleteOrders() {
        try {
            const response = await fetch('/admin/deleteAllOrders', {
                method: 'DELETE'
            });
            if (response.ok) {
                console.log('All orders successfully deleted.');
                // Optionally, you can perform any additional actions here after successful deletion
            } else {
                console.error('Failed to delete orders.');
                // Handle error condition if needed
            }
        } catch (error) {
            console.error('Error deleting orders:', error);
            // Handle network or other errors if needed
        }
    }

    render() {
        return (
            <div>
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Driver name</th>
                                <th>Car</th>
                                <th>From date</th>
                                <th>To date</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(this.state.ordersById).map(([Id, order]) => (
                                <tr key={Id}>
                                    <td>{order.driver_name}</td>
                                    <td>{order.car}</td>
                                    <td>{order.start_date}</td>
                                    <td>{order.end_date}</td>
                                    <td style={{textAlign: 'right'}}>{order.total_price.toLocaleString('sv-SE')} SEK</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h2>Total Revenue = {this.state.totalRevenue.toLocaleString('sv-SE')} SEK</h2>
                    <button onClick={this.handleDeleteOrders}>Delete All Orders</button>
                </div>
            </div>
        );
    }
}

export default Admin;