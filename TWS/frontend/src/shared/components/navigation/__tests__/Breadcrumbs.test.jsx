/**
 * Tests for Breadcrumbs component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Breadcrumbs', () => {
  it('should render custom breadcrumb items', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Projects', path: '/projects' },
      { label: 'Current Page', path: '/projects/123' }
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('should render separators between items', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Projects', path: '/projects' }
    ];

    const { container } = renderWithRouter(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll('[aria-hidden="true"]');

    expect(separators.length).toBeGreaterThan(0);
  });

  it('should use custom separator', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Projects', path: '/projects' }
    ];

    const { container } = renderWithRouter(<Breadcrumbs items={items} separator=">" />);
    
    expect(container.textContent).toContain('>');
  });

  it('should render single item without separator', () => {
    const items = [{ label: 'Home', path: '/' }];

    const { container } = renderWithRouter(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll('[aria-hidden="true"]');

    expect(separators.length).toBe(0);
  });

  it('should render empty breadcrumbs gracefully', () => {
    const { container } = renderWithRouter(<Breadcrumbs items={[]} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const items = [{ label: 'Home', path: '/' }];
    const { container } = renderWithRouter(<Breadcrumbs items={items} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render links for non-last items', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Projects', path: '/projects' }
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render last item as text (not link)', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Projects', path: '/projects' }
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    const projectsText = screen.getByText('Projects');
    expect(projectsText.closest('a')).toBeNull();
  });

  it('should handle items without path', () => {
    const items = [
      { label: 'Home' },
      { label: 'Current' }
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should have proper ARIA navigation role', () => {
    const items = [{ label: 'Home', path: '/' }];
    const { container } = renderWithRouter(<Breadcrumbs items={items} />);

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});
