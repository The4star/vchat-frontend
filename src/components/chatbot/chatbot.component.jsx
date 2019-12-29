import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {v4 as uuid} from 'uuid';

// components
import Message from '../message/message.component'
import TypingDots from './typing-dots/typing-dots.component'

// sass
import './chatbot.styles.scss'

// site where live chat bot is deployed set in src/helpers/deployed-url
import deployedUrl from '../../helpers/deployed-url'

const cookies = new Cookies();

class Chatbot extends React.Component {
    messagesEnd;
    constructor(props) {
        super(props) 
        
        this.state = {
            messages: [],
            hidden: true,
            hideDots: true
        }

        if (cookies.get('userId') === undefined) {
          cookies.set('userId', uuid(), {path: '/'})  
        }
    }
    resolveAfterXSeconds = (x) => {
        return new Promise((resolve, reject) => {
            setTimeout(() =>{ 
             resolve(x);   
            }, x * 1000)
        })
    }
    componentDidMount = async () => {
        await this.getChatHistory();
    }

    componentDidUpdate = () => {
        this.messagesEnd.scrollIntoView({behaviour: 'smooth'})
    }
    
    getChatHistory = async () => {
      const response = await axios.post('https://1vex996e96.execute-api.us-east-1.amazonaws.com/dev/api/df_get_chat_history', {userId: cookies.get('userId')})
      const data = response.data 
      
      if(data.previousSession && data.response.messages.length > 0) {
        console.log(data.response.messages.length)
        this.setState({messages: [...data.response.messages]});
      } else {
        await this.eventQuery('Welcome');
      }
    }

    textQuery = async (text) => {

        try {
            let message = {
                speaker: 'me',
                msg: text
            }

            this.setState({messages: [...this.state.messages, message]})

            const res = await axios.post('https://1vex996e96.execute-api.us-east-1.amazonaws.com/dev/api/df_text_query', {text, userId: cookies.get('userId')})
            const allMessages = [];
            const botMessages = res.data.fulfillmentMessages; 
            const payloads = res.data.webhookPayload;
  
            if (botMessages && botMessages[0] && botMessages[0].text && botMessages[0].text.text) {
                const splitMessages = botMessages[0].text.text[0].split(".", 5)
                splitMessages.map(splitMessage => {
                    if (splitMessage.length  > 1) {
                        let message = {
                        speaker: 'vchat',
                        msg:splitMessage
                        }
                        allMessages.push(message)  
                    }
                    return allMessages
                })
            }
            if (payloads && payloads.fields && payloads.fields.cards) {
                let message = {
                    speaker: 'vchat',
                    cards: payloads.fields.cards.listValue.values
                }
                allMessages.push(message)
            }

            if (payloads && payloads.fields && payloads.fields.quickReplies) {
                let message = {
                    speaker: 'vchat',
                    quickReplies: payloads.fields.quickReplies.listValue.values
                }
                allMessages.push(message)
            }

            const printMessageswithdelay = async (messageToPrint) => {
                const messageAmount = allMessages.length 
                
                if (messageToPrint === messageAmount) {
                    this.setState({ hideDots: true })
                    return
                } else {
                    if (messageToPrint !== 0) {
                        await this.resolveAfterXSeconds(2)
                    } 
                    this.setState({ messages: [...this.state.messages, allMessages[messageToPrint]] })
                    messageToPrint += 1
                    printMessageswithdelay(messageToPrint)
                }
                
            }
            printMessageswithdelay(0)
        } catch (error) {
            console.log(error)
        }
        
    }

