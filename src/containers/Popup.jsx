/* global confirm: false */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import getMessage from '../utils/i18n';
import Candidate from '../components/Candidate';
import keySequence from '../key_sequences';
import { commandOfSeq } from '../sagas/key_sequence';

class Popup extends React.Component {
  static get propTypes() {
    return {
      query:                 PropTypes.string.isRequired,
      candidates:            PropTypes.arrayOf(PropTypes.object).isRequired,
      separators:            PropTypes.arrayOf(PropTypes.object).isRequired,
      index:                 PropTypes.number,
      markedCandidateIds:    PropTypes.shape({ id: PropTypes.bool }).isRequired,
      mode:                  PropTypes.string.isRequired,
      handleSelectCandidate: PropTypes.func.isRequired,
      handleInputChange:     PropTypes.func.isRequired,
      handleKeyDown:         PropTypes.func.isRequired,
    };
  }
  static get defaultProps() {
    return {
      index: null,
    };
  }
  constructor() {
    super();
    this.focusInput = () => this.input.focus();
  }
  componentDidMount() {
    window.addEventListener('focus', this.focusInput);
    this.timer = setTimeout(() => {
      this.input.focus();
      if (document.scrollingElement) {
        document.scrollingElement.scrollTo(0, 0);
      }
    }, 100);
  }
  componentDidUpdate() {
    if (this.selectedCandidate && document.scrollingElement) {
      const container               = document.scrollingElement;
      const containerHeight         = container.clientHeight;
      const { bottom, top, height } = this.selectedCandidate.getBoundingClientRect();
      const b = containerHeight - height - 18 - container.scrollTop;
      if (bottom > containerHeight || top < 0) {
        container.scrollTop = top - b;
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener('focus', this.focusInput);
    clearTimeout(this.timer);
  }
  handleCandidateClick(index) {
    const candidate = this.props.candidates[index];
    if (candidate !== null) {
      this.props.handleSelectCandidate(candidate);
    }
  }
  hasFooter() {
    return this.props.mode !== 'command';
  }
  renderFooter() {
    switch (this.props.mode) {
      case 'command':
        return null;
      default:
        return (
          <div className="footer">
            {getMessage('key_info')}
          </div>
        );
    }
  }
  renderCandidateList() {
    const className = this.hasFooter() ? 'candidatesList' : 'candidatesList-no-footer';
    return (
      <ul className={className}>
        {this.props.candidates.map((c, i) => (
          <li
            key={c.id}
            ref={(node) => {
                if (i === this.props.index) {
                  this.selectedCandidate = node;
                }
              }}
          >
            {this.renderSeparator(i)}
            <Candidate
              item={c}
              isSelected={i === this.props.index}
              isMarked={!!this.props.markedCandidateIds[c.id]}
              onClick={() => this.handleCandidateClick(i)}
            />
          </li>))
       }
      </ul>
    );
  }
  renderSeparator(index) {
    return this.props.separators.filter(s => s.index === index && s.label).map(s => ((
      <div key={`separator${index}`} className="separator">{s.label}</div>
    )));
  }
  render() {
    return (
      <form
        className="commandForm"
      >
        <input
          className="commandInput"
          ref={(input) => { this.input = input; }}
          type="text"
          value={this.props.query}
          onChange={e => this.props.handleInputChange(e.target.value)}
          onKeyDown={this.props.handleKeyDown}
          placeholder={getMessage('commandInput_placeholder')}
        />
        {this.renderCandidateList()}
        {this.renderFooter()}
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    query:              state.query,
    candidates:         state.candidates.items,
    index:              state.candidates.index,
    separators:         state.separators,
    markedCandidateIds: state.markedCandidateIds,
    mode:               state.mode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleSelectCandidate: payload => dispatch({ type: 'SELECT_CANDIDATE', payload }),
    handleInputChange:     payload => dispatch({ type: 'QUERY', payload }),
    handleKeyDown:         (e) => {
      const keySeq = keySequence(e);
      if (commandOfSeq[keySeq]) {
        e.preventDefault();
        dispatch({ type: 'KEY_SEQUENCE', payload: keySeq });
      }
    },
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Popup));
