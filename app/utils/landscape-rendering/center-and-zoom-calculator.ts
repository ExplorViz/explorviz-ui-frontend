import THREE from 'three';
import Landscape from 'explorviz-frontend/models/landscape';
import DrawNodeEntity from 'explorviz-frontend/models/drawnodeentity';

export function getCenterAndZoom(emberLandscape: Landscape, camera: THREE.PerspectiveCamera,
  webglrenderer: THREE.WebGLRenderer) {
  // Calculate new center and update zoom
  let center = calculateLandscapeCenterAndZZoom(emberLandscape, webglrenderer);

  // Update zoom if camera has not been moved by user
  if (camera.position.z === 0) {
    camera.position.z = center.z;
    camera.updateProjectionMatrix();
  }

  return center;
}


export function calculateLandscapeCenterAndZZoom(emberLandscape: Landscape, renderer: THREE.WebGLRenderer) {
  // Semantics of rect entries
  const MIN_X = 0;
  const MAX_X = 1;
  const MIN_Y = 2;
  const MAX_Y = 3;

  const EXTRA_SPACE_IN_PERCENT = 0.02;
  const SIZE_FACTOR = 0.65;

  let rect = getLandscapeRect(emberLandscape);

  let requiredWidth = Math.abs(rect.get(MAX_X) - rect.get(MIN_X));
  requiredWidth += requiredWidth * EXTRA_SPACE_IN_PERCENT;

  let requiredHeight = Math.abs(rect.get(MAX_Y) - rect.get(MIN_Y));
  requiredHeight += requiredHeight * EXTRA_SPACE_IN_PERCENT;

  let viewPortSize = new THREE.Vector2();
  renderer.getSize(viewPortSize);

  let viewportRatio = viewPortSize.width / viewPortSize.height;

  let newZ_by_width = (requiredWidth / viewportRatio) * SIZE_FACTOR;
  let newZ_by_height = requiredHeight * SIZE_FACTOR;
  let cameraZ = Math.max(newZ_by_height, newZ_by_width, 10.0);

  const center = new THREE.Vector3(rect.get(MIN_X) + ((rect.get(MAX_X) - rect.get(MIN_X)) / 2.0),
    rect.get(MIN_Y) + ((rect.get(MAX_Y) - rect.get(MIN_Y)) / 2.0), cameraZ);

  return center;
}


export function getLandscapeRect(emberLandscape: Landscape) {
  // Semantics of rect entries
  const MIN_X = 0;
  const MAX_X = 1;
  const MIN_Y = 2;
  const MAX_Y = 3;

  let rect: number[] = [];
  rect.push(Number.MAX_VALUE);
  rect.push(-Number.MAX_VALUE);
  rect.push(Number.MAX_VALUE);
  rect.push(-Number.MAX_VALUE);

  let systems = emberLandscape.get('systems');

  if (systems.get('length') === 0) {
    rect[MIN_X] = 0.0;
    rect[MAX_X] = 1.0;
    rect[MIN_Y] = 0.0;
    rect[MAX_Y] = 1.0;
  } else {
    systems.forEach((system: any) => {
      getMinMaxFromQuad(system, rect);

      let nodegroups = system.get('nodegroups');
      nodegroups.forEach((nodegroup: any) => {
        let nodes = nodegroup.get('nodes');
        nodes.forEach((node: any) => {
          getMinMaxFromQuad(node, rect);
        });
      });
    });
  }
  return rect;
}


export function getMinMaxFromQuad(drawnodeentity: DrawNodeEntity, rect: number[]) {
  // Semantics of rect entries
  const MIN_X = 0;
  const MAX_X = 1;
  const MIN_Y = 2;
  const MAX_Y = 3;

  let curX = drawnodeentity.get('positionX');
  let curY = drawnodeentity.get('positionY');

  if (curX < rect[MIN_X]) {
    rect[MIN_X] = curX;
  }
  if (rect[MAX_X] < curX + drawnodeentity.get('width')) {
    rect[MAX_X] = curX + drawnodeentity.get('width');
  }
  if (curY > rect[MAX_Y]) {
    rect[MAX_Y] = curY;
  }
  if (rect[MIN_Y] > curY - drawnodeentity.get('height')) {
    rect[MIN_Y] = curY - drawnodeentity.get('height');
  }
}