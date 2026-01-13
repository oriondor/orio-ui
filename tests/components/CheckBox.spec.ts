import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CheckBox from '../../src/runtime/components/CheckBox.vue';

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ['name'],
};

describe('CheckBox', () => {
  it('emits update when toggled', async () => {
    const wrapper = mount(CheckBox, {
      props: { modelValue: false },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
        },
      },
    });

    await wrapper.find('input').setChecked();

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('renders checked icon when checked', () => {
    const wrapper = mount(CheckBox, {
      props: { modelValue: true, checkedIcon: 'check' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
        },
      },
    });

    const icon = wrapper.find('.icon-stub');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('data-name')).toBe('check');
  });

  it('renders unchecked icon when unchecked', () => {
    const wrapper = mount(CheckBox, {
      props: { modelValue: false, uncheckedIcon: 'close' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
          'orio-icon': IconStub,
        },
      },
    });

    const icon = wrapper.find('.icon-stub');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('data-name')).toBe('close');
  });
});
