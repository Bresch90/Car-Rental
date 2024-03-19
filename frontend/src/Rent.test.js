import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Rent from './Rent';

describe('Rent component', () => {
    beforeEach(() => {
        render(
            <Rent />
        );
    });

  test('renders Rent component with initial state', () => {
    // Verifying text and form fields, tried a few ways to get it to work
    expect(screen.getByText(/Rent a car!/i)).toBeInTheDocument();
    expect(screen.getByText(/Pick up date:/i)).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
        return element.textContent === 'Return date: ' && element.tagName.toLowerCase() === 'label';
      })).toBeInTheDocument();
    expect(screen.getByTestId('driverName')).toBeInTheDocument();
    expect(screen.getByTestId('driverAge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  test('validates driver name input', async () => {
    // Changing driverName to blank space
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: ' ' } });
    fireEvent.blur(screen.getByTestId('driverName'));

    // Checking error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid name. Only letters and one spaces allowed./i)).toBeInTheDocument();
    });
  });
  

//   // Tried triggering the "Name is required!" error
//   test('validates driver name input', async () => {
//     // Changing driverName to blank space
//     fireEvent.change(screen.getByTestId('driverName'), { target: { value: ' ' } });
//     fireEvent.blur(screen.getByTestId('driverName'));
//     await waitFor(() => {
//         return screen.getByTestId('driverName').value.includes(" ");
//     }, { timeout: 3000 });
//     // expect(screen.getByTestId('driverName').value.includes(" ")).toBe(true);

//     fireEvent.change(screen.getByTestId('driverName'), { target: { value: '' } });
//     fireEvent.blur(screen.getByTestId('driverName'));

//     // Checking error message
//     await waitFor(() => {
//       expect(screen.getByText(/Name is required!/i)).toBeInTheDocument();
//     }, {timeout: 3000});
//   });

  test('validates driver age input', async () => {
    // Filling the form with an invalid age
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '15' } });
    fireEvent.blur(screen.getByTestId('driverAge'));

    // Verifying error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid age. Only 18\+ are allowed!/i)).toBeInTheDocument();
    });
  });

  test('Try submitting an order', async () => {
    // check if alert and error
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // fill in correct name and age
    fireEvent.change(screen.getByTestId('driverName'), { target: { value: 'Sven' } });
    fireEvent.blur(screen.getByTestId('driverName'));
    fireEvent.change(screen.getByTestId('driverAge'), { target: { value: '55' } });
    fireEvent.blur(screen.getByTestId('driverAge'));

    try {
        fireEvent.click(screen.getByText('Submit'))
    } catch (error) {
        expect(error.message).toBe('Error submitting order:');
    }

    await waitFor(() => {
    expect(alertSpy).toHaveBeenCalled();
    }, {timeout: 4000});

    errorSpy.mockRestore();

  });

});