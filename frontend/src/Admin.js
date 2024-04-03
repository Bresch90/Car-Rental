import React, { useState, useEffect } from 'react';
import './Admin.css';

const Admin = () => {
    const [ordersById, setOrdersById] = useState("");
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [status, setStatus] = useState("");

    // useEffect hook to fetch orders on component mount and every 10 seconds
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                await getOrders();
                setStatus('')
            } catch (error) {
                if (error.message.includes("500")) {
                    setStatus('No connection to server.')
                } else if (error.message.includes("503")) {
                    setStatus('No connection to database.')
                }
                return;
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    // fetch orders from the server and calculate TotalRevenue
    const getOrders = async () => {
        const response = await fetch('/admin/getorders');
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        const orders = await response.json();
        if (orders.length === 0) {
            console.log("Got no orders from database.\nThis is normal if the database is empty.");
        }
        let localRevenue = 0;
        const localOrdersById = {};
        orders.forEach(order => {
            const { id, car, total_price, ...rest } = order;
            const carName = car.split(",")[0];
            localOrdersById[id] = { car: carName, total_price, ...rest };
            localRevenue += parseInt(total_price);
        });
        setTotalRevenue(localRevenue);
        setOrdersById(localOrdersById);
    };

    // handle deletion of all orders
    const handleDeleteOrders = async () => {
        try {
            const response = await fetch('/admin/deleteAllOrders', {
                method: 'DELETE'
            });
            if (response.ok) {
                setStatus('All orders successfully deleted.')
            } else {
                setStatus('Failed to delete orders.')
            }
        } catch (error) {
            console.error('Error deleting orders:', error);
        }
    };

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
                        {Object.entries(ordersById).map(([Id, order]) => (
                            <tr key={Id}>
                                <td>{order.driver_name}</td>
                                <td>{order.car}</td>
                                <td>{order.start_date}</td>
                                <td>{order.end_date}</td>
                                <td style={{ textAlign: 'right' }}>{order.total_price.toLocaleString('sv-SE')} SEK</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h2>Total Revenue = {totalRevenue.toLocaleString('sv-SE')} SEK</h2>
                <button onClick={handleDeleteOrders}>Delete All Orders</button>
                {status && <h3 style={{color: 'red'}}>{status}</h3>}
            </div>
        </div>
    )
}

export default Admin;