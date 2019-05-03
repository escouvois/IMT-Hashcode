"use strict"

class Dijkstra{

	static compute(graphe, entree){
		console.log('Dijkstra en cours...')

		let ensembleSommetsATraiter = new Set()

		let distances = new Map()

		let precedents = new Map()

		// Initialisation de chaque sommet :

		graphe.sommets.forEach(function(sommet){
			distances.set(sommet, Infinity)
			ensembleSommetsATraiter.add(sommet)
		})

		// Le point d'entrée a une distance nulle.
		distances.set(entree, 0)
		precedents.set(entree, null)

		while (ensembleSommetsATraiter.size !== 0){
			let sommet = [...distances].filter(function(distance){
				return ensembleSommetsATraiter.has(distance[0])
			}).sort()[0][0]

			ensembleSommetsATraiter.delete(sommet)

			graphe.findSommetsVoisins(sommet).forEach(function(sommetVoisin){

				let alt = distances.get(sommet) + graphe.findArreteBySommets(sommet, sommetVoisin).poids

				if (alt < distances.get(sommetVoisin)){
					distances.set(sommetVoisin, alt)
					precedents.set(sommetVoisin, sommet)
				}

			})

		}

		graphe.sommets.forEach(function(sommet){

			process.stdout.write(sommet)

			let sommetPrec = sommet

			while(sommetPrec = precedents.get(sommetPrec)){
				process.stdout.write("<="+sommetPrec);
			}

			console.log("\nDistance : "+distances.get(sommet))

		})

		console.log('Dijkstra fini.')
	}

}	

module.exports = Dijkstra