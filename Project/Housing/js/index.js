// Partie Vue -----------------------------------------------------------------

// On commence par creer des "composants" qu'on va utiliser un peu partout

// Là on donne le nom du composant (comme un span, div, h3, etc)
/*
Vue.component('boite', {
	// Les paramètres sont là
	props: ['couleur', 'valeur', 'icone', 'texte'],
	// La on donne le code source HTML du composant qui peut utiliser des données
	template: 
		`<div class="media d-flex mt-3">
			<div class="align-self-center ml-1 mr-1">
				<i :class="'fa-2x fa-fw ' + icone"></i>
			</div>
			<div class="media-body text-left ml-1">
				<b>{{valeur}}</b><br>
				<span>{{texte}}</span>
			</div>
		</div>`
});
*/
/*
Vue.component('boite-accordeon', {
	// Les paramètres sont là
	props: ['couleur', 'mutation', 'icone', 'index'],
	// La on donne le code source HTML du composant qui peut utiliser des données
	
	template: `<div class="card mt-3">
				<div class="card-body" v-on:click="selectionnerMutation()">
					<div class="media d-flex">
						<div class="align-self-center ml-1 mr-1">
							<i class="fas fa-file-signature fa-fw fa-2x"></i>
						</div>
						<div class="media-body text-left ml-1">
							<b>{{ mutation.infos[0]['Valeur fonciere'] }} € / {{ mutation.infos[0]['Nature mutation'] }}</b><br>
							<span>{{ mutation.infos[0]['Date mutation'] }}</span>
			 			</div>
					</div>
					<div v-if="vue.mutationIndex == index" style="background-color: #eee" class="mt-3">
						<boite 
							v-for="batiment in mutation.batiments" 
							:valeur="(batiment['Code type local'] != 3) ? (batiment['Surface reelle bati'] + ' m²') : ''" 
							:icone="['', 'fa fa-home', 'fas fa-building', 'fas fa-warehouse', 'fas fa-store'][batiment['Code type local']]" 
							:texte="batiment['Type local'] + ((batiment['Code type local'] < 3) ? (' / ' + batiment['Nombre pieces principales'] + ' p') : '')">
						</boite>
						<boite 
							v-for="terrain in mutation.terrains"  
							:valeur="terrain['Surface terrain'] + ' m²'" 
							icone="fa fa-tree" 
							:texte="terrain['Libellé Nature de Culture'] + (terrain['Libellé Nature Culture Spéciale'] != '' ? ' / ' + terrain['Libellé Nature Culture Spéciale'] : '')">
						</boite>
							<div v-if="mutation.mutations_liees.length > 0" style = "padding:0.5rem">
								Cette mutation contient des dispositions dans des parcelles adjacentes. La valeur foncière correspond au total.
							</div>
					</div>
			</div>
		</div>`,
	methods: {
		selectionnerMutation() {
			entrerDansMutation(this.index);
		}
	}
});
*/

// Ici, on cree l'application Vue (on lui dit de se relier à l'élément HTML app)

var vue = new Vue({
		el: '#app',
		data: {
			fold_left: false,
			section: null,
			parcelle: null,
			mutationIndex: null,
		},
		methods: {},
	});


// Partie JavaScript standard (sans framework) --------------------------------

// Définition des variables globales

var codeDepartement = null;
var nomDepartement = null;
var codeCommune = null;
var codeSection = null;
var codeParcelle = null;

var communesLayer = null;
var sectionsLayer = null;
var parcellesLayer = null;
var labelsSections = [];
var data_dvf = null;

var nom_fichier_section = null;
var data_section = null;

var dateMin = '01-01-2015';
var dateMax = '01-01-2019';

var codeEvolution = "2018 - 2019";
var anneeM2 = "2019";

var polygon = null;
var cities = null;

var polygonCommune = null;
var citiesCommune = null;

var departement_api = [];
var commune_api = [];

var departementGroup = [];
var communeGroup = [];

var augmentation;
var toggleNumber;

