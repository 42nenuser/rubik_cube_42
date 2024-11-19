import {
  BoxGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Group,
  Color,
} from 'three';

function createCubelet(x, y, z, colors) {
  // Make each cubelet slightly smaller to create minimal gaps
  const geometry = new BoxGeometry(0.95, 0.95, 0.95);
  const materials = [];
  
  // Order of faces: right, left, top, bottom, front, back
  const faceColors = [
    x > 0 ? colors[0] : 0x333333,  // right
    x < 0 ? colors[1] : 0x333333,  // left
    y > 0 ? colors[2] : 0x333333,  // top
    y < 0 ? colors[2] : 0x333333,  // bottom
    z > 0 ? colors[3] : 0x333333,  // front
    z < 0 ? colors[3] : 0x333333,  // back
  ];

  // Create materials for each face
  faceColors.forEach(color => {
    materials.push(new MeshStandardMaterial({
      color: new Color(color),
      roughness: 0.7,
      metalness: 0.1,
    }));
  });

  const cubelet = new Mesh(geometry, materials);
  // Use smaller offsets for tighter spacing
  cubelet.position.set(x, y, z);
  return cubelet;
}

function createCube() {
  const group = new Group();
  
  // Define the four colors (in hex)
  const colors = [
    0xff0000, // red
    0x00ff00, // green
    0xffff00, // yellow
    0x0000ff  // blue
  ];

  // Create all 8 cubelets with ideal spacing
  const positions = [
    [-0.5, -0.5, -0.5], // bottom layer, back left
    [-0.5, -0.5, 0.5],  // bottom layer, front left
    [-0.5, 0.5, -0.5],  // top layer, back left
    [-0.5, 0.5, 0.5],   // top layer, front left
    [0.5, -0.5, -0.5],  // bottom layer, back right
    [0.5, -0.5, 0.5],   // bottom layer, front right
    [0.5, 0.5, -0.5],   // top layer, back right
    [0.5, 0.5, 0.5],    // top layer, front right
  ];

  positions.forEach(([x, y, z]) => {
    const cubelet = createCubelet(x, y, z, colors);
    group.add(cubelet);
  });

  // Set initial rotation
  group.rotation.set(-0.5, -0.1, 0.8);

  // Add animation
  const radiansPerSecond = MathUtils.degToRad(30);
  group.tick = (delta) => {
    group.rotation.z += delta * radiansPerSecond;
    group.rotation.x += delta * radiansPerSecond;
    group.rotation.y += delta * radiansPerSecond;
  };

  return group;
}

export { createCube };