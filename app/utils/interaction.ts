import HammerInteraction from 'explorviz-frontend/utils/hammer-interaction';
import Raycaster from 'explorviz-frontend/utils/raycaster';
import THREE from 'three';

type CallbackFunctions = {
  mouseEnter?(): void,
  mouseOut?(): void,
  mouseMove?(mesh?: THREE.Mesh): void,
  mouseStop?(mesh?: THREE.Mesh, mousePosition?: Position2D): void,
  mouseWheel?(delta: number): void,
  singleClick?(mesh?: THREE.Mesh): void,
  doubleClick?(mesh?: THREE.Mesh): void,
  panning?(delta: {x: number, y: number}, button: 1|2|3): void
};

type MouseOffsetPosition = {
  offsetX: number,
  offsetY: number
};

export type Position2D = {
  x: number,
  y: number
};

/**
 * This class provides generic interaction functions which are triggered by
 * (mouse) events on a canvas. These functions in turn are calling
 * callback functions which are passed via the constructor. For some
 * events additional computing (e.g. raycasting) is provided to determine
 * the nature of the event.
 */
export default class Interaction {
  // Needed to register event listeners
  canvas: HTMLCanvasElement;

  // Needed for raycasting
  camera: THREE.Camera;

  // Needed to calculate current position of mouse in the scene
  renderer: THREE.WebGLRenderer;

  // Contains all Objects3D which shall be raycasted
  raycastObject3D: THREE.Object3D;

  // Used to determine if and which object was hit
  raycaster: Raycaster;

  // Needed for events like 'double tap'
  hammerHandler: HammerInteraction;

