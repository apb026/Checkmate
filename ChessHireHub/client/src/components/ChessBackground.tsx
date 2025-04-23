import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Define personality traits for each chess piece
export const chessPiecePersonas = {
  pawn: {
    name: "Pawn",
    title: "The Entry-Level Interviewer",
    description: "Straightforward and focused on foundational skills.",
    interviewStyle: "Covers the basics thoroughly before moving to more complex topics."
  },
  knight: {
    name: "Knight",
    title: "The Tactical Problem Solver",
    description: "Approaches interviews from unexpected angles.",
    interviewStyle: "Presents scenario-based questions and puzzles to test adaptability."
  },
  bishop: {
    name: "Bishop",
    title: "The Strategic Thinker",
    description: "Evaluates long-term potential and vision.",
    interviewStyle: "Asks about career goals and how experiences align with future plans."
  },
  rook: {
    name: "Rook",
    title: "The Technical Expert",
    description: "Direct and thorough in technical assessment.",
    interviewStyle: "Conducts deep dives into technical knowledge with practical examples."
  },
  queen: {
    name: "Queen",
    title: "The Versatile Leader",
    description: "Evaluates across multiple dimensions.",
    interviewStyle: "Combines technical, behavioral, and leadership questions."
  },
  king: {
    name: "King",
    title: "The Executive Interviewer",
    description: "Focuses on overall fit and leadership potential.",
    interviewStyle: "Assesses cultural alignment and executive presence."
  }
};

