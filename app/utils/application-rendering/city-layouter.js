import THREE from "three";
import BoxLayout from "../layout-models/box-layout";
import CommunicationLayout from "../layout-models/communication-layout";
import FoundationMesh from "../3d/application/foundation-mesh";

export function applyBoxLayout(application) {

  const INSET_SPACE = 4.0;

  const components = application.get('components');

  const foundationComponent = components.objectAt(0);

  let layoutMap = new Map();

  let boxEntities = application.getAllClazzes().concat(application.getAllComponents());
  boxEntities.forEach((entity) => {
    layoutMap.set(entity.get('id'), new BoxLayout(entity));
  });

  calcClazzHeight(foundationComponent);
  initNodes(foundationComponent);

  doLayout(foundationComponent);
  setAbsoluteLayoutPosition(foundationComponent);

  return layoutMap;

  // Helper functions

  function setAbsoluteLayoutPosition(component) {
    const childComponents = component.get('children');
    const clazzes = component.get('clazzes');

    let componentLayout = layoutMap.get(component.id);

    childComponents.forEach((childComponent) => {
      let childCompLayout = layoutMap.get(childComponent.get('id'));
      childCompLayout.positionX = childCompLayout.positionX + componentLayout.positionX;
      childCompLayout.positionY += componentLayout.positionY + 0.75 * 2.0;
      childCompLayout.positionZ = childCompLayout.positionZ + componentLayout.positionZ;
      setAbsoluteLayoutPosition(childComponent);
    });


    clazzes.forEach((clazz) => {
      let clazzLayout = layoutMap.get(clazz.get('id'));
      clazzLayout.positionX = clazzLayout.positionX + componentLayout.positionX;
      clazzLayout.positionY = clazzLayout.positionY + componentLayout.positionY;
      clazzLayout.positionY = clazzLayout.positionY + 0.75 * 2.0;
      clazzLayout.positionZ = clazzLayout.positionZ + componentLayout.positionZ;
    });
  }


  function calcClazzHeight(component) {

    const CLAZZ_SIZE_DEFAULT = 0.05;
    const CLAZZ_SIZE_EACH_STEP = 1.1;

    const clazzes = [];
    getClazzList(component, clazzes);

    const instanceCountList = [];

    clazzes.forEach((clazz) => {
      instanceCountList.push(clazz.get('instanceCount'));
    });

    const categories = getCategories(instanceCountList, false);

    clazzes.forEach((clazz) => {
      let clazzData = layoutMap.get(clazz.id);
      clazzData.height = (CLAZZ_SIZE_EACH_STEP * categories[clazz.get('instanceCount')] + CLAZZ_SIZE_DEFAULT) * 2.0;
    });
  }


  function getCategories(list, linear) {
    const result = [];

    if (list.length === 0) {
      return result;
    }

    list.sort();

    if (linear) {
      const listWithout0 = [];

      list.forEach((entry) => {
        if (entry !== 0) {
          listWithout0.push(entry);
        }
      });

      if (listWithout0.length === 0) {
        result.push(0.0);
        return result;
      }
      useLinear(listWithout0, list, result);
    }
    else {
      const listWithout0And1 = [];

      list.forEach((entry) => {
        if (entry !== 0 && entry !== 1) {
          listWithout0And1.push(entry);
        }
      });

      if (listWithout0And1.length === 0) {
        result.push(0.0);
        result.push(1.0);
        return result;
      }

      useThreshholds(listWithout0And1, list, result);
    }

    return result;



    // inner helper functions

    function useThreshholds(listWithout0And1, list, result) {
      let max = 1;

      listWithout0And1.forEach((value) => {
        if (value > max) {
          max = value;
        }
      });

      const oneStep = max / 3.0;

      const t1 = oneStep;
      const t2 = oneStep * 2;

      list.forEach((entry) => {
        let categoryValue = getCategoryFromValues(entry, t1, t2);
        result[entry] = categoryValue;
      });

    }


    function getCategoryFromValues(value, t1, t2) {
      if (value === 0) {
        return 0.0;
      } else if (value === 1) {
        return 1.0;
      }

      if (value <= t1) {
        return 2.0;
      } else if (value <= t2) {
        return 3.0;
      } else {
        return 4.0;
      }
    }


    function useLinear(listWithout0, list, result) {
      let max = 1;
      let secondMax = 1;

      listWithout0.forEach((value) => {
        if (value > max) {
          secondMax = max;
          max = value;
        }
      });

      const oneStep = secondMax / 4.0;

      const t1 = oneStep;
      const t2 = oneStep * 2;
      const t3 = oneStep * 3;

      list.forEach((entry) => {
        const categoryValue = getCategoryFromLinearValues(entry, t1, t2, t3);
        result[entry] = categoryValue;
      });

    }


    function getCategoryFromLinearValues(value, t1, t2, t3) {
      if (value <= 0) {
        return 0;
      } else if (value <= t1) {
        return 1.5;
      } else if (value <= t2) {
        return 2.5;
      } else if (value <= t3) {
        return 4.0;
      } else {
        return 6.5;
      }
    }



  } // END getCategories


  function getClazzList(component, clazzesArray) {
    const children = component.get('children');
    const clazzes = component.get('clazzes');

    children.forEach((child) => {
      getClazzList(child, clazzesArray);
    });

    clazzes.forEach((clazz) => {
      clazzesArray.push(clazz);
    });
  }


  function initNodes(component) {
    const children = component.get('children');
    const clazzes = component.get('clazzes');

    const clazzWidth = 2.0;

    children.forEach((child) => {
      initNodes(child);
    });

    clazzes.forEach((clazz) => {
      let clazzData = layoutMap.get(clazz.id);
      clazzData.depth = clazzWidth;
      clazzData.width = clazzWidth;
    });

    let componentData = layoutMap.get(component.id);
    componentData.height = getHeightOfComponent(component);
    componentData.width = -1.0;
    componentData.depth = -1.0;
  }


  function getHeightOfComponent(component) {
    const floorHeight = 0.75 * 4.0;

    let childrenHeight = floorHeight;

    const children = component.get('children');
    const clazzes = component.get('clazzes');

    clazzes.forEach((clazz) => {
      let clazzData = layoutMap.get(clazz.id);
      const height = clazzData.height;
      if (height > childrenHeight) {
        childrenHeight = height;
      }
    });

    children.forEach((child) => {
      let childData = layoutMap.get(child.id);
      if (childData.height > childrenHeight) {
        childrenHeight = childData.height;
      }
    });

    return childrenHeight + 0.1;
  }


  function doLayout(component) {
    const children = component.get('children');

    children.forEach((child) => {
      doLayout(child);
    });

    layoutChildren(component);
  }


  function layoutChildren(component) {
    let tempList = [];

    const children = component.get('children');
    const clazzes = component.get('clazzes');

    clazzes.forEach((clazz) => {
      tempList.push(clazz);
    });

    children.forEach((child) => {
      tempList.push(child);
    });

    const segment = layoutGeneric(tempList);

    let componentData = layoutMap.get(component.id);
    componentData.width = segment.width;
    componentData.depth = segment.height;
  }


  function layoutGeneric(children) {
    const rootSegment = createRootSegment(children);

    let maxX = 0.0;
    let maxZ = 0.0;

    // Sort by width and by name (for entities with same width)
    children.sort(function (e1, e2) {
      let e1Width = layoutMap.get(e1.id).width;
      let e2Width = layoutMap.get(e2.id).width;
      const result = e1Width - e2Width;

      if ((-0.00001 < result) && (result < 0.00001)) {
        return e1.get('name').localeCompare(e2.get('name'));
      }

      if (result < 0) {
        return 1;
      } else {
        return -1;
      }
    });

    children.forEach((child) => {
      let childData = layoutMap.get(child.id);
      const childWidth = (childData.width + INSET_SPACE * 2);
      const childHeight = (childData.depth + INSET_SPACE * 2);
      childData.positionY = 0.0;

      const foundSegment = insertFittingSegment(rootSegment, childWidth, childHeight);

      childData.positionX = foundSegment.startX + INSET_SPACE;
      childData.positionZ = foundSegment.startZ + INSET_SPACE;

      if (foundSegment.startX + childWidth > maxX) {
        maxX = foundSegment.startX + childWidth;
      }
      if (foundSegment.startZ + childHeight > maxZ) {
        maxZ = foundSegment.startZ + childHeight;
      }
    });

    rootSegment.width = maxX;
    rootSegment.height = maxZ;

    // add labelInset space

    const labelInsetSpace = 8.0;

    children.forEach((child) => {
      let childData = layoutMap.get(child.id);
      childData.positionX = childData.positionX + labelInsetSpace;
    });

    rootSegment.width = rootSegment.width + labelInsetSpace;

    return rootSegment;


    function insertFittingSegment(rootSegment, toFitWidth, toFitHeight) {
      if (!rootSegment.used && toFitWidth <= rootSegment.width && toFitHeight <= rootSegment.height) {
        const resultSegment = createLayoutSegment();
        rootSegment.upperRightChild = createLayoutSegment();
        rootSegment.lowerChild = createLayoutSegment();

        resultSegment.startX = rootSegment.startX;
        resultSegment.startZ = rootSegment.startZ;
        resultSegment.width = toFitWidth;
        resultSegment.height = toFitHeight;
        resultSegment.parent = rootSegment;

        rootSegment.upperRightChild.startX = rootSegment.startX + toFitWidth;
        rootSegment.upperRightChild.startZ = rootSegment.startZ;
        rootSegment.upperRightChild.width = rootSegment.width - toFitWidth;
        rootSegment.upperRightChild.height = toFitHeight;
        rootSegment.upperRightChild.parent = rootSegment;

        if (rootSegment.upperRightChild.width <= 0.0) {
          rootSegment.upperRightChild = null;
        }

        rootSegment.lowerChild.startX = rootSegment.startX;
        rootSegment.lowerChild.startZ = rootSegment.startZ + toFitHeight;
        rootSegment.lowerChild.width = rootSegment.width;
        rootSegment.lowerChild.height = rootSegment.height - toFitHeight;
        rootSegment.lowerChild.parent = rootSegment;

        if (rootSegment.lowerChild.height <= 0.0) {
          rootSegment.lowerChild = null;
        }

        rootSegment.used = true;
        return resultSegment;
      }
      else {
        let resultFromUpper = null;
        let resultFromLower = null;

        if (rootSegment.upperRightChild != null) {
          resultFromUpper = insertFittingSegment(rootSegment.upperRightChild, toFitWidth, toFitHeight);
        }

        if (rootSegment.lowerChild != null) {
          resultFromLower = insertFittingSegment(rootSegment.lowerChild, toFitWidth, toFitHeight);
        }

        if (resultFromUpper == null) {
          return resultFromLower;
        } else if (resultFromLower == null) {
          return resultFromUpper;
        } else {
          // choose best fitting square
          const upperBoundX = resultFromUpper.startX + resultFromUpper.width;

          const lowerBoundZ = resultFromLower.startZ + resultFromLower.height;

          if (upperBoundX <= lowerBoundZ) {
            resultFromLower.parent.used = false;
            return resultFromUpper;
          } else {
            resultFromUpper.parent.used = false;
            return resultFromLower;
          }
        }
      }
    }

  } // END layoutGeneric


  function createRootSegment(children) {
    let worstCaseWidth = 0.0;
    let worstCaseHeight = 0.0;

    children.forEach((child) => {
      let childData = layoutMap.get(child.id);
      worstCaseWidth = worstCaseWidth + (childData.width + INSET_SPACE * 2);
      worstCaseHeight = worstCaseHeight + (childData.depth + INSET_SPACE * 2);
    });


    const rootSegment = createLayoutSegment();

    rootSegment.startX = 0.0;
    rootSegment.startZ = 0.0;

    rootSegment.width = worstCaseWidth;
    rootSegment.height = worstCaseHeight;

    return rootSegment;
  }


  function createLayoutSegment() {
    const layoutSegment =
    {
      parent: null,
      lowerChild: null,
      upperRightChild: null,
      startX: null,
      startZ: null,
      width: null,
      height: null,
      used: false
    };

    return layoutSegment;
  } // END createLayoutSegment

}

