import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { AdminHeader } from '../admin-header';

import Loader from '../../../generics/loader/loader';
import { AdminLogsService } from '../../../services/admin/admin-logs.service';
import { dateFormatLongDayDayMonthYearHourMinut } from '../../../services/date-helper';
import Pagination from '../../../generics/pagination';

require('../admin.scss');

const PAGE_SIZE = 100;

export default class AdminLogs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,

      logs: [],
      nbTotalLogs: undefined,
      pageSize: PAGE_SIZE,
      currentPage: 0,

      adminUsers: [],
      currentAdminFilter: undefined
    }
  }

  async componentDidMount() {
    // Get total logs number and admins
    const adminUsers = await AdminLogsService.getAllAdmins();
    const nbTotalLogs = await AdminLogsService.getTotalLogsNumber();
    this.setState({ adminUsers, nbTotalLogs });

    // Get admin
    this.getPageLogs();
  }

  async getPageLogs() {
    try {
      const logs = await AdminLogsService.getAllLogs({ page: this.state.currentPage, pageSize: this.state.pageSize });
      this.setState({ logs, loading: false });
    } catch(err) {
      this.setState({ logs: [], loading: false });
    }
  }

  updatePage = (pageNumber) => {
    this.setState({ currentPage: pageNumber }, () => this.getPageLogs());
  }

  getUserLog = async (event) => {
    const value = event.target.value;
    if(!value) {
      this.setState({ currentPage: 0 }, () => this.getPageLogs())
    } else {
      const userId = +value;
      try {
        const logs = await AdminLogsService.getUserLogs(userId);
        this.setState({ logs, currentAdminFilter: userId });
      } catch(err) {
        this.setState({ logs: [], userId: userId });
      }
    }

  }


  // RENDER
  renderAdminFilter() {
    return (
      <div className="admin-logs-filter">
        <label>Choisir un administrateur : </label>
        <select onChange={this.getUserLog}>
          <option value=""></option>
          { this.state.adminUsers.map(admin => (
            <option key={admin.id} value={admin.id}>{ admin.firstName } { admin.lastName }</option>
          )) }
        </select>
      </div>
    )
  }


  render() {
    const { loading, currentPage, pageSize, adminUsers, nbTotalLogs, logs, currentAdminFilter } =  this.state;

    return (
      <div id="admin-logs">
        <Helmet title="Historique des connexions admin" titleTemplate="%s | Administration - Katellea" />
        <AdminHeader subTitle="Historique des connexions admin" />

        <section className="admin-content clearfix">
          { !loading && adminUsers ? this.renderAdminFilter() : null }

          { loading ? <div className="text-center"><Loader /></div> : null }
          { !loading && logs.length === 0 ? <div className="alert info">Pas de connexions trouvées...</div> : null }


          { !loading && logs.length > 0 ?
            <table className="text-center">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Admin</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
              {
                logs.map(log => (
                  <tr key={log.id}>
                    <td>{ log.id }</td>
                    <td>{ log.user.firstName } { log.user.lastName }</td>
                    <td>{ dateFormatLongDayDayMonthYearHourMinut(log.updatedAt) }</td>
                  </tr>
                ))
              }
              </tbody>
            </table> : null
          }

          { !loading && nbTotalLogs && !currentAdminFilter ?
            <div className="fr">
              <Pagination currentPage={currentPage} pageSize={pageSize} total={nbTotalLogs} onPageChange={this.updatePage} />
            </div> : null }

        </section>

      </div>
    );
  }
}