var min_m2 = 3000;
var max_m2 = 9000;
// Fonctions

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("sidebar_left").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}


function selectionnerEvolution() {
	// L'utilisateur a cliqué sur la liste déroulante des départements
	var e = document.getElementById("evolution");
	var sonCode = e.options[e.selectedIndex].value;
	entrerDansEvolution(sonCode);

};

function selectionnerAnnee() {
	// L'utilisateur a cliqué sur la liste déroulante des départements
	var e = document.getElementById("annee");
	var sonCode = e.options[e.selectedIndex].value;
	entrerDansAnnee(sonCode);

};


function selectionnerDepartement() {
	// L'utilisateur a cliqué sur la liste déroulante des départements
	var e = document.getElementById("departements");
	var sonCode = e.options[e.selectedIndex].value;
	entrerDansDepartement(sonCode);
};

function selectionnerCommune() {
	// L'utilisateur a cliqué sur la liste déroulante des communes
	var e = document.getElementById("communes");
	var sonCode = e.options[e.selectedIndex].value;
	entrerDansCommune(sonCode);
}


function onEachFeatureCommune(feature, layer) {

	$('#communes').append($('<option />', {
		value: feature.properties.code,
		text: feature.properties.nom
	}));
	layer.on({
		click: onCityClicked
	});
}


function viderLabelsSections() {
	for (label of labelsSections) {
		map.removeLayer(label);
	}
	labelsSections = [];
}


function entrerDansCommune(sonCode) {
	viderLabelsSections();
	invalidateMap();
	codeCommune = sonCode;
	for (pas = 0; pas < commune_api.length; pas++) {
		if(commune_api[pas]["Code commune"] == codeCommune){
			document.getElementById('titre_info').innerHTML = '<h2 id="titre_info">'+ commune_api[pas]["Commune"] +'</h2>';
			if(toggleNumber){

				document.getElementById("block_annee").style.display = "None";
	  			document.getElementById("block_evolution").style.display = "Block";

				document.getElementById('2014_2015').innerHTML = '<span id="2014_2015">' + commune_api[pas]["2014 - 2015"] + '</span>';
				document.getElementById('2015_2016').innerHTML = '<span id="2015_2016">' + commune_api[pas]["2015 - 2016"] + '</span>';
				document.getElementById('2016_2017').innerHTML = '<span id="2016_2017">' + commune_api[pas]["2016 - 2017"] + '</span>';
				document.getElementById('2017_2018').innerHTML = '<span id="2017_2018">' + commune_api[pas]["2017 - 2018"] + '</span>';
				document.getElementById('2018_2019').innerHTML = '<span id="2018_2019">' + commune_api[pas]["2018 - 2019"] + '</span>';
				document.getElementById('2019_2020').innerHTML = '<span id="2019_2020">' + commune_api[pas]["2019 - 2020"] + '</span>';
			} else {

				document.getElementById("block_evolution").style.display = "None";
	  			document.getElementById("block_annee").style.display = "Block";

				document.getElementById('d2014').innerHTML = '<span id="d2014">' + commune_api[pas]["2014"] + '</span>';
				document.getElementById('d2015').innerHTML = '<span id="d2015">' + commune_api[pas]["2015"] + '</span>';
				document.getElementById('d2016').innerHTML = '<span id="d2016">' + commune_api[pas]["2016"] + '</span>';
				document.getElementById('d2017').innerHTML = '<span id="d2017">' + commune_api[pas]["2017"] + '</span>';
				document.getElementById('d2018').innerHTML = '<span id="d2018">' + commune_api[pas]["2018"] + '</span>';
				document.getElementById('d2019').innerHTML = '<span id="d2019">' + commune_api[pas]["2019"] + '</span>';
				document.getElementById('d2020').innerHTML = '<span id="d2019">' + commune_api[pas]["2020"] + '</span>';
			}
		}
	}

}

