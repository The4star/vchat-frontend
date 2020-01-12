import React from 'react';
import { shallow, mount, render } from 'enzyme';
import Message from '../components/message/message.component';

it('renders a card component', () => {
  expect(shallow(< Message />)).toMatchSnapshot()
})