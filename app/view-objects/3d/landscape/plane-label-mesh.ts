import THREE from 'three';
import LabelMesh from '../label-mesh';

export default class PlaneLabelMesh extends LabelMesh {
  text: string;

  fontSize: number;

  constructor(font: THREE.Font, labelText: string, fontSize = 0.4,
    textColor = new THREE.Color('black')) {
    super(font, labelText, textColor);

    this.text = labelText;
    this.fontSize = fontSize;

    this.computeLabel(labelText, fontSize);
  }

  computeLabel(text: string, fontSize: number) {
    const labelGeo = new THREE.TextBufferGeometry(text, {
      font: this.font,
      curveSegments: 1,
      size: fontSize,
      height: 0,
    });

    this.geometry = labelGeo;

    const material = new THREE.MeshBasicMaterial({
      color: this.defaultColor,
    });

    this.material = material;
  }
}