function entrerDansDepartement(sonCode) {

	chargementDepartement(codeEvolution);
	// Vide l'interface
	codeDepartement = sonCode;
	viderLabelsSections();
	document.getElementById('communes').innerHTML = '<option style="display:none"></option>';
	for (pas = 0; pas < departement_api.length; pas++) {
		if(departement_api[pas]["Code departement"] == codeDepartement){
			switch (codeDepartement) {
				case '75': 
					sonNom = "Paris";
					break;
				case '77': 
					sonNom = "Seine-et-Marne";
					break;
				case '78': 
					sonNom = "Yvelines";
					break;
				case '91': 
					sonNom = "Essonne";
					break;
				case '92': 
					sonNom = "Hauts-de-Seine";
					break;
				case '93': 
					sonNom = "Seine-Saint-Denis";
					break;
				case '94': 
					sonNom = "Val-de-Marne";
					break;
				case '95': 
					sonNom = "Val-d'Oise";
					break;
			}

			document.getElementById('titre_info').innerHTML = '<h2 id="titre_info">'+ departement_api[pas]["Code departement"] + ". "+ sonNom + '</h2>';
			if(toggleNumber){
	  			document.getElementById("block_annee").style.display = "None";
	  			document.getElementById("block_evolution").style.display = "Block";

				document.getElementById('2014_2015').innerHTML = '<span id="2014_2015">' + departement_api[pas]["2014 - 2015"] + '</span>';
				document.getElementById('2015_2016').innerHTML = '<span id="2015_2016">' + departement_api[pas]["2015 - 2016"] + '</span>';
				document.getElementById('2016_2017').innerHTML = '<span id="2016_2017">' + departement_api[pas]["2016 - 2017"] + '</span>';
				document.getElementById('2017_2018').innerHTML = '<span id="2017_2018">' + departement_api[pas]["2017 - 2018"] + '</span>';
				document.getElementById('2018_2019').innerHTML = '<span id="2018_2019">' + departement_api[pas]["2018 - 2019"] + '</span>';
				document.getElementById('2019_2020').innerHTML = '<span id="2019_2020">' + departement_api[pas]["2019 - 2020"] + '</span>';
			}
			else {
				document.getElementById("block_evolution").style.display = "None";
	  			document.getElementById("block_annee").style.display = "Block";

				document.getElementById('d2014').innerHTML = '<span id="d2014">' + departement_api[pas]["2014"] + '</span>';
				document.getElementById('d2015').innerHTML = '<span id="d2015">' + departement_api[pas]["2015"] + '</span>';
				document.getElementById('d2016').innerHTML = '<span id="d2016">' + departement_api[pas]["2016"] + '</span>';
				document.getElementById('d2017').innerHTML = '<span id="d2017">' + departement_api[pas]["2017"] + '</span>';
				document.getElementById('d2018').innerHTML = '<span id="d2018">' + departement_api[pas]["2018"] + '</span>';
				document.getElementById('d2019').innerHTML = '<span id="d2019">' + departement_api[pas]["2019"] + '</span>';
				document.getElementById('d2020').innerHTML = '<span id="d2019">' + departement_api[pas]["2020"] + '</span>';
			}
		}
	}

	// Charge les communes
	$.getJSON("https://geo.api.gouv.fr/departements/" + codeDepartement + "/communes?geometry=contour&format=geojson&type=commune-actuelle",
		function (data) {
			// Pour Paris, Lyon, Marseille, il faut compléter avec les arrondissements

			if (['75', '69', '13'].includes(codeDepartement)) {
				$.getJSON("donneesgeo/arrondissements_municipaux-20180711.json",
					function (dataPLM) {
						data.features = data.features.filter(function (e) { return !(['13055', '69123', '75056'].includes(e.properties.code)); });
						dataPLM.features = dataPLM.features.filter(function (e) { return e.properties.code.substring(0, 2) == codeDepartement; });
						data.features = data.features.concat(dataPLM.features);
						afficherCommunesDepartement(data);
					}
				);
			} else {
				afficherCommunesDepartement(data);
			}
		}
	);
}



