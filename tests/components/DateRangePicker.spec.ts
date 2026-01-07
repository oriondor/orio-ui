import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DateRangePicker from '../../src/runtime/components/DateRangePicker.vue';
import type { ResumeDate } from '../../src/runtime/components/view/Dates.vue';

describe('DateRangePicker', () => {
  const defaultDates: ResumeDate = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  };

  it('renders with default dates', () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        dates: defaultDates,
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-date-picker': true,
          'orio-check-box': true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders month prop correctly', () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        dates: defaultDates,
        month: true,
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-date-picker': true,
          'orio-check-box': true,
        },
      },
    });

    expect(wrapper.props('month')).toBe(true);
  });

  it('does not show error when start date is before end date', () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        dates: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-date-picker': true,
          'orio-check-box': true,
        },
      },
    });

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('shows error when start date is after end date', async () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        dates: {
          startDate: '2024-12-31',
          endDate: '2024-01-01',
        },
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-date-picker': true,
          'orio-check-box': true,
        },
      },
    });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toContain('Start date must be before end date');
  });

  it('does not show error when end date is null (present)', () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        dates: {
          startDate: '2024-01-01',
          endDate: null,
        },
      },
      global: {
        stubs: {
          'orio-control-element': true,
          'orio-date-picker': true,
          'orio-check-box': true,
        },
      },
    });

    expect(wrapper.find('.error-message').exists()).toBe(false);
  });
});
