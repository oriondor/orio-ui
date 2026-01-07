import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Selector from '../../src/runtime/components/Selector.vue';

describe('Selector', () => {
  const stringOptions = ['Option 1', 'Option 2', 'Option 3'];

  const objectOptions = [
    { id: 1, name: 'First' },
    { id: 2, name: 'Second' },
    { id: 3, name: 'Third' },
  ];

  it('renders with string options', () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: null,
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-popover': true,
          'orio-empty-state': true,
          'orio-icon': true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders with object options', () => {
    const wrapper = mount(Selector, {
      props: {
        options: objectOptions,
        modelValue: null,
        field: 'id',
        optionName: 'name',
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-popover': true,
          'orio-empty-state': true,
          'orio-icon': true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders placeholder when no option is selected', () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: null,
        placeholder: 'Choose an option',
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-popover': true,
          'orio-empty-state': true,
          'orio-icon': true,
        },
      },
    });

    expect(wrapper.props('placeholder')).toBe('Choose an option');
  });

  it('supports multiple selection mode', () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: [],
        multiple: true,
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-popover': true,
          'orio-empty-state': true,
          'orio-icon': true,
        },
      },
    });

    expect(wrapper.props('multiple')).toBe(true);
  });

  it('renders with default field prop', () => {
    const wrapper = mount(Selector, {
      props: {
        options: objectOptions,
        modelValue: null,
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-popover': true,
          'orio-empty-state': true,
          'orio-icon': true,
        },
      },
    });

    expect(wrapper.props('field')).toBe('id');
  });

  it('renders with default placeholder', () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: null,
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-popover': true,
          'orio-empty-state': true,
          'orio-icon': true,
        },
      },
    });

    expect(wrapper.props('placeholder')).toBe('Select an option');
  });
});
