/**
 * ============================================================
 * 🎮 ENGINE 3D — SHARED UTILITIES FOR ALL LEVEL SCENES
 * ============================================================
 * Factory functions for creating 3D scenes, text sprites,
 * glow meshes, raycasting, dialog panels, and clean disposal.
 * Used by Level 0-2 and Lab TIK as a common foundation.
 * ============================================================
 */

(function () {
    'use strict';

    const Engine3D = {

        /**
         * Create a complete 3D scene setup: scene, camera, renderer, clock
         */
        createScene: function (container, budget) {
            budget = budget || { tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false };

            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || window.innerHeight;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0a0e1a);

            const camera = new THREE.PerspectiveCamera(50, width / height, 0.3, 80);

            const renderer = new THREE.WebGLRenderer({
                antialias: budget.antialias || false,
                powerPreference: 'low-power',
                alpha: false
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(budget.pixelRatio || 1.0);
            if (budget.shadows) {
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFShadowMap;
            }

            container.innerHTML = '';
            container.appendChild(renderer.domElement);

            const clock = new THREE.Clock();

            return { scene, camera, renderer, clock };
        },

        /**
         * Standard lighting setup for level scenes
         */
        setupLighting: function (scene, budget, ambientColor, ambientIntensity) {
            ambientColor = ambientColor || 0xffffff;
            ambientIntensity = ambientIntensity || (budget.tier === 'low' ? 0.85 : 0.55);
            const ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);
            scene.add(ambient);

            const dir = new THREE.DirectionalLight(0xffffff, 0.75);
            dir.position.set(6, 12, 8);
            if (budget.shadows) {
                dir.castShadow = true;
                dir.shadow.mapSize.width = 512;
                dir.shadow.mapSize.height = 512;
                dir.shadow.camera.near = 0.5;
                dir.shadow.camera.far = 30;
                dir.shadow.camera.left = -10;
                dir.shadow.camera.right = 10;
                dir.shadow.camera.top = 10;
                dir.shadow.camera.bottom = -10;
            }
            scene.add(dir);
            return { ambient, directional: dir };
        },

        /**
         * Create a text sprite (billboard) from canvas
         */
        createTextSprite: function (text, options) {
            options = options || {};
            const fontSize = options.fontSize || 28;
            const fontFamily = options.fontFamily || 'bold sans-serif';
            const color = options.color || '#ffffff';
            const bgColor = options.bgColor || 'rgba(15, 23, 42, 0.9)';
            const borderColor = options.borderColor || 'rgba(56, 189, 248, 0.6)';
            const canvasW = options.canvasWidth || 512;
            const canvasH = options.canvasHeight || 128;
            const padding = options.padding || 16;

            const canvas = document.createElement('canvas');
            canvas.width = canvasW;
            canvas.height = canvasH;
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = bgColor;
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(4, 4, canvasW - 8, canvasH - 8, 12);
                ctx.fill();
            } else {
                ctx.fillRect(4, 4, canvasW - 8, canvasH - 8);
            }

            // Border
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 3;
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(4, 4, canvasW - 8, canvasH - 8, 12);
                ctx.stroke();
            } else {
                ctx.strokeRect(4, 4, canvasW - 8, canvasH - 8);
            }

            // Text
            ctx.fillStyle = color;
            ctx.font = fontSize + 'px ' + fontFamily;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Word wrap
            const maxWidth = canvasW - padding * 2;
            const lines = this._wrapText(ctx, text, maxWidth);
            const lineHeight = fontSize * 1.25;
            const startY = canvasH / 2 - ((lines.length - 1) * lineHeight) / 2;
            lines.forEach(function (line, i) {
                ctx.fillText(line, canvasW / 2, startY + i * lineHeight);
            });

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(options.scaleX || 3.5, options.scaleY || 0.9, 1);
            sprite.userData._texture = texture;

            return sprite;
        },

        /**
         * Create a multi-line text panel (plane mesh, not sprite) — face camera
         */
        createTextPanel: function (text, options) {
            options = options || {};
            const canvasW = options.canvasWidth || 512;
            const canvasH = options.canvasHeight || 256;
            const fontSize = options.fontSize || 22;
            const color = options.color || '#e2e8f0';
            const bgColor = options.bgColor || 'rgba(15, 23, 42, 0.95)';
            const borderColor = options.borderColor || 'rgba(56, 189, 248, 0.5)';

            const canvas = document.createElement('canvas');
            canvas.width = canvasW;
            canvas.height = canvasH;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, canvasW - 4, canvasH - 4);

            ctx.fillStyle = color;
            ctx.font = fontSize + 'px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            const maxWidth = canvasW - 32;
            const lines = this._wrapText(ctx, text, maxWidth);
            const lineHeight = fontSize * 1.35;
            lines.forEach(function (line, i) {
                ctx.fillText(line, 16, 16 + i * lineHeight);
            });

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            const geo = new THREE.PlaneGeometry(
                options.meshWidth || 4,
                options.meshHeight || 2
            );
            const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.userData._texture = texture;

            return mesh;
        },

        /**
         * Update existing text panel or sprite with new text
         */
        updateTextPanel: function (mesh, text, options) {
            if (!mesh || !mesh.userData._texture) return;
            options = options || {};
            const canvas = mesh.userData._texture.image;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const canvasW = canvas.width;
            const canvasH = canvas.height;
            const fontSize = options.fontSize || 22;
            const color = options.color || '#e2e8f0';
            const bgColor = options.bgColor || 'rgba(15, 23, 42, 0.95)';
            const borderColor = options.borderColor || 'rgba(56, 189, 248, 0.5)';

            ctx.clearRect(0, 0, canvasW, canvasH);
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, canvasW - 4, canvasH - 4);

            ctx.fillStyle = color;
            ctx.font = fontSize + 'px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            const maxWidth = canvasW - 32;
            const lines = this._wrapText(ctx, text, maxWidth);
            const lineHeight = fontSize * 1.35;
            lines.forEach(function (line, i) {
                ctx.fillText(line, 16, 16 + i * lineHeight);
            });

            mesh.userData._texture.needsUpdate = true;
        },

        /**
         * Create a clickable 3D button (rounded box with glow)
         */
        createButton3D: function (label, options) {
            options = options || {};
            const width = options.width || 2.5;
            const height = options.height || 0.6;
            const depth = options.depth || 0.15;
            const color = options.color || 0x3b82f6;
            const emissiveIntensity = options.emissiveIntensity || 0.4;

            const group = new THREE.Group();

            // Button body
            const geo = new THREE.BoxGeometry(width, height, depth);
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: emissiveIntensity,
                roughness: 0.3,
                metalness: 0.2
            });
            const mesh = new THREE.Mesh(geo, mat);
            group.add(mesh);

            // Label sprite
            const labelSprite = this.createTextSprite(label, {
                fontSize: options.labelFontSize || 24,
                canvasWidth: 256,
                canvasHeight: 64,
                bgColor: 'transparent',
                borderColor: 'transparent',
                color: options.labelColor || '#ffffff',
                scaleX: width * 0.9,
                scaleY: height * 0.7
            });
            labelSprite.position.set(0, 0, depth / 2 + 0.01);
            group.add(labelSprite);

            group.userData.buttonMesh = mesh;
            group.userData.buttonMat = mat;
            group.userData.originalColor = color;
            group.userData._labelSprite = labelSprite;

            return group;
        },

        /**
         * Create a glowing neon ring (like portal ring)
         */
        createNeonRing: function (radius, color, tubeRadius) {
            tubeRadius = tubeRadius || 0.06;
            const geo = new THREE.TorusGeometry(radius, tubeRadius, 8, 32);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.85
            });
            return new THREE.Mesh(geo, mat);
        },

        /**
         * Create floor plane with grid
         */
        createFloor: function (size, color, gridColor, budget) {
            const group = new THREE.Group();
            const geo = new THREE.PlaneGeometry(size, size);
            const mat = new THREE.MeshStandardMaterial({
                color: color || 0x0f1629,
                roughness: 0.9,
                metalness: 0.1
            });
            const floor = new THREE.Mesh(geo, mat);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = !!(budget && budget.shadows);
            group.add(floor);

            const grid = new THREE.GridHelper(size, Math.floor(size / 2), gridColor || 0x1e293b, gridColor || 0x1e293b);
            grid.position.y = 0.01;
            grid.material.opacity = 0.4;
            grid.material.transparent = true;
            group.add(grid);

            return group;
        },

        /**
         * Perform raycast click detection on 3D objects
         */
        raycastObjects: function (event, container, camera, objects) {
            const rect = container.getBoundingClientRect();
            let clientX, clientY;
            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else if (event.changedTouches && event.changedTouches.length > 0) {
                clientX = event.changedTouches[0].clientX;
                clientY = event.changedTouches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }

            const pointer = new THREE.Vector2();
            pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(pointer, camera);
            return raycaster.intersectObjects(objects, true);
        },

        /**
         * Create particle burst effect at a position
         */
        createParticleBurst: function (scene, position, color, count) {
            count = count || 15;
            const particles = [];
            const geo = new THREE.SphereGeometry(0.04, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: color });

            for (let i = 0; i < count; i++) {
                const p = new THREE.Mesh(geo, mat);
                p.position.copy(position);
                p.userData.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 4,
                    Math.random() * 3 + 1,
                    (Math.random() - 0.5) * 4
                );
                p.userData.life = 1.0;
                scene.add(p);
                particles.push(p);
            }

            return {
                particles: particles,
                update: function (dt) {
                    let alive = false;
                    particles.forEach(function (p) {
                        if (p.userData.life <= 0) return;
                        alive = true;
                        p.userData.life -= dt * 2;
                        p.userData.velocity.y -= 6 * dt;
                        p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
                        p.material.opacity = Math.max(0, p.userData.life);
                        p.material.transparent = true;
                        if (p.userData.life <= 0) {
                            p.visible = false;
                        }
                    });
                    return alive;
                },
                dispose: function () {
                    particles.forEach(function (p) {
                        scene.remove(p);
                        p.geometry.dispose();
                        p.material.dispose();
                    });
                    particles.length = 0;
                }
            };
        },

        /**
         * Animate a mesh floating up and down
         */
        floatAnimation: function (mesh, time, speed, amplitude, baseY) {
            if (!mesh) return;
            mesh.position.y = (baseY || mesh.position.y) + Math.sin(time * (speed || 2)) * (amplitude || 0.1);
        },

        /**
         * Create a simple HUD overlay (HTML) on top of 3D canvas
         */
        createHUD: function (container, config) {
            const hud = document.createElement('div');
            hud.className = 'level3d-hud-overlay';
            hud.innerHTML = `
                <div class="level3d-hud-bar">
                    <button type="button" class="btn-hud-exit" id="${config.exitBtnId || 'btn-3d-exit'}">← Lobi</button>
                    <div class="hud-center-title">
                        <span class="hud-level-tag">${config.levelTag || 'LEVEL'}</span>
                        <strong>${config.title || ''}</strong>
                    </div>
                    <div class="hud-stats-cluster" id="${config.statsId || 'hud-3d-stats'}">
                        ${config.statsHtml || ''}
                    </div>
                </div>
            `;
            container.appendChild(hud);
            return hud;
        },

        /**
         * Create feedback overlay (correct/wrong) on top of 3D
         */
        showFeedback3D: function (container, isCorrect, title, explanation, duration) {
            duration = duration || 2500;
            let overlay = container.querySelector('.level3d-feedback-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'level3d-feedback-overlay';
                container.appendChild(overlay);
            }
            overlay.className = 'level3d-feedback-overlay ' + (isCorrect ? 'feedback-3d-correct' : 'feedback-3d-wrong');
            overlay.innerHTML = `
                <div class="feedback-3d-icon">${isCorrect ? '✅' : '❌'}</div>
                <div class="feedback-3d-body">
                    <strong>${title || (isCorrect ? 'BENAR!' : 'SALAH!')}</strong>
                    <p>${explanation || ''}</p>
                </div>
            `;
            overlay.style.display = 'flex';

            setTimeout(function () {
                overlay.style.display = 'none';
            }, duration);
        },

        /**
         * Dispose entire scene cleanly
         */
        disposeScene: function (sceneSetup) {
            if (!sceneSetup) return;

            if (sceneSetup.animFrameId) {
                cancelAnimationFrame(sceneSetup.animFrameId);
            }

            if (sceneSetup.scene) {
                sceneSetup.scene.traverse(function (obj) {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach(function (m) {
                                if (m.map) m.map.dispose();
                                m.dispose();
                            });
                        } else {
                            if (obj.material.map) obj.material.map.dispose();
                            obj.material.dispose();
                        }
                    }
                    if (obj.userData && obj.userData._texture) {
                        obj.userData._texture.dispose();
                    }
                });
            }

            if (sceneSetup.renderer) {
                sceneSetup.renderer.dispose();
                if (sceneSetup.renderer.domElement && sceneSetup.renderer.domElement.parentNode) {
                    sceneSetup.renderer.domElement.parentNode.removeChild(sceneSetup.renderer.domElement);
                }
            }

            sceneSetup.scene = null;
            sceneSetup.camera = null;
            sceneSetup.renderer = null;
            sceneSetup.clock = null;
        },

        // Internal: word wrap helper
        _wrapText: function (ctx, text, maxWidth) {
            var words = text.split(' ');
            var lines = [];
            var currentLine = '';
            for (var i = 0; i < words.length; i++) {
                var testLine = currentLine + (currentLine ? ' ' : '') + words[i];
                var metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines.length > 0 ? lines : [''];
        }
    };

    window.Engine3D = Engine3D;
})();
