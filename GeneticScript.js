/*
PY2 - Vectorizacion de imagenes
Kevin Jiménez Molinares 2021475925
Sebastián López Herrera 2019053591
Josafat Badilla Rodríguez 2020257662
*/

// Informacion general de la imagen para que las clases tengan acceso
const imageInformation = {};
imageInformation.width = 0;
imageInformation.height = 0;
imageInformation.pixels = [];

//let Pruebamat;

/**
 * @class Vertex
 */
class Vertex {
    /**
     * Creates an instance of Vertex.
     *
     * @constructor
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     *  Change Vertex location
     *
     * @param x {number}
     * @param y {number}
     */
    setCoordinates(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Return true if a vertex is in a black pixel in the paint
     *
     * @returns {boolean}
     */
    isInBlack() {
        return imageInformation.pixels[this.y][this.x] === 0;
    }
}

/**
 * @class Line
 */
class Line {
    // Cuanto puede variar el grosor y el angulo de las lineas
    /** @type {[number, number]} */
    static ticknessRange = [0, 0];
    /** @type {number} */
    static ticknessVariation = 0;

    //static vertexMovement = 0;

    /**
     * Creates an instance of Line.
     *
     * @constructor
     * @param {Vertex} vertexA
     * @param {Vertex} vertexB
     */
    constructor(vertexA, vertexB) {
        this.vertexA = vertexA;
        this.vertexB = vertexB;
        /** @type {number} */
        this.tickness = this.setRandomTickness();
    }

    copyLine() {
        let copied = new Line(new Vertex(this.vertexA.x, this.vertexA.y), new Vertex(this.vertexB.x, this.vertexB.y));
        copied.tickness = this.tickness;
        return copied;
    }

    /**
     * Value between tickness range
     *
     * @returns {number}
     */
    setRandomTickness() {
        const range = Line.ticknessRange[1] - Line.ticknessRange[0];
        return (Math.random() * range) + Line.ticknessRange[0];
    }

    /**
     * Change the tickness randomly
     */
    mutateTickness() {
        // Opcional
        const range = this.tickness * (Line.ticknessVariation / 100);
        const result = Math.random() * (2 * range + 1) - range;
        this.tickness += result;
    }

    /*
    mutateVertex() {
        // Por definir
        // Opcional
    }
    */

    /**
     * Returns the euclidian distance between the 2 vertex of the line
     *
     * @returns {number}
     */
    getDistance() {
        // Distancia euclidiana
        const distanceX = this.vertexA.x - this.vertexB.x;
        const distanceY = this.vertexA.y - this.vertexB.y;
        return Math.sqrt(distanceX ** 2 + distanceY ** 2);
    }

    /**
     * Create a Vertex from the midle of the line
     *
     * @returns {Vertex}
     */
    getMiddlePoint() {
        // Punto medio de la linea
        const x = Math.round((this.vertexA.x + this.vertexB.x) / 2);
        const y = Math.round((this.vertexA.y + this.vertexB.y) / 2);
        return new Vertex(x, y);
    }

    static setTicknessVariation(ticknessVariation) {
        Line.ticknessVariation = ticknessVariation;
    }

    /*
    static setVertexMovement(vertexMovement) {
        Line.vertexMovement = vertexMovement;
    }
    */

    static setTicknessRange(range) {
        Line.ticknessRange = range;
    }
}

/**
 * @class Individual
 */
class Individual {
    // Rango de distancia entre puntos para hacer la linea
    /** @type {[number, number]} */
    static distanceRange = [0, 0];
    /** @type {number} */
    static quantLinesVariation = 0;

    /**
     * Creates an instance of Individual.
     *
     * @constructor
     * @param {number} quantLines
     */
    constructor(quantLines) {
        this.quantLines = quantLines;
        /** @type {Line[]} */
        this.lines = [];
        /** @type {number} */
        this.fitness = 0;
    }

    
    /**
     * Description copia a un individuo creando uno nuevo
     *
     * @returns {Individual}
     */
    copyIndividual() {
        let copied = new Individual(this.quantLines);
        for (let i = 0; i < this.lines.length; i++) {
            copied.lines.push(this.lines[i].copyLine());
        }
        copied.fitness = this.fitness;
        return copied;
    }

