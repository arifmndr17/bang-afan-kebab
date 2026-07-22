document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Preloader Logic ---
    const loader = document.getElementById('loader');
    const loaderProgress = document.getElementById('loader-progress');
    const loaderText = document.getElementById('loader-text');
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;
        
        loaderProgress.style.width = `${progress}%`;
        loaderText.innerText = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    initAnimations(); 
                }, 1000);
            }, 500);
        }
    }, 40);

    // --- 2. Custom Cursor ---
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        function animateCursor() {
            let distX = mouseX - cursorX;
            let distY = mouseY - cursorY;
            cursorX += distX * 0.15; 
            cursorY += distY * 0.15;
            
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        const interactables = document.querySelectorAll('.cursor-hover, a, button, input, textarea');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                cursor.style.borderColor = 'rgba(6, 182, 212, 1)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.backgroundColor = 'transparent';
                cursor.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            });
        });
    }

    // --- 3. Lenis Smooth Scroll ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000) });
    gsap.ticker.lagSmoothing(0, 0);

    // --- 4. Navigation & Scroll Progress ---
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    let scrollIntensity = 0;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('py-4', 'bg-bg/50', 'backdrop-blur-xl');
            navbar.classList.remove('py-6');
        } else {
            navbar.classList.remove('py-4', 'bg-bg/50', 'backdrop-blur-xl');
            navbar.classList.add('py-6');
        }

        let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        let scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + "%";
        
        // Map scroll to 0-1 for hologram intensity
        scrollIntensity = Math.min(winScroll / 800, 1.0);
    });

    // --- 5. Typed.js Initialization ---
    new Typed('#typed-text', {
        strings: ['Future.', 'Holograms.', 'Impossible.', 'Web 3.0.'],
        typeSpeed: 60,
        backSpeed: 40,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // --- 6. Magnetic Buttons ---
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const position = btn.getBoundingClientRect();
            const x = e.pageX - position.left - position.width / 2;
            const y = e.pageY - position.top - position.height / 2;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });

    // --- 7. GSAP Scroll Animations ---
    function initAnimations() {
        const revealElements = document.querySelectorAll(".gs_reveal");
        revealElements.forEach(elem => {
            let x = 0, y = 50;
            if (elem.classList.contains("gs_right")) { x = 50; y = 0; }
            
            gsap.fromTo(elem, 
                { x: x, y: y, autoAlpha: 0 }, 
                {
                    duration: 1, 
                    x: 0, 
                    y: 0, 
                    autoAlpha: 1, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });
        
        const counters = document.querySelectorAll('.counter');
        ScrollTrigger.create({
            trigger: "#stats-container",
            start: "top 80%",
            once: true,
            onEnter: () => {
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 2,
                        snap: { innerHTML: 1 },
                        ease: "power2.out"
                    });
                });
            }
        });
    }

    // ========================================================
    // --- 8. THREE.JS CINEMATIC HOLOGRAPHIC CORE SCENE ---
    // ========================================================
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    // Use a slightly foggy background to blend the hologram perfectly
    scene.fog = new THREE.FogExp2(0x050816, 0.02);
    
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-Processing (Bloom for Cinematic Glow)
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.2; // Base strength
    bloomPass.radius = 0.5;

    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- Master Group for the Hologram ---
    const hologramGroup = new THREE.Group();
    // Shift right on desktop to align with 2-column layout
    hologramGroup.position.x = window.innerWidth > 1024 ? 6 : 0;
    scene.add(hologramGroup);

    // 1. Central Hologram Core (Custom Shader for Scanlines & Fresnel)
    const coreGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const coreMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x06B6D4) }, // Cyan
            color2: { value: new THREE.Color(0x3B82F6) }  // Blue
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vec3 viewDir = normalize(-vPosition);
                float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
                rim = smoothstep(0.4, 1.0, rim);
                
                // Animated Holographic Scanlines
                float scanline = sin(vUv.y * 120.0 - time * 15.0) * 0.5 + 0.5;
                
                // Energy Pulse
                float pulse = sin(time * 3.0) * 0.5 + 0.5;
                
                // Color Mixing
                vec3 baseColor = mix(color2, color1, vUv.y + pulse * 0.3);
                
                // Additive intensity
                vec3 finalColor = baseColor * (0.3 + scanline * 0.4) + (baseColor * pow(rim, 2.0) * 2.5);
                
                gl_FragColor = vec4(finalColor, 0.8 * (rim + 0.2));
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const core = new THREE.Mesh(coreGeo, coreMaterial);
    hologramGroup.add(core);

    // 2. Wireframe Energy Sphere (Pulses outwards)
    const wireGeo = new THREE.IcosahedronGeometry(3.2, 2);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x06B6D4,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    hologramGroup.add(wireSphere);

    // 3. Rotating Holographic Rings (Data Streams)
    const ringGroup = new THREE.Group();
    const ringCount = 4;
    for(let i = 0; i < ringCount; i++) {
        // Different sizes and thickness
        const rGeo = new THREE.TorusGeometry(4.5 + i * 1.2, 0.02 + i * 0.01, 16, 100);
        const rMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x06B6D4 : 0x7C3AED,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(rGeo, rMat);
        
        // Random initial rotations
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        
        // Store individual speed vectors
        ring.userData = {
            speedX: (Math.random() - 0.5) * 0.015,
            speedY: (Math.random() - 0.5) * 0.015
        };
        ringGroup.add(ring);
    }
    hologramGroup.add(ringGroup);

    // 4. Floating Crystal Shards (Data Fragments)
    const shardGeo = new THREE.OctahedronGeometry(0.25, 0);
    const shardMat = new THREE.MeshPhysicalMaterial({
        color: 0x06B6D4,
        transparent: true,
        opacity: 0.7,
        transmission: 0.9,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x3B82F6,
        emissiveIntensity: 0.5
    });
    const shards = [];
    for(let i = 0; i < 20; i++) {
        const shard = new THREE.Mesh(shardGeo, shardMat);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 6 + Math.random() * 4; // Orbit radius
        
        shard.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
        shard.userData = {
            angle: theta,
            radius: r,
            speed: 0.005 + Math.random() * 0.01,
            yOffset: shard.position.y
        };
        hologramGroup.add(shard);
        shards.push(shard);
    }

    // 5. Electric Arcs (Dynamic LineSegments)
    const arcGeo = new THREE.BufferGeometry();
    const arcCount = 5;
    const arcPoints = 10;
    const arcPositions = new Float32Array(arcCount * arcPoints * 3);
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    const arcMat = new THREE.LineBasicMaterial({
        color: 0x3B82F6,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const arcs = new THREE.LineSegments(arcGeo, arcMat);
    hologramGroup.add(arcs);

    // 6. Particle Galaxy (Volumetric Dust)
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 60;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x06B6D4,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // --- Mouse Parallax Interaction ---
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (event) => {
            targetX = (event.clientX - windowHalfX) * 0.0015;
            targetY = (event.clientY - windowHalfY) * 0.0015;
        });
    }

    // --- Render & Animation Loop ---
    const clock = new THREE.Clock();
    
    function animate3D() {
        requestAnimationFrame(animate3D);
        const elapsedTime = clock.getElapsedTime();

        // 1. Update Core Shader
        coreMaterial.uniforms.time.value = elapsedTime;
        core.rotation.y += 0.005;
        core.rotation.x += 0.002;

        // 2. Pulse Wireframe Sphere & React to Scroll
        // Base pulse + scroll intensity scale
        const pulseScale = 1 + Math.sin(elapsedTime * 2) * 0.05 + scrollIntensity * 0.3;
        wireSphere.scale.setScalar(pulseScale);
        wireSphere.rotation.y -= 0.003;
        
        // Increase Bloom on scroll
        bloomPass.strength = 1.2 + scrollIntensity * 2.0;

        // 3. Animate Rings
        ringGroup.children.forEach(r => {
            // Speed up rings drastically when scrolling down
            const speedMult = 1 + scrollIntensity * 8;
            r.rotation.x += r.userData.speedX * speedMult;
            r.rotation.y += r.userData.speedY * speedMult;
        });

        // 4. Animate Shards (Orbiting)
        shards.forEach(s => {
            const speedMult = 1 + scrollIntensity * 3;
            s.userData.angle += s.userData.speed * speedMult;
            s.position.x = s.userData.radius * Math.cos(s.userData.angle);
            s.position.z = s.userData.radius * Math.sin(s.userData.angle);
            // Floating bob effect
            s.position.y = s.userData.yOffset + Math.sin(elapsedTime * 3 + s.userData.angle) * 0.5;
            
            s.rotation.x += 0.02 * speedMult;
            s.rotation.y += 0.03 * speedMult;
        });

        // 5. Update Electric Arcs (Glitchy movement around core)
        if(Math.random() > 0.5) {
            const positions = arcs.geometry.attributes.position.array;
            for(let i=0; i<arcCount * arcPoints; i++) {
                // Generate random points close to the core surface
                const radius = 2.8 + Math.random() * 0.8;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                positions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i*3+2] = radius * Math.cos(phi);
            }
            arcs.geometry.attributes.position.needsUpdate = true;
        }

        // 6. Particle Background Rotation
        particlesMesh.rotation.y = -elapsedTime * 0.01;

        // 7. Smooth Mouse Parallax (Easing)
        hologramGroup.rotation.y += 0.05 * (targetX - hologramGroup.rotation.y);
        hologramGroup.rotation.x += 0.05 * (targetY - hologramGroup.rotation.x);

        // Render using composer instead of renderer for Post-Processing Bloom
        composer.render();
    }
    animate3D();

    // --- Resize Handler ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        
        // Readjust position
        hologramGroup.position.x = window.innerWidth > 1024 ? 6 : 0;
    });
});
