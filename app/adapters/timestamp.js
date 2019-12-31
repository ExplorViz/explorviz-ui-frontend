import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'explorviz-frontend/config/environment';
import { computed } from '@ember/object';

const { JSONAPIAdapter } = DS;

/**
* This Adapter operates as communication abstraction for all network requests,
* that refer to Timestamp objects. It provides functions for fetching,
* updating and uploading. However, at the time of writing this documentation
* only fetching is implemented by the backend.
*
* @class Timestamp-Adapter
* @extends DS.JSONAPIAdapter
*
* @module explorviz
* @submodule network
*/
export default JSONAPIAdapter.extend(DataAdapterMixin, {

  host: ENV.APP.API_ROOT,
  namespace: "v1",

  headers: computed('session.data.authenticated.access_token', function() {
    let headers = { 'Accept': 'application/vnd.api+json' };
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }

    return headers;
  }),

  /**
   * Queries landscape or replay timestamps
   * @param {*} query 
   */
  urlForQuery(query) {
    const baseUrl = this.buildURL();
    if (query.type === 'replay') {
      return `${baseUrl}/timestamps?filter[type]=replay`
    }
    else {
      return `${baseUrl}/timestamps?filter[type]=landscape`
    }
  }

});
