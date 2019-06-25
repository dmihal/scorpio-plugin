import equal from 'deep-equal';
import AccountStatus from './ui/AccountStatus';

export default class LinksPlugin {
  constructor(identityServer) {
    this.identityServer = identityServer;
    this._pluginContext = null;
    this.changeListeners = new Set();
    this.user = null;
    this.friends = null;
  }

  initializePlugin(pluginContext) {
    this._pluginContext = pluginContext;

    pluginContext.addElement('home-top', AccountStatus);
    pluginContext.onAccountSearch(search => this.getFriends(search));
    this.checkStatus();
  }

  async checkStatus() {
    const result = await fetch(`${this.identityServer}/status`);
    const json = await result.json();
    if (!json.authenticated) {
      return this.setStatus({ user: null, friends: null });
    }
  }

  setStatus({ user, friends }) {
    let changed = false;
    if (user !== undefined && !equal(user, this.user)) {
      changed = true;
      this.user = user;
    }
    if (friends !== undefined && !equal(friends, this.friends)) {
      changed = true;
      this.friends = friends;
    }
    if (changed) {
      this.changeListeners.forEach(listener => listener(this.user, this.friends));
    }
  }

  get pluginContext() {
    if (!this._pluginContext) {
      throw new Error('Exchange not initialized');
    }
    return this._pluginContext;
  }

  addChangeListener(listener) {
    this.changeListeners.add(listener);
  }

  removeChangeListener(listener) {
    this.changeListeners.remove(listener);
  }
}
