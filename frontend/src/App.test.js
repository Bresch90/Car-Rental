import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import App from './App';


describe('App component', () => {
  // beforeEach(() => {
  //   render(
  //       <App />
  //   );
  // });

  test('renders top bar with correct text', () => {
    const history = createMemoryHistory();
    render(
      <App history={history} />
    );
    const topBarElement = screen.getByText(/Fortnox/i);
    expect(topBarElement).toBeInTheDocument();
  });

  test('renders Home component by default', () => {
    const history = createMemoryHistory();
    render(
      <App history={history} />
    );
    const homeElement = screen.getByText(/Please visit \/rent or \/admin/i);
    expect(homeElement).toBeInTheDocument();
  });

  test('renders Rent component when "/rent" route is accessed', () => {
    const history = createMemoryHistory();
    render(
      <App history={history} />
    );
    const rentLink = screen.getByRole('link', { name: /\/rent/i });
    userEvent.click(rentLink);
    const rentElement = screen.getByText(/Rent a car!/i);
    expect(rentElement).toBeInTheDocument();
  });

  test('renders Admin component when "/admin" route is accessed', () => {
    const history = createMemoryHistory();
    render(
      <App history={history} />
    );
    // const adminLink = screen.getByRole('link', { name: /\/admin/i });
    const adminLink = screen.getByRole('link', {name: /\/(?! )admin/i });
    userEvent.click(adminLink);
    const adminElement = screen.getByText(/Delete All Orders/i);
    expect(adminElement).toBeInTheDocument();
  });
});