import DS from 'ember-data';
import Draw3DNode from './draw3dnode';

const { attr, belongsTo } = DS;

export default Draw3DNode.extend({
  visible: attr('boolean'),
  parent: belongsTo('system')
});
