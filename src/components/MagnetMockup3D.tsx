import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";

interface MagnetProps {
  imageUrl: string;
}

const MagnetModel = ({ imageUrl }: MagnetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[2, 2, 0.15]}
      radius={0.12}
      smoothness={4}
      castShadow
      receiveShadow
    >
      {/* Front face with photo */}
      <meshStandardMaterial attach="material-4" map={texture} roughness={0.3} metalness={0.1} />
      {/* Other faces — dark magnet back */}
      <meshStandardMaterial attach="material-0" color="#1e293b" roughness={0.8} metalness={0.2} />
      <meshStandardMaterial attach="material-1" color="#1e293b" roughness={0.8} metalness={0.2} />
      <meshStandardMaterial attach="material-2" color="#1e293b" roughness={0.8} metalness={0.2} />
      <meshStandardMaterial attach="material-3" color="#1e293b" roughness={0.8} metalness={0.2} />
      <meshStandardMaterial attach="material-5" color="#334155" roughness={0.6} metalness={0.3} />
    </RoundedBox>
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
      <div className="w-full aspect-square rounded-2xl border border-border bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground">3D preview unavailable</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border bg-card">
      <ErrorBoundary onError={() => setHasError(true)}>
        <Suspense fallback={<FallbackBox />}>
          <Canvas
            shadows
            camera={{ position: [0, 0, 4], fov: 40 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <directionalLight position={[-3, 2, -3]} intensity={0.4} />
            <MagnetModel imageUrl={imageUrl} />
            <Environment preset="studio" />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// Simple error boundary
import { Component, type ReactNode, type ErrorInfo } from "react";

interface EBProps { children: ReactNode; onError: () => void; }
interface EBState { hasError: boolean; }

class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_: Error, __: ErrorInfo) { this.props.onError(); }
  render() { return this.state.hasError ? null : this.props.children; }
}
