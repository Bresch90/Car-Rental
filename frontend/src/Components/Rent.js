import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { calculateBlacklistByCar, calculateStartDatesBlacklistByCar, calculateNextAvailableDateAndMaxEnd, calculateTotalPrice } from '../Helpers/RentHelper';
import "react-datepicker/dist/react-datepicker.css";
import '../Css/Rent.css';

const Rent = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [minEndDate, setMinEndDate] = useState(new Date());
    const [maxEndDate, setMaxEndDate] = useState(new Date("2090-02-11"));
    const [datesBlacklistByCar, setDatesBlacklistByCar] = useState({
            "Volkswagen Golf, 1333kr/day": [],
            "Volvo S60, 1500 kr/day": [],
            "Ford Transit, 2400kr/day": [],
            "Ford Mustang, 3000kr/day": []
        });
    const [startDatesBlacklistByCar, setStartDatesBlacklistByCar] = useState({
            "Volkswagen Golf, 1333kr/day": [],
            "Volvo S60, 1500 kr/day": [],
            "Ford Transit, 2400kr/day": [],
            "Ford Mustang, 3000kr/day": []
        });    
    const [ordersByCar, setOrdersByCar] = useState({});
    const [nextAvailableDate, setNextAvailableDate] = useState(new Date());

    const [status, setStatus] = useState({
        nameError: '',
        ageError: '',
        databaseError: '',
        orderState: '',
        submitInProgress: false,
    })

    const [formData, setFormData] = useState({
        car: 'Volkswagen Golf, 1333kr/day',
        driverName: '',
        driverAge: '',
        totalPrice: 0
    })

    // Effect for fetching orders on load
    useEffect(() => {
        getOrders()
    }, []);

    // Effect for updating datesBlacklist and also set start values for dates when ordersByCar changes
    useEffect(() => {
        const localBlacklistByCar = calculateBlacklistByCar(datesBlacklistByCar, ordersByCar);
        setDatesBlacklistByCar(localBlacklistByCar);
        const {localNextAvailableDate, localMaxEndDate} = calculateNextAvailableDateAndMaxEnd(localBlacklistByCar, formData.car);
        setNextAvailableDate(localNextAvailableDate);
        setMaxEndDate(localMaxEndDate);
        // Quickfix to handle bugg where day before next intervall should not be pickable
        setStartDatesBlacklistByCar(calculateStartDatesBlacklistByCar(localBlacklistByCar, startDatesBlacklistByCar))
    }, [ordersByCar]);
    
    // Effect for updating minEndDate and endDate when startDate changes
    useEffect(() => {
        updateMaxEndDate();
        const tomorrow = new Date(startDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setEndDate(tomorrow);
        setMinEndDate(new Date(tomorrow))
    }, [startDate]);

    // Effect for updating NextAvailableDate And MaxEnd when car selection changes
    useEffect(() => {
        const {localNextAvailableDate, localMaxEndDate} = calculateNextAvailableDateAndMaxEnd(datesBlacklistByCar, formData.car);
        setNextAvailableDate(localNextAvailableDate);
        setMaxEndDate(localMaxEndDate);
    }, [formData.car]);
    
    // Effect for updating dates when nextAvailableDate changes
    useEffect(() => {
        setStartDate(nextAvailableDate);
        const tomorrow = new Date(nextAvailableDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setMinEndDate(tomorrow);
        setEndDate(tomorrow);
    }, [nextAvailableDate]);

    // Effect for updating totalPrice
    useEffect(() => {
        const newTotalPrice = calculateTotalPrice(formData.car, startDate, endDate);
        setFormData({...formData, totalPrice: newTotalPrice});
    }, [startDate, endDate, formData.car]);

    // Fetch orders from the server
    const getOrders = async () => {
        try {
            const response = await fetch('/rent/getorders');
            if (!response.ok) {
                throw new Error(`${response.status}`);
            }
            const orders = await response.json();
            if (orders.length === 0) {
                console.log("Got no orders from database.\nThis is normal if the database is empty.");
            }
            const localOrdersByCar = {};
            orders.forEach(order => {
                const { car, start_date, end_date } = order;
                localOrdersByCar[car] = localOrdersByCar[car] || [];
                localOrdersByCar[car].push({ start_date, end_date });
            });
            setOrdersByCar(localOrdersByCar);
        } catch (error) {
            if (error.message.includes("500")) {
                setStatus({...status, databaseError: 'No connection to server.'})
                alert(`Error connecting to backend!\nMake sure it is running!`);
            } else if (error.message.includes("503")) {
                setStatus({...status, databaseError: 'No connection to database.'})
                alert(`Error connecting to database!\nMake sure it is running!`);
            }
            return;
        }
        setStatus({...status, databaseError: ''})
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!status.submitInProgress) {
            setStatus({...status, submitInProgress: true});
        }
        // Tell the user to fix the displayed errors
        if (status.nameError || status.ageError || status.databaseError) {
            alert('Please correct the errors before submitting.');
            setStatus({...status, submitInProgress: false});
            return;
        }

        // Package order
        const order = {
            'car': formData.car,
            'startDate': startDate.toISOString(),
            'endDate': endDate.toISOString(),
            'driverName': formData.driverName,
            'driverAge': formData.driverAge,
            'totalPrice': formData.totalPrice
        }

        // Try sending the order and display errors if any
        try {
            const response = await fetch('/rent/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });

            if (response.ok) {
                setStatus({...status, orderState: 'Order submitted successfully!'})
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                const errorMessage = await response.text();
                alert(`Failed to submit order. Please try again later.\n${JSON.stringify(order, null, 2)}`);
                console.log(`Failed to submit order.\n${errorMessage}`);
                setStatus({...status, submitInProgress: false});
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('An error occurred while submitting the order. Please try again later.');
            setStatus({...status, submitInProgress: false});
        }
    }

    // Validate driver name
    const nameValidation = (e) => {
        const { name, value } = e.target;
        if (!value.length) {
            setStatus({...status, nameError: 'Name is required!'})
        } else if (!/^[a-zåäöA-ZÅÄÖ]+(\s[a-zåäöA-ZÅÄÖ]+)?$/.test(value)) {
            setStatus({...status, nameError: 'Invalid name. Only letters and one spaces allowed.'})
        } else if (value.length >= 30) {
            setStatus({...status, nameError: 'Max name length is 30 characters.'})
        } else {
            setStatus({...status, nameError: ''})
        }
        setFormData({...formData, [name]: value})
    }

    // Validate driver age
    const ageValidation = (e) => {
        const { name, value } = e.target;
        if (value < 18) {
            setStatus({...status, ageError: 'Invalid age. Only 18+ are allowed!'})
        } else if (value > 100) {
            setStatus({...status, ageError: 'Invalid age. Max age is 100.'})
        } else {
            setStatus({...status, ageError: ''})
        }
        setFormData({
            ...formData, [name]: value
        })
    }

    // Handle car selection change
    const handleCarChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData, [name]: value
        })
    };

    // Handle start date change
    const handleStartDateChange = (date) => {
        setStartDate(date);
    }

    // Update maxEndDate
    const updateMaxEndDate = () => {
        let localMaxEndDate = new Date("2100-01-01");
        for (let i = 0; i < datesBlacklistByCar[formData.car].length; i++) {
            const interval = datesBlacklistByCar[formData.car][i];
            if (startDate < interval.start) {
                localMaxEndDate = new Date(interval.start);
                break;
            }
        }
        setMaxEndDate(localMaxEndDate);
    }

    return (
        <div className='Rent'>
            <form onSubmit={handleSubmit}>
                <h1>Rent a car!</h1>
                <select data-testid="car-selector" name="car" onChange={handleCarChange}>
                    <option value="Volkswagen Golf, 1333kr/day">Volkswagen Golf, 1333kr/day</option>
                    <option value="Volvo S60, 1500 kr/day">Volvo S60, 1500 kr/day</option>
                    <option value="Ford Transit, 2400kr/day">Ford Transit, 2400kr/day</option>
                    <option value="Ford Mustang, 3000kr/day">Ford Mustang, 3000kr/day</option>
                </select>
                <div>
                    <div>
                        <label>Pick up date:</label>
                        <DatePicker id="pickUpDate" minDate={new Date()} selected={startDate} onChange={handleStartDateChange} excludeDateIntervals={startDatesBlacklistByCar[formData.car]} />
                    </div>
                    <div>
                        <label>Return date: </label>
                        <DatePicker id="returnDate" minDate={minEndDate} maxDate={maxEndDate} selected={endDate} onChange={(date) => setEndDate(date)} />
                    </div>
                </div>
                <input type="text" data-testid="driverName" name='driverName' value={formData.driverName} placeholder='Name of driver' onChange={nameValidation} maxLength={30} required></input>
                {status.nameError && <p className="error">{status.nameError}</p>}
                <input type="number" data-testid='driverAge' name='driverAge' value={formData.driverAge} placeholder='Age of driver' onChange={ageValidation} min={1} max={100} required></input>
                {status.ageError && <p className="error">{status.ageError}</p>}
                <h2>Sum total = {formData.totalPrice.toLocaleString('sv-SE')} SEK</h2>
                <button type="submit" disabled={status.submitInProgress}>Submit</button>
            </form>
            {status.orderState && <h3>{status.orderState}</h3>}
            {status.databaseError && <h3 style={{color: 'red'}}>{status.databaseError}</h3>}
        </div>
    );
};

export default Rent;