// 3D Chess background component inspired by Windows 7 Chess
const ChessBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827); // dark blue-gray background
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    // Create the chessboard
    const boardSize = 16;
    const boardGeometry = new THREE.BoxGeometry(boardSize, 0.5, boardSize);
    const boardMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 50
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.receiveShadow = true;
    board.position.y = -0.25;
    scene.add(board);
    
    // Create squares on the board
    const squareSize = boardSize / 8;
    const squareGeometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          const squareMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xF0D9B5, // light squares
            shininess: 30
          });
          const square = new THREE.Mesh(squareGeometry, squareMaterial);
          square.position.set(
            (i - 3.5) * squareSize, 
            0.1, 
            (j - 3.5) * squareSize
          );
          square.receiveShadow = true;
          board.add(square);
        } else {
          const squareMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xB58863, // dark squares
            shininess: 30
          });
          const square = new THREE.Mesh(squareGeometry, squareMaterial);
          square.position.set(
            (i - 3.5) * squareSize, 
            0.1, 
            (j - 3.5) * squareSize
          );
          square.receiveShadow = true;
          board.add(square);
        }
      }
    }
    
    // Create chess pieces
    const createPiece = (
      pieceType: string, 
      color: number, 
      position: THREE.Vector3, 
      scale: number = 1
    ) => {
      let geometry;
      
      switch(pieceType) {
        case 'pawn':
          geometry = new THREE.ConeGeometry(0.4, 1.2, 8);
          break;
        case 'rook':
          geometry = new THREE.BoxGeometry(0.6, 1.4, 0.6);
          break;
        case 'knight':
          // Simplified knight using multiple geometries
          const knightGroup = new THREE.Group();
          
          const baseGeom = new THREE.CylinderGeometry(0.4, 0.5, 0.4, 8);
          const baseMesh = new THREE.Mesh(
            baseGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          baseMesh.position.y = 0.2;
          knightGroup.add(baseMesh);
          
          const bodyGeom = new THREE.ConeGeometry(0.4, 1, 8);
          const bodyMesh = new THREE.Mesh(
            bodyGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          bodyMesh.position.y = 0.9;
          knightGroup.add(bodyMesh);
          
          const headGeom = new THREE.SphereGeometry(0.3, 8, 8);
          const headMesh = new THREE.Mesh(
            headGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          headMesh.position.set(0.1, 1.5, 0);
          knightGroup.add(headMesh);
          
          knightGroup.position.copy(position);
          knightGroup.scale.set(scale, scale, scale);
          knightGroup.castShadow = true;
          
          // Add orbit animation
          const orbitRadius = 8 + Math.random() * 5;
          const orbitSpeed = 0.0003 + Math.random() * 0.0002;
          const initialAngle = Math.random() * Math.PI * 2;
          const height = 4 + Math.random() * 3;
          
          const knightObj = {
            mesh: knightGroup,
            radius: orbitRadius,
            speed: orbitSpeed,
            angle: initialAngle,
            height: height,
            rotationAxis: new THREE.Vector3(
              Math.random(), Math.random(), Math.random()
            ).normalize(),
            rotationSpeed: 0.01 + Math.random() * 0.01
          };
          
          scene.add(knightGroup);
          return knightObj;
          
        case 'bishop':
          geometry = new THREE.ConeGeometry(0.4, 1.8, 8);
          break;
        case 'queen':
          geometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
          break;
        case 'king':
          const kingGroup = new THREE.Group();
          
          const kingBaseGeom = new THREE.CylinderGeometry(0.5, 0.6, 0.4, 8);
          const kingBaseMesh = new THREE.Mesh(
            kingBaseGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          kingBaseMesh.position.y = 0.2;
          kingGroup.add(kingBaseMesh);
          
          const kingBodyGeom = new THREE.CylinderGeometry(0.45, 0.5, 1.4, 8);
          const kingBodyMesh = new THREE.Mesh(
            kingBodyGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          kingBodyMesh.position.y = 1.1;
          kingGroup.add(kingBodyMesh);
          
          const kingCrownGeom = new THREE.CylinderGeometry(0.5, 0.45, 0.3, 8);
          const kingCrownMesh = new THREE.Mesh(
            kingCrownGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          kingCrownMesh.position.y = 1.9;
          kingGroup.add(kingCrownMesh);
          
          const crossBaseGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
          const crossBaseMesh = new THREE.Mesh(
            crossBaseGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          crossBaseMesh.position.y = 2.2;
          kingGroup.add(crossBaseMesh);
          
          const crossTopGeom = new THREE.BoxGeometry(0.2, 0.4, 0.1);
          const crossTopMesh = new THREE.Mesh(
            crossTopGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          crossTopMesh.position.y = 2.5;
          kingGroup.add(crossTopMesh);
          
          const crossSideGeom = new THREE.BoxGeometry(0.5, 0.1, 0.1);
          const crossSideMesh = new THREE.Mesh(
            crossSideGeom, 
            new THREE.MeshPhongMaterial({ color, shininess: 60 })
          );
          crossSideMesh.position.y = 2.35;
          kingGroup.add(crossSideMesh);
          
          kingGroup.position.copy(position);
          kingGroup.scale.set(scale, scale, scale);
          kingGroup.castShadow = true;
          
          // Add orbit animation
          const kingOrbitRadius = 9 + Math.random() * 4;
          const kingOrbitSpeed = 0.0002 + Math.random() * 0.0001;
          const kingInitialAngle = Math.random() * Math.PI * 2;
          const kingHeight = 5 + Math.random() * 2;
          
          const kingObj = {
            mesh: kingGroup,
            radius: kingOrbitRadius,
            speed: kingOrbitSpeed,
            angle: kingInitialAngle,
            height: kingHeight,
            rotationAxis: new THREE.Vector3(
              Math.random(), Math.random(), Math.random()
            ).normalize(),
            rotationSpeed: 0.005 + Math.random() * 0.005
          };
          
          scene.add(kingGroup);
          return kingObj;
          
        default:
          geometry = new THREE.SphereGeometry(0.5, 16, 16);
      }
      
      if (pieceType !== 'knight' && pieceType !== 'king') {
        const material = new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 60
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.scale.set(scale, scale, scale);
        mesh.castShadow = true;
        
        // Add orbit animation
        const orbitRadius = 7 + Math.random() * 6;
        const orbitSpeed = 0.0002 + Math.random() * 0.0003;
        const initialAngle = Math.random() * Math.PI * 2;
        const height = 3 + Math.random() * 4;
        
        const pieceObj = {
          mesh: mesh,
          radius: orbitRadius,
          speed: orbitSpeed,
          angle: initialAngle,
          height: height,
          rotationAxis: new THREE.Vector3(
            Math.random(), Math.random(), Math.random()
          ).normalize(),
          rotationSpeed: 0.008 + Math.random() * 0.012
        };
        
        scene.add(mesh);
        return pieceObj;
      }
      
      return null;
    };
    
    // Define piece object type
    interface ChessPieceObject {
      mesh: THREE.Mesh | THREE.Group;
      radius: number;
      speed: number;
      angle: number;
      height: number;
      rotationAxis: THREE.Vector3;
      rotationSpeed: number;
    }
    
    // Create floating chess pieces
    const floatingPieces: (ChessPieceObject | null)[] = [];
    
    // White pieces
    floatingPieces.push(createPiece('pawn', 0xFFFFFF, new THREE.Vector3(0, 3, 0), 1.2));
    floatingPieces.push(createPiece('rook', 0xFFFFFF, new THREE.Vector3(0, 4, 0), 1.5));
    floatingPieces.push(createPiece('knight', 0xFFFFFF, new THREE.Vector3(0, 5, 0), 1.5));
    floatingPieces.push(createPiece('bishop', 0xFFFFFF, new THREE.Vector3(0, 6, 0), 1.5));
    floatingPieces.push(createPiece('queen', 0xFFFFFF, new THREE.Vector3(0, 7, 0), 1.5));
    floatingPieces.push(createPiece('king', 0xFFFFFF, new THREE.Vector3(0, 8, 0), 1.5));
    
    // Black pieces
    floatingPieces.push(createPiece('pawn', 0x333333, new THREE.Vector3(0, 3, 0), 1.2));
    floatingPieces.push(createPiece('rook', 0x333333, new THREE.Vector3(0, 4, 0), 1.5));
    floatingPieces.push(createPiece('knight', 0x333333, new THREE.Vector3(0, 5, 0), 1.5));
    floatingPieces.push(createPiece('bishop', 0x333333, new THREE.Vector3(0, 6, 0), 1.5));
    floatingPieces.push(createPiece('queen', 0x333333, new THREE.Vector3(0, 7, 0), 1.5));
    floatingPieces.push(createPiece('king', 0x333333, new THREE.Vector3(0, 8, 0), 1.5));
    
    // Create stars (small white dots)
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const starsPositions = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      
      // Keep stars away from the center
      if (Math.abs(x) < 10 && Math.abs(y) < 10 && Math.abs(z) < 10) continue;
      
      starsPositions.push(x, y, z);
    }
    
    starsGeometry.setAttribute(
      'position', 
      new THREE.Float32BufferAttribute(starsPositions, 3)
    );
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Add slow camera rotation
    let cameraAngle = 0;
    const cameraRadius = 30;
    const cameraHeight = 15;
    const cameraSpeed = 0.0005;
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update camera position in a circular path
      cameraAngle += cameraSpeed;
      camera.position.x = Math.sin(cameraAngle) * cameraRadius;
      camera.position.z = Math.cos(cameraAngle) * cameraRadius;
      camera.position.y = cameraHeight;
      camera.lookAt(0, 0, 0);
      
      // Update floating pieces
      floatingPieces.forEach(piece => {
        if (!piece) return;
        
        // Update orbit position
        piece.angle += piece.speed;
        const x = Math.cos(piece.angle) * piece.radius;
        const z = Math.sin(piece.angle) * piece.radius;
        
        piece.mesh.position.set(x, piece.height, z);
        
        // Rotate piece around its axis
        piece.mesh.rotateOnAxis(piece.rotationAxis, piece.rotationSpeed);
      });
      
      // Slowly rotate the stars
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js resources
      renderer.dispose();
      floatingPieces.forEach(piece => {
        if (!piece) return;
        
        if (piece.mesh instanceof THREE.Mesh) {
          piece.mesh.geometry.dispose();
          if (Array.isArray(piece.mesh.material)) {
            piece.mesh.material.forEach((material: THREE.Material) => material.dispose());
          } else {
            piece.mesh.material.dispose();
          }
        } else if (piece.mesh instanceof THREE.Group) {
          piece.mesh.children.forEach((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach((material: THREE.Material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }
      });
      
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    ></div>
  );
};

export default ChessBackground;
