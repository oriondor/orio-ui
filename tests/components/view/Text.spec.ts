import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Text from '../../../src/runtime/components/view/Text.vue';

describe('view/Text', () => {
  it('renders without errors', () => {
    const wrapper = mount(Text);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders slot content', () => {
    const wrapper = mount(Text, {
      slots: { default: 'Hello World' },
    });
    expect(wrapper.text()).toContain('Hello World');
  });

  it('renders modelValue when no slot provided', () => {
    const wrapper = mount(Text, {
      props: { modelValue: 'Test Value' },
    });
    expect(wrapper.text()).toContain('Test Value');
  });

  it('applies text type by default', () => {
    const wrapper = mount(Text);
    expect(wrapper.find('div').classes()).toContain('text');
  });

  it('applies title type when specified', () => {
    const wrapper = mount(Text, {
      props: { type: 'title' },
    });
    expect(wrapper.find('div').classes()).toContain('title');
  });

  it('applies medium size by default', () => {
    const wrapper = mount(Text);
    expect(wrapper.find('div').classes()).toContain('medium');
  });

  it('applies large size when specified', () => {
    const wrapper = mount(Text, {
      props: { size: 'large' },
    });
    expect(wrapper.find('div').classes()).toContain('large');
  });

  it('applies uppercase class when specified', () => {
    const wrapper = mount(Text, {
      props: { uppercase: true },
    });
    expect(wrapper.find('div').classes()).toContain('uppercase');
  });

  it('renders icon when provided', () => {
    const wrapper = mount(Text, {
      props: { icon: 'check' },
      global: {
        stubs: {
          'orio-icon': {
            template: '<span class="icon">icon</span>',
            props: ['name'],
          },
        },
      },
    });
    expect(wrapper.html()).toContain('icon');
  });

  it('applies line clamp class when lineClamp provided', () => {
    const wrapper = mount(Text, {
      props: { lineClamp: 3 },
    });
    expect(wrapper.find('div').classes()).toContain('clamp');
  });

  it('passes attributes to wrapper div', () => {
    const wrapper = mount(Text, {
      attrs: { 'data-test': 'custom' },
    });
    expect(wrapper.find('div').attributes('data-test')).toBe('custom');
  });
});