function afficherCommunesDepartement(geojson) {
	communeGroup = [];
	geojson.features.forEach(function (state) {
		for (pas = 0; pas < commune_api.length; pas++) {
			if(commune_api[pas]["Code commune"].toString() == state.properties.code){
					if(toggleNumber){
						augmentation = commune_api[pas][codeEvolution];
						var nomber;
						if (augmentation === null){
							color = "100%";
							nomber = 0;
						}
						else{
							color = "50%";
							if (augmentation > 6){
								nomber = 120;
							}
							else if(augmentation < -6){
								nomber = 0;
							}
							else{
								nomber = 60 + (augmentation*10);
							}
						}
						var fillColor = "hsl(" + nomber + ", 100%, "+ color + ")";
					}
					else {
							augmentation = commune_api[pas][anneeM2];
							var nomber;
							if (augmentation === null){
								color = "100%";
								nomber = 0;
							}
							else{
								color = "50%";
								if (augmentation > max_m2){
									nomber = 120;
								}
								else if(augmentation < min_m2){
									nomber = 0;
								}
								else{
									nomber = ((augmentation-min_m2)/(max_m2 - min_m2))*120;
								}
							}
							var fillColor = "hsl(" + nomber + ", 100%, "+ color + ")";

					}
			}
		}
		polygonCommune = L.geoJson(state, 
					{
						weight: 1,
						fillOpacity: 0.5,
						fillColor:fillColor,
						color: '#212f39',
						onEachFeature: onEachFeatureCommune
					}
					
				).on('click', onCityClicked);

					communeGroup.push(polygonCommune);
			});
		if(citiesCommune)
				{
				    map.removeLayer(citiesCommune);
				}
			citiesCommune = L.layerGroup(communeGroup);
			citiesCommune.addTo(map);

	//map.fitBounds(sonCode.getBounds());
}




function entrerDansEvolution(sonCode){
	codeEvolution = sonCode;
	chargementDepartement(codeEvolution);
	if(citiesCommune){
		document.getElementById("departements").value = codeDepartement;
		entrerDansDepartement(codeDepartement);
	}
}

function entrerDansAnnee(sonCode){
	anneeM2 = sonCode;
	chargementDepartement(anneeM2);
	if(citiesCommune){
		document.getElementById("departements").value = codeDepartement;
		entrerDansDepartement(codeDepartement);
	}
}


function onCityClicked(event) {
	// L'utilisateur a cliqué sur la géométrie d'une commune
	var sonCode = event.sourceTarget.feature.properties.code;
	entrerDansCommune(sonCode);
	document.getElementById("communes").value = sonCode;

}
function onDepartementClick(event) {
	// L'utilisateur a cliqué sur la géométrie d'un département
	var id = event.target._leaflet_id;
	var sonCode = event.target._layers[id - 1]['feature'].properties.code;
	document.getElementById("departements").value = sonCode;
	entrerDansDepartement(sonCode);
};





function toggleLeftBar() {
	vue.fold_left = !vue.fold_left; 
	invalidateMap();
}





function invalidateMap() {
	// Il faut absolument invalider la carte après chaque changement d'affichage des menus pour qu'elle s'adapte bien à la largeur.
	// C'est de plus important de laisser du temps pour que l'invalidation passe après le changement de taille effectif.
	setTimeout(function(){ map.invalidateSize(); }, 200);
}


