import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { debounce } from 'lodash'

import { MESSAGES_TYPES } from 'constants';
import { Video, Image, Message, Carousel, Buttons, Offline, IosUpdateUI } from 'messagesComponents';

import './styles.scss';
import ThemeContext from '../../../../ThemeContext';

import { addAllOldMessage } from "actions";
import { fetchOldMessage, resendWelcomeMessage, retrieveLostMessage } from "./server/fetchData";
import Cookies from 'js-cookie';

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

const scrollToTop = () => {
  const messagesDiv = document.getElementById('rw-messages');
  if (messagesDiv) {
    messagesDiv.scrollTop = 1;
  }
};

const isEarlierExisted = (response) => response !== []

const isAgentResponse = (message) => {
  const prefix = 'agent:';
  if (typeof message === 'object') return false;
  return message ? message.startsWith(prefix) : false;
};
class Messages extends Component {
  constructor() {
    super();
    this.messagesRef = React.createRef(null);
    this.hasMoreOldMessageRef = React.createRef(true);
    this.isFetchedEndRef = React.createRef(false);
  }
  componentDidMount() {
    const { isSameUser } = this.props
    if (isSameUser) {
      this.requestMessages();
      return scrollToTop();
    }
    scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    // do not scroll while there's no message
    if (prevProps.messages.size === this.props.messages.size) return;
    if (this.isFetchedEndRef.current) {
      scrollToTop()
      return this.isFetchedEndRef.current = false;
    }
    scrollToBottom();
  }

  componentWillUnmount() {

  }

  async requestMessages() {
    const { messages, oldMessageURL, sessionId, dispatch } = this.props;
    const earliestTimestamp = messages?.get(1)?.get('timestamp') / 1000 || -1;
    const latestTimestamp = messages?.get(messages.size - 1)?.get('timestamp') / 1000 || -1;
    if (!sessionId) return;
    const result = await fetchOldMessage(oldMessageURL, sessionId, earliestTimestamp);
    if (!isEarlierExisted(result.events) || !result) {
      return this.hasMoreOldMessageRef.current = false;
    }
    // redux append history messages
    dispatch(addAllOldMessage(result.events))
    this.isFetchedEndRef.current = true;
    // api trigger event to send lost socket messages sent by agent
    if (Cookies.get('mode') === "connection_success") {
      await retrieveLostMessage(oldMessageURL, sessionId, latestTimestamp);
    }
    // apit trigger event to send welcome messages to client who lost connection over ten minutes
    await resendWelcomeMessage(oldMessageURL, sessionId, latestTimestamp);
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
    const { displayTypingIndication,
      profileAvatar,
      agentAvatar,
      liveAgent,
      connected,
      language,
      showUpdateUI,
      messages,
      isSameUser } = this.props;
    const handleScroll = debounce(
      () => {
        if (!this.hasMoreOldMessageRef.current || !isSameUser) return
        if (messages.size < 2) return
        if (this.messagesRef.current.scrollTop === 0) {
          this.requestMessages()
        }
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

    return (
      !connected ? (
        <Offline locale={language} />
      ) : showUpdateUI ? (
        <IosUpdateUI />
      ) : (
        <div id="rw-messages" style={{ backgroundColor: conversationBackgroundColor }} className="rw-messages-container" ref={this.messagesRef} onScroll={(e) => handleScroll(e)} >
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
  isSameUser: PropTypes.bool,
  liveAgent: PropTypes.bool,
  connected: PropTypes.bool,
  language: PropTypes.oneOf(['zh', 'en']),
  showUpdateUI: PropTypes.bool,
  customComponent: PropTypes.func,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  displayTypingIndication: PropTypes.bool
};

Message.defaultTypes = {
  displayTypingIndication: false,
  isSameUser: false,
  liveAgent: false,
};

export default connect(store => ({
  messages: store.messages,
  displayTypingIndication: store.behavior.get('messageDelayed')
}))(Messages);
