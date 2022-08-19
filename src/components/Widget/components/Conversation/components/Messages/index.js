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
import { fetchOldMessage, resendWelcomeMessage } from "./server/fetchData";

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
  console.log('scroll top');
  const messagesDiv = document.getElementById('rw-messages');
  if (messagesDiv) {
    messagesDiv.scrollTop = 1;
  }
};

const isEarlierExisted = (response) => {
  console.log(`isEarlierExisted length:${response.length}`);
  if (Array.isArray(response)) return response.length !== 0;
}

const isAgentResponse = (message) => {
  const prefix = 'agent:';
  if (typeof message === 'object') return false;
  return message ? message.startsWith(prefix) : false;
};
class Messages extends Component {
  constructor() {
    super();
    this.messagesRef = React.createRef(null);
    this.hasMoreOldMessage = true;
    this.isScrollToFetchedEnd = false;
    this.earliestTimestamp = -1;
  }
  componentDidMount() {
    scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    // do not scroll while there's no new message
    if (prevProps.messages.size === this.props.messages.size && prevProps.messages.size !== 0) return;
    if (prevProps.sessionId === null && this.props.sessionId && this.props.isLoggedIn) {
      this.getInitMessagesFromServer();
    }
  }

  getMoreMessages = async () => {
    const { sessionId } = this.props;
    console.log(`sessionId:${sessionId},earliestTimestamp:${this.earliestTimestamp}`);
    if (!sessionId) return;
    this.fetchMessageRequest();
    this.isScrollToFetchedEnd = true;
  }

  async fetchMessageRequest() {
    const { oldMessageURL, sessionId, dispatch } = this.props;
    // no session id props in or no elder messages
    if (!sessionId || !this.hasMoreOldMessage) return;
    const result = await fetchOldMessage(oldMessageURL, sessionId, this.earliestTimestamp);
    if (!result) return;
    if (!isEarlierExisted(result.events)) {
      this.hasMoreOldMessage = false;
      console.log(`hasMoreOldMessage222:${this.hasMoreOldMessage}`);
      return
    }
    this.earliestTimestamp = result.events[0]?.timestamp;
    // redux append history messages
    dispatch(addAllOldMessage(result.events));
  }

  async getInitMessagesFromServer() {
    const { props: { oldMessageURL, sessionId }, earliestTimestamp } = this;
    if (!sessionId) return;
    this.fetchMessageRequest();
    // api trigger event to send welcome messages to client who lost connection over ten minutes
    await resendWelcomeMessage(oldMessageURL, sessionId, Date.now() / 1000);
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
      props: {
        displayTypingIndication,
        profileAvatar,
        agentAvatar,
        liveAgent,
        connected,
        language,
        showUpdateUI,
        isLoggedIn,
      },
      messagesRef,
    } = this;
    const handleScroll = debounce(
      async () => {
        if (!this.hasMoreOldMessage || !isLoggedIn) return
        if (messagesRef.current.scrollTop === 0) {
          await this.getMoreMessages()
          scrollToTop();
        }
      },
      1000
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
  isLoggedIn: PropTypes.bool,
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
  isLoggedIn: false,
  liveAgent: false,
};

export default connect(store => ({
  messages: store.messages,
  displayTypingIndication: store.behavior.get('messageDelayed')
}))(Messages);