    /**
     * Fill the lines array with random lines
     */
    randomLines() {
        // Crea lineas aleatorias
        for (let i = 0; i < this.quantLines; i++) {
            this.lines.push(this.randomLine());
        }
    }

    
    /**
     * Description añade lineas al individuo
     *
     * @param {*} lines
     */
    addLines(lines) {
        for (let i = 0; i < lines.length; i++) {
            this.lines.push(lines[i]);
        }
    }

    /**
     * Create a random Line
     *
     * @returns {Line}
     */
    randomLine() {
        // Crear un primer punto
        const x = Math.floor(Math.random() * imageInformation.width);
        const y = Math.floor(Math.random() * imageInformation.height);
        const vertex1 = new Vertex(x, y);

        // Obtener la distancia
        const range = Individual.distanceRange[1] - Individual.distanceRange[0];
        const distance = Math.round((Math.random() * range) + Individual.distanceRange[0]);

        // Crear el segundo punto a una distancia k
        let p = 0;
        let q = 0;
        do {
            const angle = Math.random() * 2 * Math.PI;
            p = Math.round(x + distance * Math.cos(angle));
            q = Math.round(y + distance * Math.sin(angle));
        } while (p < 0 || p >= imageInformation.width || q < 0 || q >= imageInformation.height);
        const vertex2 = new Vertex(p, q);

        // Crear linea
        return new Line(vertex1, vertex2);
    }

    /**
     * Fill lines array from the genes of the parents
     *
     * @param {Individual} parentA
     * @param {Individual} parentB
     */
    crossover(parentA, parentB) {
        const percentage = Math.random() * (70 - 50) + 50;
        const linesPriority = Math.round(this.quantLines * percentage / 100);
        const copylinesFromA = parentA.lines.slice(0, linesPriority);
        let linesFromA = [];
        for (let i = 0; i < copylinesFromA.length; i++) {
            linesFromA.push(copylinesFromA[i].copyLine());
        }
        const copylinesFromB = parentB.lines.slice(0, this.quantLines - linesPriority);
        let linesFromB = [];
        for (let k = 0; k < copylinesFromB.length; k++) {
            linesFromB.push(copylinesFromB[k].copyLine());
        }
        this.addLines(linesFromA);
        this.addLines(linesFromB);
    }

    /**
     * Change the number of individual's lines
     */
    mutateLines() {
        const range = this.lines.length * (Individual.quantLinesVariation / 100);
        const result = Math.floor(Math.random() * (2 * range + 1) - range);
        if (result < 0) {
            this.lines.splice(0, result);
        } else {
            for (let i = 0; i < result; i++) {
                this.lines.push(this.randomLine());
            }
        }
        this.quantLines = this.lines.length;
    }

    /**
     * Set a number between 0 and 1 of the % of correctness of the Individual
     */
    calculateFitness() {
        
        let actualFitness = 0;
        for (let i = 0; i < this.lines.length; i++) {
            const actualLine = this.lines[i];
            // +1 Punto si los puntos extremos se encuentran en una zona sombreada
            if (actualLine.vertexA.isInBlack()) {
                actualFitness++;
            }
            if (actualLine.vertexB.isInBlack()) {
                actualFitness++;
            }
            // +2 Puntos si el punto medio de la linea se encuentra en una zona sombreada
            if (actualLine.getMiddlePoint().isInBlack()) {
                actualFitness += 2;
            }
        }
        // Esto lo hago con la idea de que tener + lineas sea un factor determinante. 
        // Lo que importa es que las que tenga esten bien.
        actualFitness /= (4 * this.lines.length);
        this.fitness = actualFitness;
    }

