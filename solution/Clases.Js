// Informacion general de la imagen para que las clases tengan acceso
const imageInformation = {};
imageInformation.width = 0;
imageInformation.large = 0;
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
}

class Line {
    // Cuanto puede variar el grosor y el angulo de las lineas
    static ticknessVariation = 0;
    static vertexMovement = 0;

    constructor(vertexA, vertexB, tickness) {
        this.vertexA = vertexA;
        this.vertexB = vertexB;
        this.tickness = tickness;
    }

    mutateTickness() {
        // Opcional
        const range = this.tickness * (this.ticknessVariation / 100);
        const result = Math.random() * (2 * range + 1) - range;
        this.tickness += result;
    }

    mutateVertex() {
        // Por definir
        // Opcional
    }

    getDistance() {
        const distanceX = this.vertexA.x - this.vertexB.x;
        const distanceY = this.vertexA.y - this.vertexB.y;
        return Math.sqrt(distanceX ** 2 + distanceY ** 2);
    }

    setTicknessVariation(ticknessVariation) {
        this.ticknessVariation = ticknessVariation;
    }

    setVertexMovement(vertexMovement) {
        this.vertexMovement = vertexMovement;
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
        for (let i = 0; i < this.quantLines; i++) {
            this.lines.push(this.randomLine());
        }
    }

    randomLine() {
        // Por definir
    }

    crossover(parentA, parentB) {
        // Por definir
    }

    mutateLines() {
        const range = this.quantLines * (this.quantLinesVariation / 100);
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
        // Por definir
        this.fitness = 0;
    }
}

class Generation {
    // Porcentajes y Rangos que comparten todas las generaciones
    static maxGenerations = 0;
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
        for(let i = 0; i < this.populationPerGen; i++) {
            this.population.push(this.createRandomIndividual());
        }
    }

    createRandomIndividual() {
        // Por definir
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
        const cantidad = Math.round(this.population.length * (this.selectionPerGen / 100));
        return this.population.slice(0, cantidad);
    }

    crossover() {
        const cantidad = Math.round(this.population.length * (this.crossoverPercentage / 100));
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
        const cantidad = Math.round(this.population.length * (this.mutatePercentage / 100));
        const mutaded = this.population.slice(0, cantidad);

        for (let i = 0; i < mutaded.length; i++) {
            // Esto es provisional pues aun no se como lo vamos a mutar
            mutaded[i].mutateLines();
        }

        return mutaded;
    }
}

class VectorizeImage {
    constructor() {
        this.generations = [];
    }
}