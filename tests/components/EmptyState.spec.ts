import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmptyState from '../../src/runtime/components/EmptyState.vue';

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ['name'],
};

const ViewTextStub = {
  template: '<span class="view-text"><slot /></span>',
};

describe('EmptyState', () => {
  it('renders title, description, and icon', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No items',
        description: 'Try again later',
        icon: 'inbox',
        size: 'large',
      },
      global: {
        stubs: {
          'orio-icon': IconStub,
          'orio-view-text': ViewTextStub,
        },
      },
    });

    expect(wrapper.text()).toContain('No items');
    expect(wrapper.text()).toContain('Try again later');
    expect(wrapper.find('.icon-stub').exists()).toBe(true);
    expect(wrapper.find('.empty-state').classes()).toContain('large');
  });

  it('defaults to medium size', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Nothing here',
      },
      global: {
        stubs: {
          'orio-icon': IconStub,
          'orio-view-text': ViewTextStub,
        },
      },
    });

    expect(wrapper.find('.empty-state').classes()).toContain('medium');
  });
});
