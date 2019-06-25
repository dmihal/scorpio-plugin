import equal from 'deep-equal';
import AccountRegisterPage from './ui/AccountRegisterPage';
import AccountStatus from './ui/AccountStatus';

export default class ScorpioPlugin {
  constructor(identityServer) {
    this.identityServer = identityServer;
    this._pluginContext = null;
    this.changeListeners = new Set();
    this.user = null;
    this.friends = null;
    this.lastFetch = 0;
  }

  initializePlugin(pluginContext) {
    this._pluginContext = pluginContext;

    pluginContext.addPage('/register-account', AccountRegisterPage);
    pluginContext.addElement('home-top', AccountStatus);
    pluginContext.onAccountSearch(search => this.searchForFriends(search));
    this.checkStatus();
  }

  async registerAddress(address) {
    await this.checkStatus();
    if (this.user && (!this.user.address || this.user.address.toLowerCase() !== address.toLowerCase())) {
      await fetch(`${this.identityServer}/set_address`, {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ address }),
        credentials: 'include',
      });
      await this.checkStatus();
    }
  }

  async getFriends() {
    if (Date.now() - this.lastFetch < 15 * 1000) {
      return this.friends;
    }
    const response = await fetch(`${this.identityServer}/friends`, { credentials: 'include' });
    const { friends } = await response.json();
    this.friends = friends;
    this.lastFetch = Date.now();
    return friends;
  }

  async searchForFriends(search) {
    let friends = await this.getFriends();
    if (search && search.length > 0) {
      const regexSearch = new RegExp(`^${search}| ${search}`,'i');
      friends = friends.filter(friend => regexSearch.test(friend.name));
    }
    return friends;
  }

  async checkStatus() {
    const result = await fetch(`${this.identityServer}/status`, { credentials: 'include' });
    const json = await result.json();
    if (!json.authenticated) {
      this.setStatus({ user: null, friends: null });
    } else {
      this.setStatus({ user: json.user })
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
    this.changeListeners.delete(listener);
  }
}
