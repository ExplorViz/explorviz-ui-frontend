import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  reSetupScene() {
    this.trigger('reSetupScene');
  }

});
