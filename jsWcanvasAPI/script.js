const { Engine,Render,Runner,World,Bodies,Body,Events
    // MouseConstraint, Mouse
      }
    = Matter;


const cellsHorizontal = 3;
const cellsVertical = 3;
const width = window.innerWidth;
const height = window.innerHeight;

//length of one side of cell
const unitLengthX = width/cellsHorizontal;
const unitLengthY = height/cellsVertical;

const engine = Engine.create();
engine.world.gravity.y=0;
const {world} = engine;

const render = Render.create({
    //where to show inside of html document
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// World.add(world, MouseConstraint.create(engine, {
//     mouse: Mouse.create(render.canvas)
// }))

const walls =[
    //top
    Bodies.rectangle(width/2,0,width,10, {isStatic: true}),
    //bottom
    Bodies.rectangle(width/2,height,width,10, {isStatic: true}),
    //left
    Bodies.rectangle(0,height/2,10,height, {isStatic: true}),
    //right
    Bodies.rectangle(width,height/2,10,height, {isStatic: true})

];
World.add(world, walls)


// //random shapes
// //how many shapes do we want 
// for(let i =0; i < 35; i++){
//         if(Math.random() > 0.5){
//             World.add
//             (world, Bodies.rectangle(
//             //random location drops...
//             Math.random() * width, Math.random() * height,
//             50,50,
//             // {
//             // render: {
//             //         fillStyle: 'blue'
//             //         }
//             //  }
//             ))
//         } else{
//             World.add
//             (world, Bodies.circle(
//             //random location drops...
//             Math.random() * width, Math.random() * height,
//             35, 
//             // {
//             // render: {
//             //         fillStyle: 'red'
//             //         }
//             // }  
//             ));
//         }   
// };


//Maze Generation

const shuffle = (arr) => {
    let counter = arr.length;
   
    while(counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[index];
        arr[index] = arr[counter];
        arr[counter] = temp
    }
    return arr;
}

const grid = Array(cellsVertical).fill(null)
             .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null)
.map(() => Array(cellsHorizontal-1).fill(false));


const horizontals = Array(cellsVertical-1).fill(null)
.map(() => Array(cellsHorizontal).fill(false));


// console.log('grid',grid)
// console.log('verticals',verticals)
// console.log('horizontals',horizontals)

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// console.log(startRow)
// console.log(startColumn)

const stepThroughCell = (row,column) => {
    console.log('row', row, 'column', column)
// if i have visited the cell at [row, column] then return
if(grid[row][column]){
    return;
}
//mark this cell as visited
grid[row][column] = true;
//asseble random ordered list of neighbors
const neighbors = 
shuffle(
    [
    //above
    [row-1, column, 'up'],
    // //right
    [row, column+1, 'right'],
    // down
    [row+1, column, 'down'],
    // left
    [row, column-1, 'left']
]
);
//for each neighbor...
for (let neighbor of neighbors){
    //destructure.. 
    //accessing individual 
    //rows/columns.. 
    const [nextRow,nextColumn,direction] = neighbor;
//see if the neighbor is out of bounds
    if (nextRow < 0 || nextRow >=cellsVertical ||
     nextColumn < 0 || nextColumn >=cellsHorizontal){
        continue;
        //skip bottom code, move on to next neighbor pair
     }
//if we have visited neighbor, continue to the next neighbor
     if (grid[nextRow][nextColumn]){
        continue;
     }
//remove a wall from vert/hori array
     if(direction === 'left'){
        verticals[row][column-1] = true;
     } else if (direction ==='right'){
        verticals[row][column] = true;
     } else if (direction === 'up'){
        horizontals[row-1][column] = true;
     } else if (direction === 'down'){
       horizontals[row][column] = true; 
     }

     stepThroughCell(nextRow,nextColumn);
     console.log('nR', nextRow, 'nC', nextColumn, direction)
}
};
stepThroughCell(startRow,startColumn);


horizontals.forEach((row, rowIndex) => {
    console.log('horizontals rows', row, 'row index',rowIndex)
   row.forEach((open, columnIndex) => {
    if (open){
        console.log('row for each',open, 'columnIndex',columnIndex)
        return;
    }
    //if false..
    //draw a wall
    const wall = Bodies.rectangle(
       columnIndex * unitLengthX + unitLengthX/2,
       rowIndex * unitLengthY + unitLengthY,
       unitLengthX,
       10, {
        label: 'wall',
        isStatic: true,
        render: {
            fillStyle: 'red'
        }
       }
    );
    World.add(world,wall)
   });
});

verticals.forEach((row, rowIndex) => {
    console.log('verticals rows',row , 'rowIndex', rowIndex)
    row.forEach((open, columnIndex) => {
        if (open){
        console.log('row for each', open, 'columnIndex',columnIndex)
            return;
        }
   
    const wall = Bodies.rectangle(
       columnIndex  * unitLengthX + unitLengthX,
       rowIndex * unitLengthY + unitLengthY/2,
       10,
       unitLengthY,{
        label: 'wall',
        isStatic: true,
        render: {
            fillStyle: 'red'
        }
       }
    );
    World.add(world,wall)
});
});

//GOAL
const goal = Bodies.rectangle (
    width - unitLengthX/2,
    height - unitLengthY/2,
    unitLengthX * .5,
    unitLengthY * .5,{
        isStatic: true,
        label: 'youWin',
        render: {
            fillStyle: 'green'
        }
    }

);
World.add(world,goal);

//BALL
const ballRadius = Math.min(unitLengthX, unitLengthY) /4
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,{
       label: 'nextgensball',
       id: 69,
       render: {
        fillStyle: 'yellow'
       }
    }
);
World.add(world,ball);

document.addEventListener('keydown', e => {
    const {x, y} = ball.velocity;
    if (e.keyCode === 87) {
        //up
        Body.setVelocity(ball, {x, y: y-5});
    }
    if (e.keyCode === 83) {
        //down
        Body.setVelocity(ball, {x, y: y +5});

    }
    if (e.keyCode === 65) {
        //left
        Body.setVelocity(ball, {x: x-5, y});

    }
    if (e.keyCode === 68) {
        //right
        Body.setVelocity(ball, {x: x+5,y});

    }

});

//Detect Win
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        console.log(collision)
        const labels=['nextgensball','youWin'];
        if (labels.includes(collision.bodyA.label) && 
            labels.includes(collision.bodyB.label)
        ) {

            document.querySelector('.winner').classList.remove('hidden')


            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall'){
                   Body.setStatic(body, false); 
                }
            })
        }
    });
})