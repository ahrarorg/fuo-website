"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/astrolabe";
import { glowVertex, glowFragment } from "./shaders";

export function CoreMark() {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.ShaderMaterial>(null);

  const glowUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ffd98a") },
      uIntensity: { value: 1 },
    }),
    [],
  );

  const spriteTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,217,138,0.9)");
    grad.addColorStop(0.35, "rgba(232,184,75,0.35)");
    grad.addColorStop(1, "rgba(232,184,75,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y += delta * 0.25;
    const s = 1 - sceneState.open * 0.3;
    g.scale.setScalar(s);
    if (glowRef.current) {
      glowRef.current.uniforms.uIntensity.value =
        0.9 + Math.sin(state.clock.elapsedTime * 1.2) * 0.15 + sceneState.focusStrength * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <sprite scale={[2.4, 2.4, 1]}>
        <spriteMaterial
          map={spriteTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.85}
        />
      </sprite>
      <mesh>
        <sphereGeometry args={[0.17, 32, 32]} />
        <shaderMaterial
          ref={glowRef}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.012, 12, 96]} />
        <meshBasicMaterial color="#e8b84b" toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.6, 0.006, 8, 96]} />
        <meshBasicMaterial color="#9c7a2f" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.008, 0.008, 2.3, 8]} />
        <meshBasicMaterial color="#9c7a2f" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <coneGeometry args={[0.05, 0.16, 4]} />
        <meshBasicMaterial color="#ffd98a" toneMapped={false} />
      </mesh>
    </group>
  );
}