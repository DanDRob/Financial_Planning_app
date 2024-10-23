import { FinancialPlanner } from '@/components/FinancialPlanner';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { mockMarketData, mockPortfolioData } from '../mocks';

describe('FinancialPlanner Component', () => {
  beforeEach(() => {
    render(<FinancialPlanner />);
  });

  test('renders all main tabs', () => {
    expect(screen.getByText('Data Input')).toBeInTheDocument();
    expect(screen.getByText('Risk Profile')).toBeInTheDocument();
    expect(screen.getByText('Monte Carlo')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Tax Strategy')).toBeInTheDocument();
  });

  test('handles portfolio optimization', async () => {
    const optimizeButton = screen.getByText('Optimize Portfolio');
    await userEvent.click(optimizeButton);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Optimized')).toBeInTheDocument();
    });
  });

  test('updates portfolio data on input change', async () => {
    const investmentInput = screen.getByLabelText('Initial Investment');
    await userEvent.type(investmentInput, '100000');

    expect(investmentInput).toHaveValue(100000);
  });

  test('displays error message on API failure', async () => {
    // Mock API failure
    server.use(
      rest.post('/api/optimize', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const optimizeButton = screen.getByText('Optimize Portfolio');
    await userEvent.click(optimizeButton);

    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
  });
});