    /**
     *
     * @returns {cv.Mat}
     */
    convertToMat() {
        // Crear una matriz en blanco
        const mat = new cv.Mat(imageInformation.width, imageInformation.height, cv.CV_8UC3, [255, 255, 255, 255]);

        for (let i = 0; i < this.lines.length; i++) {
            // Obtener info de la Linea
            const lineInfo = this.lines[i];
            const startV = new cv.Point(lineInfo.vertexA.x, lineInfo.vertexA.y);
            const endV = new cv.Point(lineInfo.vertexB.x, lineInfo.vertexB.y);
            const color = new cv.Scalar(0, 0, 0);
            const tickness = lineInfo.tickness;

            // Agregar linea a la matriz
            cv.line(mat, startV, endV, color, tickness);
        }
        cv.imshow('canvasOutput', mat);
        //Pruebamat = mat;
        return mat;
    }

    static setDistanceRange(distance) {
        Individual.distanceRange = distance;
    }

    static setQuantLinesVariation(variation) {
        Individual.quantLinesVariation = variation;
    }

    getFitness(){
        return this.fitness;
    }
}

/**
 * @class Generation
 */
class Generation {
    // Porcentajes y Rangos que comparten todas las generaciones
    static populationPerGen = 0;
    static selectionPerGen = 0;
    static mutatePercentage = 0;
    static crossoverPercentage = 0;
    /** @type {[number, number]} */
    static quantLinesRange = [0, 0];
    // Tiempo total del algoritmo
    static totalTime = 0;

    /**
     * Creates an instance of Generation.
     *
     * @constructor
     * @param {number} id
     */
    constructor(id) {
        this.id = id;
        /** @type {number} */
        this.genTime = 0;
        /** @type {Individual[]} */
        this.population = [];
    }

    /**
     * Fills the population array with random Individuals
     */
    createRandomPopulation() {
        for (let i = 0; i < Generation.populationPerGen; i++) {
            this.population.push(this.createRandomIndividual());
        }
    }

    /**
     * Creates an instance of the class Individual with random Lines
     *
     * @returns {Individual}
     */
    createRandomIndividual() {
        const range = Generation.quantLinesRange[1] - Generation.quantLinesRange[0];
        const quantLines = Math.round((Math.random() * range) + Generation.quantLinesRange[0]);
        const individual = new Individual(quantLines);
        individual.randomLines();
        return individual;
    }

    calculateFitness() {
        for (let i = 0; i < this.population.length; i++) {
            this.population[i].calculateFitness();
        }
    }

    sortPopulation() {
        this.population.sort((a, b) => b.fitness - a.fitness);
    }

    addIndividuals(array) {
        for (let i = 0; i < array.length; i++) {
            this.population.push(array[i]);
        }
    }

    getBest() {
        //console.log("Pana: ", this.population[0]);
        return this.population[0];
    }

    selectBestPopulation() {
        const cantidad = Math.round(this.population.length * (Generation.selectionPerGen / 100));
        const copyPopulation = this.population.slice(0, cantidad);
        let bestPopulation = [];
        for (let i = 0; i < copyPopulation.length; i++) {
            bestPopulation.push(copyPopulation[i].copyIndividual());
        }
        return bestPopulation;
    }
    
    /**
     * Description cruza los individuos de una poblacion
     *
     * @returns {Individual[]}
     */
    crossover() {
        const cantidad = Math.round(this.population.length * (Generation.crossoverPercentage / 100));
        const copyParentsGroupA = this.population.slice(0, cantidad);
        const copyParentsGroupB = this.population.slice(0, cantidad).reverse();
        let parentsGroupA = [];
        let parentsGroupB = [];
        for (let i = 0; i < copyParentsGroupA.length; i++) {
            parentsGroupA.push(copyParentsGroupA[i].copyIndividual());
        }
        for (let j = 0; j < copyParentsGroupB.length; j++) {
            parentsGroupB.push(copyParentsGroupB[j].copyIndividual());
        }
        let children = [];

        for (let i = 0; i < parentsGroupA.length; i++) {
            // Crear un hijo por pareja
            const parentA = parentsGroupA[i];
            const parentB = parentsGroupB[i];
            const quantLines = Math.round((parentA.quantLines + parentB.quantLines) / 2)
            let son = new Individual(quantLines);
            son.crossover(parentA, parentB);
            children.push(son);
        }

        return children;
    }

