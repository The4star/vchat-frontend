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
import { deployedURL, apiURL }  from '../../helpers/variables'

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
      if (!process.env.JEST_WORKER_ID) {
        this.messagesEnd.scrollIntoView({behaviour: 'smooth'})
      }
    }
    
    getChatHistory = async () => {
      const response = await axios.post(`${apiURL}/api/df_get_chat_history`, {userId: cookies.get('userId')})
      const data = response.data 
      
      if(data.previousSession && data.response.messages.length > 0) {
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

            const res = await axios.post(`${apiURL}/api/df_text_query`, {text, userId: cookies.get('userId')})
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

          
            this.printMessageswithdelay(allMessages, 0)
        } catch (error) {
            console.log(error)
        }
        
    }

    eventQuery = async (event) => {
        try {
            const res = await axios.post(`${apiURL}/api/df_event_query`, {event, userId: cookies.get('userId')})
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
            
            this.printMessageswithdelay(allMessages, 0)
        } catch (error) {
            console.log(error)
        }

    }

    printMessageswithdelay = async (messages, messageToPrint) => {
      const messageAmount = messages.length 
      
      if (messageToPrint === messageAmount) {
          this.setState({ hideDots: true })
          return
      } else {
          if (messageToPrint !== 0) {
              await this.resolveAfterXSeconds(2)
          } 
          this.setState({ messages: [...this.state.messages, messages[messageToPrint]] })
          messageToPrint += 1
          this.printMessageswithdelay(messages, messageToPrint)
      }
      
  }

    renderMessages = (stateMessages) => {
        if(stateMessages) {
            return stateMessages.map((message, i) => {
                if (message.msg) {
                   return <Message key={i} speaker={message.speaker} text={message.msg} /> 
                } else if (message.cards)  {
                    return <Message key={i} speaker={message.speaker} cards={message.cards} cardStyle/> 
                  } else if (message.script)  {
                    return <Message key={i} speaker={message.speaker} text={message.script} scriptStyle/> 
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

    getInjectionScript = () => {
      let injectionScript = `<div id="chatbot"></div>`
      const scripts = document.querySelectorAll('script')
      const links = document.querySelectorAll('link')

      scripts.forEach(script => {
        if (script.src) {
        injectionScript += `<script src="${script.src}"></script>`
        } else {
          injectionScript += script.outerHTML
        }
      })

      links.forEach((link, i) => {
        if (i > 1 && i < 4) {
        injectionScript += link.outerHTML
        }
        if (i === 5) {
        injectionScript += `<link href="${link.href}" rel="stylesheet">`
        }
      })
    
      const scriptMessage = `Your injection script has been copied to your clipboard. You can now paste it into your website just before the closing </body> tag. If you accidentally copy something else you can copy the script again from below`
      const allMessages = []
      const splitMessages = scriptMessage.split(".", 5)
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
      this.copyToClipboard(injectionScript)
      const scriptMsg = {
        speaker: 'vchat',
        script: injectionScript
      }
      allMessages.push(scriptMsg)
      this.setState({hideDots: false})
      this.printMessageswithdelay(allMessages, 0)
    }

    copyToClipboard = (str) => {

      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '')
      el.style = {position: 'absolute', left: '-9999px'};
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    isDeployedSite = () => {
      if (window.location.href === deployedURL) {
        return true
      }
    }
    
    render() {
        const { messages, hideDots } = this.state
        if (this.state.hidden) {
            return (
                <div className="hidden-chatbot" onClick={() => this.toggleBot()} >
                    <div className="logo-only">
                        <img className="logo-hider" src={`${deployedURL}/img/logo.jpg`} alt="logo"/>
                        <div ref={(el) => this.messagesEnd = el}></div>
                    </div>
                </div>     
            )   
        } else {
            return(
                <div className="chatbot">
                    <div className="main-title">
                        <div className="logowrapper">
                          <img src={`${deployedURL}/img/logo.jpg`} alt="logo"/>  
                        </div>
                        <div className="text">
                          {
                            this.isDeployedSite() ? 
                            <p className="injection-button" onClick={() => this.getInjectionScript()}>
                                Injection Script
                            </p> :  null
                          }
                             
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