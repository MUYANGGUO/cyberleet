import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js";
import allQuestions from "./data/all.json";
import "./ThreeView.css";
import Swal from 'sweetalert2';

class ThreeView extends Component {
  constructor(props) {
    super(props);
    this.state = {questionName: '', questionData: '', questionSlug: '', prequestionSlug: ''};
    this.animate = this.animate.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.initializeCamera = this.initializeCamera.bind(this);
    // this.initializeOrbits = this.initializeOrbits.bind(this);
  }
componentDidMount() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    // this.initializeOrbits();
    this.initializeCamera();

    this.cubesToBePicked = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.INTERSECTED = null;
    var worldsize = 6000;
    this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(worldsize, worldsize, 1),
        new THREE.MeshBasicMaterial({
            color: "grey",
            opacity: 0.3,
            transparent: true,
        })
    );
    this.plane.rotation.set(-Math.PI / 2, 0, 0);
    this.scene.add(this.plane);
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
        this.line = new THREE.LineSegments(geometry, material);
        this.scene.add(this.line);
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
        this.line = new THREE.LineSegments(geometry, material);
        this.scene.add(this.line);
    }

    var offset = 2000,
    side = 50,
    sidegap = 80;
    for (let i = 0; i < allQuestions.length; i += 1) {
    var questionIndex = Number(allQuestions[i]["id"]) - 1;
    var bottommaterial;
    var difficulty;
    var questionData = allQuestions[i]["content"];
    if (allQuestions[i]["difficulty"] === "1") {
        bottommaterial = new THREE.MeshBasicMaterial({ color: 0x00cc00 });
        difficulty = 'EASY';
    } else if (allQuestions[i]["difficulty"] === "2") {
        bottommaterial = new THREE.MeshBasicMaterial({ color: 0xff9900 });
        difficulty = 'MEDIUM';
    } else {
        bottommaterial = new THREE.MeshBasicMaterial({ color: 0xD63333 });
        difficulty = 'HARD';
    }
    var bottomgeometry = new THREE.BoxGeometry(60, 20, 60);
    var row = Math.floor(questionIndex / side);
    var col = questionIndex % side;
    bottomgeometry.translate(
        col * sidegap - offset,
        10,
        row * sidegap - offset
    );
    this.bottommesh = new THREE.Mesh(bottomgeometry, bottommaterial);
    
   
    this.bottommesh.name = allQuestions[i]["id"] + ' - ' + allQuestions[i]["name"].split('-').join(' ') + ' - ' + difficulty;
    this.bottommesh.userData = questionData;
    this.scene.add(this.bottommesh);
    this.cubesToBePicked.push(this.bottommesh);

}


    window.addEventListener("resize", this.onWindowResize, false);
    window.addEventListener('pointerdown', this.onMouseDown, false);
    this.animate();
  }
componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
    this.mount.removeChild(this.renderer.domElement);
  }

onMouseDown(event) {
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cubesToBePicked);
    if (intersects.length > 0) {
        if (intersects[0].object != this.INTERSECTED) {
            if (this.INTERSECTED)
                this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            this.INTERSECTED = intersects[0].object;
            this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
            this.INTERSECTED.material.color.setHex(0xFF00FF);
            this.setState((state) => (  // this is the current state
              { 
                prequestionSlug: state.questionSlug, // this will be the previous randomNumber
                questionName: this.INTERSECTED.name,
                questionData: this.INTERSECTED.userData["content"], 
                questionSlug: this.INTERSECTED.userData["questionTitleSlug"]
             }));
            // this.setState({questionName: this.INTERSECTED.name, questionData: this.INTERSECTED.userData["content"], questionSlug: this.INTERSECTED.userData["questionTitleSlug"], prequestionSlug: this.state.questionSlug});
            
        }
    }
    else //no intesections
    {
        if (this.INTERSECTED) {
            this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
        }
        this.INTERSECTED = null;
        this.setState((state) => (  // this is the current state
          { 
            prequestionSlug: state.questionSlug, // this will be the previous randomNumber
            questionName: '',
            questionData: '', 
            questionSlug: ''
         }));
        //this.setState({questionName: '', questionData: '', questionSlug: '',prequestionSlug: this.state.questionSlug});
      

    }
    
}


onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
}
// initializeOrbits() {
//     this.controls.rotateSpeed = 1.0;
//     this.controls.zoomSpeed = 1.2;
//     this.controls.panSpeed = 0.8;
//   }
initializeCamera() {
    this.camera.position.x = 0;
    this.camera.position.y = 2000;
    this.camera.position.z = 1500;
    this.controls.update();
  }
animate() {
    // this.raycaster.setFromCamera(this.mouse, this.camera);
    // const intersects = this.raycaster.intersectObjects(this.cubesToBePicked);
    // if (intersects.length > 0) {
    //     if (intersects[0].object != this.INTERSECTED) {
    //         if (this.INTERSECTED)
    //             this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
    //         this.INTERSECTED = intersects[0].object;
    //         this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
    //         this.INTERSECTED.material.color.setHex(0xFF00FF);
    //         this.setState({questionName: this.INTERSECTED.name, questionData: this.INTERSECTED.userData});
    //     }
    // }
    // else //no intesections
    // {
    //     if (this.INTERSECTED) {
    //         this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
    //     }
    //     this.INTERSECTED = null;
    //     this.setState({questionName: '', questionData: ''});

    // }
    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }



render() {
    return (
      <div>
        <button id = "floatingButton" className="btn orange" onClick={()=> window.open("https://www.leetcode.com/problems/" + this.state.prequestionSlug, "_blank")}>CYBER LEET_ : {this.state.questionName}</button>
        {this.state.questionData && <button className="loading" dangerouslySetInnerHTML={{ __html: this.state.questionData}}/>}
        <div
          id="ThreeViewer"
          ref={mount => {
            this.mount = mount;
          }}
        />
      <button id = "credits" className="credits default" onClick={()=> window.open("https://www.muyangguo.xyz/", "_blank")}>@ Muyang Guo </button>

      </div>
      // <button id = "footer" className="credits orange" onClick={()=> window.open("https://www.muyangguo.xyz/" , "_blank")}> @ Muyang Guo </button>
    );
  }
}
export default ThreeView;