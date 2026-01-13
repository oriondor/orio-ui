import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Input from '../../src/runtime/components/Input.vue';

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

describe('Input', () => {
  it('emits update when input value changes', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: '' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
        },
      },
    });

    await wrapper.find('input').setValue('Hello');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Hello']);
  });

  it('passes attributes to input element', () => {
    const wrapper = mount(Input, {
      attrs: { placeholder: 'Type here' },
      global: {
        stubs: {
          'orio-control-element': ControlStub,
        },
      },
    });

    expect(wrapper.find('input').attributes('placeholder')).toBe('Type here');
  });
});
