import * as THREE from './three.module.js';
import { WebGL } from './WebGL.js';
import { form } from './form_full.js';

class Animatic {
    constructor(container) {
        this.container = container;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.visibleHeight = 0;
        this.visibleWidth = 0;
        this.sparkles_matrix = new THREE.Matrix4();
        this.sparkles_mesh = null;
        this.circle_count = form.length;
        this.circle_radius = 0.03;
        this.utime = 0;
        this.points_count = 0;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(380, this.container.clientWidth / this.container.clientHeight, 0.1, 10000);
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(new THREE.Vector3(0, 0, -1));
        const vFOV = this.camera.fov;
        this.visibleHeight = 2 * Math.tan(vFOV / 2) * Math.abs(this.camera.position.z);
        this.visibleWidth = this.visibleHeight * this.camera.aspect;
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, autoClearColor: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0xffffff, 0.0);

        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.visibleWidth = this.visibleHeight * this.camera.aspect;
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        const sparkles_geometry = new THREE.CircleGeometry(this.circle_radius, 12);
        this.sparkles_mesh = new THREE.InstancedMesh(sparkles_geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), this.circle_count / 4);
        
        for (let i = 0; i < this.circle_count; i += 4) {
            var x = form[i + 0] / 100 - 6;
            var y = form[i + 1] / 100 - 6;
            var z = form[i + 2];

            if (i < this.circle_count / 4) {
                x -= 3.5;
            }
            if (i > this.circle_count * 3/ 4 && i < this.circle_count * 5 / 6) {
                y -= 0.5;
            }
            this.sparkles_matrix.setPosition(x, y, z);
            this.sparkles_mesh.setMatrixAt(this.points_count, this.sparkles_matrix);
            
            this.sparkles_mesh.setColorAt(this.points_count, new THREE.Color(form[i + 3]));
            var col = new THREE.Color();
            this.sparkles_mesh.getColorAt(this.points_count, col);

            this.sparkles_mesh.instanceColor.needsUpdate = true;

            this.points_count++;
        }
        this.sparkles_mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.sparkles_mesh);

        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize(), false);

        if (WebGL.isWebGLAvailable()) {
            this.animate();
        } else {
            const warning = WebGL.getWebGLErrorMessage();
            this.container.appendChild(warning);
        }
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.visibleWidth = this.visibleHeight * this.camera.aspect;
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.camera.updateProjectionMatrix();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
    }
    
    render() {
        var pos = new THREE.Vector3();
        var quat = new THREE.Quaternion();
        var scale = new THREE.Vector3();
        var scale_factor = 1;

        for (let i = 0; i < this.points_count; i++) {
            if (i < this.points_count / 4) {
                this.sparkles_mesh.getMatrixAt(i, this.sparkles_matrix);
                this.sparkles_matrix.decompose(pos, quat, scale);
                scale_factor = 1;
                scale = new THREE.Vector3(scale_factor, scale_factor, 1);
                pos.y = pos.y + Math.sin(pos.x + this.utime) / 1500;
                this.sparkles_matrix.compose(pos, quat, scale);
                this.sparkles_mesh.setMatrixAt(i, this.sparkles_matrix);
            }
            if (i >= this.points_count / 4 && i <= this.points_count / 2) {
                this.sparkles_mesh.getMatrixAt(i, this.sparkles_matrix);
                this.sparkles_matrix.decompose(pos, quat, scale);
                scale_factor = 0.8;
                scale = new THREE.Vector3(scale_factor, scale_factor, 1);
                pos.x = pos.x - Math.sin(pos.x + this.utime * 0.8) / 1200;
                pos.y = pos.y + Math.sin(pos.x + this.utime * 0.8) / 1300;
                this.sparkles_matrix.compose(pos, quat, scale);
                this.sparkles_mesh.setMatrixAt(i, this.sparkles_matrix);
            }
            if (i > this.points_count / 2) {
                this.sparkles_mesh.getMatrixAt(i, this.sparkles_matrix);
                this.sparkles_matrix.decompose(pos, quat, scale);
                scale_factor = 0.9;
                scale = new THREE.Vector3(scale_factor, scale_factor, 1);
                pos.x = pos.x - Math.sin(pos.x + this.utime * 0.5) / 1200;
                pos.y = pos.y + Math.sin(pos.x + this.utime * 0.5) / 1300;
                this.sparkles_matrix.compose(pos, quat, scale);
                this.sparkles_mesh.setMatrixAt(i, this.sparkles_matrix);
            }
        }
        if (this.utime < 1000 * Math.PI) { this.utime += 0.02 }
        else { this.utime = 0 }
        this.sparkles_mesh.instanceMatrix.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize animations for all elements with class "animatic"
document.addEventListener('DOMContentLoaded', () => {
    const animaticElements = document.getElementsByClassName('animatic');
    for (let element of animaticElements) {
        new Animatic(element);
    }
});
