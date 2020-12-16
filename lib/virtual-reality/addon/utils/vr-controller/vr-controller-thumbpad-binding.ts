import VRController from "explorviz-frontend/utils/vr-rendering/VRController";
import VRControllerLabelGroup from "./vr-controller-label-group";
import VRControllerLabelMesh, { VRControllerLabelPosition } from "./vr-controller-label-mesh";
import THREE from "three";

type VRControllerThumbpadLabels = {
    labelUp?: string;
    labelRight?: string;
    labelDown?: string;
    labelLeft?: string;
};


export type VRControllerThumbpadLabelPositions = {
    positionUp: VRControllerLabelPosition;
    positionRight: VRControllerLabelPosition;
    positionDown: VRControllerLabelPosition;
    positionLeft: VRControllerLabelPosition;
};

type VRControllerThumbpadCallbacks = {
    onThumbpadTouch?(controller: VRController, axes: number[]): void;
    onThumbpadDown?(controller: VRController, axes: number[]): void;
    onThumbpadPress?(controller: VRController, axes: number[]): void;
    onThumbpadUp?(controller: VRController, axes: number[]): void;
};

export default class VRControllerThumbpadBinding {
    static getDirection(axes: number[]) {
        const angle = THREE.MathUtils.RAD2DEG * Math.atan(axes[1] / axes[0]);
        if (angle < 45) return 'right';
        if (angle < 135) return 'up';
        if (angle < 225) return 'left';
        return 'down';
    }

    labels: VRControllerThumbpadLabels;
    callbacks: VRControllerThumbpadCallbacks;

    constructor(labels : VRControllerThumbpadLabels, callbacks: VRControllerThumbpadCallbacks) {
        this.labels = labels;
        this.callbacks = callbacks;
    }

    addLabels(group: VRControllerLabelGroup, positions: VRControllerThumbpadLabelPositions): void {
        if (this.labels.labelUp) group.add(new VRControllerLabelMesh(this.labels.labelUp, positions.positionUp));
        if (this.labels.labelRight) group.add(new VRControllerLabelMesh(this.labels.labelRight, positions.positionRight));
        if (this.labels.labelDown) group.add(new VRControllerLabelMesh(this.labels.labelDown, positions.positionDown));
        if (this.labels.labelLeft) group.add(new VRControllerLabelMesh(this.labels.labelLeft, positions.positionLeft));
    }
}