  // Contains functions which should be called in case of an event
  eventCallbackFunctions: CallbackFunctions;

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera, renderer: THREE.WebGLRenderer,
    application: THREE.Object3D, eventCallbackFunctions: CallbackFunctions) {
    this.canvas = canvas;
    this.camera = camera;
    this.renderer = renderer;
    this.raycastObject3D = application;
    this.eventCallbackFunctions = { ...eventCallbackFunctions };

    this.raycaster = new Raycaster();

    // Init Hammer interaction
    this.hammerHandler = HammerInteraction.create();
    this.hammerHandler.setupHammer(canvas);

    this.setupInteraction();
  }

  setupInteraction() {
    this.bindThisOnEventListeners();
    this.setupEventListener();
    this.setupHammerListener();
  }

  bindThisOnEventListeners() {
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseWheelStart = this.onMouseWheelStart.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseStop = this.onMouseStop.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onPanning = this.onPanning.bind(this);
    this.onSingleClick = this.onSingleClick.bind(this);
  }

  setupEventListener() {
    // mouseout handler for disabling notifications
    if (this.eventCallbackFunctions.mouseOut) { this.canvas.addEventListener('mouseout', this.onMouseOut, false); }

    // mouseenter handler for disabling notifications
    if (this.eventCallbackFunctions.mouseEnter) { this.canvas.addEventListener('mouseenter', this.onMouseEnter, false); }

    // zoom handler
    if (this.eventCallbackFunctions.mouseWheel) { this.canvas.addEventListener('wheel', this.onMouseWheelStart, false); }

    // mouse move handler
    if (this.eventCallbackFunctions.mouseMove) { this.canvas.addEventListener('mousemove', this.onMouseMove, false); }

    if (this.eventCallbackFunctions.mouseStop) {
      this.createMouseStopEvent();
      this.canvas.addEventListener('mousestop', this.onMouseStop, false);
    }
  }

  setupHammerListener() {
    if (this.eventCallbackFunctions.doubleClick) {
      this.hammerHandler.on('doubletap', this.onDoubleClick);
    }

    if (this.eventCallbackFunctions.panning) {
      this.hammerHandler.on('panning', this.onPanning);
    }

    if (this.eventCallbackFunctions.singleClick) {
      this.hammerHandler.on('singletap', this.onSingleClick);
    }
  }

  onMouseEnter() {
    if (!this.eventCallbackFunctions.mouseEnter) { return; }

    this.eventCallbackFunctions.mouseEnter();
  }

  onMouseOut() {
    if (!this.eventCallbackFunctions.mouseOut) { return; }

    this.eventCallbackFunctions.mouseOut();
  }

  onMouseMove(evt: MouseEvent) {
    if (!this.eventCallbackFunctions.mouseMove) { return; }

    // Extract mouse position
    const mouse = {
      x: evt.offsetX,
      y: evt.offsetY,
    };

    const intersectedViewObj = this.raycast(mouse);

    if (intersectedViewObj && intersectedViewObj.object instanceof THREE.Mesh) {
      this.eventCallbackFunctions.mouseMove(intersectedViewObj.object);
    } else {
      this.eventCallbackFunctions.mouseMove();
    }
  }

  onMouseStop(evt: CustomEvent<MouseOffsetPosition>) {
    if (!this.eventCallbackFunctions.mouseStop) { return; }

    // Extract mouse position
    const mouse = {
      x: evt.detail.offsetX,
      y: evt.detail.offsetY,
    };

    const intersectedViewObj = this.raycast(mouse);

    if (intersectedViewObj && intersectedViewObj.object instanceof THREE.Mesh) {
      this.eventCallbackFunctions.mouseStop(intersectedViewObj.object, mouse);
    } else {
      this.eventCallbackFunctions.mouseStop();
    }
  }

  onMouseWheelStart(evt: WheelEvent) {
    if (!this.eventCallbackFunctions.mouseWheel) { return; }

    // Either 1 or -1 (depending on mouse wheel direction)
    const delta = Math.sign(evt.deltaY);

    this.eventCallbackFunctions.mouseWheel(delta);
  }

  onSingleClick(mouse: Position2D) {
    if (!this.eventCallbackFunctions.singleClick) { return; }

    const intersectedViewObj = this.raycast(mouse);

    if (intersectedViewObj && intersectedViewObj.object instanceof THREE.Mesh) {
      this.eventCallbackFunctions.singleClick(intersectedViewObj.object);
    } else {
      this.eventCallbackFunctions.singleClick();
    }
  }

  onDoubleClick(mouse: Position2D) {
    if (!this.eventCallbackFunctions.doubleClick) { return; }

    const intersectedViewObj = this.raycast(mouse);

    if (intersectedViewObj && intersectedViewObj.object instanceof THREE.Mesh) {
      this.eventCallbackFunctions.doubleClick(intersectedViewObj.object);
    } else {
      this.eventCallbackFunctions.doubleClick();
    }
  }

  onPanning(delta: {x: number, y: number}, event: any) {
    if (!this.eventCallbackFunctions.panning) { return; }

    this.eventCallbackFunctions.panning(delta, event.button);
  }

  // Handler

  calculatePositionInScene(mouseOnCanvas: Position2D) {
    const x = (mouseOnCanvas.x / this.renderer.domElement.clientWidth) * 2 - 1;

    const y = -(mouseOnCanvas.y / this.renderer.domElement.clientHeight) * 2 + 1;

    const origin = { x, y };

    return origin;
  }

  raycast(mouseOnCanvas: Position2D) {
    const origin = this.calculatePositionInScene(mouseOnCanvas);

    const intersectedViewObj = this.raycaster.raycasting(origin, this.camera,
      this.raycastObject3D.children);

    return intersectedViewObj;
  }

  createMouseStopEvent() {
    const self = this;

    // Custom event for mousemovement end
    (function computeMouseMoveEvent(delay) {
      let timeout: NodeJS.Timeout;
      self.canvas.addEventListener('mousemove', (evt: MouseEvent) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const event = new CustomEvent<MouseOffsetPosition>('mousestop', {
            detail: {
              offsetX: evt.offsetX,
              offsetY: evt.offsetY,
            },
            bubbles: true,
            cancelable: true,
          });
          if (evt.target) evt.target.dispatchEvent(event);
        }, delay);
      });
    }(300));
  }

  /**
   * Removes all listeners for mouse and hammer events
   */
  removeHandlers() {
    if (this.eventCallbackFunctions.doubleClick) { this.hammerHandler.hammerManager.off('doubletap'); }

    if (this.eventCallbackFunctions.panning) { this.hammerHandler.hammerManager.off('panning'); }

    if (this.eventCallbackFunctions.singleClick) { this.hammerHandler.hammerManager.off('singletap'); }

    if (this.eventCallbackFunctions.mouseOut) { this.canvas.removeEventListener('mouseout', this.onMouseOut); }

    if (this.eventCallbackFunctions.mouseEnter) { this.canvas.removeEventListener('mouseenter', this.onMouseEnter); }

    if (this.eventCallbackFunctions.mouseWheel) { this.canvas.removeEventListener('wheel', this.onMouseWheelStart); }

    if (this.eventCallbackFunctions.mouseMove) { this.canvas.removeEventListener('mousemove', this.onMouseMove); }

    if (this.eventCallbackFunctions.mouseStop) { this.canvas.removeEventListener('mousestop', this.onMouseStop); }
  }
}
