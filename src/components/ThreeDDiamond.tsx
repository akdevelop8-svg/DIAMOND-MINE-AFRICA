import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import diamondmineLogo from '../assets/images/diamondmine.jpg';

interface ThreeDDiamondProps {
  className?: string;
  onClick?: () => void;
}

interface GemColor {
  name: string;
  amharicName: string;
  colorHex: string;
  colorInt: number;
  emissiveInt: number;
  lightInt: number;
}

const GEM_COLORS: GemColor[] = [
  // 1. Red (ቀይ)
  {
    name: 'Ruby Red',
    amharicName: 'ቀይ',
    colorHex: '#ef4444',
    colorInt: 0xff6b81,
    emissiveInt: 0x880015,
    lightInt: 0xef4444,
  },
  // 2. Blue (ሰማያዊ)
  {
    name: 'Sapphire Blue',
    amharicName: 'ሰማያዊ',
    colorHex: '#3b82f6',
    colorInt: 0x60a5fa,
    emissiveInt: 0x1e3a8a,
    lightInt: 0x3b82f6,
  },
  // 3. White (ነጭ)
  {
    name: 'Pure White Diamond',
    amharicName: 'ነጭ',
    colorHex: '#ffffff',
    colorInt: 0xffffff,
    emissiveInt: 0x475569,
    lightInt: 0xffffff,
  },
  // 4. Emerald Green
  {
    name: 'Emerald Green',
    amharicName: 'አረንጓዴ',
    colorHex: '#10b981',
    colorInt: 0x34d399,
    emissiveInt: 0x065f46,
    lightInt: 0x10b981,
  },
  // 5. Imperial Gold
  {
    name: 'Imperial Gold',
    amharicName: 'ወርቅ',
    colorHex: '#f59e0b',
    colorInt: 0xfbbf24,
    emissiveInt: 0x78350f,
    lightInt: 0xf59e0b,
  },
  // 6. Electric Cyan
  {
    name: 'Electric Cyan',
    amharicName: 'ሳይያን',
    colorHex: '#06b6d4',
    colorInt: 0x38bdf8,
    emissiveInt: 0x083344,
    lightInt: 0x06b6d4,
  },
  // 7. Amethyst Violet
  {
    name: 'Royal Violet',
    amharicName: 'ሐምራዊ',
    colorHex: '#a855f7',
    colorInt: 0xc084fc,
    emissiveInt: 0x581c87,
    lightInt: 0xa855f7,
  },
];

