"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  RINGS,
  sceneState,
  sceneParams,
  setSceneFocus,
  type Quality,
} from "@/lib/astrolabe";
import { DEPARTMENT_SLUGS } from "@/lib/departments";
import { orbitTick } from "@/lib/audio";
import { OrbitParticles } from "./OrbitParticles";
import { CoreMark } from "./CoreMark";

const damp = THREE.MathUtils.damp;

export function SceneRig({
  quality,
  onNavigate,
}: {
  quality: Quality;
  onNavigate: (slug: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const cageRef = useRef<THREE.Group>(null);
  const torusRefs = useRef<(THREE.Mesh | null)[]>([]);
  const spinRef = useRef(0);
  const perfRef = useRef({ frames: 0, last: performance.now(), downgraded: false });
  const { camera, gl, size, setDpr } = useThree();
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const tmpVec2 = useMemo(() => new THREE.Vector3(), []);

  const cageGeometry = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(Math.cos(a) * 3.42, 0, Math.sin(a) * 3.42);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return geo;
  }, []);

  useEffect(() => () => cageGeometry.dispose(), [cageGeometry]);

  useEffect(() => {
    const el = gl.domElement;
    let lastX = 0;
    let lastY = 0;

    const toNdc = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      sceneState.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      sceneState.pointerNdc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      sceneState.dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      toNdc(e);
      if (!sceneState.dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      sceneState.rotY += dx * 0.005;
      sceneState.dragVelY = dx * 0.0045;
      sceneState.rotX = THREE.MathUtils.clamp(sceneState.rotX + dy * 0.002, -0.55, 0.55);
    };
    const onUp = () => {
      sceneState.dragging = false;
    };
    const onLeave = () => {
      sceneState.pointerNdc.x = 0;
      sceneState.pointerNdc.y = 0;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    sceneState.open = damp(sceneState.open, sceneState.openTarget, 3, dt);
    sceneState.focusStrength = damp(
      sceneState.focusStrength,
      sceneState.focusTarget >= 0 ? 1 : 0,
      6,
      dt,
    );

    if (!sceneState.dragging) {
      sceneState.rotY += sceneState.dragVelY;
      sceneState.dragVelY *= 0.94;
      if (sceneParams.spin) {
        spinRef.current += dt * 0.06 * (1 - sceneState.open * 0.75);
      }
    }

    const g = groupRef.current;
    if (g) {
      g.rotation.y = sceneState.rotY + spinRef.current + sceneState.pointerNdc.x * 0.1;
      g.rotation.x = sceneState.rotX - sceneState.pointerNdc.y * 0.07;

      tmpVec.set(sceneState.pointerNdc.x, sceneState.pointerNdc.y, 0.5).unproject(camera);
      tmpVec.sub(camera.position).normalize();
      const dist = -camera.position.z / tmpVec.z;
      tmpVec2.copy(camera.position).add(tmpVec.multiplyScalar(dist));
      g.worldToLocal(tmpVec2);
      sceneState.pointerWorld.x = tmpVec2.x;
      sceneState.pointerWorld.y = tmpVec2.y;
      sceneState.pointerWorld.z = tmpVec2.z;
    }

    const open = sceneState.open * sceneParams.spread;
    torusRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const ring = RINGS[i];
      mesh.rotation.order = "YXZ";
      mesh.rotation.x = ring.incl * (1 - open * 0.55) + Math.PI / 2;
      mesh.rotation.y = ring.node;
      mesh.position.y = open * (i - 4.5) * 0.34;
      mesh.scale.setScalar(1 + open * 0.4);
    });

    if (cageRef.current) {
      cageRef.current.rotation.y -= dt * 0.02;
      cageRef.current.children.forEach((child) => {
        const line = child as THREE.LineLoop;
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity = 0.16 * (1 - open);
      });
    }

    const aspect = size.width / Math.max(1, size.height);
    const fit = Math.max(1, 1.05 / aspect);
    const targetZ = (sceneParams.distance + open * 1.5) * fit;
    camera.position.z = damp(camera.position.z, targetZ, 2.5, dt);
    camera.position.x = damp(camera.position.x, sceneState.pointerNdc.x * 0.2, 3, dt);
    camera.position.y = damp(camera.position.y, sceneState.pointerNdc.y * 0.12, 3, dt);
    camera.lookAt(0, 0, 0);

    const perf = perfRef.current;
    perf.frames++;
    const now = performance.now();
    if (now - perf.last > 2000) {
      const fps = (perf.frames * 1000) / (now - perf.last);
      if (fps < 32 && !perf.downgraded && gl.getPixelRatio() > 1) {
        setDpr(1);
        perf.downgraded = true;
      }
      perf.frames = 0;
      perf.last = now;
    }

    if (!sceneState.ready) sceneState.ready = true;
  });

  return (
    <>
      <group ref={groupRef}>
        <OrbitParticles quality={quality} />
        <CoreMark />
        {RINGS.map((ring, i) => (
          <mesh
            key={DEPARTMENT_SLUGS[i]}
            ref={(el) => {
              torusRefs.current[i] = el;
            }}
            rotation={[Math.PI / 2, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setSceneFocus(i);
              orbitTick();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setSceneFocus(-1);
              document.body.style.cursor = "";
            }}
            onClick={(e) => {
              if (e.delta < 8) {
                e.stopPropagation();
                onNavigate(DEPARTMENT_SLUGS[i]);
              }
            }}
          >
            <torusGeometry args={[ring.radius, 0.16, 6, 64]} />
            <meshBasicMaterial colorWrite={false} depthWrite={false} transparent opacity={0} />
          </mesh>
        ))}
        <group ref={cageRef}>
          <lineLoop geometry={cageGeometry} rotation={[0, 0, 0]}>
            <lineBasicMaterial color="#e8b84b" transparent opacity={0.16} />
          </lineLoop>
          <lineLoop geometry={cageGeometry} rotation={[Math.PI / 2, 0, 0]}>
            <lineBasicMaterial color="#e8b84b" transparent opacity={0.16} />
          </lineLoop>
        </group>
      </group>
    </>
  );
}