    /**
     * Description muta los individuos de la generacion
     *
     * @returns {Individual[]}
     */
    mutate() {
        const cantidad = Math.round(this.population.length * (Generation.mutatePercentage / 100));
        const copyMutaded = this.population.slice(0, cantidad);
        let mutaded = [];
        for (let i = 0; i < copyMutaded.length; i++) {
            mutaded.push(copyMutaded[i].copyIndividual());
        }

        for (let i = 0; i < mutaded.length; i++) {
            mutaded[i].mutateLines();
        }

        return mutaded;
    }

    getId(){
        return this.id;
    }

    getPopulation(){
        return this.population;
    }

    getGenTime(){
        return this.genTime;
    }

    static setPopulationPerGen(value) {
        Generation.populationPerGen = value;
    }

    static setSelectionPerGen(percentage) {
        Generation.selectionPerGen = percentage;
    }

    static setMutatePercentage(percentage) {
        Generation.mutatePercentage = percentage;
    }

    static setCrossoverPercentage(percentage) {
        Generation.crossoverPercentage = percentage;
    }

    static setQuantLinesRange(range) {
        Generation.quantLinesRange = range;
    }

    static addTotalTime(time) {
        Generation.totalTime += time;
    }
}

/**
 * @class VectorizeImage
 */
class VectorizeImage {
    /**
     * Creates an instance of VectorizeImage.
     *
     * @constructor
     */
    constructor() {
        /** @type {Generation[]} */
        this.generations = [];
        /** @type {number} */
        this.maxGenerations = 0;
    }

    static setMutationVariation(variation) {
        Line.setTicknessVariation(variation);
        Individual.setQuantLinesVariation(variation);
    }

    static setImageInformation(width, height, pixels) {
        imageInformation.width = width;
        imageInformation.height = height;
        imageInformation.pixels = pixels;
    }

    static setPercentages(selection, crossover, mutate) {
        Generation.setSelectionPerGen(selection);
        Generation.setCrossoverPercentage(crossover);
        Generation.setMutatePercentage(mutate);
    }

    setMaxGenerationsAndPopulation(generation, population) {
        this.maxGenerations = generation;
        Generation.setPopulationPerGen(population);
    }

    static setRanges(quantLines, distance, tickness) {
        Generation.setQuantLinesRange(quantLines);
        Individual.setDistanceRange(distance);
        Line.setTicknessRange(tickness);
    }

    /**
     * Creates Generations until it vectorizes the image, or it reaches the max Gens const
     */
    vectorize() {
        // Primera generacion
        
        let inicio = performance.now(); // Tomar tiempo
        let firstGen = new Generation(0);
        firstGen.createRandomPopulation();
        firstGen.calculateFitness();
        firstGen.sortPopulation();
        let fin = performance.now();// Detener tiempo
        let time = fin - inicio;
        firstGen.genTime = time;
        Generation.addTotalTime(time);
        this.generations.push(firstGen);
        while (!this.hasConverged(VectorizeImage.setPixels(this.getLastGen().getBest().convertToMat())) && this.getLastGen().id < this.maxGenerations) {
            // Nueva Generacion
            let inicio = performance.now(); // Tomar tiempo
            let lastGen = this.getLastGen();
            let newGen = new Generation(lastGen.id + 1);
            newGen.addIndividuals(lastGen.selectBestPopulation());
            newGen.addIndividuals(lastGen.crossover());
            newGen.addIndividuals(lastGen.mutate());    // El mutate genera un error con las cant lineas
            newGen.calculateFitness();
            newGen.sortPopulation();
            let fin = performance.now(); // Detener tiempo
            let time = fin - inicio;
            newGen.genTime = time;
            Generation.addTotalTime(time);
            // Agregar generacion
            this.generations.push(newGen);
        }
    }

