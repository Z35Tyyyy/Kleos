import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ count = 200 }) => {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 10;
            p[i * 3 + 1] = (Math.random() - 0.5) * 10;
            p[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, [count]);

    const ref = useRef();
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        ref.current.rotation.y = time * 0.05;
        ref.current.rotation.x = time * 0.03;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={points}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.015}
                color="#FF2D55"
                transparent
                opacity={0.4}
                sizeAttenuation
            />
        </points>
    );
};

const Blob = ({ position, color, speed, distort }) => {
    return (
        <Float speed={speed} rotationIntensity={2} floatIntensity={2}>
            <Sphere args={[1, 64, 64]} position={position} scale={1.5}>
                <MeshDistortMaterial
                    color={color}
                    speed={speed}
                    distort={distort}
                    radius={1}
                    transparent
                    opacity={0.15}
                />
            </Sphere>
        </Float>
    );
};

const Background3D = () => {
    return (
        <div className="fixed inset-0 -z-20 bg-[#0A0A0A]">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                
                <ParticleField count={400} />
                
                <Blob position={[-3, 2, -2]} color="#FF2D55" speed={2} distort={0.4} />
                <Blob position={[3, -2, -3]} color="#FF6B8B" speed={1.5} distort={0.5} />
                
                {/* Neural grid floor effect */}
                <gridHelper 
                    args={[20, 20, '#FF2D55', '#1A1A1A']} 
                    position={[0, -4, 0]} 
                    rotation={[0, 0, 0]} 
                    transparent
                    opacity={0.1}
                />
            </Canvas>
        </div>
    );
};

export default Background3D;
