import { moduleFor, test } from 'ember-qunit';

moduleFor('route:replay', 'Unit | Route | replay', {
  // Specify the other units that are required for this test.
   needs: ['service:session', 'service:rendering-service']
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
