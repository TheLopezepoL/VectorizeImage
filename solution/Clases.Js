// Image information for the functions : Width, Larga and PixelsMap
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
    static ticknessVariation = 0;
    static vertexMovement = 0;

    constructor(vertexA, vertexB, tickness) {
        this.vertexA = vertexA;
        this.vertexB = vertexB;
        this.tickness = tickness;
    }

    mutateTickness() {
        const range = this.tickness * (this.ticknessVariation / 100);
        const result = Math.random() * (2 * range) - range;
        this.tickness += result;
    }

    mutateVertex() {
         // Por definir
    }

    setTicknessVariation(ticknessVariation) {
        this.ticknessVariation = ticknessVariation;
    }

    setVertexMovement(vertexMovement) {
        this.vertexMovement = vertexMovement;
    }
}

class Individual {
    constructor(quantLines) {

    }
}

class Generation {
    constructor() {
        this.maxGenerations = 0;
        this.populationPerGen = 0;
        this.selectionPerGen = 0;
        this.mutate = 0;
        this.crossover = 0;
        this.id = 0;
    }

}

class VectorizeImage {
    constructor() {

    }
}