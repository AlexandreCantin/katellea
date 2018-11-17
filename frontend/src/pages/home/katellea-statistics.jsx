import React, { Component } from 'react';
import { StatisticsService } from '../../services/statistics.service';
import { dateFormatShortDayDayMonthYear } from '../../services/date-helper';

export default class KatelleaStatistics extends Component {

  constructor(props) {
    super(props);

    this.state = {
      statistics: undefined
    };
  }

  async componentWillMount() {
    let data = await StatisticsService.getLastStatistics();
    if (data) this.setState({ statistics: data });
  }

  render() {
    const { statistics } = this.state;

    if (!statistics) return null;

    return (
      <div className="katellea-statistics">
        <div className="stats">
          <span><span className="number">{statistics.bloodGiven || 0}</span> L. de sang</span>
          <span><span className="number">{statistics.plasmaGiven || 0}</span> L. de plasma</span>
          <span><span className="number">{statistics.plateletGiven || 0}</span> L. de plaquettes</span>
        </div>

        <div className="last-update text-center">Dernière mise à jour : {dateFormatShortDayDayMonthYear(statistics.createdAt)}</div>
      </div>
    );
  }
}
