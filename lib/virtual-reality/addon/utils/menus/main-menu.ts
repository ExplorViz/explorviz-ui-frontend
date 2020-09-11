import TextItem from './items/text-item';
import BaseMenu from './base-menu';
import TextbuttonItem from './items/textbutton-item';

export default class MainMenu extends BaseMenu {
  constructor(closeMenu: () => void, openCameraMenu: () => void, openLandscapeMenu: () => void) {
    super();

    this.opacity = 0.8;

    const textItem = new TextItem('Text', 'text', '#ffffff', { x: 256, y: 50 }, 50, 'center');
    this.items.push(textItem);

    const cameraButton = new TextbuttonItem('change_height', 'Change Camera', {
      x: 100,
      y: 80,
    }, 316, 50, 28, '#555555', '#ffc338', '#929292', {
      onTriggerPressed: openCameraMenu,
    });
    const landscapeButton = new TextbuttonItem('change_landscape_position', 'Move Landscape', {
      x: 100,
      y: 140,
    }, 316, 50, 28, '#555555', '#ffc338', '#929292', {
      onTriggerPressed: openLandscapeMenu,
    });
    const spectateButton = new TextbuttonItem('spectate', 'Spectate', {
      x: 100,
      y: 200,
    }, 316, 50, 28, '#555555', '#ffc338', '#929292', {});
    const connectionButton = new TextbuttonItem('connection', 'Connection', {
      x: 100,
      y: 260,
    }, 316, 50, 28, '#555555', '#ffc338', '#929292', {});
    const advancedButton = new TextbuttonItem('advanced', 'Advanced Options', {
      x: 100,
      y: 320,
    }, 316, 50, 28, '#555555', '#ffc338', '#929292', {});
    const exitButton = new TextbuttonItem('exit', 'Exit', {
      x: 100,
      y: 402,
    }, 316, 50, 28, '#555555', '#ffc338', '#929292', {
      onTriggerPressed: closeMenu,
    });
    this.items.push(cameraButton, landscapeButton, spectateButton,
      connectionButton, advancedButton, exitButton);
    this.update();
  }
}