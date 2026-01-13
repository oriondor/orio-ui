import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '../../src/runtime/components/Button.vue';

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ['name'],
};

const LoadingStub = {
  template: '<span class="loading-stub"></span>',
};

describe('Button', () => {
  it('emits click when enabled and not loading', async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { onClick },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
          'orio-loading-spinner': LoadingStub,
        },
      },
    });

    await wrapper.find('button').trigger('click');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit click when disabled', async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { disabled: true, onClick },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
          'orio-loading-spinner': LoadingStub,
        },
      },
    });

    await wrapper.find('button').trigger('click');

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not emit click when loading', async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { loading: true, onClick },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
          'orio-loading-spinner': LoadingStub,
        },
      },
    });

    await wrapper.find('button').trigger('click');

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders loading spinner instead of icon while loading', () => {
    const wrapper = mount(Button, {
      props: { loading: true, icon: 'check' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
          'orio-loading-spinner': LoadingStub,
        },
      },
    });

    expect(wrapper.find('.loading-stub').exists()).toBe(true);
    expect(wrapper.find('.icon-stub').exists()).toBe(false);
  });

  it('applies icon-only class when only icon is rendered', () => {
    const wrapper = mount(Button, {
      props: { icon: 'check' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
          'orio-loading-spinner': LoadingStub,
        },
      },
    });

    expect(wrapper.find('button').classes()).toContain('icon-only');
  });

  it('applies variant class', () => {
    const wrapper = mount(Button, {
      props: { variant: 'secondary' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
          'orio-loading-spinner': LoadingStub,
        },
      },
    });

    expect(wrapper.find('button').classes()).toContain('secondary');
  });
});
