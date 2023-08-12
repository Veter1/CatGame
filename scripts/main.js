const menuWindow = document.getElementsByClassName('menuWindow')[0];
const gameWindow = document.getElementsByClassName('gameWindow')[0];
const scoreDisplay = gameWindow.getElementsByClassName('score')[0];
const animal = gameWindow.getElementsByClassName('animal')[0];
const mouseSound = new Audio('../res/sounds/mouse.mp3');
const fishSound1 = new Audio('../res/sounds/fish_1.mp3');
const fishSound2 = new Audio('../res/sounds/fish_2.mp3');
let selectAnimal = 'mouse', selectDuration = 3000, score = 0, permissionToMove = false;
let animalWidth = 180, animalHeight = 72, currentAngelRotation = 0, timer;
mouseSound.loop = true; mouseSound.volume = 0.3;
fishSound1.loop = true; fishSound1.volume = 0.25;
fishSound2.loop = true; fishSound2.volume = 0.4;

// catch click on gameWindow
gameWindow.addEventListener('click', (event)=>{
    if (event.target.classList.contains('animal')){
        catchAnimal();
    } else if (event.target.classList.contains('btnBackToMenu')){
        endGame();
    } else{        
        // animal.style = animal.style.cssText +
        // 'transform: rotate('+57.2958*calcAngel((event.x - 200),(event.y - 240))+'deg);';
        animalMove();
    }
})

// catch click to button 'Play'
menuWindow.addEventListener('click', (event)=>{
    if (event.target.classList.contains('btnPlay')){
        startGame();
    }
})
// catch change radioButton
menuWindow.addEventListener('change', (event)=>{
    if (event.target.name == 'animal'){
        selectAnimal = event.target.value;
    } else if (event.target.name == 'duration'){
        selectDuration = event.target.value;
    }
})

// func on start game
function startGame(){
    permissionToMove = true;
    score = 0;
    scoreDisplay.textContent = score;
    switch(selectAnimal){
        case 'mouse':{
            gameWindow.style = gameWindow.style.cssText + "background: url('../res/imgs/cheese texture.png') 0 0/80% 50% repeat;";
            animal.style = animal.style.cssText + "background: url('../res/imgs/mouse.png') 0 0/180px 65px no-repeat;";
            mouseSound.play();
            break;
        }
        case 'fish':{
            gameWindow.style = gameWindow.style.cssText + "background: url('../res/imgs/water texture.jpg') 0 0/80% 50% repeat;";
            animal.style = animal.style.cssText + "background: url('../res/imgs/fish.png') 0 0/180px 80px no-repeat;";
            fishSound1.play(); fishSound2.play();
            break;
        }
    }
    menuWindow.style = menuWindow.style.cssText + "display: none;";
    gameWindow.style = gameWindow.style.cssText + "display: block;";
    if (selectDuration != 'infinity')
        setTimeout(()=>{ endGame() }, selectDuration);
    animalMove();
}

