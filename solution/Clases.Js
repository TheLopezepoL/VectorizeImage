// Informacion general de la imagen para que las clases tengan acceso
const imageInformation = {};
imageInformation.width = 0;
imageInformation.height = 0;
imageInformation.pixels = [];

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    setCoordinates(x, y) {
        this.x = x;
        this.y = y;
    }

    isInBlack() {
        if (imageInformation.pixels[this.y][this.x] === 0) {
            return true;
        }
        return false;
    }
}

class Line {
    // Cuanto puede variar el grosor y el angulo de las lineas
    static ticknesRange = [0, 0];
    static ticknessVariation = 0;
    static vertexMovement = 0;

    constructor(vertexA, vertexB) {
        this.vertexA = vertexA;
        this.vertexB = vertexB;
        this.tickness = setRandomTickness();
    }

    setRandomTickness() {
        const range = Individual.ticknesRange[1] - Individual.ticknesRange[0];
        return (Math.random() * range) + Individual.ticknesRange[0];
    }

    mutateTickness() {
        // Opcional
        const range = this.tickness * (Line.ticknessVariation / 100);
        const result = Math.random() * (2 * range + 1) - range;
        this.tickness += result;
    }

    mutateVertex() {
        // Por definir
        // Opcional
    }

    getDistance() {
        // Distancia euclidiana
        const distanceX = this.vertexA.x - this.vertexB.x;
        const distanceY = this.vertexA.y - this.vertexB.y;
        return Math.sqrt(distanceX ** 2 + distanceY ** 2);
    }

    getMiddlePoint() {
        // Punto medio de la linea
        const x = Math.round((this.vertexA.x + this.vertexB.x) / 2);
        const y = Math.round((this.vertexA.y + this.vertexB.y) / 2);
        return new Vertex(x, y);
    }

    setTicknessVariation(ticknessVariation) {
        Line.ticknessVariation = ticknessVariation;
    }

    setVertexMovement(vertexMovement) {
        Line.vertexMovement = vertexMovement;
    }

    setTicknessRange(min, max) {
        Line.ticknesRange = [min, max];
    }
}

class Individual {
    // Rango de distancia entre puntos para hacer la linea
    static distanceRange = [0, 0];
    static quantLinesVariation = 0;

    constructor(quantLines) {
        this.quantLines = quantLines;
        this.lines = [];
        this.fitness = 0;
    }

    randomLines() {
        // Crea lineas aleatorias
        for (let i = 0; i < this.quantLines; i++) {
            this.lines.push(this.randomLine());
        }
    }

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
        do  {
            const angle = Math.random() * 2 * Math.PI;
            p = Math.round(x + distance * Math.cos(angle));
            q = Math.round(y + distance * Math.sin(angle));
        } while (p < 0 || p >= imageInformation.width || q < 0 || q >= imageInformation.height);
        const vertex2 = new Vertex(p, q);

        // Crear linea
        return new Line(vertex1, vertex2);
    }

    crossover(parentA, parentB) {
        const linesPriority = Math.round(this.quantLines * 65 / 100);
        const linesFromA = parentA.lines.slice(0, linesPriority);
        const linesFromB = parentB.lines.slice(0, this.quantLines - linesPriority);
        this.lines.concat(linesFromA);
        this.lines.concat(linesFromB);
    }

    mutateLines() {
        // Opcional
        const range = this.quantLines * (Individual.quantLinesVariation / 100);
        const result = Math.floor(Math.random() * (2 * range + 1) - range);
        for (let i = 0; i < Math.abs(result); i++) {
            if (result > 0) {
                this.lines.push(this.randomLine());
            }
            else {
                const randomIndex = Math.floor(Math.random * this.lines.length)
                this.lines.splice(randomIndex, 1);
            }
        }
        this.quantLines = this.lines.length;
    }

    calculateFitness() {
        // Por definir - Este fitness es modificable
        let actualFitness = 0;
        for (let i = 0; i < this.quantLines; i++) {
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
        actualFitness /= (4 * this.quantLines);
        this.fitness = actualFitness;
    }

    setDistanceRange(min, max) {
        Individual.distanceRange = [min, max];
    }

    setQuantLinesVariation(variation) {
        Individual.quantLinesVariation = variation;
    }
}

