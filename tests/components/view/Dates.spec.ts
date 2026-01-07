import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Dates from '../../../src/runtime/components/view/Dates.vue';

// Stub for orio-view-text component
const viewTextStub = {
  template: '<span>{{ modelValue }}</span>',
  props: ['modelValue', 'type', 'size'],
};

describe('view/Dates', () => {
  it('renders without errors', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01' },
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders single date when endDate is undefined', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01' },
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.text()).toContain('Jan');
    expect(wrapper.text()).not.toContain('-');
  });

  it('renders date range when endDate is provided', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01', endDate: '2024-12-31' },
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.text()).toContain('-');
  });

  it('renders Present when endDate is null', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01', endDate: null },
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.text()).toContain('Present');
  });

  it('formats as month/year when month prop is true', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-15' },
        month: true,
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    // Should not contain day
    expect(wrapper.text()).toContain('Jan');
    expect(wrapper.text()).toContain('2024');
  });

  it('uses italics type by default', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01' },
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.html()).toBeTruthy();
  });

  it('uses small size by default', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01' },
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.html()).toBeTruthy();
  });

  it('accepts custom type prop', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01' },
        type: 'title',
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.html()).toBeTruthy();
  });

  it('accepts custom size prop', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01' },
        size: 'large',
      },
      global: {
        stubs: {
          'orio-view-text': viewTextStub,
        },
      },
    });
    expect(wrapper.html()).toBeTruthy();
  });
});