    /**
     * Checks if the best Individual completed the task
     *
     * @param best best Individual from Generation
     * @returns {boolean}
     */
    hasConverged(best) { // Pensar despues
        let similarityBlacks = 0;
        let totalBlacks = 0;
        //let similarityWhites = 0;
        //let totalWhites = 0;
        for (let row = 0; row < imageInformation.height; row++) {
            for (let col = 0; col < imageInformation.width; col++) {
                if (imageInformation.pixels[row][col] === 0) {
                    totalBlacks++;
                    if (best[row][col] === 0) {
                        similarityBlacks++;
                    }
                }
                /*else {
                    totalWhites++;
                    if (best[row][col] !== 0) {
                        similarityWhites++;
                    }
                }*/
            }
        }
        //
        const similarity = similarityBlacks / totalBlacks;
        console.log("Similarity: ", similarity);
        return similarity >= 0.85;
    }

    getLastGen() {
        return this.generations[this.generations.length - 1];
    }

    getGenerations(){
        return this.generations;
    }

    /**
     * Gives a matrix with the pixels of a Mat Object
     *
     * @param mat The cv.mat Object
     * @returns {number[][]}
     */
    static setPixels(mat) {
        let pixels = [];
        for (let col = 0; col < imageInformation.width; col++) {
            let rows = [];
            for (let row = 0; row < imageInformation.height; row++) {
                let uchar = mat.ucharPtr(col, row);
                rows.push(uchar[0]);
            }
            pixels.push(rows);
        }
        return pixels;
    }
}


/**
 * Description Carga la imagen en el canvas
 * 
 */
function loadImage() {
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = function () {

        canvas.width = image.width;
        canvas.height = image.height;
        imageInformation.width = image.width;
        imageInformation.height = image.height;


        ctx.drawImage(image, 0, 0);
        Matrix();
        VectorizeImage.setRanges([28, 38], [2,5], [1, 3]);
    };

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}



/**
 * Description Crear la matriz de puntos
 * 
 */
function Matrix() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const matrix = [];

    for (let y = 0; y < canvas.height; y++) {
        const row = [];

        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const isBlack = r === 0 && g === 0 && b === 0;

            row.push(isBlack ? 0 : 255);
        }

        matrix.push(row);
    }
    imageInformation.pixels = matrix;
    //console.log(imageInformation.pixels);
    //console.log(matrix); // Imprimir la matriz de puntos en la consola
}


/**
 * Description Actualiza los valores al seleccionar los porcentages
 * @date 6/7/2023 - 7:52:27 PM
 */
function updateValues() {
    var selectionPtr = parseInt(document.getElementById("selectionPtr").value);
    var mutationPtr = parseInt(document.getElementById("mutationPtr").value);
    var crossoverPtr = parseInt(document.getElementById("crossoverPtr").value);
  
    
    const sum = selectionPtr + mutationPtr + crossoverPtr;
    if (sum === 100) {
      document.getElementById("result").innerHTML = "La suma es igual a 100%. ¡Valores válidos!";
      document.getElementById("saveBtn").disabled = false;
    } else {
      document.getElementById("result").innerHTML = "La suma debe ser igual a 100%. La suma actual es " + sum +" %";
      document.getElementById("saveBtn").disabled = true;
    }
}
  

/**
 * Description Guarda los valores de la configuracion e inicia las generaciones
 * 
 */
