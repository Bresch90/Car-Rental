import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from './Home';

describe('Home component', () => {
  beforeEach(() => {
    render(
        <Router>
            <Home />
        </Router>
    );
  });

  test('renders Home component with correct content', () => {
    const paragraphElement = screen.getByText(/Please visit \/rent or \/admin/i);
    expect(paragraphElement).toBeInTheDocument();

    const rentLink = screen.getByRole('link', { name: /\/rent/i });
    expect(rentLink).toBeInTheDocument();

    const adminLink = screen.getByRole('link', { name: /\/admin/i });
    expect(adminLink).toBeInTheDocument();
  });

  test('redirects to /rent when rent link is clicked', () => {
    const rentLink = screen.getByText('/rent');
    userEvent.click(rentLink);
    expect(window.location.pathname).toBe('/rent');
  });
  

  test('redirects to /admin when admin link is clicked', () => {
    const adminLink = screen.getByText('/admin');
    userEvent.click(adminLink);
    expect(window.location.pathname).toBe('/admin');
  });
});
