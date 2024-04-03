import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Rent from '../Components/Rent';
import { advanceTo, clear } from 'jest-date-mock';

describe('Rent component', () => {
  let originalFetch;
  // let capturedLogs = [];


  beforeEach( async () => {
    // const consoleSpy = jest.spyOn(console, 'log').mockImplementation(message => {
    //   capturedLogs.push(message);
    // });
    // const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // mocking date
    advanceTo(new Date('2024-04-19'));

    // mocking fetch call
    originalFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
            {"id":53,"car":"Volkswagen Golf, 1333kr/day","start_date":"2024-04-20","end_date":"2024-04-27","driver_name":"twentyTotwentySeven","driver_age":27,"total_price":9331},
            {"id":54,"car":"Volkswagen Golf, 1333kr/day","start_date":"2024-04-30","end_date":"2024-05-04","driver_name":"twentyeightShouldBeFree","driver_age":30,"total_price":5332},
            {"id":55,"car":"Volvo S60, 1500 kr/day","start_date":"2024-04-01","end_date":"2024-04-05","driver_name":"FirstToFifth","driver_age":55,"total_price":6000},
            {"id":56,"car":"Ford Transit, 2400kr/day","start_date":"2024-05-05","end_date":"2024-05-20","driver_name":"Hello","driver_age":55,"total_price":36000},
            {"id":57,"car":"Volkswagen Golf, 1333kr/day","start_date":"2024-05-06","end_date":"2024-05-07","driver_name":"FifthShouldNotBeFree","driver_age":55,"total_price":1333}
          ])
    }));

    // act because state updates in didMount
    await act(async () => {
      render(
          <Rent />
      );
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    // capturedLogs = [];
    // clears mocked date
    clear();
  });

  
  test('renders Rent component with initial state', () => {
    // Verifying text and form fields, tried a few ways
    expect(screen.getByText(/Rent a car!/)).toBeInTheDocument();
    expect(screen.getByText(/Pick up date:/)).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
        return element.textContent === 'Return date: ' && element.tagName.toLowerCase() === 'label';
      })).toBeInTheDocument();
    // should TestId really be necessary??
    expect(screen.getByTestId('driverName')).toBeInTheDocument();
    expect(screen.getByTestId('driverAge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/ })).toBeInTheDocument();
    expect(screen.getByText('Sum total = 1 333 SEK')).toBeInTheDocument();
  });


  test('select volvo and verify sum', async () => {
    const carSelector = screen.getByTestId('car-selector');
    const options = screen.getAllByRole('option');
    const sumH2 = screen.getByText(/Sum total =/);

    fireEvent.change(carSelector, { target: { value: options[1].value } });

    await waitFor(() => {
      expect(carSelector.value).toBe(options[1].value);
      expect(sumH2).toHaveTextContent('1 500');
    }, 2000);
  });


  test('select transit and verify sum', async () => {
    const carSelector = screen.getByTestId('car-selector');
    const options = screen.getAllByRole('option');
    const sumH2 = screen.getByText(/Sum total =/);

    fireEvent.change(carSelector, { target: { value: options[2].value } });

    await waitFor(() => {
      expect(carSelector.value).toBe(options[2].value);
      expect(sumH2).toHaveTextContent('Sum total = 2 400');
    }, 2000);
  });


  test('select mustang and verify sum', async () => {
    const carSelector = screen.getByTestId('car-selector');
    const options = screen.getAllByRole('option');
    const sumH2 = screen.getByText(/Sum total =/);

    fireEvent.change(carSelector, { target: { value: options[3].value } });

    await waitFor(() => {
      expect(carSelector.value).toBe(options[3].value);
      expect(sumH2).toHaveTextContent('Sum total = 3 000');
    }, 2000);
  });


  test('blank space in driverName input', async () => {
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: ' ' } });
    fireEvent.blur(screen.getByTestId('driverName'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid name. Only letters and one spaces allowed./)).toBeInTheDocument();
    });
  });


  test('too long name error', async () => {
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: 'ThisIsAWayTooLongNameToAddToThisField MaxIsThirtyCharacters' } });
    fireEvent.blur(screen.getByTestId('driverName'));

    // Checking error message
    await waitFor(() => {
      expect(screen.getByText(/Max name length is 30 characters./)).toBeInTheDocument();
    });
  });


  test('trigger "Name is required!" error', async () => {
    // Changing driverName to blank space
    const driverName = screen.getByTestId('driverName');
    fireEvent.change(driverName, { target: { value: ' ' } });
    fireEvent.blur(driverName);
    await waitFor(() => {
        driverName.value.includes(" ");
    }, { timeout: 2000 });

    // then change it to nothing
    fireEvent.change(driverName, { target: { value: '' } });
    fireEvent.blur(driverName);

    // Checking error message
    await waitFor(() => {
      expect(screen.getByText(/Name is required!/)).toBeInTheDocument();
    }, {timeout: 2000});
  });


  test('Underaged driver', async () => {
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '15' } });
    fireEvent.blur(screen.getByTestId('driverAge'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid age. Only 18\+ are allowed!/)).toBeInTheDocument();
    });
  });


  test('Overaged driver', async () => {
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '101' } });
    fireEvent.blur(screen.getByTestId('driverAge'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid age. Max age is 100./)).toBeInTheDocument();
    });
  });


  test('nameError on submit', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    // Filling the form with an invalid name
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: '222' } });
    fireEvent.blur(screen.getByTestId('driverName'));

    fireEvent.click(screen.getByRole('button', { name: /Submit/ }));
    // Verifying error message
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please correct the errors before submitting.');
    });
  });


  test('ageError on submit', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    // Filling the form with an invalid age
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '101' } });
    fireEvent.blur(screen.getByTestId('driverAge'));

    fireEvent.click(screen.getByRole('button', { name: /Submit/ }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please correct the errors before submitting.');
    });
  });


  test('Successfully submit an order', async () => {
    // fill in correct name and age
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: 'Sven' } });
    fireEvent.blur(screen.getByTestId('driverName'));
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '55' } });
    fireEvent.blur(screen.getByTestId('driverAge'));
    fireEvent.click(screen.getByRole('button', { name: /Submit/ }));
    await waitFor(() => {
      expect(screen.getByText(/Order submitted successfully!/)).toBeInTheDocument();
    }, {timeout: 2000});
  });


  test('error at submitting an order', async () => {
    const capturedErrorlogs = [];
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(message => {
      capturedErrorlogs.push(message);
    });
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to add to database.")));

    // fill in correct name and age
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: 'Sven' } });
    fireEvent.blur(screen.getByTestId('driverName'));
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '55' } });
    fireEvent.blur(screen.getByTestId('driverAge'));

    fireEvent.click(screen.getByText('Submit'))
        
    await waitFor(() => {
      expect(capturedErrorlogs).toContain("Error submitting order:");
    }, {timeout: 2000});
  });

  
  test('failed at submitting an order', async () => {
    // capture logs and alert since the implementation uses it 
    const capturedLogs = [];
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(message => {
      capturedLogs.push(message);
    });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // custom reponse to validate the error
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      text: () => Promise.resolve('Internal server error.')
    }));

    // fill in correct name and age
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: 'Sven' } });
    fireEvent.blur(screen.getByTestId('driverName'));
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '55' } });
    fireEvent.blur(screen.getByTestId('driverAge'));

    // Submit the order
    fireEvent.click(screen.getByText('Submit'))
    
    // check that it contains the expected strng
    await waitFor(() => {
      expect(capturedLogs).toContain("Failed to submit order.\nInternal server error.");
      expect(alertSpy).toHaveBeenCalledWith(
      "Failed to submit order. Please try again later.\n" +
      "{\n" +
      "  \"car\": \"Volkswagen Golf, 1333kr/day\",\n" +
      "  \"startDate\": \"2024-04-28T00:00:00.000Z\",\n" +
      "  \"endDate\": \"2024-04-29T00:00:00.000Z\",\n" +
      "  \"driverName\": \"Sven\",\n" +
      "  \"driverAge\": \"55\",\n" +
      "  \"totalPrice\": 1333\n" +
      "}"
      );
    }, {timeout: 2000});
  });


  test('error fetching orders', async () => {
    const capturedErrorlogs = [];
    //TODO Change to alert spy and check that alert is correct.
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(message => {
      capturedErrorlogs.push(message);
    });
    global.fetch = jest.fn(() => Promise.reject(new Error("503")));

    await act(async () => {
      render(
          <Rent />
      );
    });

    await waitFor(() => {
      expect(screen.getByText("No connection to database.")).toBeInTheDocument();
    }, {timeout: 2000});
  });


  test('with two gap-days, date 28 should be pickable', async () => {
    // Date() is 2024-04-19
    // 2024-04-20 Should be blocked even though its free since 2024-04-21 is start interval.
    // 2024-04-28 should be nextAvailableDate
    // 2024-04-29 should be nextMaxEnd
    const datePicker = screen.getByText((content, element) => {
      return element.type === 'text' && element.id === 'pickUpDate';
    });
    fireEvent.click(datePicker);

    const day28 = screen.getByText('28');
    fireEvent.click(day28);

    expect(day28).not.toHaveClass('react-datepicker__day--disabled');
    expect(day28).toHaveClass('react-datepicker__day--selected');
    expect(datePicker.value).toBe("04/28/2024");
  });


  test('with interval start tomorrow, today (20) should NOT be pickable', async () => {
    // Date() is 2024-04-19
    // 2024-04-20 Should be blocked even though its free since 2024-04-21 is start interval.
    // 2024-04-28 should be nextAvailableDate
    // 2024-04-29 should be nextMaxEnd
    const datePicker = screen.getByText((content, element) => {
      return element.type === 'text' && element.id === 'pickUpDate';
    });
    fireEvent.click(datePicker);

    const day20 = screen.getByText('20');
    expect(day20).toHaveClass('react-datepicker__day--disabled');
  });


  test('Blocked gap day, 2024-05-05 should NOT be pickable', async () => {
    const datePicker = screen.getByText((content, element) => {
      return element.type === 'text' && element.id === 'pickUpDate';
    });
    fireEvent.click(datePicker);
    const nextMonthButton = screen.getByLabelText('Next Month')
    fireEvent.click(nextMonthButton);

    const day5 = screen.getByText('5');
    expect(day5).toHaveClass('react-datepicker__day--disabled');
  });


  test('Next intervall, 2024-05-08 should be first nextAvailable', async () => {
    // Date() is 2024-04-19
    // 2024-04-20 Should be blocked even though its free since 2024-04-21 is start interval.
    // 2024-04-28 should be nextAvailableDate
    // 2024-04-29 should be nextMaxEnd
    const datePicker = screen.getByText((content, element) => {
      return element.type === 'text' && element.id === 'pickUpDate';
    });
    jest.clearAllMocks()
    fireEvent.click(datePicker);
    const nextMonthButton = screen.getByLabelText('Next Month')
    fireEvent.click(nextMonthButton);

    const day7 = screen.getByText('7');
    let day8 = screen.getByText('8');

    fireEvent.click(day8);

    // apparently i have to get day8 again for the classlist to update?
    fireEvent.click(datePicker);
    day8 = screen.getByText('8');

    expect(day8).not.toHaveClass('react-datepicker__day--disabled');
    expect(day8).toHaveClass('react-datepicker__day--selected');
    expect(day7).toHaveClass('react-datepicker__day--disabled');
  });


  test('default endDate and maxEndDate should be 2024-04-29', async () => {
    // Date() is 2024-04-19
    // 2024-04-20 Should be blocked even though its free since 2024-04-21 is start interval.
    // 2024-04-28 should be nextAvailableDate
    // 2024-04-29 should be nextMaxEnd
    const datePicker = screen.getByText((content, element) => {
      return element.type === 'text' && element.id === 'returnDate';
    });
    fireEvent.click(datePicker);

    const day29 = screen.getByText('29');
    const day30 = screen.getByText('30');
    expect(day29).not.toHaveClass('react-datepicker__day--disabled');
    expect(day29).toHaveClass('react-datepicker__day--selected');
    expect(day30).toHaveClass('react-datepicker__day--disabled');
  });

  
  test('MaxEndDate, ford transit last return date should be 2024-05-04', async () => {
    // change to ford transit
    const carSelector = screen.getByTestId('car-selector');
    const options = screen.getAllByRole('option');
    fireEvent.change(carSelector, { target: { value: options[2].value } });

    const datePicker = screen.getByText((content, element) => {
      return element.type === 'text' && element.id === 'returnDate';
    });
    // change to correct month
    fireEvent.click(datePicker);
    const nextMonthButton = screen.getByLabelText('Next Month')
    fireEvent.click(nextMonthButton);

    const day4 = screen.getByText('4');
    const day5 = screen.getByText('5');

    expect(day4).not.toHaveClass('react-datepicker__day--disabled');
    expect(day5).toHaveClass('react-datepicker__day--disabled');

    // should this be used instead?
    expect(day4).toHaveAttribute('aria-disabled', 'false');
    expect(day5).toHaveAttribute('aria-disabled', 'true');
  });

});