function chargementDepartement(codeEvolution){
		$.getJSON("donneesgeo/departements-100m.geojson",
		function (data) {
			departementGroup = [];
			departements = data;
			departements.features.forEach(function (state) {
				for (pas = 0; pas < departement_api.length; pas++) {
					if(departement_api[pas]["Code departement"] == state.properties.code){

						//alert(toggleNumber);
						if(toggleNumber){
							augmentation = departement_api[pas][codeEvolution];
							var nomber;
							if (augmentation === null){
								color = "100%";
								nomber = 0;
							}
							else{
								color = "50%";
								if (augmentation > 6){
									nomber = 120;
								}
								else if(augmentation < -6){
									nomber = 0;
								}
								else{
									nomber = 60 + (augmentation*10);
								}
							}
							var fillColor = "hsl(" + nomber + ", 100%, "+ color + ")";
						} 
						else {
							augmentation = departement_api[pas][anneeM2];
							var nomber;
							if (augmentation === null){
								color = "100%";
								nomber = 0;
							}
							else{
								color = "50%";
								if (augmentation > max_m2){
									nomber = 120;
								}
								else if(augmentation < min_m2){
									nomber = 0;
								}
								else{
									nomber = ((augmentation-min_m2)/(max_m2 - min_m2))*120;
								}
							}
							var fillColor = "hsl(" + nomber + ", 100%, "+ color + ")";
						}
					}
				}
				polygon = L.geoJson(state, 
					{
						weight: 1,
						fillOpacity: 0.5,
						fillColor:fillColor,
						color: '#212f39',
					}
					
				).on('click', onDepartementClick);



				if(codeDepartement != state.properties.code){	
					departementGroup.push(polygon);
				}
			}

			);
			if(cities)
				{
				    map.removeLayer(cities);
				}
			cities = L.layerGroup(departementGroup);
			cities.addTo(map);
		}
	);

}





// C'est le code qui est appelé au début (sans que personne ne clique)
(function () {
	// Mise en place du toggle
	var toggle = document.getElementById('container');
	var toggleContainer = document.getElementById('toggle-container');

	toggle.addEventListener('click', function() {
		toggleNumber = !toggleNumber;
		if (toggleNumber) {
			toggleContainer.style.clipPath = 'inset(0 0 0 50%)';
			toggleContainer.style.backgroundColor = '#D74046';


  			document.getElementById("nom_label").innerHTML = '<span id="nom_label">Evolution à travers les années</span>';
  			document.getElementById("annee").style.display = "None";
  			document.getElementById("evolution").style.display = "block";
  			document.getElementById("estimationGroup").style.display = "None";
			document.getElementById("predictionGroup").style.display = "None";
			selectionnerEvolution();

			populationLegend.addTo(map);
			map.removeControl(populationChangeLegend);
		} else {
			toggleContainer.style.clipPath = 'inset(0 50% 0 0)';
			toggleContainer.style.backgroundColor = 'dodgerblue';
  			document.getElementById("nom_label").innerHTML = '<span id="nom_label">Prix du mètre carré par année</span>';
  			document.getElementById("evolution").style.display = "None";
  			document.getElementById("annee").style.display = "block";
  			document.getElementById("estimationGroup").style.display = "block";

			selectionnerAnnee();

			populationChangeLegend.addTo(map);
	        map.removeControl(populationLegend);
		}
	});
	//alert(toggleNumber);

	// Mise en place de la carte
	map = new L.Map('mapid', min = 0, max = 30);
	var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {
			minZoom: 8,
			maxZoom: 30,
			attribution: osmAttrib
		});
	map.setView(new L.LatLng(48.65, 2.5), 5);
	map.addLayer(osm);


	var populationLegend = L.control({position: 'topright'});
	var populationChangeLegend = L.control({position: 'topright'});

	populationLegend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend');
	    div.innerHTML +=
	    '<div id="titre_legend">Evolution à travers les années</div><div id="legend"></div><p id="text_legend"><span>-6%</span><span>0%</span><span>+6%</span></p>';
	return div;
	};

	populationChangeLegend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend');
	    div.innerHTML +=
	    '<div id="titre_legend">Prix du mètre carrés</div><div id="legend"></div><p id="text_legend"><span id="min_m2">3 000€</span><span></span><span id="max_m2">9 000€</span></p>';
	return div;
	};


	//alert(toggleNumber);
	// Add this one (only) for now, as the Population layer is on by default
	//populationLegend.addTo(map);
