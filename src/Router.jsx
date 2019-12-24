import React from 'react';
import {Route, Switch} from 'react-router-dom';

import './router.styles.scss'

// components
import Landing from './pages/landing/landing.component';
import About from './pages/about/about.component';
import Faq from './components/faq/faq.component'
import Header from './components/header/header.component';
import Chatbot from './components/chatbot/chatbot.component';

const Router = () => (
    <>
        <Header />
        <Switch>
                <Route exact path='/' component={Landing} />
                <Route exact path='/about' component={About} />
                <Route exact path='/faq' component={Faq} />  
        </Switch>
        <Chatbot />
    </>
)

export default Router;