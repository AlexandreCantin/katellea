import React, { Component } from 'react';
import { dateFormatLongDayDayMonthYearHourMinut } from '../../../services/date-helper';
import { AdminLogsService } from '../../../services/admin/admin-logs.service';
import store from '../../../services/store';


export class AdminLastLogin extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lastLog: undefined
    }
  }

  async componentDidMount() {
    try {
      const user = store.getState().user;
      const lastLog = await AdminLogsService.getLastLog(user.id);
      this.setState({ lastLog });
    } catch(err) {}
  }

  render() {
    const { lastLog } = this.state;

    if(!lastLog) return null;

    return (
      <div className="admin-last-login alert info">
        Votre dernière connexion/action fut le <strong>{ dateFormatLongDayDayMonthYearHourMinut(lastLog.updatedAt) }</strong>
      </div>
    )
  }
}