class Generation {
    // Porcentajes y Rangos que comparten todas las generaciones
    static populationPerGen = 0;
    static selectionPerGen = 0;
    static mutatePercentage = 0;
    static crossoverPercentage = 0;
    static quantLinesRange = [0, 0];
    // Tiempo total del algoritmo
    static totalTime = 0;
    
    constructor(id) {
        this.id = id;
        this.genTime = 0;
        this.population = [];
    }

    createRandomPopulation() {
        for(let i = 0; i < Generation.populationPerGen; i++) {
            this.population.push(this.createRandomIndividual());
        }
    }

    createRandomIndividual() {
        const range = Generation.quantLinesRange[1] - Generation.quantLinesRange[0];
        const quantLines = Math.round((Math.random() * range) + Generation.quantLinesRange[0]);
        const individual = new Individual(quantLines);
        individual.randomLines();
        return individual;
    }

    pushIndividuals(individuals) {
        this.population.concat(individuals);
    }

    calculateFitness() {
        for(let i = 0; i < this.population.length; i++) {
            this.population[i].calculateFitness();
        }
    }

    sortPopulation() {
        this.population.sort((a, b) => b.fitness - a.fitness);
    }

    getBest() {
        return this.population[0];
    }

    selectBestPopulation() {
        const cantidad = Math.round(this.population.length * (Generation.selectionPerGen / 100));
        return this.population.slice(0, cantidad);
    }

    crossover() {
        const cantidad = Math.round(this.population.length * (Generation.crossoverPercentage / 100));
        const parentsGroupA = this.population.slice(0, cantidad / 2);
        const parentsGroupB = this.population.slice(0, cantidad).reverse().slice(0, cantidad / 2);
        let children = [];

        for(let i = 0; i < parentsGroupA.length; i++) {
            const parentA = parentsGroupA[i];
            const parentB = parentsGroupB[i];
            const quantLines = Math.round((parentA.quantLines + parentB.quantLines) / 2)
            let son = new Individual(quantLines);
            son.crossover(parentA, parentB);
            children.push(son);
        }

        return children;
    }

    mutate() {
        const cantidad = Math.round(this.population.length * (Generation.mutatePercentage / 100));
        const mutaded = this.population.slice(0, cantidad);

        for (let i = 0; i < mutaded.length; i++) {
            // Esto es provisional pues aun no se como lo vamos a mutar
            mutaded[i].mutateLines();
        }

        return mutaded;
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

    static setQuantLinesRange(min, max) {
        Generation.quantLinesRange = [min, max];
    }

    static addTotalTime(time) {
        Generation.totalTime += time;
    }
}

class VectorizeImage {
    constructor() {
        this.generations = [];
        this.maxGenerations = 0;
    }

    setImageInformation(width, height, pixels) {
        imageInformation.width = width;
        imageInformation.height = height;
        imageInformation.pixels = pixels;
    }

    vectorize() {
        // Primera generacion
        // Tomar tiempo
        let time = 0;
        let firstGen = new Generation(0);
        firstGen.createRandomPopulation();
        firstGen.calculateFitness();
        firstGen.sortPopulation();
        // Detener tiempo
        firstGen.genTime = time;
        Generation.addTotalTime(time);
        while (!this.hasConverged() && this.getLastGen().id < this.maxGenerations) {
            // Nueva Generacion
            // Tomar tiempo
            time = 0;
            let lastGen = this.getLastGen();
            let newGen = new Generation(lastGen.id + 1);
            newGen.population.concat(lastGen.selectBestPopulation());
            newGen.population.concat(lastGen.crossover());
            newGen.population.concat(lastGen.mutate());
            newGen.calculateFitness();
            newGen.sortPopulation();
            // Detener tiempo
            newGen.genTime = time;
            Generation.addTotalTime(time);
        }
    }

    hasConverged() {
        // Por definir
        return false;
    }

    getLastGen() {
        return this.generations[this.generations.length - 1];
    }

    
}