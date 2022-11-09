import { 
    CreateGround, 
    Engine, 
    ArcRotateCamera,  
    Scene, 
    //FreeCamera, 
    Vector3, 
    //Vector4,
    //MeshBuilder, 
    StandardMaterial, 
    Color3, 
    HemisphericLight,
    Animation,
    Texture,
    //ActionManager,
    //registerAction
    //PBRMaterial
    SceneLoader
} from "@babylonjs/core";
import board from "../../public/assets/board.jpg"
import cabin from '../../public/assets/models/Cabin/cabin.gltf'
import 'babylonjs-loaders'
import "@babylonjs/loaders/glTF"
import "@babylonjs/loaders/STL"


const moveModel = (position) => {
    const frameRate = 10
    let positionX = new Animation("positionX", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);  
    let positionY = new Animation("positionY", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);  
    let positionZ = new Animation("positionZ", "position.z", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);  
    let rotationZ = new Animation("rotationZ", "rotation.z", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)

    let xFrames = [
    {
        frame: 0,
        value: this.card.position.x
    },
    {
        frame: frameRate * 1,
        value: position.x
    }
    ]
    let yFrames = [
    {
        frame: 0,
        value: this.card.position.y
    },
    {
        frame: frameRate * .5,
        value: 9
    },
    {
        frame: frameRate * 1,
        value: position.y
    }
    ]
    let zFrames = [
    {
        frame: 0,
        value: this.card.position.z
    },
    {
        frame: frameRate * 1,
        value: position.z
    }
    ]
    let rotationFrames = [
    {
    frame: 0,
    value: 0
    },
    {
    frame: frameRate * 1,
    value: - Math.PI
    }
    ]
    
    positionX.setKeys(xFrames)
    positionY.setKeys(yFrames)
    positionZ.setKeys(zFrames)
    rotationZ.setKeys(rotationFrames)

    this.card.animations.push(positionX)
    this.card.animations.push(positionY)
    this.card.animations.push(positionZ)
    this.card.animations.push(rotationZ)

    this.scene.beginDirectAnimation(this.card,[positionX, positionY, positionZ, rotationZ], 0, frameRate * 1, false)
    console.log(this.card.position)
}

const moveStart = (direction) => {
    this.getSocket().emit("moveStart", direction);
}

const  createScene = async (canvas) => {
    const engine = new Engine(canvas);
    var scene = new Scene(engine);
    scene.clearColor = new Color3(1,1,1)

    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, -6, new Vector3(0, 10, -10));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.inputs.attached.mousewheel.wheelPrecision = 20
    camera.upperBetaLimit = (Math.PI / 2) * 0.99;

    var light = new HemisphericLight("light1", new Vector3(1, 1, 1), scene);
    light.intensity = 1.25;

    var ground = CreateGround("ground1", { width: 10, height: 10, subdivisions: 2 }, scene);
    let mat = new StandardMaterial("mat", scene);
    let texture = new Texture(board, scene);
    mat.diffuseTexture = texture;
    ground.material = mat

    //BABYLON.GLTFFileLoader.Append(cabin, "cabin", scene)

    await SceneLoader.ImportMeshAsync("", cabin, "", scene, ()=>{}, ".gltf" )
    // console.log(cabinGLTF)
    //let cabinGLTF = meshes.meshes[0]
    // card.scaling.setAll(.12)
    //cabinG.position = new Vector3(-39,1,-15)
    // card.actionManager = new ActionManager(scene)
    // card.actionManager.registerAction(
    // // new BABYLON.ExecuteCodeAction(
    // //     BABYLON.ActionManager.OnPickTrigger,
    // //     ()=>{this.moveStart("up")}
    // // )
    // )
    engine.runRenderLoop(() => {
        scene.render();
    });

}

export { createScene, moveStart, moveModel };


//extra stuff from old scene
    //thses were inside mounted
    //let position = new BABYLON.Vector3(-24.2,1,-15)
    //this.moveModel(position, 1)

//old create scene
//babylon animation methods
      // async createScene() {
      //   var scene = new Scene(this.engine);
      //   scene.clearColor = new BABYLON.Color3(1,1,1)

      //   const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, -6, new BABYLON.Vector3(0, 100, -100));
      //   camera.setTarget(Vector3.Zero());
      //   camera.attachControl(this.canvas, true);
      //   camera.inputs.attached.mousewheel.wheelPrecision = 20
      //   camera.upperBetaLimit = (Math.PI / 2) * 0.99;

      //   var light = new HemisphericLight("light1", new Vector3(1, 1, 1), scene);
      //   light.intensity = 1.25;

      //   var ground = CreateGround("ground1", { width: 100, height: 100, subdivisions: 2 }, scene);
      //   let mat = new StandardMaterial("mat", scene);
      //   let texture = new BABYLON.Texture(this.board, scene);
      //   mat.diffuseTexture = texture;
      //   ground.material = mat

      //   //BABYLON.GLTFFileLoader.Append(cabin, "cabin", scene)

      //   this.stls = await BABYLON.SceneLoader.ImportMeshAsync("card", "card.stl","", scene)
      //   this.card = this.stls.meshes[0]
      //   this.card.scaling.setAll(.12)
      //   this.card.position = new BABYLON.Vector3(-39,1,-15)
      //   this.card.actionManager = new BABYLON.ActionManager(scene)
      //   this.card.actionManager.registerAction(
      //     new BABYLON.ExecuteCodeAction(
      //       BABYLON.ActionManager.OnPickTrigger,
      //       ()=>{this.moveStart("up")}
      //     )
      //   )
      //   return scene
      // },
      //
