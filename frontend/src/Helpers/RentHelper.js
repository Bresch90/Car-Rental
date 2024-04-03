
// Had to make a new list because start of intervals should shift -1 on startDate
const calculateStartDatesBlacklistByCar = (localBlacklistByCar, startDatesBlacklistByCar) => {
    const localStartDatesBlacklist = JSON.parse(JSON.stringify(startDatesBlacklistByCar));
    Object.keys(localBlacklistByCar).forEach((car) => {
        const localDatesBlacklistArray = [];
        localBlacklistByCar[car].forEach(interval => {
            const startDateMinusOne = new Date(interval.start);
            startDateMinusOne.setDate(startDateMinusOne.getDate() - 1);
            localDatesBlacklistArray.push({start: startDateMinusOne, end: new Date(interval.end)});
        });
        localStartDatesBlacklist[car] = localDatesBlacklistArray;
    });
    return localStartDatesBlacklist;
}

// Calculate datesToExclude from orders based
const calculateBlacklistByCar = (datesBlacklistByCar, ordersByCar) => {
    const localDatesBlacklistByCar = JSON.parse(JSON.stringify(datesBlacklistByCar))
    
    Object.keys(localDatesBlacklistByCar).forEach((car) => {
        // Get only dates from matching car
        if (!ordersByCar[car]) {
            localDatesBlacklistByCar[car] = [];
            return;
        }
        const localDatesBlacklist = [];
        ordersByCar[car].forEach(dateDict => {
            var includeStartDate = new Date(dateDict.start_date);
            includeStartDate.setDate(includeStartDate.getDate() - 1);
            localDatesBlacklist.push({ start: new Date(includeStartDate), end: new Date(dateDict.end_date) });
        });
        
        // If only one date is available between two intervals, fill it.
        // Not possible to pick up and return on one day.
        localDatesBlacklist.sort((a, b) => a.start - b.start);
        for (let i = 0; i < localDatesBlacklist.length - 1; i++) {
            const currentInterval = localDatesBlacklist[i];
            const nextInterval = localDatesBlacklist[i + 1];
            const daysGap = (nextInterval.start - currentInterval.end) / (1000 * 60 * 60 * 24);
            if (daysGap === 1) {
                currentInterval.end.setDate(currentInterval.end.getDate() + 1);
            }
        }
        localDatesBlacklistByCar[car] = localDatesBlacklist;
    });
    return localDatesBlacklistByCar;
}

// Calculate nextAvailableDate and maxEndDate based on datesToExclude
const calculateNextAvailableDateAndMaxEnd = (datesBlacklistByCar, car) => {
    let localNextAvailableDate = new Date();
    let localMaxEndDate = new Date("2100-01-01");
    for (let i = 0; i < datesBlacklistByCar[car].length; i++) {
        const interval = datesBlacklistByCar[car][i];
        if (localNextAvailableDate < interval.start) {
            localMaxEndDate = new Date(interval.start);
            break;
        }
        const newDay = new Date(interval.end);
        newDay.setDate(newDay.getDate() + 1);
        localNextAvailableDate = newDay;
    }

    /// return multiple? set states? ...prev? packup? how? has been done in rent.js
    return { localNextAvailableDate, localMaxEndDate};
    // setNextAvailableDate(localNextAvailableDate);
    // setMaxEndDate(localMaxEndDate);
}

// Update maxEndDate
const calculateMaxEndDate = (datesBlacklistByCar, car, startDate) => {
    let localMaxEndDate = new Date("2100-01-01");
    for (let i = 0; i < datesBlacklistByCar[car].length; i++) {
        const interval = datesBlacklistByCar[car][i];
        if (startDate < interval.start) {
            localMaxEndDate = new Date(interval.start);
            break;
        }
    }
    return localMaxEndDate;
}

// Update total price
const calculateTotalPrice = (car, startDate, endDate) => {
    const numberOfDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let carPrice = 0
    switch (car) {
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
    }
    return numberOfDays * carPrice;
}
export { calculateBlacklistByCar, calculateStartDatesBlacklistByCar, calculateNextAvailableDateAndMaxEnd, calculateMaxEndDate, calculateTotalPrice };
