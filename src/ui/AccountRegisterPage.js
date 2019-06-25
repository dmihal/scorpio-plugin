import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default class AccountRegisterPage extends Component {
  componentDidMount() {
    this.tryRegistration();
  }

  componentDidUpdate(oldProps) {
    if (!this.registering && oldProps.accounts !== this.props.accounts) {
      this.tryRegistration();
    }
  }

  async tryRegistration() {
    if (this.props.accounts.length > 0) {
      await this.props.plugin.registerAddress(this.props.accounts[0]);
      this.props.history.push('/');
    }
  }

  render() {
    return (
      <div>Finishing Registration...</div>
    );
  }
}
