import Ember from 'ember';

export default Ember.Component.extend({

	navbarService: Ember.inject.service('navbar-labels'),

  actions: {
    resetToLandscapeView() {
      this.sendAction("resetToLandscapeView");
    } 
  }
});