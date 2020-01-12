import React from 'react';
import { shallow, mount, render } from 'enzyme';
import Card from '../components/chatbot/card/card.component';

it('renders a card component', () => {
  expect(shallow(< Card />)).toMatchSnapshot()
})