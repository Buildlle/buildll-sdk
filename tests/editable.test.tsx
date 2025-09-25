import { render } from '@testing-library/react';
import { EditableText, useBuildllEditable } from '../src';
import { useRef } from 'react';

describe('EditableText', () => {
  it('renders with correct attributes', () => {
    const { container } = render(
      <EditableText id="test-id" tag="h1" className="test-class">
        Test Content
      </EditableText>
    );

    const element = container.querySelector('h1');
    expect(element).toBeTruthy();
    expect(element?.getAttribute('data-buildll-id')).toBe('test-id');
    expect(element?.getAttribute('data-buildll-text')).toBe('Test Content');
    expect(element?.getAttribute('data-buildll-type')).toBe('text');
    expect(element?.className).toBe('test-class');
    expect(element?.textContent).toBe('Test Content');
  });

  it('defaults to p tag when no tag specified', () => {
    const { container } = render(
      <EditableText id="test-id">Test Content</EditableText>
    );

    const element = container.querySelector('p');
    expect(element).toBeTruthy();
  });
});

describe('useBuildllEditable', () => {
  it('adds correct attributes to element', () => {
    function TestComponent() {
      const ref = useBuildllEditable('test-id', 'Test Text');
      return <div ref={ref}>Test Text</div>;
    }

    const { container } = render(<TestComponent />);
    const element = container.querySelector('div');

    expect(element?.getAttribute('data-buildll-id')).toBe('test-id');
    expect(element?.getAttribute('data-buildll-text')).toBe('Test Text');
    expect(element?.getAttribute('data-buildll-type')).toBe('text');
  });

  it('allows custom type', () => {
    function TestComponent() {
      const ref = useBuildllEditable('test-id', 'Test Text', 'custom');
      return <div ref={ref}>Test Text</div>;
    }

    const { container } = render(<TestComponent />);
    const element = container.querySelector('div');

    expect(element?.getAttribute('data-buildll-type')).toBe('custom');
  });
});