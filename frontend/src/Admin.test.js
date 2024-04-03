import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Rent from './Admin';
import { advanceTo, clear } from 'jest-date-mock';

describe('Admin component', () => {
  let originalFetch;
  // let capturedLogs = [];


  beforeEach(async () => {
    // const consoleSpy = jest.spyOn(console, 'log').mockImplementation(message => {
    //   capturedLogs.push(message);
    // });
    // const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    //mocks date
    advanceTo(new Date('2024-04-19'));

    // mock fetch call
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
    // act() because state update when mounting?
    await act(async () => {
      render(
          <Rent />
      );
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    // capturedLogs = [];
    // clears datemock
    clear();
  });

  
  test('renders Admin component with initial state', () => {
      expect(screen.getByText('Driver name')).toBeInTheDocument();
      expect(screen.getByText('Car')).toBeInTheDocument();
      expect(screen.getByText('From date')).toBeInTheDocument();
      expect(screen.getByText('To date')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText(/Total Revenue = /)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete All Orders/ })).toBeInTheDocument();
    });


  test('test that revenue renders', async () => {
    const totalRevenue = screen.getByText(/Total Revenue = /);

    await waitFor(() => {
        expect(totalRevenue.textContent).toContain('57');
        expect(totalRevenue.textContent).toContain('996');
        // seems to render as <h2>Total Revenue = 57&nbsp;996 SEK</h2>? regex because of this.
        expect(totalRevenue.textContent).toMatch(/Total Revenue\s*=\s*57\s*996\s*SEK/);
        // but this worked?
        expect(totalRevenue).toHaveTextContent("Total Revenue = 57 996 SEK");
    }, {timeout: 3000});
  });


  test('Check that row 0 values are correct', async () => {
    const table = screen.getByRole('table').querySelector('tbody');
    await waitFor(() => {
      const rows = table.querySelectorAll('tr');
      expect(rows[0]).toHaveTextContent('twentyTotwentySeven');
      expect(rows[0]).toHaveTextContent('Volkswagen Golf');
      expect(rows[0]).toHaveTextContent('2024-04-20');
      expect(rows[0]).toHaveTextContent('2024-04-27');
      expect(rows[0]).toHaveTextContent('9 331 SEK');
    }, {timeout: 2000});
  });


  test('Check that row 1 values are correct', async () => {
    const table = screen.getByRole('table').querySelector('tbody');
    await waitFor(() => {
      const rows = table.querySelectorAll('tr');
      expect(rows[1]).toHaveTextContent('twentyeightShouldBeFree');
      expect(rows[1]).toHaveTextContent('Volkswagen Golf');
      expect(rows[1]).toHaveTextContent('2024-04-30');
      expect(rows[1]).toHaveTextContent('2024-05-04');
      expect(rows[1]).toHaveTextContent('5 332 SEK');
    }, {timeout: 2000});
  });


  test('delete all orders', async () => {
    const deleteAllButton = screen.getByRole('button', { name: /Delete All Orders/ });
    fireEvent.click(deleteAllButton);

    await waitFor(() => {
      expect(screen.getByText('All orders successfully deleted.')).toBeInTheDocument();
    }, {timeout: 2000});
  });


  test('fail to delete orders', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false
    }));

    const deleteAllButton = screen.getByRole('button', { name: /Delete All Orders/ });
    fireEvent.click(deleteAllButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete orders.')).toBeInTheDocument();
    }, {timeout: 2000});
    
  });


  test('error when deleting orders', async () => {
    //only since the implementation writes to the console
    const capturedErrorlogs = [];
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(message => {
      capturedErrorlogs.push(message);
    });

    // give an empty response
    global.fetch = jest.fn(() => Promise.resolve());
    // wanted to throw error but it didnt seem to get caught?
    // global.fetch = jest.fn(() => Promise.reject(new Error('Fetch failed')));

    const deleteAllButton = screen.getByRole('button', { name: /Delete All Orders/ });
    await act(async () => {
      fireEvent.click(deleteAllButton);
    });
    await waitFor(() => {
      expect(capturedErrorlogs).toContain("Error deleting orders:");
    }, {timeout: 2000});
  });

});