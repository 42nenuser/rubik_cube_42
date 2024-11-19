import {
  BoxGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Group,
  Color,
  Vector3,
} from 'three';

function createCubelet(x, y, z, colors) {
  const geometry = new BoxGeometry(0.95, 0.95, 0.95);
  const materials = [];
  
  const faceColors = [
    x > 0 ? colors[0] : 0x333333,  // right (pos x)
    x < 0 ? colors[1] : 0x333333,  // left (neg x)
    y > 0 ? colors[2] : 0x333333,  // top (pos y)
    y < 0 ? colors[2] : 0x333333,  // bottom (neg y)
    z > 0 ? colors[3] : 0x333333,  // front (pos z)
    z < 0 ? colors[3] : 0x333333,  // back (neg z)
  ];

  faceColors.forEach(color => {
    materials.push(new MeshStandardMaterial({
      color: new Color(color),
      roughness: 0.7,
      metalness: 0.1,
    }));
  });

  const cubelet = new Mesh(geometry, materials);
  cubelet.position.set(x, y, z);
  cubelet.userData.colors = [...faceColors];
  cubelet.userData.originalPosition = { x, y, z };
  
  return cubelet;
}

function createCube() {
  const group = new Group();
  
  const colors = [
    0xff0000, // red (right)
    0x00ff00, // green (left)
    0xffff00, // yellow (up)
    0x0000ff  // blue (front)
  ];

  const positions = [
    [-0.5, -0.5, -0.5],
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, -0.5],
    [-0.5, 0.5, 0.5],
    [0.5, -0.5, -0.5],
    [0.5, -0.5, 0.5],
    [0.5, 0.5, -0.5],
    [0.5, 0.5, 0.5],
  ];

  positions.forEach(([x, y, z]) => {
    const cubelet = createCubelet(x, y, z, colors);
    group.add(cubelet);
  });

  group.rotation.set(-0.5, -0.1, 0.8);

  let isRotating = false;
  let rotationAngle = 0;

  // Function to update colors based on rotation axis and direction
  function updateCubeletColors(cubelet, rotationAxis, clockwise) {
    const materials = cubelet.material;
    const oldColors = [...cubelet.userData.colors];
    const newColors = [...oldColors];
    
    switch(rotationAxis) {
      case 'z': // Front/Back face rotation
        if (clockwise) {
          newColors[0] = oldColors[3]; // right gets bottom
          newColors[1] = oldColors[2]; // left gets top
          newColors[2] = oldColors[0]; // top gets right
          newColors[3] = oldColors[1]; // bottom gets left
        } else {
          newColors[0] = oldColors[2]; // right gets top
          newColors[1] = oldColors[3]; // left gets bottom
          newColors[2] = oldColors[1]; // top gets left
          newColors[3] = oldColors[0]; // bottom gets right
        }
        break;
      case 'x': // Right/Left face rotation
        if (clockwise) {
          newColors[2] = oldColors[5]; // top gets back
          newColors[3] = oldColors[4]; // bottom gets front
          newColors[4] = oldColors[2]; // front gets top
          newColors[5] = oldColors[3]; // back gets bottom
        } else {
          newColors[2] = oldColors[4]; // top gets front
          newColors[3] = oldColors[5]; // bottom gets back
          newColors[4] = oldColors[3]; // front gets bottom
          newColors[5] = oldColors[2]; // back gets top
        }
        break;
      case 'y': // Up/Down face rotation
        if (clockwise) {
          newColors[0] = oldColors[4]; // right gets front
          newColors[1] = oldColors[5]; // left gets back
          newColors[4] = oldColors[1]; // front gets left
          newColors[5] = oldColors[0]; // back gets right
        } else {
          newColors[0] = oldColors[5]; // right gets back
          newColors[1] = oldColors[4]; // left gets front
          newColors[4] = oldColors[0]; // front gets right
          newColors[5] = oldColors[1]; // back gets left
        }
        break;
    }
    
    materials.forEach((material, index) => {
      material.color.setHex(newColors[index]);
    });
    
    cubelet.userData.colors = newColors;
  }

  function rotateFace(axis, positive, clockwise) {
    if (isRotating) return;
    
    const direction = clockwise ? 1 : -1;
    const rotationVector = new Vector3();
    const positionValue = positive ? 0.5 : -0.5;
    
    // Select cubelets based on axis and position
    const faceCubelets = group.children.filter(cube => {
      switch(axis) {
        case 'x': return Math.abs(cube.position.x - positionValue) < 0.1;
        case 'y': return Math.abs(cube.position.y - positionValue) < 0.1;
        case 'z': return Math.abs(cube.position.z - positionValue) < 0.1;
      }
    });

    isRotating = true;
    rotationAngle = 0;
    
    const rotationGroup = new Group();
    faceCubelets.forEach(cube => {
      group.remove(cube);
      rotationGroup.add(cube);
    });
    group.add(rotationGroup);

    // Set rotation axis
    switch(axis) {
      case 'x': rotationVector.set(1, 0, 0); break;
      case 'y': rotationVector.set(0, 1, 0); break;
      case 'z': rotationVector.set(0, 0, 1); break;
    }

    const animate = () => {
      if (rotationAngle < Math.PI / 2) {
        rotationAngle += 0.1;
        rotationGroup.rotateOnAxis(rotationVector, 0.1 * direction);
        requestAnimationFrame(animate);
      } else {
        faceCubelets.forEach(cube => {
          rotationGroup.remove(cube);
          group.add(cube);
          
          // Update position
          cube.position.applyAxisAngle(rotationVector, direction * Math.PI / 2);
          cube.rotation[axis] = 0;
          
          // Update colors
          updateCubeletColors(cube, axis, clockwise);
          
          cube.userData.originalPosition = {
            x: cube.position.x,
            y: cube.position.y,
            z: cube.position.z
          };
        });
        
        group.remove(rotationGroup);
        isRotating = false;
      }
    };
    
    animate();
  }

  window.addEventListener('keydown', (event) => {
    if (isRotating) return;
    
    switch (event.key.toLowerCase()) {
      // Front face
      case 'q': rotateFace('z', true, true); break;   // F
      case 'w': rotateFace('z', true, false); break;  // F'
      // Back face
      case 'a': rotateFace('z', false, true); break;  // B
      case 's': rotateFace('z', false, false); break; // B'
      // Right face
      case 'e': rotateFace('x', true, true); break;   // R
      case 'r': rotateFace('x', true, false); break;  // R'
      // Left face
      case 'd': rotateFace('x', false, true); break;  // L
      case 'f': rotateFace('x', false, false); break; // L'
      // Up face
      case 't': rotateFace('y', true, true); break;   // U
      case 'y': rotateFace('y', true, false); break;  // U'
      // Down face
      case 'g': rotateFace('y', false, true); break;  // D
      case 'h': rotateFace('y', false, false); break; // D'
    }
  });

  group.tick = (delta) => {
    // Continuous rotation removed for better visualization of face rotations
  };

  return group;
}

export { createCube };