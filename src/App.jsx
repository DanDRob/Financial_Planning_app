import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';
import { FinancialPlanner } from './components/FinancialPlanner';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a href="/" className="mr-6 flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="font-bold">Financial Planner</span>
                </a>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="container py-6">
              <FinancialPlanner />
            </div>
          </main>

          <footer className="border-t">
            <div className="container flex h-14 items-center">
              <p className="text-sm text-muted-foreground">
                Built with React and Tailwind CSS
              </p>
            </div>
          </footer>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;