    eventQuery = async (event) => {
        try {
            const res = await axios.post('https://1vex996e96.execute-api.us-east-1.amazonaws.com/dev/api/df_event_query', {event, userId: cookies.get('userId')})
            const allMessages = []
            const botMessages = res.data.fulfillmentMessages 
            const payloads = res.data.webhookPayload
            
            if (botMessages && botMessages[0] && botMessages[0].text && botMessages[0].text.text) {
                    const splitMessages = botMessages[0].text.text[0].split(".", 5)
                    splitMessages.map(splitMessage => {
                        if (splitMessage.length  > 1) {
                            let message = {
                            speaker: 'vchat',
                            msg:splitMessage
                            }
                            allMessages.push(message)  
                        }
                        return allMessages
                    })
            }
            // add card message
            if (payloads && payloads.fields && payloads.fields.cards) {
                let message = {
                    speaker: 'vchat',
                    cards: payloads.fields.cards.listValue.values
                }
                allMessages.push(message)
            }
            // add quick reply message
            if (payloads && payloads.fields && payloads.fields.quickReplies) {
                let message = {
                    speaker: 'vchat',
                    quickReplies: payloads.fields.quickReplies.listValue.values
                }
                allMessages.push(message)
            }
            
            this.setState({hideDots: false})
            const printMessageswithdelay = async (messageToPrint) => {
                const messageAmount = allMessages.length 
                
                if (messageToPrint === messageAmount) {
                    this.setState({ hideDots: true })
                    return
                } else {
                    if (messageToPrint !== 0) {
                        await this.resolveAfterXSeconds(2)
                    } 
                    this.setState({ messages: [...this.state.messages, allMessages[messageToPrint]] })
                    messageToPrint += 1
                    printMessageswithdelay(messageToPrint)
                }  
            }
            
            printMessageswithdelay(0)
        } catch (error) {
            console.log(error)
        }

    }

    renderMessages = (stateMessages) => {
        if(stateMessages) {
            return stateMessages.map((message, i) => {
                if (message.msg) {
                   return <Message key={i} speaker={message.speaker} text={message.msg} /> 
                } else if (message.cards)  {
                    return <Message key={i} speaker={message.speaker} cards={message.cards} cardStyle/> 
                } else {
                    return <Message key={i} speaker={message.speaker} quickReplies={message.quickReplies} handleQuickReply={this.handleQuickReply} qRStyle/> 
                }
                
            })
        } else {
            return null
        }
    }

    handleQuickReply = (text, payload) => {
        this.setState({hideDots: false })
        this.textQuery(payload);
    }

    toggleBot = () => {
        this.setState({hidden: !this.state.hidden})
    }

    handleSubmit = async(e) => {
        e.preventDefault()
        let submission = e.target.children[0]
        if (submission.value !== '') {
          this.setState({hideDots: false})
           this.textQuery(submission.value)
            submission.value = '' 
        } else {
            return
        }
        
    }
    
    render() {
        const { messages, hideDots } = this.state
        if (this.state.hidden) {
            return (
                <div className="hidden-chatbot" onClick={() => this.toggleBot()} >
                    <div className="logo-only">
                        <img className="logo-hider" src={`${deployedUrl}/img/logo.jpg`} alt="logo"/>
                        <div ref={(el) => this.messagesEnd = el}></div>
                    </div>
                </div>     
            )   
        } else {
            return(
                <div className="chatbot">
                    <div className="main-title">
                        <div className="logowrapper">
                          <img src={`${deployedUrl}/img/logo.jpg`} alt="logo"/>  
                        </div>
                        <div className="text">
                            <p className="close-button" onClick={() => this.toggleBot()}>
                                Close
                            </p>  
                        </div>
                    </div>
                        <div className="messages-container">
                        {
                            this.renderMessages(messages)
                        }
                        {
                           hideDots ?
                           null :
                           <TypingDots /> 
                        }
                        
                        <div ref={(el) => this.messagesEnd = el}></div>
                    </div>
                
                    <form className="input-form" onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="Type a message..." className="user-input" />  
                    <button type="submit" className="submit"><i className="material-icons">&#xe163;</i></button>
                    </form>
                    
                </div>    
            )
        }
        
    }

    
}

export default Chatbot;