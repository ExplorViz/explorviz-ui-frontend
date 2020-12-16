import { module, test } from 'qunit';
import VRController, { VRControllerMode } from 'virtual-reality/utils/vr-rendering/VRController';
import THREE from 'three';
import VRControllerBindingsList from 'virtual-reality/utils/vr-controller/vr-controller-bindings-list';
import VRControllerBindings from 'virtual-reality/utils/vr-controller/vr-controller-bindings';
import MenuGroup from 'virtual-reality/utils/vr-menus/menu-group';

module('Unit | Utility | vr-rendering/VRController', function() {

  test('it exists', function( assert ) {
    let result = new VRController({
      gamepadIndex: 0, 
      mode: VRControllerMode.INTERACTION,
      raySpace: new THREE.Group(), 
      gripSpace: new THREE.Group(),
      menuGroup: new MenuGroup(),
      bindings: new VRControllerBindingsList(new VRControllerBindings({}), []),
      scene: new THREE.Scene(),
    });
    assert.ok(result);
  });
});