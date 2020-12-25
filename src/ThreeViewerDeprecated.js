import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js";
import allQuestions from "./data/all.json";
import "./ThreeView.css";
import Swal from 'sweetalert2';

class ThreeView extends Component {
    constructor(props) {
        super(props)
        this.state = {questionName: ''}
        
    }
    
    
    componentDidMount() {
        // --- three.js applied here ---
        
        var worldsize = 6000;
        var camera, scene, renderer;
        scene = new THREE.Scene();
        // scene.background = new THREE.Color( 0xf0f0f0 );
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );
        renderer = new THREE.WebGLRenderer({ antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.setPixelRatio(window.devicePixelRatio);

        // document.body.appendChild(renderer.domElement);
        this.mount.appendChild(renderer.domElement);
        // var canvas1,context1, texture1;
        // var sprite1;

        // canvas1 = document.createElement('canvas');
        // context1 = canvas1.getContext('2d');
        // context1.font = "10px Arial";
        // context1.fillStyle = "rgba(0,0,0,0.95)";
        // context1.fillText('Now ... Explore the Cyber Leet', 0, 30);
        // texture1 = new THREE.Texture(canvas1)
        // texture1.minFilter = THREE.LinearMipMapNearestFilter;
        // texture1.magFilter = THREE.LinearFilter;
        // texture1.needsUpdate = true;
        // ////////////////////////////////////////
        // var spriteMaterial = new THREE.SpriteMaterial( { map: texture1} );
        // spriteMaterial.depthTest = false;
        // sprite1 = new THREE.Sprite( spriteMaterial );
        // sprite1.scale.set(400, 400,1.0);
        // sprite1.position.set( 200, 200, 400 );
        // scene.add( sprite1 );	

        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.set(0, 2000, 1500);
        controls.update();

        // raycasting + mouse movement tracking
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let INTERSECTED;
        var cubesToBePicked = [];
        gridPlane();
        blocksInitial();
        //axes();
        render();
  
        window.addEventListener("resize", onWindowResize, false);
        window.addEventListener('mousemove', onMouseMove, false);
        function axes() {
            //axes + origin (optional)
            const axesHelper = new THREE.AxesHelper(20);
            scene.add(axesHelper);
            const origingeometry = new THREE.BoxGeometry(1, 1, 1);
            const originmaterial = new THREE.MeshBasicMaterial({ color: "white" });
            const origin = new THREE.Mesh(origingeometry, originmaterial);
            scene.add(origin);
        }

        function gridPlane() {
            //grid + background plane
            var plane = new THREE.Mesh(
                new THREE.PlaneGeometry(worldsize, worldsize, 1),
                new THREE.MeshBasicMaterial({
                    color: "grey",
                    opacity: 0.3,
                    transparent: true,
                })
            );
            plane.rotation.set(-Math.PI / 2, 0, 0);
            scene.add(plane);
            //grid
            var size = 3000,
                step = 40;
            var geometry, material, line;
            for (let i = -size; i <= size; i += step) {
                if ((i / step) % 2 === 0) {
                    continue;
                }
                geometry = new THREE.Geometry();
                material = new THREE.LineBasicMaterial({
                    color: "purple",
                });
                geometry.vertices.push(new THREE.Vector3(-size, 0, i));
                geometry.vertices.push(new THREE.Vector3(size, 0, i));
                line = new THREE.LineSegments(geometry, material);
                scene.add(line);
            }
            for (let i = -size; i <= size; i += step) {
                if ((i / step) % 2 === 0) {
                    continue;
                }
                geometry = new THREE.Geometry();
                material = new THREE.LineBasicMaterial({
                    color: "green",
                });
                geometry.vertices.push(new THREE.Vector3(i, 0, -size));
                geometry.vertices.push(new THREE.Vector3(i, 0, size));
                line = new THREE.LineSegments(geometry, material);
                scene.add(line);
            }
        }

        function blocksInitial() {
            // blocks
            var offset = 2000,
                side = 50,
                sidegap = 80;
            for (let i = 0; i < allQuestions.length; i += 1) {
                var questionIndex = Number(allQuestions[i]["id"]) - 1;
                var bottommaterial;
                if (allQuestions[i]["difficulty"] === "1") {
                    bottommaterial = new THREE.MeshBasicMaterial({ color: 0x00cc00 });
                } else if (allQuestions[i]["difficulty"] === "2") {
                    bottommaterial = new THREE.MeshBasicMaterial({ color: 0xff9900 });
                } else {
                    bottommaterial = new THREE.MeshBasicMaterial({ color: 0xD63333 });
                }
                var bottomgeometry = new THREE.BoxGeometry(60, 20, 60);
                var row = Math.floor(questionIndex / side);
                var col = questionIndex % side;
                bottomgeometry.translate(
                    col * sidegap - offset,
                    10,
                    row * sidegap - offset
                );
                var bottommesh = new THREE.Mesh(bottomgeometry, bottommaterial);
                bottommesh.name = allQuestions[i]["name"];
                scene.add(bottommesh);
                cubesToBePicked.push(bottommesh);

            }
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }


        function render () {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubesToBePicked);
            if (intersects.length > 0) {
                if (intersects[0].object != INTERSECTED) {
                    if (INTERSECTED)
                        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                    INTERSECTED = intersects[0].object;
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    INTERSECTED.material.color.setHex(0xFF00FF);
    
                     
                    // Swal.fire({
                    //     position: 'top-end',
                    //     title: INTERSECTED.name,
                    //     showConfirmButton: false,
                    //     allowOutsideClick: true,
                    //     showClass: {
                    //         popup: 'swal2-noanimation',
                    //         backdrop: 'swal2-noanimation'
                    //       },
                    //       hideClass: {
                    //         popup: '',
                    //         backdrop: ''
                    //       }
                    //   })
                    // this.setState({questionName: 'xxxxx'})
                    //--- texture and sprite ---
                    // if ( intersects[ 0 ].object.name )
                    // {
              
                    //     context1.clearRect(0,0,640,480);
                    //     var message = intersects[ 0 ].object.name;
                    //     var metrics = context1.measureText(message);
                    //     var width = metrics.width;
                    //     context1.fillStyle = "rgba(255,255,255,1)"; // white filler
                    //     context1.fillRect( 2,2, width + 4,10);
                    //     context1.fillStyle = "rgba(0,0,0,1)"; // text color
                    //     context1.fillText( message, 4,10 );                        
                    //     texture1.needsUpdate = true;
                    // }
                    // else
                    // {
                    //     context1.clearRect(0,0,300,300);
                    //     texture1.needsUpdate = true;
                    // }
                    // --- texture and sprite --- 
                }
            }
            else //no intesections
            {
                if (INTERSECTED) {
                    INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                }
                INTERSECTED = null;
                // context1.clearRect(0,0,300,300);
                // texture1.needsUpdate = true;
                Swal.close();
            }

            requestAnimationFrame(render);
            controls.update();
            renderer.render(scene, camera);
        }
     
        function onMouseMove(event) {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            // var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            // vector.unproject( camera );
            // var dir = vector.sub( camera.position ).normalize();
            // var distance = - camera.position.z / dir.z;
            // var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
            // sprite1.position.copy(pos);
 
        }
        // --- three.js parts end ---

    }


    render() {
        return (
            
            <div>
            <button id = "floatingButton" className="btn orange">CYBER LEET_ : A work created by Muyang Guo{this.state.questionName}</button>
            <div id = "ThreeView" ref={mount => {
                this.mount = mount;
              }}>
            
            </div>

 
            </div>
        );
    }
}
export default ThreeView;

