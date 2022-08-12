import React, { Component, useRef } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import InfiniteScroll from 'react-infinite-scroll-component';
import { connect } from 'react-redux';
import { throttle, debounce } from 'lodash'

import { MESSAGES_TYPES } from 'constants';
import { Video, Image, Message, Carousel, Buttons, Offline, IosUpdateUI } from 'messagesComponents';

import './styles.scss';
import ThemeContext from '../../../../ThemeContext';

import { addAllOldMessage } from "actions";
import fetchOldMessage from "./server/fetchData";

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const formatDate = (date) => {
  const dateToFormat = new Date(date);
  const showDate = isToday(dateToFormat) ? '' : `${dateToFormat.toLocaleDateString()} `;
  return `${showDate}${dateToFormat.toLocaleTimeString('en-US', { timeStyle: 'short' })}`;
};

const scrollToBottom = () => {
  const messagesDiv = document.getElementById('rw-messages');
  if (messagesDiv) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};


const isAgentResponse = (message) => {
  const prefix = 'agent:';
  if (typeof message === 'object') return false;
  return message ? message.startsWith(prefix) : false;
};
class Messages extends Component {
  constructor() {
    super();
    this.state = {
      hasMoreOldMessage: true,
    }
    this.messagesRef = React.createRef(null)
  }
  componentDidMount() {
    scrollToBottom();
  }

  componentDidUpdate() {
    scrollToBottom();
  }



  getComponentToRender = (message, index, isLast) => {
    const { params } = this.props;
    const ComponentToRender = (() => {
      switch (message.get('type')) {
        case MESSAGES_TYPES.TEXT: {
          return Message;
        }
        case MESSAGES_TYPES.CAROUSEL: {
          return Carousel;
        }
        case MESSAGES_TYPES.VIDREPLY.VIDEO: {
          return Video;
        }
        case MESSAGES_TYPES.IMGREPLY.IMAGE: {
          return Image;
        }
        case MESSAGES_TYPES.BUTTONS: {
          return Buttons;
        }
        case MESSAGES_TYPES.CUSTOM_COMPONENT:
          return connect(
            store => ({ store }),
            dispatch => ({ dispatch })
          )(this.props.customComponent);
        default:
          return null;
      }
    })();
    if (message.get('type') === 'component') {
      const messageProps = message.get('props');
      return (<ComponentToRender
        id={index}
        {...(messageProps.toJS ? messageProps.toJS() : messageProps)}
        isLast={isLast}
      />);
    }
    return <ComponentToRender id={index} params={params} message={message} isLast={isLast} />;
  }

  render() {
    const {
      displayTypingIndication,
      profileAvatar,
      agentAvatar,
      liveAgent,
      connected,
      language,
      showUpdateUI,
      messages,
      oldMessageURL,
      sessionId,
      dispatch
    } = this.props;
    console.log(this.props);
    const { } = this.state
    const handleScroll = debounce(
      async (e) => {
        // test
        if (messages.size > 2) {
          const earliestTimeStamp = messages.get(messages.size - 1).get('timestamp')
          if (this.messagesRef.current.scrollTop === 0) {
            const result = await fetchOldMessage(oldMessageURL, sessionId, earliestTimeStamp);
            if (result === []) {
              this.setState({
                hasMoreOldMessage: false
              })
            }

            dispatch(addAllOldMessage(result.events))
          }
        }
        // if(!this.state.hasMoreOldMessage) return
        // if(messages.size > 1){
        //   console.log(messages);
        //   const earliestTimeStamp = messages.get(1).get('timestamp')
        //   console.log(earliestTimeStamp);
        //   console.log(this.messagesRef)
        //   if(this.messagesRef.current.scrollTop === 0){
        // const result = await fetchOldMessage(oldMessageURL, sessionId, earliestTimeStamp);
        // if(result.events === []){
        //   this.setState({
        //     hasMoreOldMessage: false
        //   })
        // }
        // dispatch(addAllOldMessage(result.events))
        // console.log(`result.events:${result.events}`);
        //   }
        // }
      }
    )
    const renderMessages = () => {
      const {
        messages,
        showMessageDate,
      } = this.props;

      if (messages.isEmpty()) return null;

      const groups = [];
      let group = null;



      const dateRenderer = typeof showMessageDate === 'function' ? showMessageDate :
        showMessageDate === true ? formatDate : null;

      const renderMessageDate = (message) => {
        const timestamp = message.get('timestamp');

        if (!dateRenderer || !timestamp) return null;
        const dateToRender = dateRenderer(message.get('timestamp', message));
        return dateToRender
          ? <span className="rw-message-date">{dateRenderer(message.get('timestamp'), message)}</span>
          : null;
      };

      const renderMessage = (message, index) => {
        const text = message.get('text');
        const avatar = isAgentResponse(text) ? agentAvatar : profileAvatar;
        return (
          <div className={`rw-message ${avatar && 'rw-with-avatar'}`} key={index}>
            {avatar && message.get('showAvatar') && (
              <img src={avatar} className="rw-avatar" alt="profile" />
            )}
            {this.getComponentToRender(message, index, index === messages.size - 1)}
            {renderMessageDate(message)}
          </div>
        );
      };


      messages.forEach((msg, index) => {
        if (msg.get('hidden')) return;
        if (group === null || group.from !== msg.get('sender')) {
          if (group !== null) groups.push(group);

          group = {
            from: msg.get('sender'),
            messages: []
          };
        }

        group.messages.push(renderMessage(msg, index));
      });

      groups.push(group); // finally push last group of messages.

      return groups.map((g, index) => (
        <div className={`rw-group-message rw-from-${g && g.from}`} key={`group_${index}`}>
          {g.messages}
        </div>
      ));
    };
    const { conversationBackgroundColor, assistBackgoundColor } = this.context;

    const handleFetchNewMessage = () => {
      const result = fetchOldMessage(oldMessageURL, sessionId);
      if (result === []) {
        this.setState({ hasOldMessage: false });
        return;
      }
      console.log();
      dispatch(addAllOldMessage(result));
    }

    return (
      !connected ? (
        <Offline locale={language} />
      ) : showUpdateUI ? (
        <IosUpdateUI />
      ) : (
        <div id="rw-messages" style={{ backgroundColor: conversationBackgroundColor }} className="rw-messages-container" ref={this.messagesRef} >
          {renderMessages()}
          {displayTypingIndication && (
            <div className="rw-message rw-typing-indication rw-with-avatar">
              <img src={liveAgent ? agentAvatar : profileAvatar} className="rw-avatar" alt="profile" />
              <div style={{ backgroundColor: assistBackgoundColor }} className="rw-response">
                <div id="wave">
                  <span className="rw-dot" />
                  <span className="rw-dot" />
                  <span className="rw-dot" />
                </div>
              </div>
            </div>
          )}
        </div>)
    );
  }
}
Messages.contextType = ThemeContext;
Messages.propTypes = {
  messages: ImmutablePropTypes.listOf(ImmutablePropTypes.map),
  profileAvatar: PropTypes.string,
  agentAvatar: PropTypes.string,
  sessionId: PropTypes.string,
  oldMessageURL: PropTypes.string,
  liveAgent: PropTypes.bool,
  connected: PropTypes.bool,
  language: PropTypes.oneOf(['zh', 'en']),
  showUpdateUI: PropTypes.bool,
  customComponent: PropTypes.func,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  displayTypingIndication: PropTypes.bool
};

Message.defaultTypes = {
  displayTypingIndication: false
};

export default connect(store => ({
  messages: store.messages,
  displayTypingIndication: store.behavior.get('messageDelayed')
}))(Messages);