function saveValues() {
    var selectionPtr = parseInt(document.getElementById("selectionPtr").value);
    var mutationPtr = parseInt(document.getElementById("mutationPtr").value);
    var crossoverPtr = parseInt(document.getElementById("crossoverPtr").value);
    var maxGenerations = parseInt(document.getElementById("maxGenerations").value);
    var maxIndividuals = parseInt(document.getElementById("maxIndividuals").value);
    
    var vectorizeImage = new VectorizeImage();
    VectorizeImage.setMutationVariation(15);
    VectorizeImage.setPercentages(selectionPtr,crossoverPtr,mutationPtr);
    vectorizeImage.setMaxGenerationsAndPopulation(maxGenerations,maxIndividuals)
    
    console.log(selectionPtr,mutationPtr,crossoverPtr,maxGenerations,maxIndividuals);
    document.getElementById("g").style.visibility = "visible"; 
    document.getElementById("configurationContainer").style.visibility = "hidden"; 
    vectorizeImage.vectorize();
    console.log("Termino");
    console.log("TotalTime: ", Generation.totalTime);
    let time = convertTime(Generation.totalTime); 
    let avgTime = calculateAvgTime(vectorizeImage);
    document.getElementById("avgTime").innerText= "Tiempo Promedio= " + avgTime.minutos +"m:" + avgTime.segundos + "s:" + avgTime.milisegundos +"ms";
    document.getElementById("finalTime").innerText= "Tiempo final= " + time.minutos +"m:" + time.segundos + "s:" + time.milisegundos +"ms";
    createGraphic(vectorizeImage);
  }
 



 /**
  * Description Calcula el tiempo promedio de las generaciones
  *
  * @param {VectorizeImage} vectorizeImage
  * @returns {{ minutos: number; segundos: number; milisegundos: number; }}
  */
 function calculateAvgTime(vectorizeImage){
    var times= [];
    var generations = vectorizeImage.getGenerations();
    for (let i= 0 ; i < generations.length; i++){
        times.push(generations[i].getGenTime());
    }

    let avgTime = calculateAverage(times);
    return convertTime(avgTime);
 }


 
 /**
  * Description Convierte los milisengundos a minutos, segundos y milisegundos
  *
  * @param {number} milisegundos
  * @returns {{ minutos: number; segundos: number; milisegundos: number; }}
  */
 function convertTime(milisegundos) {
    // Convertir milisegundos a segundos
    var segundos = Math.floor(milisegundos / 1000);
  
    // Calcular los minutos y segundos
    var minutos = Math.floor(segundos / 60);
    segundos = segundos % 60;
    milisegundos = milisegundos % 1000;
  
    return {
      minutos: minutos,
      segundos: segundos,
      milisegundos: milisegundos  
    };
  }

/**
 * Description placeholder
 *
 * @param {number[]} array
 * @returns {number} Promedio del arreglo
 */
function calculateAverage(array) {
    var suma = 0;
    var cantidadElementos = array.length;
  
    // Suma todos los elementos del array
    for (var i = 0; i < cantidadElementos; i++) {
      suma += array[i];
    }
  
    // Calcula el promedio dividiendo la suma total por la cantidad de elementos
    var promedio = suma / cantidadElementos;
  
    return promedio;
  }


/**
 * Description placeholder
 *
 * @param {VectorizeImage} vectorizeImage
 */

function createGraphic(vectorizeImage){
    var generationsIds= [];
    var bestFitness= [];
    var avgFitness = [];
    var generations = vectorizeImage.getGenerations()
    
    for (let i= 0 ; i < generations.length; i++){
        let fitnesess= [];
        let population = generations[i].getPopulation();
        for (let j= 0; j < population.length; j++){
            fitnesess.push(population[j].getFitness())
        }
        avgFitness.push(calculateAverage(fitnesess));
        generationsIds.push(generations[i].getId());
        bestFitness.push(generations[i].getBest().getFitness());
    }
    
    

    var datos = {
        labels: generationsIds,
        datasets: [{
          label: 'BestFitness',
          data: bestFitness,
          fill: false,
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }, {
            label: 'AverageFitness',
            data: avgFitness,
            fill: false,
            borderColor: 'rgba(122, 255, 235, 1)',
            borderWidth: 2
          },]
      };
  
      // Opciones del gráfico
      var opciones = {
        plugins: {
            drawBackground: {
              color: 'rgb(255, 255, 255)' // Color del fondo
            }
          },
        responsive: false,
        maintainAspectRatio: false
      };
  
      // Crear el gráfico
      var ctx = document.getElementById('grafico').getContext('2d');
      var grafico = new Chart(ctx, {
        type: 'line',
        data: datos,
        options: opciones
      });

}  

document.getElementById("fileInput").addEventListener('change', function (e) {
    e.preventDefault();
    loadImage()
});  


  