// func that move animal if i'ts permission
async function animalMove(){    
    if (permissionToMove){
        // отримуємо коориднати нової точки руху та вираховуємо кут повороту в її напрямку
        let newX, newY, newAngel, rotateSpeed = 0.1, moveSpeed = 0.1;
        await generateNewPoint().then(value => {newX = value.split('/')[0]; newY = value.split('/')[1];});
        newAngel = Math.round(57.2958 *
            calcAngel((newX - animal.getBoundingClientRect().x), (newY - animal.getBoundingClientRect().y)));

        // set rotateSpeed (чим нижче тим швидше)
            if (newAngel > currentAngelRotation)
                rotateSpeed = (newAngel - currentAngelRotation) * 1 / 360;
            else if (newAngel < currentAngelRotation)
                rotateSpeed = (currentAngelRotation - newAngel) * 1 / 360;
            else
                rotateSpeed = newAngel * 1 / 360;        

        // повертаємо тваринку у напрямку руху
        animal.style = animal.style.cssText + "transition-duration: "+rotateSpeed+"s;";
        animal.style = animal.style.cssText + 'transform: rotate('+newAngel+'deg);';

        // pause for end rotate animation
        await new Promise((resolve)=>{setTimeout(()=>{resolve('done')}, rotateSpeed * 1000 + 50)})

        // set moveSpeed (чим нижче тим швидше)
        moveSpeed = setMoveSpeed(newX, newY);

        // рухаємо тваринку до нової точки
        animal.style = animal.style.cssText + "left: "+newX+"px; top: "+newY+"px;";
        animal.style = animal.style.cssText + "transition-duration: "+moveSpeed+"s;";

        // зберігаємо останній кут повороту щоб при наступному зміні напрямку руху
        // більш корректно розрахувати розмір тваринки та залежні швидкості
        currentAngelRotation = newAngel;

        // рекурсія після досягання нової точки
        timer = setTimeout(()=> animalMove(), moveSpeed * 1000 + 100)
    }
}
// визначаємо швидкість руху
function setMoveSpeed(newX, newY){
    let moveSpeed = 1;
    let a, b, kef;
    
    if (Math.abs(newX) > Math.abs(animal.getBoundingClientRect().x))
        a = Math.abs(newX) - Math.abs(animal.getBoundingClientRect().x);
    else if (Math.abs(newX) <= Math.abs(animal.getBoundingClientRect().x))
        a = Math.abs(animal.getBoundingClientRect().x) - Math.abs(newX);

    if (Math.abs(newY) > Math.abs(animal.getBoundingClientRect().y))
        b = Math.abs(newY) - Math.abs(animal.getBoundingClientRect().y);
    else if (Math.abs(newY) <= Math.abs(animal.getBoundingClientRect().y))
        b = Math.abs(animal.getBoundingClientRect().y) - Math.abs(newY);

    kef = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))

    if (kef > 200)
        moveSpeed = 2;
    else if (kef > 500)
        moveSpeed = 3.5;
    else if (kef > 900)
        moveSpeed = 5;
        
    return moveSpeed;
}
// генерація нової точки напрямку руху
async function generateNewPoint(){
    // // get new X position
    // let x = Math.round(Math.random()*1000);
    // let i = Number(x.toString()[0]);
    // let j = Number(x.toString()[1] + x.toString()[2]);
    // if (isNaN(j))
    //     j = 50;

    // if (i < 3){
    //     if (j > 80)
    //         j = 80;
    //     x = Math.round(innerWidth * j / 100) * -1;
    // } else if (i > 2 && i < 8){
    //     x = Math.round(innerWidth * j / 100);
    // } else if (i > 7){
    //     if (j > 80)
    //         j = 80;
    //     x = Math.round(innerWidth * j / 100) + innerWidth;
    // }
    // get new X position
    let x = Math.round(Math.random()*10000);
    let i = Number(x.toString()[0] + x.toString()[1]);
    let j = Number(x.toString()[2] + x.toString()[3]);
    if (isNaN(i))
        i = 55;
    if (isNaN(j))
        j = 50;

    if (i < 16){
        if (j > 80)
            j = 80;
        x = Math.round(innerWidth * j / 100) * -1;
    } else if (i > 15 && i < 85){
        x = Math.round(innerWidth * j / 100);
    } else if (i > 84){
        if (j > 80)
            j = 80;
        x = Math.round(innerWidth * j / 100) + innerWidth;
    }

    // get new Y position
    let y = Math.round(Math.random()*1000);
    i = Number(y.toString()[0]);
    j = Number(y.toString()[1] + y.toString()[2]);
    if (isNaN(j))
        j = 50;

    if (i == 1){
        if (j > 50)
            j = 50;
        y = Math.round(innerHeight * j / 100) * -1;
    } else if (i > 1 && i < 9){
        y = Math.round(innerHeight * j / 100);
    } else if (i == 9){
        if (j > 50)
            j = 50;
        y = Math.round(innerHeight * j / 100) + innerHeight;
    }
    let str = x.toString() + '/' + y.toString()
    return str;
} 
// визначення кута поворота тваринки до нового напрямку руху
function calcAngel(x, y){
    if (x > 0 && y > 0) return Math.PI / 2 - Math.atan(x / y);
    if (x < 0 && y > 0) return Math.PI / 2 - Math.atan(x / y);
    if (x < 0 && y < 0) return Math.PI + Math.atan(y / x);
    if (x > 0 && y < 0) return 3 * Math.PI / 2 + Math.abs(Math.atan(x / y));
}

// func on tap animal
function catchAnimal(){
    score++;
    scoreDisplay.textContent = score;
    permissionToMove = false;
    clearTimeout(timer);
    animal.style = animal.style.cssText + "transition-duration: 0s; opacity: 0;";
    setTimeout(()=>{
        animal.style = animal.style.cssText + "top: -100px; left: -210px; transform: rotate(0deg);";
        animal.style.opacity = 1;
        permissionToMove = true;
        setTimeout(()=> animalMove(), 200)
    }, 500);
}

// func on end game
function endGame(){
    permissionToMove = false;
    mouseSound.pause(); fishSound1.pause(); fishSound2.pause();
    gameWindow.style = gameWindow.style.cssText + "display: none;";
    menuWindow.style = menuWindow.style.cssText + "display: flex;";
}
