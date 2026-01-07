import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSpinner from '../../src/runtime/components/LoadingSpinner.vue';

describe('LoadingSpinner', () => {
  it('renders without errors', () => {
    const wrapper = mount(LoadingSpinner, {
      global: {
        stubs: {
          'orio-icon': {
            template: '<span class="icon-stub">loading</span>',
          },
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders an icon component', () => {
    const wrapper = mount(LoadingSpinner, {
      global: {
        stubs: {
          'orio-icon': {
            template: '<span class="icon-stub">loading</span>',
            props: ['name'],
          },
        },
      },
    });
    expect(wrapper.html()).toContain('loading');
  });
});
