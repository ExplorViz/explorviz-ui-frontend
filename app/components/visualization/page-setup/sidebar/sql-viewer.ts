import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { computed, action } from '@ember/object';
import $ from 'jquery';
import DS from 'ember-data';
import LandscapeRepository from 'explorviz-frontend/services/repos/landscape-repository';
import AdditionalData from 'explorviz-frontend/services/additional-data';
import DatabaseQuery from 'explorviz-frontend/models/databasequery';

type SortingProperty = 'timestamp'|'sqlStatement'|'statementType'|'responseTime';
type TimeUnit = 's'|'ms'|'ns';

export default class SQLViewer extends Component {

  @service('repos/landscape-repository')
  landscapeRepo!: LandscapeRepository;

  @service('additional-data')
  additionalData!: AdditionalData;

  @service('store')
  store!: DS.Store;

  // default time units
  @tracked
  responseTimeUnit:TimeUnit = 'ms';

  @tracked
  isSortedAsc: boolean = true;
  @tracked
  sortBy:SortingProperty = 'timestamp';
  @tracked
  selectedQuery:DatabaseQuery|null = null;
  @tracked
  scrollPosition:null|number = null;

  @tracked
  filterTerm: string = '';
  @tracked
  filterInput: string = '';

  // Compute current traces when highlighting changes
  @computed('landscapeRepo.latestApplication.databaseQueries', 'isSortedAsc', 'sortBy',
  'filterTerm', 'selectedQuery')
  get databaseQueries() {
    let queries: DatabaseQuery[];
    if (this.selectedQuery) {
      queries = [this.selectedQuery];
    } else {
      if(this.landscapeRepo.latestApplication !== null) {
        queries = this.filterAndSortQueries(this.landscapeRepo.latestApplication.databaseQueries.toArray());
      } else {
        queries = [];
      }
    }
    return queries;
  }

  filterAndSortQueries(queries: DatabaseQuery[]) {
    let filteredQueries: DatabaseQuery[] = [];
    let filter = this.filterTerm;
    queries.forEach((query) => {
      if (filter === ''
        || query.get('sqlStatement').toLowerCase().includes(filter)) {
        filteredQueries.push(query);
      }
    });

    if (this.isSortedAsc) {
      filteredQueries.sort((a, b) => (a.get(this.sortBy) > b.get(this.sortBy)) ? 1 : ((b.get(this.sortBy) > a.get(this.sortBy)) ? -1 : 0));
    } else {
      filteredQueries.sort((a, b) => (a.get(this.sortBy) < b.get(this.sortBy)) ? 1 : ((b.get(this.sortBy) < a.get(this.sortBy)) ? -1 : 0));
    }

    return filteredQueries;
  }

  @action
  queryClicked(query: DatabaseQuery) {
    // Allow deselection of query
    if (query.get('isSelected')) {
      query.set('isSelected', false);
      this.selectedQuery = null;
      if (this.scrollPosition) {
        $('#sqlScrollDiv').animate({ scrollTop: this.scrollPosition }, 'slow');
      }
    }
    // Select query
    else {
      // Deselect potentially selected query
      let queries = this.store.peekAll('databasequery');
      queries.forEach((query) => {
        query.set('isSelected', false);
      });
      // Mark new query as selected
      query.set('isSelected', true);
      this.selectedQuery = query;
      // Remember scroll position
      let scrollPos = $('#sqlScrollDiv').scrollTop();
      if(scrollPos !== undefined)
        this.scrollPosition = scrollPos;
    }
  }

  @action
  filter() {
    // Case insensitive string filter
    this.filterTerm = this.filterInput.toLowerCase();
  }

  @action
  toggleResponseTimeUnit() {
    let timeUnit = this.responseTimeUnit;

    if (timeUnit === 'ns') {
      this.responseTimeUnit = 'ms';
    }
    else if (timeUnit === 'ms') {
      this.responseTimeUnit = 's';
    }
    else if (timeUnit === 's') {
      this.responseTimeUnit = 'ns';
    }
  }

  @action
  sortByProperty(property: SortingProperty) {
    // Determine order for sorting
    if (this.sortBy === property) {
      // Toggle sorting order
      this.isSortedAsc = !this.isSortedAsc;
    } else {
      // Sort in ascending order by default
      this.isSortedAsc = true;
    }

    // Set property by which shall be sorted
    this.sortBy = property;
  }

  @action
  close() {
    this.additionalData.removeComponent('visualization/page-setup/sidebar/sql-viewer');
  }

}