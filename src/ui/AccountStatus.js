import React, { Component } from 'react';
import classes from './AccountStatus.module.css';

export default class AccountStatus extends Component {
  constructor(props) {
    super(props);
    this.plugin = props.plugin;
    this.state = {
      user: null,
    };

    this.onChange = (user) => this.setState({ user });
  }

  componentDidMount() {
    this.plugin.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    this.plugin.removeChangeListener(this.onChange);
  }

  render() {
    const { user } = this.state;
    return this.state.user ? (
      <div className={classes.statusBar}>
        <div className={classes.avatar} style={{ backgroundImage: `url(${user.picture})` }} />
        <div className={classes.name}>{user.name}</div>
      </div>
    ) : (
      <a
        className={classes.loginBtn}
        href={`${this.plugin.identityServer}/auth?redirect=${encodeURIComponent(window.location.href)}`}
      >
        Log In with Facebook
      </a>
    )
  }
}
