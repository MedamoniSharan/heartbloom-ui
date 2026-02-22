import { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Component, type ReactNode, type ErrorInfo } from "react";

interface MagnetProps {
  imageUrl: string;
}

const MagnetModel = ({ imageUrl }: MagnetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    };
    img.onerror = () => {
      // Create a pink fallback texture
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#E91E8C";
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("HeartPrinted", 128, 128);
      const tex = new THREE.CanvasTexture(canvas);
      setTexture(tex);
    };
    img.src = imageUrl;

    return () => {
      texture?.dispose();
    };
  }, [imageUrl, gl]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  const frontMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.3,
    metalness: 0.05,
  });

  const sideMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#1e293b"),
    roughness: 0.8,
    metalness: 0.2,
  });

  const backMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#334155"),
    roughness: 0.6,
    metalness: 0.3,
  });

  // BoxGeometry face order: +X, -X, +Y, -Y, +Z (front), -Z (back)
  const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[2, 2, 0.12]} />
      </mesh>
      {/* Subtle rounded edge highlight */}
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[1.96, 1.96]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

const FallbackBox = () => (
  <div className="w-full h-full flex items-center justify-center bg-muted rounded-2xl">
    <div className="text-center text-muted-foreground">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 animate-pulse">
        <span className="text-primary text-lg">3D</span>
      </div>
      <p className="text-xs">Loading preview...</p>
    </div>
  </div>
);

export const MagnetMockup3D = ({ imageUrl }: MagnetProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground">3D preview unavailable</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ErrorBoundary onError={() => setHasError(true)}>
        <Suspense fallback={<FallbackBox />}>
          <Canvas
            camera={{ position: [0, 0, 4], fov: 38 }}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            style={{ background: "transparent" }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 4, 5]} intensity={1.2} />
            <directionalLight position={[-3, 2, -2]} intensity={0.3} />
            <pointLight position={[0, 0, 3]} intensity={0.3} />
            <MagnetModel imageUrl={imageUrl} />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// Error boundary
interface EBProps { children: ReactNode; onError: () => void; }
interface EBState { hasError: boolean; }

class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_: Error, __: ErrorInfo) { this.props.onError(); }
  render() { return this.state.hasError ? null : this.props.children; }
}
