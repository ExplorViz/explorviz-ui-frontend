import TextItem from './items/text-item';
import BaseMenu from './base-menu';
import TextbuttonItem from './items/textbutton-item';
import ArrowbuttonItem from './items/arrowbutton-item';
import VRControllerButtonBinding from '../vr-controller/vr-controller-button-binding';
import VRControllerThumbpadBinding from '../vr-controller/vr-controller-thumbpad-binding';
import VRController from '../vr-rendering/VRController';

export default class CameraMenu extends BaseMenu {

  getCameraDelta: () => THREE.Vector3;
  changeCameraHeight: (deltaY: number) => void;
  resetButton: TextbuttonItem;
  deltaItem: TextItem;

  constructor(getCameraDelta: () => THREE.Vector3, changeCameraHeight: (deltaY: number) => void) {
    super();
    this.getCameraDelta = getCameraDelta;
    this.changeCameraHeight = changeCameraHeight;
    this.opacity = 0.8;

    const title = new TextItem('Camera', 'title', '#ffffff', { x: 256, y: 20 }, 50, 'center');
    this.items.push(title);

    this.deltaItem = new TextItem(getCameraDelta().y.toFixed(2), 'camera_height', '#ffffff', { x: 256, y: 202 }, 28, 'center');
    this.items.push(this.deltaItem);

    this.resetButton = new TextbuttonItem('reset', 'Reset', {
      x: 420,
      y: 13,
    }, 65, 40, 22, '#aaaaaa', '#ffffff', '#dc3b00');

    this.resetButton.onTriggerDown = this.resetCamera.bind(this);

    this.items.push(this.resetButton);

    const heightDownButton = new ArrowbuttonItem('height_down', {
      x: 100,
      y: 182,
    }, 50, 60, '#ffc338', '#00e5ff', 'down');

    heightDownButton.onTriggerPressed = this.heightDown.bind(this);

    const heightUpButton = new ArrowbuttonItem('height_up', {
      x: 366,
      y: 182,
    }, 50, 60, '#ffc338', '#00e5ff', 'up');

    heightUpButton.onTriggerPressed = this.heightUp.bind(this);

    this.items.push(heightDownButton, heightUpButton);
    this.update();
  }

  resetCamera() {
    const delta = this.getCameraDelta().y;
    this.changeCameraHeight(-delta);
    this.deltaItem.text = this.getCameraDelta().y.toFixed(2);
  }

  heightDown(value: number) {
      this.changeCameraHeight(-0.02 * value);
      this.deltaItem.text = this.getCameraDelta().y.toFixed(2);
      this.update();
  }

  heightUp(value: number) {
    this.changeCameraHeight(0.02 * value);
    this.deltaItem.text = this.getCameraDelta().y.toFixed(2);
    this.update();
  }


  makeGripButtonBinding() {
    return new VRControllerButtonBinding('Reset', {
      onButtonDown: () => { this.resetCamera(); this.resetButton.enableHoverEffect(); this.update() },
      onButtonUp: () => { this.resetButton.resetHoverEffect(); this.update() }
    });
  }

  makeThumbpadBinding() {
    return new VRControllerThumbpadBinding({ labelUp: 'Up', labelDown: 'Down' }, {
      onThumbpadPress: (_controller, axes) => 
          { axes[1] > 0 ? this.heightUp(axes[1]) : this.heightDown(-axes[1]); this.deltaItem.text = this.getCameraDelta().y.toFixed(2); this.update()},

    })
  }
}
