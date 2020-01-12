import React from 'react';
import { shallow, mount, render } from 'enzyme';
import TypingDots from '../components/chatbot/typing-dots/typing-dots.component';

it('renders a card component', () => {
  expect(shallow(< TypingDots />)).toMatchSnapshot()
})