/*
	map.on('overlayadd', function (eventLayer) {
	    // Switch to the Population legend...
	    if (eventLayer.name === 'Population') {
	        this.removeControl(populationChangeLegend);
	        populationLegend.addTo(this);
	    } else { // Or switch to the Population Change legend...
	        this.removeControl(populationLegend);
	        populationChangeLegend.addTo(this);
	    }
	});*/



	// Chargement de la liste des départements
	$.getJSON("https://geo.api.gouv.fr/departements?fields=nom,code", 
		function (data) {
			var $select = $('#departements');
			$.each(data, function (i, val) {
				if (["75", "77", "78", "91", "92", "93", "94", "95"].indexOf(data[i].code) !== -1){
					$select.append($('<option />', {
						value: data[i].code,
						text: data[i].code + ' - ' + data[i].nom
					}
				));
				}
			});
		}
	);

		$.getJSON("donneesgeo/departement.json",
			function (data) {

				$.each(data["Code departement"], function (i, val) {
					departement_api.push(
						{
							"Code departement":data["Code departement"][i],
							//"Departement":data["Departement"][i],
							"2014":data["2014"][i],
							"2015":data["2015"][i],
							"2016":data["2016"][i],
							"2017":data["2017"][i],
							"2018":data["2018"][i],
							"2019":data["2019"][i],
							"2020":data["2020"][i],
							"2014 - 2015":data["2014 - 2015"][i],
							"2015 - 2016":data["2015 - 2016"][i],
							"2016 - 2017":data["2016 - 2017"][i],
							"2017 - 2018":data["2017 - 2018"][i],
							"2018 - 2019":data["2018 - 2019"][i],
							"2019 - 2020":data["2019 - 2020"][i],
							//"Erreur 2018 - 2019":data["Erreur 2018 - 2019"][i],
							//"Erreur 2019 - 2020":data["Erreur 2019 - 2020"][i],
							"Taille":data["Taille"][i],
							"Min":data["Min"][i],
							"Max":data["Max"][i]
						}
						);
				});
			}
		);

		$.getJSON("donneesgeo/commune.json",
			function (data) {

				$.each(data["Code commune"], function (i, val) {
					commune_api.push(
						{
							"Code departement":data["Code departement"][i],
							"Code commune":data["Code commune"][i],
							"Commune":data["Commune"][i],
							"2014":data["2014"][i],
							"2015":data["2015"][i],
							"2016":data["2016"][i],
							"2017":data["2017"][i],
							"2018":data["2018"][i],
							"2019":data["2019"][i],
							"2020":data["2020"][i],
							"2014 - 2015":data["2014 - 2015"][i],
							"2015 - 2016":data["2015 - 2016"][i],
							"2016 - 2017":data["2016 - 2017"][i],
							"2017 - 2018":data["2017 - 2018"][i],
							"2018 - 2019":data["2018 - 2019"][i],
							"2019 - 2020":data["2019 - 2020"][i],
							"Erreur":data["Erreur"][i],
							"Taille":data["Taille"][i],
							"Min":data["Min"][i],
							"Max":data["Max"][i]
						}
						);
				});
			}
		);

	// Chargement des contours des départements
	//chargementDepartement(codeEvolution);
	document.getElementById("block_annee").style.display = "None";
	document.getElementById("block_evolution").style.display = "None";
	document.getElementById("predictionGroup").style.display = "None";
	toggle.click();

	$('#estimation_prix').on("click", function(){
		code_commune = $('#communes').val()
		surface_m2 = $('#m2').val()
		for (pas = 0; pas < commune_api.length; pas++) {
			if(commune_api[pas]["Code commune"].toString() == code_commune){
							augmentation = commune_api[pas][anneeM2];
							if(surface_m2){
								document.getElementById('predictionTitre').innerHTML = '<b id="predictionTitre">' + commune_api[pas]["Commune"] + ' - ' + surface_m2 + ' m2</b>';
								document.getElementById('predictionPrix').innerHTML = '<span id="predictionPrix">' + Math.round(surface_m2*augmentation) + ' €</span>';
								document.getElementById("predictionGroup").style.display = "Block";
							}
			}
		}
	});

	// Sur mobile, cacher la barre latérale
	if (window.innerWidth < 768) {
		vue.fold_left = true;
		invalidateMap();
	}


})();
