import React from 'react';
import { shallow, mount, render } from 'enzyme';
import Chatbot from '../components/chatbot/chatbot.component';
// import Message from '../components/message/message.component'
 const wrapper = shallow(<Chatbot />)

it('renders the chatbot component', () => {
  expect(wrapper).toMatchSnapshot()
})

describe('function testing', () => {
  it('toggles the bot from hidden to showing', () => {
    expect(wrapper.instance().state.hidden).toEqual(true)
    wrapper.instance().toggleBot()
    expect(wrapper.instance().state.hidden).toEqual(false)
  })

  it('performs a text query', () => {
    wrapper.instance().textQuery('hi')
    expect(wrapper.instance().state.messages.length).toEqual(1)
    // console.log(wrapper.instance().state.messages)
  })
  
  it('renders messages', () => {
   expect(wrapper.instance().renderMessages([ { speaker: 'me', msg: 'hi' }  ])).toHaveLength(1)
   expect(wrapper.instance().renderMessages([ { speaker: 'me', msg: 'hi' }, { speaker: 'vchat', msg: 'hi, im vchat' }  ])).toHaveLength(2)
  })
})