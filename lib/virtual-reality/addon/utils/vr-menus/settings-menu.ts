import TextItem from './items/text-item';
import BaseMenu from './base-menu';
import TextbuttonItem from './items/textbutton-item';
import VRControllerLabelGroup from '../vr-controller/vr-controller-label-group';
import CheckboxItem from './items/checkbox-item';

export default class SettingsMenu extends BaseMenu {

  constructor({openCameraMenu, labelGroups}: {
    openCameraMenu: () => void, 
    labelGroups: (VRControllerLabelGroup|undefined)[]
  }) {
    super();

    const textItem = new TextItem('Settings', 'title', '#ffffff', { x: 256, y: 20 }, 50, 'center');
    this.items.push(textItem);

    const cameraButton = new TextbuttonItem('change_height', 'Change Camera', {
      x: 100,
      y: 80,
    }, 316, 50, 28, '#555555', '#ffc338', '#929292');

    this.items.push(cameraButton);
    this.thumbpadTargets.push(cameraButton);
    cameraButton.onTriggerDown = openCameraMenu;

    const labelsText = new TextItem('Show Labels', 'labels_text', '#ffffff', { x: 100, y: 200 }, 28, 'left');
    this.items.push(labelsText);

    const labelsCheckbox = new CheckboxItem('labels_checkbox', {
      x: 366,
      y: 180,
    }, 50, 50, '#ffc338', '#ffffff', '#00e5ff', 5, VRControllerLabelGroup.visibilitySetting, true);
    this.items.push(labelsCheckbox);
    this.thumbpadTargets.push(labelsCheckbox);

    labelsCheckbox.onTriggerDown = () => {
      const visible = !VRControllerLabelGroup.visibilitySetting;
      VRControllerLabelGroup.visibilitySetting = visible;
      labelsCheckbox.isChecked = visible;
      for (let labelGroup of labelGroups) {
        if(labelGroup) labelGroup.visible = visible;
      }
      this.update();
    };

    this.update();
  }

}