        import * as THREE from './three.module.js';
        import { WebGL } from './WebGL.js';
        import { form } from './form_full.js';
        var camera, scene, renderer, container;
        var visibleHeight, visibleWidth;
        
        const sparkles_matrix = new THREE.Matrix4();
        let sparkles_mesh;
        const circle_count = form.length;
        const circle_radius = 0.03;
        let utime = 0;
        var points_count = 0;

        init();

        function init() {
            container = document.getElementById('container');
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(380, window.innerWidth / window.innerHeight, 0.1, 10000);
            camera.position.set(0, 0, 20);
            camera.lookAt(new THREE.Vector3(0, 0, -1));
            const vFOV = camera.fov ;
            visibleHeight = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
            const height = visibleHeight;
            visibleWidth = height * camera.aspect;
            scene.add(camera);
            

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, autoClearColor: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xffffff, 0.0);

            camera.aspect = window.innerWidth / window.innerHeight;
            visibleWidth = visibleHeight * camera.aspect;
            renderer.setSize(window.innerWidth, window.innerHeight);

            const sparkles_geometry = new THREE.CircleGeometry(circle_radius, 12);
            sparkles_mesh = new THREE.InstancedMesh(sparkles_geometry, new THREE.MeshBasicMaterial({ color: 0x82C57F, side: THREE.DoubleSide }), circle_count);
            
            for (let i = 0; i < circle_count; i += 4) {

                var x = form[i + 0] / 100 - 6;
                var y = form[i + 1] / 100 - 6;
                var z = form[i + 2];

                if (i < circle_count / 4) {
                    x -= 3.5;
                }
                if (i > circle_count * 3/ 4 && i < circle_count * 5 / 6) {
                    y -= 0.5;
                }
                sparkles_matrix.setPosition(x, y, z);
                sparkles_mesh.setMatrixAt(points_count, sparkles_matrix);
                sparkles_mesh.setColorAt(points_count, new THREE.Color(form[i + 3]));
                sparkles_mesh.instanceColor.needsUpdate = true;
                points_count++;
            }
            console.log(points_count);
            sparkles_mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                        scene.add(sparkles_mesh);

            container.appendChild(renderer.domElement);

            window.addEventListener('resize', onWindowResize, false);

            if (WebGL.isWebGLAvailable()) {

                animate();

            } else {

                const warning = WebGL.getWebGLErrorMessage();
                document.getElementById('container').appendChild(warning);

            }
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            visibleWidth = visibleHeight * camera.aspect;
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.updateProjectionMatrix();
        }
        function animate() {
            requestAnimationFrame(animate);
            render();
        }
        
        function render() {

            var pos_old = new THREE.Vector3();
            var pos_new = new THREE.Vector3();
            var quat = new THREE.Quaternion();
            var angle = 0;
            var scale = new THREE.Vector3();
            var scale_factor = 1;

            for (let i = 0; i < points_count; i++) {
                if (i < points_count / 4) {
                    sparkles_mesh.getMatrixAt(i, sparkles_matrix);
                    sparkles_matrix.decompose(pos_old, quat, scale);
                    scale_factor = 1;
                    scale = new THREE.Vector3(scale_factor, scale_factor, 1);
                    pos_new.x = pos_old.x;
                    pos_new.y = pos_old.y + Math.sin(pos_new.x + utime) / 1500;
                    sparkles_matrix.compose(pos_new, quat, scale);
                    sparkles_mesh.setMatrixAt(i, sparkles_matrix);
                }
                if (i >= points_count / 4 && i <= points_count / 2) {
                    sparkles_mesh.getMatrixAt(i, sparkles_matrix);
                    sparkles_matrix.decompose(pos_old, quat, scale);
                    scale_factor = 0.8;
                    scale = new THREE.Vector3(scale_factor, scale_factor, 1);
                    pos_new.x = pos_old.x - Math.sin(pos_new.x + utime * 0.8) / 1200;
                    pos_new.y = pos_old.y + Math.sin(pos_new.x + utime * 0.8) / 1300;
                    sparkles_matrix.compose(pos_new, quat, scale);
                    sparkles_mesh.setMatrixAt(i, sparkles_matrix);
                }
                if (i> points_count / 2) {
                    sparkles_mesh.getMatrixAt(i, sparkles_matrix);
                    sparkles_matrix.decompose(pos_old, quat, scale);
                    scale_factor = 0.9;
                    scale = new THREE.Vector3(scale_factor, scale_factor, 1);
                    pos_new.x = pos_old.x - Math.sin(pos_new.x + utime * 0.5) / 1200;
                    pos_new.y = pos_old.y + Math.sin(pos_new.x + utime * 0.5) / 1300;
                    sparkles_matrix.compose(pos_new, quat, scale);
                    sparkles_mesh.setMatrixAt(i, sparkles_matrix);
                }
            }
            if (utime < 1000 * Math.PI) { utime += 0.02 }
            else { utime = 0 }
            sparkles_mesh.instanceMatrix.needsUpdate = true;
            renderer.render(scene, camera);
        }
