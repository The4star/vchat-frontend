import React from 'react';
import { shallow, mount, render } from 'enzyme';
import QuickReply from '../components/chatbot/quick-reply/quick-reply.component';

it('renders a card component', () => {

  expect(shallow(< QuickReply />)).toMatchSnapshot()
})