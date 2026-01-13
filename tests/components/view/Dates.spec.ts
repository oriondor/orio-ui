import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Dates from '../../../src/runtime/components/view/Dates.vue';

const ViewTextStub = {
  template:
    '<span class="view-text" :data-type="type" :data-size="size">{{ modelValue }}</span>',
  props: ['modelValue', 'type', 'size'],
};

describe('view/Dates', () => {
  it('renders a single date when endDate is undefined', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01' },
      },
      global: {
        stubs: {
          'orio-view-text': ViewTextStub,
        },
      },
    });

    expect(wrapper.findAll('.view-text')).toHaveLength(1);
  });

  it('renders Present when endDate is null', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01', endDate: null },
      },
      global: {
        stubs: {
          'orio-view-text': ViewTextStub,
        },
      },
    });

    expect(wrapper.text()).toContain('Present');
  });

  it('passes type and size to view text', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-01', endDate: '2024-02-01' },
        type: 'title',
        size: 'large',
      },
      global: {
        stubs: {
          'orio-view-text': ViewTextStub,
        },
      },
    });

    const items = wrapper.findAll('.view-text');
    expect(items[0].attributes('data-type')).toBe('title');
    expect(items[0].attributes('data-size')).toBe('large');
  });

  it('formats month and year when month is true', () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { startDate: '2024-01-15' },
        month: true,
      },
      global: {
        stubs: {
          'orio-view-text': ViewTextStub,
        },
      },
    });

    expect(wrapper.text()).toContain('2024');
    expect(wrapper.text()).not.toContain(',');
  });
});
