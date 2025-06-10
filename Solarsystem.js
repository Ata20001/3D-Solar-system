const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);


const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;


const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);


function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

createStars();


const planets = [
    { name: 'Sun', radius: 10, color: 0xffff00, distance: 0, speed: 0 },
    { name: 'Mercury', radius: 1.5, color: 0xa9a9a9, distance: 20, speed: 0.04 },
    { name: 'Venus', radius: 2.5, color: 0xffa500, distance: 30, speed: 0.015 },
    { name: 'Earth', radius: 2.6, color: 0x1E90FF, distance: 40, speed: 0.01 },
    { name: 'Mars', radius: 2, color: 0xff4500, distance: 50, speed: 0.008 },
    { name: 'Jupiter', radius: 6, color: 0xffd700, distance: 70, speed: 0.002 },
    { name: 'Saturn', radius: 5, color: 0xf4a460, distance: 90, speed: 0.0009, hasRing: true },
    { name: 'Uranus', radius: 4, color: 0x00bfff, distance: 110, speed: 0.0004 },
    { name: 'Neptune', radius: 3.8, color: 0x0000ff, distance: 130, speed: 0.0001 }
];


const planetObjects = [];
const orbitObjects = [];

planets.forEach((planet, index) => {
    
    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: planet.color });
    const sphere = new THREE.Mesh(geometry, material);
    
    if (index !== 0) {
        
        sphere.position.x = planet.distance;
        
        
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
        const points = [];
        const segments = 64;
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                planet.distance * Math.cos(theta),
                0,
                planet.distance * Math.sin(theta)
            ));
        }
        
        orbitGeometry.setFromPoints(points);
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbit);
        orbitObjects.push(orbit);
    }
    
    scene.add(sphere);
    planetObjects.push({
        mesh: sphere,
        speed: planet.speed,
        distance: planet.distance,
        angle: Math.random() * Math.PI * 2
    });
    
    
    if (planet.hasRing) {
        const ringGeometry = new THREE.RingGeometry(planet.radius + 2, planet.radius + 5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xf4a460, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        sphere.add(ring);
    }
});


const speedControlsContainer = document.getElementById('speed-controls');
planetObjects.slice(1).forEach((planet, index) => {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';
    
    const label = document.createElement('label');
    label.textContent = planets[index + 1].name;
    controlGroup.appendChild(label);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '0.1';
    slider.step = '0.001';
    slider.value = planet.speed;
    slider.id = `speed-${planets[index + 1].name}`;
    controlGroup.appendChild(slider);
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = planet.speed.toFixed(3);
    controlGroup.appendChild(valueDisplay);
    
    slider.addEventListener('input', () => {
        planet.speed = parseFloat(slider.value);
        valueDisplay.textContent = planet.speed.toFixed(3);
    });
    
    speedControlsContainer.appendChild(controlGroup);
});


let isPaused = false;
document.getElementById('pause-resume').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('pause-resume').textContent = isPaused ? 'Resume' : 'Pause';
});


document.getElementById('reset').addEventListener('click', () => {
    planetObjects.slice(1).forEach((planet, index) => {
        planet.speed = planets[index + 1].speed;
        const slider = document.getElementById(`speed-${planets[index + 1].name}`);
        slider.value = planet.speed;
        slider.nextElementSibling.textContent = planet.speed.toFixed(3);
    });
});


function animate() {
    requestAnimationFrame(animate);
    
    if (!isPaused) {
        planetObjects.forEach((planet, index) => {
            if (index !== 0) { 
                planet.angle += planet.speed;
                planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
                planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
                planet.mesh.rotation.y += 0.01;
            }
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();