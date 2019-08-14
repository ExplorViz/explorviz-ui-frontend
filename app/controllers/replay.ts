import Controller from '@ember/controller';
import AlertifyHandler from 'explorviz-frontend/mixins/alertify-handler';
import { inject as service } from "@ember/service";
import { computed, action, get, set } from '@ember/object';
import LandscapeRepository from 'explorviz-frontend/services/repos/landscape-repository';

export default class Replay extends Controller.extend(AlertifyHandler) {

  @service('current-user') currentUser !: any;
  @service('landscape-file-loader') landscapeFileLoader !: any;
  @service('repos/timestamp-repository') timestampRepo !: any;
  @service("repos/landscape-repository") landscapeRepo !: LandscapeRepository;
  @service("rendering-service") renderingService : any;
  @service("reload-handler") reloadHandler : any;

  state = null;

  @computed('landscapeRepo.latestApplication')
  get showLandscape() {
    return !get(this, 'landscapeRepo.latestApplication');
  }

  @action
  resize() {
    get(this, 'renderingService').resizeCanvas();
  }

  @action
  resetView() {
    get(this, 'renderingService').reSetupScene();
  }

  @action
  openLandscapeView() {
    set(this, 'landscapeRepo.latestApplication', null);
    set(this, 'landscapeRepo.replayApplication', null);
  }

  @action
  toggleTimeline() {
    get(this, 'renderingService').toggleTimeline();
  }

  @action
  timelineClicked(timestampInMillisecondsArray) {
    get(this, 'reloadHandler').loadReplayLandscapeByTimestamp(timestampInMillisecondsArray[0]);
  }

  showTimeline() {
    set(this, 'renderingService.showTimeline', true);
  }

  hideVersionbar(){
    set(this, 'renderingService.showVersionbar', false);
  }

  // necessary for hidded input box to select a file for uploading
  @action triggerSelectBox() {
    let queryBox = document.querySelector("#selectBoxUploadLandscape") as HTMLElement;
    queryBox.click();
  }

  // upload a landscape to the backend
  @action uploadLandscape(evt: any) {
    this.get('landscapeFileLoader').uploadLandscape(evt);
  }

  // fetches replay timestamps from the backend
  @action fetchReplayTimestamps() {
    this.get('timestampRepo').fetchReplayTimestamps();
  }

  // called when on 'setupController() from the replay route
  initController() {
    this.get('fetchReplayTimestamps')();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'replay': Replay;
  }
}
