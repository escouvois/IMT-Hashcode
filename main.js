
let { GenAlgo, fittestSingle } = require('genalgo');

var _ = require('lodash');
var helpers = require('./helpers.js')

const USERNAME = "DEB";
const POSITION_ORIGINE = {
    lat: 0.5,
    lng: 0.5
};

var problems = {
    // 1000 commandes
    problem1: {
        problem_id: 'problem1',
        orders: helpers.parseCsv('problem1.csv')
    },
    // 3000 commandes
    problem2: {
        problem_id: 'problem2',
        orders: helpers.parseCsv('problem2.csv')
    },
    // 3500 commandes un peu spéciales
    problem3: {
        problem_id: 'problem3',
        orders: helpers.parseCsv('problem3.csv')
    }
};

var findClosestOrder = function (orders, pos) {
    orders = orders.sort(function (orderA, orderB) {
        return helpers.compute_dist(orderA.pos_lat, orderA.pos_lng, pos.lat, pos.lng) <= helpers.compute_dist(orderB.pos_lat, orderB.pos_lng, pos.lat, pos.lng)
    });
    return orders[orders.length - 1];
}

var findRatio = function (orders, pos, coef) {
    orders = orders
        .sort(function (o1, o2) {
            return (o1.amount) * coef - helpers.compute_dist(o1.pos_lat, o1.pos_lng, pos.lat, pos.lng)
                >= (o2.amount) * coef - helpers.compute_dist(o2.pos_lat, o2.pos_lng, pos.lat, pos.lng)
        });
    return orders[orders.length - 1];
}

let solveProblemV1 = (problem, coef) => {
    var solution = {
        problem_id: problem.problem_id,
        username: USERNAME,
        orders: []
    };

    var pos = POSITION_ORIGINE;


    var i = 0;

    while (problem.orders.length > 0) {
        // On prend la commande la plus proche et on l'ajoute au trajet du livreur

        i = Math.max.apply(Math, problem.orders.map(function (o) { return o.amount; }))
        if (i > 0) {
            var order = findRatio(problem.orders, pos, coef);
        } else {
            var order = findClosestOrder(problem.orders, pos);
        }
        solution.orders.push(order.order_id);
        problem.orders = problem.orders.map(o => {
            if (o.amount >= 0) o.amount--;
            return o;
        })

        // On garde en mémoire la nouvelle position du livreur
        pos.lat = order.pos_lat;
        pos.lng = order.pos_lng;

        // On retire la commande qui vient d'être réalisé
        problem.orders.splice(problem.orders.indexOf(order), 1);
    }
    console.log(solution);
    return solution;
}

let solveProblemV2 = (problem) => {
    var solution = {
        problem_id: problem.problem_id,
        username: USERNAME,
        orders: []
    };

    // Create a GenAlgo object with simple parameters
    const algo = new GenAlgo({
        mutationProbability: 1,
        iterationNumber: 500
    });


    let seed = () => {
        let solutions = [];
        let i = 10;
        while (i > 0) {
            var pbCopy = JSON.parse(JSON.stringify(problem));
            solutions.push(solveProblemV1(pbCopy, Math.random() * 0.2 + 0.4));
            i--;
        }
        return solutions;
    }

    const fitnessEvaluator = (individual) => {
        return helpers.get_score(problem, individual.orders).score;
    }

    // Will be called at each iteration
    const iterationCallback = ({ bestIndividual, elapsedTime, iterationNumber }) => {
        console.log("Iteration " + iterationNumber);
        console.log("Best fitness : " + bestIndividual.fitness);
        console.log("Elapsed time : " + elapsedTime);
        return true;
    };

    // Function used to mutate an individual
    const mutation = individual => {
        let rand = Math.floor(Math.random() * individual.orders.length);
        let rand2 = Math.floor(Math.random() * individual.orders.length);
        let temp = individual.orders[rand];
        individual.orders[rand] = individual.orders[rand2];
        individual.orders[rand2] = temp;
        return individual;
    };


    algo.setSeed(seed());
    algo.setFitnessEvaluator(fitnessEvaluator);
    algo.setIterationCallback(iterationCallback);
    algo.setSelectSingleFunction(fittestSingle);
    algo.setSelectPairFunction(null);
    algo.setMutationFunction(mutation);
    algo.start().then(data => {
        let max = data.reduce(function (prev, current) {
            return (prev.fitness > current.fitness) ? prev : current
        });
        helpers.send_solution(max.entity);
    });
    return solution;
}

solveProblemV2(problems.problem1);
