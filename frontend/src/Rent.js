import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './Rent.css';

const Rent = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [minEndDate, setMinEndDate] = useState(new Date());
    const [maxEndDate, setMaxEndDate] = useState(new Date("2124-03-20"));
    const [dateToExcludeArray, setDateToExcludeArray] = useState([]);
    const [datesToExcludeStartDates, setDatesToExcludeStartDates] = useState([]);
    const [ordersByCar, setOrdersByCar] = useState({});
    const [nextAvailableDate, setNextAvailableDate] = useState(new Date());

    const [nameError, setNameError] = useState('');
    const [ageError, setAgeError] = useState('');
    const [databaseError, setDatabaseError] = useState('');
    const [orderState, setOrderState] = useState('');

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

    // Effect for updating datesToExclude when ordersByCar changes
    useEffect(() => {
        datesToExclude();
    }, [ordersByCar]);
    
    // Effect for updating minEndDate and endDate when startDate changes
    useEffect(() => {
        updateMaxEndDate();
        const tomorrow = new Date(startDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setEndDate(tomorrow);
    }, [startDate]);

    // Effect for updating datesToExclude when car selection changes
    useEffect(() => {
        datesToExclude();
    }, [formData.car]);
    
    // Effect for updating dates when nextAvailableDate changes
    useEffect(() => {
        setStartDate(nextAvailableDate);
        const tomorrow = new Date(nextAvailableDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setMinEndDate(tomorrow);
        setEndDate(tomorrow);

// Quickfix to handle bugg where day before next intervall should not be pickable
        updateDatesToExcludeStartDates()

    }, [nextAvailableDate]);

    // Effect for updating totalPrice
    useEffect(() => {
        priceUpdate();
    }, [startDate, endDate, formData.car]);

    // Fetch orders from the server
    const getOrders = async () => {
        try {
            const response = await fetch('/rent/getorders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const orders = await response.json();
            if (orders.length === 0) {
                console.log("Got no orders from database, are you sure it is running?");
            }
            const localOrdersByCar = {};
            orders.forEach(order => {
                const { car, start_date, end_date } = order;
                localOrdersByCar[car] = localOrdersByCar[car] || [];
                localOrdersByCar[car].push({ start_date, end_date });
            });
            setOrdersByCar(localOrdersByCar);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setDatabaseError('No connection to database.');
            alert("Error connecting to database!\nMake sure it is running!");
            return;
        }
        setDatabaseError("")        
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Tell the user to fix the displayed errors
        if (nameError || ageError || databaseError) {
            alert('Please correct the errors before submitting.');
            return;
        }

        // Package order
        const order = {
            'car': formData.car,
            'startDate': startDate.toLocaleDateString(),
            'endDate': endDate.toLocaleDateString(),
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
                setOrderState('Success');
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                const errorMessage = await response.text();
                alert(`Failed to submit order. Please try again later.\n\n${errorMessage}`);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('An error occurred while submitting the order. Please try again later.');
        }
    }

    // Validate driver name
    const nameValidation = (e) => {
        const { name, value } = e.target;
        if (!value.length) {
            setNameError('Name is required!')
        } else if (!/^[a-zåäöA-ZÅÄÖ]+(\s[a-zåäöA-ZÅÄÖ]+)?$/.test(value)) {
            setNameError('Invalid name. Only letters and one spaces allowed.')
        } else if (value.length >= 30) {
            setNameError('Max name length is 30 characters.')
        } else {
            setNameError('')
        }
        setFormData({
            ...formData, [name]: value
        })
    }

    // Validate driver age
    const ageValidation = (e) => {
        const { name, value } = e.target;
        if (value < 18) {
            setAgeError('Invalid age. Only 18+ are allowed!');
        } else if (value > 100) {
            setAgeError('Invalid age. Max age is 100.');
        } else {
            setAgeError('');
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
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setMinEndDate(new Date(tomorrow))
        if (date.getDate() >= endDate.getDate()) {
            setEndDate(tomorrow);
        }
    }

    // Update maxEndDate
    const updateMaxEndDate = () => {
        let localMaxEndDate = new Date("2100-01-01");
        for (let i = 0; i < dateToExcludeArray.length; i++) {
            const interval = dateToExcludeArray[i];
            if (startDate < interval.start) {
                localMaxEndDate = new Date(interval.start);
                break;
            }
        }
        setMaxEndDate(localMaxEndDate);
    }

    // Had to make a new list because start of intervals should shift -1 on startDate
    const updateDatesToExcludeStartDates = () => {
        const localDatesToExcludeArray = [];
        dateToExcludeArray.forEach(interval => {
            const startDateMinusOne = new Date(interval.start);
            startDateMinusOne.setDate(startDateMinusOne.getDate() - 1);
            localDatesToExcludeArray.push({start: startDateMinusOne, end: new Date(interval.end)});
        });
        setDatesToExcludeStartDates(localDatesToExcludeArray);
    }

    // Update total price
    const priceUpdate = () => {
        const numberOfDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        let carPrice = 0
        switch (formData.car) {
            case "Volkswagen Golf, 1333kr/day":
                carPrice = 1333;
                break;
            case "Volvo S60, 1500 kr/day":
                carPrice = 1500;
                break;
            case "Ford Transit, 2400kr/day":
                carPrice = 2400;
                break;
            case "Ford Mustang, 3000kr/day":
                carPrice = 3000;
                break;
            default:
                console.error("Car is not recognized when calculating price!");
        }
        const totalPrice = numberOfDays * carPrice;
        setFormData({
            ...formData, totalPrice: totalPrice
        });
    }

    // Calculate datesToExclude and nextAvailableDate
    const datesToExclude = async () => {
        const LocalDatesToExcludeArray = calculateDatesToExclude();
        // calculateNextAvailableDateAndMaxEnd also checks if today needs to be excluded
        calculateNextAvailableDateAndMaxEnd(LocalDatesToExcludeArray);
    }

    // Calculate datesToExclude from orders based on selected car
    const calculateDatesToExclude = () => {
        if (!ordersByCar[formData.car]) {
            setDateToExcludeArray([]);
            return [];
        }
        // Get only dates from matching car
        const LocalDatesToExcludeArray = [];
        ordersByCar[formData.car].forEach(dateDict => {
            var includeStartDate = new Date(dateDict.start_date);
            includeStartDate.setDate(includeStartDate.getDate() - 1);
            LocalDatesToExcludeArray.push({ start: new Date(includeStartDate), end: new Date(dateDict.end_date) });
        });

        // If only one date is available between two intervals, fill it.
        // Not possible to pick up and return on one day.
        LocalDatesToExcludeArray.sort((a, b) => a.start - b.start);
        for (let i = 0; i < LocalDatesToExcludeArray.length - 1; i++) {
            const currentInterval = LocalDatesToExcludeArray[i];
            const nextInterval = LocalDatesToExcludeArray[i + 1];
            const daysGap = (nextInterval.start - currentInterval.end) / (1000 * 60 * 60 * 24);
            if (daysGap === 1) {
                currentInterval.end.setDate(currentInterval.end.getDate() + 1);
            }
        }
        setDateToExcludeArray(LocalDatesToExcludeArray);
        return LocalDatesToExcludeArray;
    }

    // Calculate nextAvailableDate and maxEndDate based on datesToExclude
    const calculateNextAvailableDateAndMaxEnd = (localDatesToExcludeArray) => {
        let localNextAvailableDate = new Date();
        let localMaxEndDate = new Date("2100-01-01");
        for (let i = 0; i < localDatesToExcludeArray.length; i++) {
            const interval = localDatesToExcludeArray[i];
            if (localNextAvailableDate < interval.start) {
                localMaxEndDate = new Date(interval.start);
                break;
            }
            const newDay = new Date(interval.end);
            newDay.setDate(newDay.getDate() + 1);
            localNextAvailableDate = newDay;
        }
        setNextAvailableDate(localNextAvailableDate);
        setMaxEndDate(localMaxEndDate);

        //Also checks if today needs to be excluded...
        const yesterDay = new Date();
        if (yesterDay.getDate() !== localNextAvailableDate.getDate()) {
            yesterDay.setDate(yesterDay.getDate() - 1);
            localDatesToExcludeArray.push({ start: yesterDay, end: new Date() });
            setDateToExcludeArray(localDatesToExcludeArray);
        }
    }

    return (
        <div className='Rent'>
            <form onSubmit={handleSubmit}>
                <h1>Rent a car!</h1>
                <select name="car" onChange={handleCarChange}>
                    <option value="Volkswagen Golf, 1333kr/day">Volkswagen Golf, 1333kr/day</option>
                    <option value="Volvo S60, 1500 kr/day">Volvo S60, 1500 kr/day</option>
                    <option value="Ford Transit, 2400kr/day">Ford Transit, 2400kr/day</option>
                    <option value="Ford Mustang, 3000kr/day">Ford Mustang, 3000kr/day</option>
                </select>
                <div>
                    <div>
                        <label>Pick up date:</label>
                        <DatePicker id="pickUpDate" minDate={new Date()} selected={startDate} onChange={handleStartDateChange} excludeDateIntervals={datesToExcludeStartDates} />
                    </div>
                    <div>
                        <label>Return date: </label>
                        <DatePicker id="returnDate" minDate={minEndDate} maxDate={maxEndDate} selected={endDate} onChange={(date) => setEndDate(date)} />
                    </div>
                </div>
                <input type="text" data-testid="driverName" name='driverName' value={formData.driverName} placeholder='Name of driver' onChange={nameValidation} maxLength={30} required></input>
                {nameError && <p className="error">{nameError}</p>}
                <input type="number" data-testid='driverAge' name='driverAge' value={formData.driverAge} placeholder='Age of driver' onChange={ageValidation} min={1} max={100} required></input>
                {ageError && <p className="error">{ageError}</p>}
                <h2>Sum total = {formData.totalPrice.toLocaleString('sv-SE')} SEK</h2>
                <button type="submit">Submit</button>
            </form>
            {orderState && <h3>Order submitted successfully!</h3>}
            {databaseError && <h3 style={{color: 'red'}}>{databaseError}</h3>}
        </div>
    );
};

export default Rent;