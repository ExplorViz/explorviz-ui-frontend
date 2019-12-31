import JSONAPIAdapter from 'ember-data/adapters/json-api';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'explorviz-frontend/config/environment';
import { computed } from '@ember/object';

export default JSONAPIAdapter.extend(DataAdapterMixin,{

  host: ENV.APP.API_ROOT,

  headers: computed('session.data.authenticated.access_token', function() {
    let headers = { 'Accept': 'application/vnd.api+json' };
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }

    return headers;
  }),

  // @Override
  // Overrides URL for model.save()
  urlForCreateRecord() {
    const baseUrl = this.buildURL();
    return `${baseUrl}/v1/userbatch`;
  },

  authorize(xhr) {
    let { access_token } = this.get('session.data.authenticated');
    xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  }

});
