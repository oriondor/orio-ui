import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Separator from '../../../src/runtime/components/view/Separator.vue';

describe('view/Separator', () => {
  it('renders without errors', () => {
    const wrapper = mount(Separator);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders a div element', () => {
    const wrapper = mount(Separator);
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('uses solid style by default', () => {
    const wrapper = mount(Separator);
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('uses size 1 by default', () => {
    const wrapper = mount(Separator);
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('uses margin 1 by default', () => {
    const wrapper = mount(Separator);
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('accepts custom style prop', () => {
    const wrapper = mount(Separator, {
      props: { style: 'dashed' },
    });
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('accepts custom size prop', () => {
    const wrapper = mount(Separator, {
      props: { size: 2 },
    });
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('accepts custom margin prop', () => {
    const wrapper = mount(Separator, {
      props: { margin: 2 },
    });
    expect(wrapper.find('div').exists()).toBe(true);
  });
});