export const ThreeDDiamond: React.FC<ThreeDDiamondProps> = ({ className = '', onClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  // Expose color index ref for animation loop
  const colorIndexRef = useRef(0);
  const activeColorTarget = useRef({
    color: new THREE.Color(GEM_COLORS[0].colorInt),
    emissive: new THREE.Color(GEM_COLORS[0].emissiveInt),
    light: new THREE.Color(GEM_COLORS[0].lightInt),
  });

  // 5-second automatic color cycle: Red -> Blue -> White -> Green -> Gold -> Cyan -> Violet
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => {
        const next = (prev + 1) % GEM_COLORS.length;
        colorIndexRef.current = next;
        activeColorTarget.current = {
          color: new THREE.Color(GEM_COLORS[next].colorInt),
          emissive: new THREE.Color(GEM_COLORS[next].emissiveInt),
          light: new THREE.Color(GEM_COLORS[next].lightInt),
        };
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.5);

    // 3. Renderer with transparency and antialiasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // 4. Create Faceted Diamond Geometry
    const segments = 16;
    const crownRadius = 1.15;
    const tableRadius = 0.65;
    const girdleHeight = 0.08;
    const crownHeight = 0.48;
    const pavilionDepth = 1.25;

    const vertices: number[] = [];
    const indices: number[] = [];

    const tableY = crownHeight + girdleHeight / 2;
    const girdleTopY = girdleHeight / 2;
    const girdleBottomY = -girdleHeight / 2;
    const culetY = -pavilionDepth;

    // 0: Table center
    vertices.push(0, tableY, 0);

    // 1..segments: Table edge
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push(Math.cos(angle) * tableRadius, tableY, Math.sin(angle) * tableRadius);
    }

    // Girdle top
    const girdleTopStart = segments + 1;
    for (let i = 0; i < segments; i++) {
      const angle = ((i + 0.5) / segments) * Math.PI * 2;
      vertices.push(Math.cos(angle) * crownRadius, girdleTopY, Math.sin(angle) * crownRadius);
    }

    // Girdle bottom
    const girdleBottomStart = girdleTopStart + segments;
    for (let i = 0; i < segments; i++) {
      const angle = ((i + 0.5) / segments) * Math.PI * 2;
      vertices.push(Math.cos(angle) * crownRadius, girdleBottomY, Math.sin(angle) * crownRadius);
    }

    // Culet point
    const culetIndex = girdleBottomStart + segments;
    vertices.push(0, culetY, 0);

    // Facet triangles
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      indices.push(0, i + 1, next + 1);
    }

    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const t1 = i + 1;
      const t2 = next + 1;
      const g1 = girdleTopStart + i;
      const g2 = girdleTopStart + next;
      indices.push(t1, g1, t2);
      indices.push(t2, g1, g2);
    }

    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const gt1 = girdleTopStart + i;
      const gt2 = girdleTopStart + next;
      const gb1 = girdleBottomStart + i;
      const gb2 = girdleBottomStart + next;
      indices.push(gt1, gb1, gt2);
      indices.push(gt2, gb1, gb2);
    }

    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const gb1 = girdleBottomStart + i;
      const gb2 = girdleBottomStart + next;
      indices.push(gb1, culetIndex, gb2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // 5. High-Refraction Diamond Physical Material
    const initialGem = GEM_COLORS[colorIndexRef.current];
    const diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialGem.colorInt),
      emissive: new THREE.Color(initialGem.emissiveInt),
      emissiveIntensity: 0.42,
      metalness: 0.15,
      roughness: 0.04,
      transmission: 0.92,
      thickness: 1.8,
      ior: 2.417,
      reflectivity: 0.96,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      flatShading: true,
      transparent: true,
      opacity: 0.96,
    });

    const diamondMesh = new THREE.Mesh(geometry, diamondMaterial);
    diamondMesh.position.y = 0.1;
    scene.add(diamondMesh);

    // Inner wireframe facet highlights
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(initialGem.colorInt),
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    diamondMesh.add(wireframeMesh);

    // 6. Sparkling Star Particle Cloud around the Diamond
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;

      particlePositions[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.065,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 7. Dynamic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x1a2639, 2.0);
    scene.add(ambientLight);

    // Primary Dynamic Key Light (changes with color cycle)
    const keyLight = new THREE.DirectionalLight(initialGem.lightInt, 3.4);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x2563eb, 2.2);
    fillLight.position.set(-3, -2, -2);
    scene.add(fillLight);

    // Rotating point light that creates traveling facet flares
    const rotatingLight = new THREE.PointLight(initialGem.lightInt, 4.2, 8);
    scene.add(rotatingLight);

    // 8. Robust Hand / Touch & Mouse Rotation Handling
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let rotationY = 0;
    let rotationX = 0.15;

    const onStart = (clientX: number, clientY: number) => {
      isDragging = true;
      prevPointerX = clientX;
      prevPointerY = clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;

      rotationY += deltaX * 0.012;
      rotationX += deltaY * 0.012;

      velocityX = deltaX * 0.012;
      velocityY = deltaY * 0.012;

      prevPointerX = clientX;
      prevPointerY = clientY;
    };

    const onEnd = () => {
      isDragging = false;
    };

    // Pointer events (works for mouse + modern pen/touch)
    const handlePointerDown = (e: PointerEvent) => {
      onStart(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      onMove(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      onEnd();
    };

    // Native Touch events fallback for mobile browsers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && isDragging) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      onEnd();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    domEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 9. Render & Animation Loop with Smooth 5s Color Morphing
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth color interpolation towards activeColorTarget
      const lerpSpeed = 0.04;
      diamondMaterial.color.lerp(activeColorTarget.current.color, lerpSpeed);
      diamondMaterial.emissive.lerp(activeColorTarget.current.emissive, lerpSpeed);
      keyLight.color.lerp(activeColorTarget.current.light, lerpSpeed);
      rotatingLight.color.lerp(activeColorTarget.current.light, lerpSpeed);
      wireframeMaterial.color.lerp(activeColorTarget.current.light, lerpSpeed);

      // Continuous smooth diamond floating & rotation
      if (!isDragging) {
        // Apply friction to user spin velocity
        velocityX *= 0.94;
        velocityY *= 0.94;

        rotationY += 0.012 + velocityX;
        rotationX += velocityY;

        // Keep vertical tilt bounded so it stays upright
        rotationX = Math.max(-0.6, Math.min(0.6, rotationX));
      }

      diamondMesh.rotation.y = rotationY;
      diamondMesh.rotation.x = rotationX;
      diamondMesh.rotation.z = Math.sin(elapsedTime * 1.2) * 0.05;

      // Soft vertical floating
      diamondMesh.position.y = 0.1 + Math.sin(elapsedTime * 1.8) * 0.12;

      // Orbiting specular light beam creating refraction flares
      rotatingLight.position.x = Math.sin(elapsedTime * 2.2) * 3;
      rotatingLight.position.z = Math.cos(elapsedTime * 2.2) * 3;
      rotatingLight.position.y = 1.2 + Math.sin(elapsedTime * 1.5) * 1.0;

      // Rotate particle stars slowly
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Responsive resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 320;
      const newHeight = container.clientHeight || 320;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domEl.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      diamondMaterial.dispose();
      wireframeMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, []);

  const currentColor = GEM_COLORS[colorIndex];

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Radial Dynamic Glow Aura behind the 3D diamond (shifts color) */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          isHovered ? 'scale-125 opacity-100' : 'opacity-85'
        }`}
        style={{ backgroundColor: currentColor.colorHex, opacity: 0.35 }}
      />
      <div className="absolute w-64 h-64 rounded-full bg-cyan-500/25 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

      {/* Pulsing Floor Ring beneath diamond */}
      <div
        className="absolute bottom-4 w-64 h-12 rounded-[100%] blur-md pointer-events-none transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${currentColor.colorHex}88 0%, transparent 70%)`,
        }}
      />

      {/* Dynamic Star Constellation around the 3D Diamond */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {[
          { top: '12%', left: '15%', size: 4, delay: '0.2s', dur: '2.5s' },
          { top: '22%', right: '18%', size: 6, delay: '0.8s', dur: '3.2s' },
          { top: '80%', left: '22%', size: 3, delay: '1.4s', dur: '2.8s' },
          { top: '75%', right: '14%', size: 5, delay: '0.5s', dur: '3.6s' },
          { top: '35%', left: '8%', size: 5, delay: '1.9s', dur: '4.0s' },
          { top: '60%', right: '8%', size: 4, delay: '1.1s', dur: '3.0s' },
          { top: '8%', right: '35%', size: 3, delay: '0.6s', dur: '2.2s' },
        ].map((star, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              right: star.right,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.dur,
            }}
          />
        ))}
      </div>

      {/* Sleek Bottom-Left Logo Badge (Unobstructed 3D Diamond in Center) */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#061126]/90 border border-[#E5B869]/80 shadow-[0_0_20px_rgba(229,184,105,0.6),0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-md hover:scale-105 transition-transform group">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E5B869] shadow-[0_0_10px_rgba(229,184,105,0.8)] shrink-0">
          <img
            src={diamondmineLogo}
            alt="Diamondmine Africa"
            className="w-full h-full object-cover filter brightness-[1.1] contrast-[1.15]"
          />
        </div>
        <div className="text-left font-mono leading-none">
          <span className="text-[10px] font-black text-white tracking-wider block uppercase">
            DIAMONDMINE
          </span>
          <span className="text-[9px] font-extrabold text-[#E5B869] tracking-widest block uppercase">
            3D GEM NODE
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Container with direct Hand/Touch Rotation */}
      {hasWebGL ? (
        <div
          ref={mountRef}
          className="relative z-10 w-full h-full min-w-[280px] min-h-[280px] sm:min-w-[340px] sm:min-h-[340px] lg:min-w-[420px] lg:min-h-[420px] cursor-grab active:cursor-grabbing flex items-center justify-center"
          title="3D African Diamond"
        />
      ) : (
        /* Graceful WebGL Fallback */
        <div className="relative z-10 w-72 h-72 flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_0_35px_rgba(56,189,248,0.9)] animate-pulse">
            <polygon points="36,36 84,36 100,52 60,52" fill="#E0F2FE" />
            <polygon points="20,52 36,36 60,52" fill={currentColor.colorHex} />
            <polygon points="60,52 84,36 100,52" fill="#7DD3FC" />
            <polygon points="20,52 60,52 60,98" fill="#0369A1" />
            <polygon points="60,52 100,52 60,98" fill="#0284C7" />
          </svg>
        </div>
      )}
    </div>
  );
};

