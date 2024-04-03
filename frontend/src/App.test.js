import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App component', () => {
  test('renders top bar with correct text', () => {
    render(<App />);
    const topBarElement = screen.getByText(/Car rental/i);
    expect(topBarElement).toBeInTheDocument();
  });

  test('renders Home component by default', () => {
    render(<App />);
    const homeElement = screen.getByText(/Please visit \/rent or \/admin/i);
    expect(homeElement).toBeInTheDocument();
  });

  test('renders Rent component when "/rent" link is clicked', () => {
    render(<App />);
    
    const rentLink = screen.getByRole('link', { name: /\/rent/i });
    userEvent.click(rentLink);
    const rentElement = screen.getByText(/Rent a car!/i);
    expect(rentElement).toBeInTheDocument();
  });

  test('renders Admin component when "/admin" link is clicked', () => {
    // Had to use this funky way of pushing a state since i use router in my App.js
    // Because of this i cant use memoryRouter and when changing to /rent in previous test its stuck there.
    window.history.pushState({}, 'App', '/'); 
    render(<App />);
    
    expect(window.location.pathname).toBe('/');
    // had a hard time getting that /admin link. This is not perfekt if the structure changes.
    const adminHits = screen.getAllByText(/\/admin/);
    userEvent.click(adminHits[1]);

    const adminElement = screen.getByText(/Delete All Orders/i);
    expect(adminElement).toBeInTheDocument();
  });
});
