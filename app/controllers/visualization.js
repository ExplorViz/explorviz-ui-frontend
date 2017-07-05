import Ember from 'ember';
const { computed, Controller, inject } = Ember;

export default Controller.extend({

  urlBuilder: inject.service("url-builder"),
  viewImporter: inject.service("view-importer"),
  reloadHandler: inject.service("reload-handler"),
  renderingService: inject.service(),
  landscapeRepo: inject.service("repos/landscape-repository"),

  // Specify query parameters
  queryParams: ['timestamp', 'appID', 'camX', 'camY', 'camZ'],

  type: 'landscape',

  // query parameter serialized into strings
  timestamp: null,
  appID: null,
  camX: null,
  camY: null,
  camZ: null,

  showLandscape: computed('landscapeRepo.latestApplication', function() {
    return !this.get('landscapeRepo.latestApplication');
  }),

  //showLandscape: true,
  state: null,
  
  // @Override
  init() {
    const self = this;

    // setup url-builder Service
    this.get('urlBuilder').on('transmitState', function(state) {
      self.set('state',state);
    });
  },

  // reset query parameters
  cleanupQueryParams(){
    this.set('timestamp',null);
    this.set('appID',null);
    this.set('camX',null);
    this.set('camY',null);
    this.set('camZ',null);  
  },

  actions: {

    resetQueryParams(){
      this.cleanupQueryParams();
    },

    setupService(){
      const self = this;
      // Listen for component request 
      self.get('viewImporter').on('requestView', function() {
        const newState = {};
        // Get and convert query params
        
        newState.timestamp = self.get('timestamp');
        newState.appID = self.get('appID'); 
        
        newState.camX = parseFloat(self.get('camX'));
        newState.camY = parseFloat(self.get('camY'));
        newState.camZ = parseFloat(self.get('camZ'));

        // Passes the new state from controller via service to component
        self.get('viewImporter').transmitView(newState);
      });
    },

    // Triggered by the export button 
    exportState() {
      // Pause timeshift
      this.get('reloadHandler').stopExchange();
      // Update query parameters
      this.get('urlBuilder').requestURL();

      this.set('timestamp', this.get('state').timestamp);
      this.set('appID', this.get('state').appID);

      this.set('camX', this.get('state').camX);
      this.set('camY', this.get('state').camY);
      this.set('camZ', this.get('state').camZ);
    },

    resetView() {
      this.set('timestamp', null);
      this.set('appID', null);

      this.set('camX', null);
      this.set('camY', null);
      this.set('camZ', null);

      this.set('viewImporter.importedURL', false);
      this.get('renderingService').reSetupScene();
      this.get('reloadHandler').startExchange();
    }


  }
});