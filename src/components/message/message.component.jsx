import React from 'react';

import './message.styles.scss'

// components
import Card from '../chatbot/card/card.component';
import QuickReply from '../chatbot/quick-reply/quick-reply.component';

const Message = ({ speaker, text, cards, quickReplies, handleQuickReply, cardStyle, qRStyle }) => (

    <div className="wrapper">
        {speaker === 'vchat' &&
            <div className={cardStyle ? "message-container-bot-cards" : "message-container-bot" && qRStyle ? "message-container-bot-quick-replies" : "message-container-bot"}>
                {
                    text &&
                    <div className="message-content">
                        <p>{text}</p>
                    </div>
                }
                {
                    cards &&
                    <>
                        <div className="cards-container">
                            {
                                cards.map((card, i) => {
                                    return <Card
                                        key={i}
                                        header={card.structValue.fields.header.stringValue}
                                        link={card.structValue.fields.link.stringValue}
                                        price={card.structValue.fields.price.stringValue}
                                        image={card.structValue.fields.image.stringValue}
                                        description={card.structValue.fields.description.stringValue}
                                    />
                                })
                            }
                        </div>
                        <p>Scroll For More Suggestions---></p>
                    </>
                }
                {
                    quickReplies &&
                    <div className="quick-replies-container">
                        {
                            quickReplies.map((quickReply, i) => {
                                return <QuickReply
                                    key={i}
                                    text={quickReply.structValue.fields.text.stringValue}
                                    payload={quickReply.structValue.fields.payload ?quickReply.structValue.fields.payload.stringValue : null}
                                    link={quickReply.structValue.fields.link ? quickReply.structValue.fields.link.stringValue : null}
                                    reactLink={quickReply.structValue.fields.reactLink ? quickReply.structValue.fields.reactLink.stringValue : null}
                                    handleQuickReply={handleQuickReply}
                                />
                            })
                        }
                    </div>
                }

            </div>
        }
        {
            speaker === 'me' &&
            <div className="message-container-user">
                <div className="message-content">
                    <p>{text}</p>
                </div>
            </div>
        }
    </div>
)

export default Message;