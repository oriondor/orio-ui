import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NavButton from '../../src/runtime/components/NavButton.vue';

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ['name'],
};

describe('NavButton', () => {
  it('emits click when enabled', async () => {
    const onClick = vi.fn();
    const wrapper = mount(NavButton, {
      props: { onClick },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
        },
      },
    });

    await wrapper.find('button').trigger('click');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit click when disabled', async () => {
    const onClick = vi.fn();
    const wrapper = mount(NavButton, {
      props: { disabled: true, onClick },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
        },
      },
    });

    await wrapper.find('button').trigger('click');

    expect(onClick).not.toHaveBeenCalled();
  });

  it('marks active state and aria-current', () => {
    const wrapper = mount(NavButton, {
      props: { active: true },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
        },
      },
    });

    const button = wrapper.find('button');
    expect(button.classes()).toContain('active');
    expect(button.attributes('aria-current')).toBe('page');
  });

  it('applies icon-only class when only icon is rendered', () => {
    const wrapper = mount(NavButton, {
      props: { icon: 'home' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
        },
      },
    });

    expect(wrapper.find('button').classes()).toContain('icon-only');
  });
});
