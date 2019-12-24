import React from 'react';

// sass
import './faq.styles.scss'

const Faq = () => (
    <div className="faq">
        <h1>
            Frequently Asked Questions
        </h1>
        <h3>What can i ask the Mrs?</h3>
        <p><strong>A:</strong> Anything! The MRS will usually have a handy response for your query though the main purpose is to help you find somewhere to eat! You can find some popular questions below.</p>
        <ul>
            <li>Do you have any reccommendations?</li>
            <li>I want some mexican food!</li>
            <li>Where are the best lunch spots?</li>
            <li>Where's a good place for a drink?</li>
        </ul>
    </div>
)

export default Faq;