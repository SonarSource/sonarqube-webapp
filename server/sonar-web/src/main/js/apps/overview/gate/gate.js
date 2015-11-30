import React from 'react';

import GateConditions from './gate-conditions';
import GateEmpty from './gate-empty';


export default React.createClass({
  renderGateConditions () {
    return <GateConditions gate={this.props.gate} component={this.props.component}/>;
  },

  renderGateText () {
    let text = '';
    if (this.props.gate.level === 'ERROR') {
      text = window.t('widget.alerts.errors') + this.props.gate.text + '.';
    } else if (this.props.gate.level === 'WARN') {
      text = window.t('widget.alerts.warnings') + this.props.gate.text + '.';
    } else {
      text = window.t('widget.alerts.no_alert');
    }
    return <div className="overview-card">{text}</div>;
  },

  render() {
    if (!this.props.gate || !this.props.gate.level) {
      return this.props.component.qualifier === 'TRK' ? <GateEmpty/> : null;
    }

    let level = this.props.gate.level.toLowerCase(),
        badgeClassName = 'badge badge-' + level,
        badgeText = window.t('overview.gate', this.props.gate.level);

    return (
        <div className="overview-gate">
          <h2 className="overview-title">
            {window.t('overview.quality_gate')}
            <span className={badgeClassName}>{badgeText}</span>
          </h2>
          {this.props.gate.conditions ? this.renderGateConditions() : this.renderGateText()}
        </div>
    );
  }
});