// Communication Layouting //


export function applyCommunicationLayout(application, boxLayoutMap, modelIdToMesh) {
  let layoutMap = new Map();

  layoutEdges(application);

  const drawableClazzCommunications = application.get('drawableClazzCommunications');

  drawableClazzCommunications.forEach((clazzcommunication) => {
    if (layoutMap.has(clazzcommunication.get('id'))) {
      layoutDrawableCommunication(clazzcommunication, application.get('components').objectAt(0));
    }
  });

  return layoutMap;

  // HELPER FUNCTIONS

  function layoutEdges(application) {

    const drawableClazzCommunications = application.get('drawableClazzCommunications');

    drawableClazzCommunications.forEach((clazzCommunication) => {
      let parentComponent = clazzCommunication.get('parentComponent');
      let parentMesh = modelIdToMesh.get(parentComponent.get('id'));

      if (parentMesh.opened) {
        layoutMap.set(clazzCommunication.get('id'), new CommunicationLayout(clazzCommunication));

        let sourceEntity = null;
        let targetEntity = null;

        let sourceParent = clazzCommunication.get('sourceClazz').get('parent');
        let sourceParentMesh = modelIdToMesh.get(sourceParent.get('id'));

        if (sourceParentMesh.opened) {
          sourceEntity = clazzCommunication.get('sourceClazz');
        } else {
          sourceEntity = findFirstParentOpenComponent(clazzCommunication.get('sourceClazz').get('parent'));
        }


        let targetParent = clazzCommunication.get('targetClazz').get('parent');
        let targetParentMesh = modelIdToMesh.get(targetParent.get('id'));

        if (targetParentMesh.opened) {
          targetEntity = clazzCommunication.get('targetClazz');
        }
        else {
          targetEntity = findFirstParentOpenComponent(clazzCommunication.get('targetClazz').get('parent'));
        }

        let commLayout = layoutMap.get(clazzCommunication.get('id'));
        let sourceLayout = boxLayoutMap.get(sourceEntity.get('id'));
        let targetLayout = boxLayoutMap.get(targetEntity.get('id'));

        if (sourceEntity !== null && targetEntity !== null) {
          commLayout.startX = sourceLayout.positionX + sourceLayout.width / 2.0;
          commLayout.startY = sourceLayout.positionY;
          commLayout.startZ = sourceLayout.positionZ + sourceLayout.depth / 2.0;

          commLayout.endX = targetLayout.positionX + targetLayout.width / 2.0;
          commLayout.endY = targetLayout.positionY + 0.05;
          commLayout.endZ = targetLayout.positionZ + targetLayout.depth / 2.0;
        }
      }
      calculatePipeSizeFromQuantiles(application);
    });

    // Calculates the size of the pipes regarding the number of requests
    function calculatePipeSizeFromQuantiles(application) {

      // constant factors for rendering communication lines (pipes)
      const pipeSizeEachStep = 0.45;
      const pipeSizeDefault = 0.1;

      const requestsList = gatherRequestsIntoList(application);
      const categories = calculateCategories(requestsList);
      const drawableClazzCommunications = application.get('drawableClazzCommunications');

      drawableClazzCommunications.forEach((clazzCommunication) => {
        if (layoutMap.has(clazzCommunication.get('id'))) {
          const calculatedCategory = getMatchingCategory(clazzCommunication.get('requests'), categories);
          let communicationData = layoutMap.get(clazzCommunication.get('id'));
          communicationData.lineThickness = (calculatedCategory * pipeSizeEachStep) + pipeSizeDefault;
        }
      });

      // generates four default categories for rendering (thickness of communication lines)
      function calculateCategories(requestsList) {
        const minNumber = Math.min.apply(Math, requestsList);
        const avgNumber = requestsList.reduce(addUpRequests) / requestsList.length;
        const maxNumber = Math.max.apply(Math, requestsList);
        const categories = [0, minNumber, avgNumber, maxNumber];

        return categories;
      } // END calculateCategories

      // retrieves a matching category for a specific clazzCommunication
      function getMatchingCategory(numOfRequests, categories) {

        // default category = lowest category
        let calculatedCategory = 0;

        for (var i = 1; i < categories.length; i++) {
          if (numOfRequests >= categories[i]) {
            calculatedCategory = i;
          }
          else {
            return calculatedCategory;
          }
        }
        return calculatedCategory;
      } // END getMatchingCategory

      // Retrieves all requests and pushes them to a list for further processing
      function gatherRequestsIntoList(application) {

        let requestsList = [];
        const drawableClazzCommunications = application.get('drawableClazzCommunications');

        drawableClazzCommunications.forEach((clazzCommunication) => {
          if ((clazzCommunication.get('sourceClazz') !== clazzCommunication.get('targetClazz'))) {
            requestsList.push(clazzCommunication.get('requests'));
          }
        });

        return requestsList;
      } // END gatherRequestsIntoList

      // adds up a number to an existing number
      function addUpRequests(requestSum, requestCount) {
        return requestSum + requestCount;
      } // END addUpRequests

    } // END calculatePipeSizeFromQuantiles

    function findFirstParentOpenComponent(entity) {
      let parentComponent = entity.get('parentComponent');

      let parentMesh = modelIdToMesh.get(parentComponent.get('id'));
      if (parentMesh instanceof FoundationMesh || parentMesh.opened) {
        return entity;
      } else {
        return findFirstParentOpenComponent(entity.get('parentComponent'));
      }
    }

  } // END layoutEdges

  function layoutDrawableCommunication(commu, foundation) {

    const externalPortsExtension = new THREE.Vector3(3.0, 3.5, 3.0);

    const centerCommuIcon =
      new THREE.Vector3(foundation.get('positionX') + foundation.get('extension').x * 2.0 +
        externalPortsExtension.x * 4.0, foundation.get('positionY') -
        foundation.get('extension').y + externalPortsExtension.y,
        foundation.get('positionZ') + foundation.get('extension').z * 2.0 -
        externalPortsExtension.z - 12.0);

    layoutInAndOutCommunication(commu, commu.get('sourceClazz'), centerCommuIcon);
  }

  function layoutInAndOutCommunication(commu, internalClazz, centerCommuIcon) {
    let communicationData = layoutMap.get(commu.get('id'));
    communicationData.pointsFor3D = [];
    communicationData.pointsFor3D.push(centerCommuIcon);

    if (internalClazz !== null) {
      const end = new THREE.Vector3();

      const centerPoint =
        new THREE.Vector3(internalClazz.get('positionX') +
          internalClazz.get('width') / 2.0,
          internalClazz.get('positionY') + internalClazz.get('height') / 2.0,
          internalClazz.get('positionZ') + internalClazz.get('depth') / 2.0);

      end.x = internalClazz.get('positionX') + internalClazz.get('width') / 2.0;
      end.y = centerPoint.y;
      end.z = internalClazz.get('positionZ') + internalClazz.get('depth') / 2.0;
      communicationData.pointsFor3D.push(end);
    }
  }

}
