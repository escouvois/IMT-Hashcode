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

var solve_problem_dumb = function (problem) {
    var solution = {
        problem_id: problem.problem_id,
        username: USERNAME,
        orders: []
    };

    var pos = POSITION_ORIGINE;

    while (problem.orders.length > 0) {
        console.log(problem.orders.length);
        // On prend la commande la plus proche et on l'ajoute au trajet du livreur
        var order = findClosestOrder(problem.orders, pos);
        solution.orders.push(order.order_id);

        // On garde en mémoire la nouvelle position du livreur
        pos.lat = order.pos_lat;
        pos.lng = order.pos_lng;

        // On retire la commande qui vient d'être réalisé
        problem.orders.splice(problem.orders.indexOf(order), 1);
    }
    return solution;
};

var findClosestOrder = function (orders, pos) {
    orders = orders.sort(function (orderA, orderB) {
        return helpers.compute_dist(orderA.pos_lat, orderA.pos_lng, pos.lat, pos.lng) <= helpers.compute_dist(orderB.pos_lat, orderB.pos_lng, pos.lat, pos.lng)
    });
    return orders[orders.length - 1];
}


var findClosestOrders = function (orders, pos, numberOrders) {
    orders = orders.sort(function (orderA, orderB) {
        return helpers.compute_dist(orderA.pos_lat, orderA.pos_lng, pos.lat, pos.lng) <= helpers.compute_dist(orderB.pos_lat, orderB.pos_lng, pos.lat, pos.lng)
    });
    return orders.slice(numberOrders - 1);
}

var findRatio = function (orders, pos) {
    orders = orders
        .map(o => o.amount / helpers.compute_dist(o.pos_lat, o.pos_lng, pos.lat, pos.lng))
        .sort(function (o1, o2) {
            return o1 >= o2
        });

    return orders[orders.length - 1];
}

let solveProblemV1 = (problem) => {
    var solution = {
        problem_id: problem.problem_id,
        username: USERNAME,
        orders: []
    };

    var pos = POSITION_ORIGINE;





    while (problem.orders.length > 0) {
        //console.log(problem.orders.length);
        // On prend la commande la plus proche et on l'ajoute au trajet du livreur
        //var closestOrders = findClosestOrders(problem.orders, pos, problem.orders.length < 3 ? problem.orders.length : 3);
        console.log(pos);
        var order = findRatio(problem.orders, pos);


        solution.orders.push(order.order_id);


        // On garde en mémoire la nouvelle position du livreur
        pos.lat = order.pos_lat;
        pos.lng = order.pos_lng;

        // On retire la commande qui vient d'être réalisé
        problem.orders.splice(problem.orders.indexOf(order), 1);
    }
    return solution;
}

var solution = solveProblemV1(problems.problem1);
helpers.send_solution(solution);
