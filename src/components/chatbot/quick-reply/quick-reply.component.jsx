import React from 'react';

import './quick-reply.styles.scss';

const QuickReply = ({text, payload, link, reactLink, handleQuickReply}) => (
    <div className="quick-reply">
        {
            payload ?
            <button onClick={() => handleQuickReply(text, payload)}>{text}</button>
            : 
            link && <a href={link} target="_blank" rel="noopener noreferrer"><button>{text}</button></a> 

        }
    </div>
)

export default QuickReply;