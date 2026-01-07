import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from '../../src/runtime/components/Icon.vue'

describe('Icon', () => {
  it('renders without errors', () => {
    const wrapper = mount(Icon, {
      props: { name: 'check' }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the correct icon from registry', () => {
    const wrapper = mount(Icon, {
      props: { name: 'check' }
    })
    expect(wrapper.html()).toContain('svg')
  })

  it('applies custom size as number', () => {
    const wrapper = mount(Icon, {
      props: { name: 'check', size: 24 }
    })
    const span = wrapper.find('.orio-icon')
    expect(span.attributes('style')).toContain('width: 24px')
    expect(span.attributes('style')).toContain('height: 24px')
  })

  it('applies custom size as string', () => {
    const wrapper = mount(Icon, {
      props: { name: 'check', size: '2rem' }
    })
    const span = wrapper.find('.orio-icon')
    expect(span.attributes('style')).toContain('width: 2rem')
    expect(span.attributes('style')).toContain('height: 2rem')
  })

  it('applies custom color', () => {
    const wrapper = mount(Icon, {
      props: { name: 'check', color: '#ff0000' }
    })
    const span = wrapper.find('.orio-icon')
    expect(span.attributes('style')).toContain('color: rgb(255, 0, 0)')
  })

  it('uses default size of 1em', () => {
    const wrapper = mount(Icon, {
      props: { name: 'check' }
    })
    const span = wrapper.find('.orio-icon')
    expect(span.attributes('style')).toContain('width: 1em')
  })

  it('uses currentColor as default color', () => {
    const wrapper = mount(Icon, {
      props: { name: 'check' }
    })
    const span = wrapper.find('.orio-icon')
    expect(span.attributes('style')).toContain('color: currentcolor')
  })

  it('renders empty when icon name not found', () => {
    const wrapper = mount(Icon, {
      props: { name: 'non-existent-icon' }
    })
    expect(wrapper.html()).not.toContain('svg')
  })
})
