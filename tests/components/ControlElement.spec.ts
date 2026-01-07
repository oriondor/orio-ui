import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ControlElement from '../../src/runtime/components/ControlElement.vue'

describe('ControlElement', () => {
  it('renders without errors', () => {
    const wrapper = mount(ControlElement)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(ControlElement, {
      slots: { default: '<input type="text" />' }
    })
    expect(wrapper.html()).toContain('input')
  })

  it('renders label when provided', () => {
    const wrapper = mount(ControlElement, {
      attrs: { label: 'Username' },
      slots: { default: '<input type="text" />' }
    })
    expect(wrapper.find('.control-label').text()).toBe('Username')
  })

  it('does not render label when not provided', () => {
    const wrapper = mount(ControlElement, {
      slots: { default: '<input type="text" />' }
    })
    expect(wrapper.find('.control-label').exists()).toBe(false)
  })

  it('applies normal appearance by default', () => {
    const wrapper = mount(ControlElement)
    expect(wrapper.find('.control').classes()).toContain('normal')
  })

  it('applies minimal appearance when specified', () => {
    const wrapper = mount(ControlElement, {
      props: { appearance: 'minimal' }
    })
    expect(wrapper.find('.control').classes()).toContain('minimal')
  })

  it('passes attributes to slot-wrapper', () => {
    const wrapper = mount(ControlElement, {
      attrs: { 'data-test': 'custom' },
      slots: { default: '<input />' }
    })
    expect(wrapper.find('.slot-wrapper').attributes('data-test')).toBe('custom')
  })
})
