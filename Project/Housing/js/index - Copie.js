// Partie Vue -----------------------------------------------------------------

// On commence par creer des "composants" qu'on va utiliser un peu partout

// Là on donne le nom du composant (comme un span, div, h3, etc)

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


var dateMin = '01-01-2015';
var dateMax = '01-01-2019';

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

$('.input-daterange input').each(function() {
    $(this).datepicker('clearDates');
});


function exportCSV(el, data, fileName) {
	
	var json = data;
	var fields = Object.keys(json[0])
	var replacer = function(key, value) { return value === null ? '' : value } 
	var csv = json.map(function(row){
	  return fields.map(function(fieldName){
		return JSON.stringify(row[fieldName], replacer)
	  }).join(';')
	})
	csv.unshift(fields.join(';')); // add header column
	csv = csv.join('\r\n');
	
	el.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
	el.setAttribute("download", fileName);
}

	
/*
// Non utilisé	
function exportJson(el) {
	
	var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data_dvf));
	el.setAttribute("href", "data:"+data);
	el.setAttribute("download", 'nomfichier.json');    
}
*/



function selectionnerEvolution() {
	// L'utilisateur a cliqué sur la liste déroulante des départements
	var e = document.getElementById("evolution");
	var sonCode = e.options[e.selectedIndex].value;
	entrerDansEvolution(sonCode);
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

function selectionnerSection() {
	// L'utilisateur a cliqué sur la liste déroulante des sections
	var e = document.getElementById("sections");
	var sonCode = e.options[e.selectedIndex].value;
	entrerDansSection(sonCode);
}

function selectionnerParcelle() {
	// L'utilisateur a cliqué sur la liste déroulante des sections
	var e = document.getElementById("parcelles");
	var sonCode = e.options[e.selectedIndex].value;
	entrerDansParcelle(sonCode);
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

function onEachFeatureSection(feature, layer) {

	var label = L.marker(layer.getBounds().getCenter(), {
			interactive: false,
			icon: L.divIcon({
				className: 'labelSection',
				html: (feature.properties.prefixe + feature.properties.code).replace(/^0+/, ''),
			})
		});
	label.addTo(map);
	labelsSections.push(label);
	$('#sections').append($('<option />', {
		value: (feature.properties.prefixe + ('0' + feature.properties.code).slice(-2)),
		text: (feature.properties.prefixe + ('0' + feature.properties.code).slice(-2)).replace(/^0+/, '')
	}));
	layer.on({
		click: onSectionClicked
	});
}

function viderLabelsSections() {
	for (label of labelsSections) {
		map.removeLayer(label);
	}
	labelsSections = [];
}

function onEachFeatureParcelle(feature, layer) {
	$('#parcelles').append($('<option />', {
		value: feature.id,
		text: feature.id
	}));
	layer.on({
		click: onParcelleClicked
	});
}


function onParcelleClicked(event) {
	sonCode = event.target.feature.id;
	document.getElementById("parcelles").value = sonCode;
	entrerDansParcelle(sonCode);
}

function entrerDansParcelle(sonCode) {
	codeParcelle = sonCode;
	data_parcelle = null;
	$.getJSON("api/parcelles/" + codeParcelle + "/from=" + dateMin.replace(new RegExp("/", "g"), "-")  + '&to=' + dateMax.replace(new RegExp("/", "g"), "-") ,
		function (data) {
			data_parcelle = data;
			
			// Formattage des champs pour l'affichage
			for (m = 0; m < data_parcelle.mutations.length; m++){
				data_parcelle.mutations[m].infos[0]['Date mutation'] = (new Date(data_parcelle.mutations[m].infos[0]['Date mutation'])).toLocaleDateString('fr-FR');
				data_parcelle.mutations[m].infos[0]['Valeur fonciere'] = data_parcelle.mutations[m].infos[0]['Valeur fonciere'].replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
				
				for (b = 0 ; b < data_parcelle.mutations[m].batiments.length; b++){
					data_parcelle.mutations[m].batiments[b]['Surface reelle bati'] = data_parcelle.mutations[m].batiments[b]['Surface reelle bati'].replace(/(\d)(?=(\d{3})+$)/g, '$1 ');					
				}
				for (ter = 0 ; ter < data_parcelle.mutations[m].terrains.length; ter++){
					data_parcelle.mutations[m].terrains[ter]['Surface terrain'] = data_parcelle.mutations[m].terrains[ter]['Surface terrain'].replace(/(\d)(?=(\d{3})+$)/g, '$1 ');					
				}
			}

			vue.parcelle = {
				code: codeParcelle,
				n_mutations: data_parcelle.nbMutations,
				mutations: data_parcelle.mutations,
			};
			invalidateMap();
			
			if (vue.parcelle.mutations.length == 1) {
				entrerDansMutation(0);
			} else {
				entrerDansMutation(null);
			}
		}
	);
}

function sortirDeParcelle() {
	
	entrerDansSection(codeSection);
}

function onSectionClicked(event) {
	sonCode = event.target.feature.properties.prefixe + ('0' + event.target.feature.properties.code).slice(-2);
	document.getElementById("sections").value = sonCode;
	entrerDansSection(sonCode);
}

function entrerDansMutation(sonIndex) {
	vue.mutationIndex = sonIndex;
	leCode = vue.parcelle.mutations.length > 0 ? vue.parcelle.mutations[0].infos[0]['Code parcelle'] : '';
	codesParcelles = [];
	if (sonIndex != null) {
		for (autre of vue.parcelle.mutations[sonIndex].mutations_liees) {
			codesParcelles.push(autre['Code parcelle']);
		}
	}
	parcellesLayer.eachLayer(function (layer) {
		var aColorier = false;
		for (mutation of data_section.donnees) {
			if (mutation["Code parcelle"] == layer.feature.id) {
				aColorier = true;
			}
		}
		if (aColorier) {
			style = {
				color: '#238FD8',
				fillOpacity: 0.5
			};
			for (autreCode of codesParcelles) {
				if (autreCode == layer.feature.id) {
					style = {
						color: '#ff8FD8',
						fillOpacity: 0.5
					};
				}
			}
			if (leCode == layer.feature.id) {
				style = {
					color: '#ff5FA8',
					fillOpacity: 0.8
				};
			}
			layer.setStyle(style);
		};
	});
}

function entrerDansSection(sonCode) {
	
	codeSection = sonCode;
	viderLabelsSections();
	vue.parcelle = null;
	invalidateMap();
	document.getElementById('parcelles').innerHTML = '<option style="display:none"></option>';
	$.when(
		// Charge la couche géographique
		$.getJSON("https://cadastre.data.gouv.fr/bundler/cadastre-etalab/communes/" + codeCommune + "/geojson/parcelles",
			function (data) {
				data_geo = data;
			}
		),
		// Charge les mutations
		$.getJSON("api/mutations/" + codeCommune + "/" + sonCode + "/from=" + dateMin.replace(new RegExp("/", "g"), "-") + '&to=' + dateMax.replace(new RegExp("/", "g"), "-") ,
			function (data) {
				data_section = data;
				data_dvf = data.donnees;
			}
		)
	).then(
		// Une fois qu'on a la géographie et les mutations, on fait tout l'affichage
		function () {
			data_geo.features = data_geo.features.filter(function(e) {
				return (sonCode == (e.properties.prefixe + ('0'+ e.properties.section).slice(-2)))
			}).sort(function(e,a){
				return(e.id).localeCompare(a.id) ;
			}) ;
			if (parcellesLayer != null) {
				map.removeLayer(parcellesLayer);
			}
			parcellesLayer = L.geoJson(data_geo, {
				style: function (feature) {
					var aColorier = false;
					for (mutation of data_section.donnees) {
						if (mutation["Code parcelle"] == feature.id) {
							aColorier = true;
						}
					}
					if (aColorier) {
						return {
							color: '#238FD8',
							fillOpacity: 0.5
						};
					} else {
						return {
							color: '#212f39',
							fillOpacity: 0.2
						};
					}
				},
				weight: 1,
				onEachFeature: onEachFeatureParcelle
			});
			if (parcellesLayer != null) {
				map.removeLayer(parcellesLayer);
			}
			parcellesLayer.addTo(map);
			map.fitBounds(parcellesLayer.getBounds());
			vue.section = {
				code: sonCode,
				n_mutations: data_section.nbMutations,
			};
		}
	);
}


function entrerDansCommune(sonCode) {

	viderLabelsSections();
	vue.parcelle = null;
	vue.section = null;
	invalidateMap();
	codeCommune = sonCode;
	document.getElementById('sections').innerHTML = '<option style="display:none"></option>';
	document.getElementById('parcelles').innerHTML = '<option style="display:none"></option>';
	$.getJSON("https://cadastre.data.gouv.fr/bundler/cadastre-etalab/communes/" + codeCommune + "/geojson/sections",
		function (data) {
			if (sectionsLayer != null) {
				map.removeLayer(sectionsLayer);
			}

			data.features.sort(function (a, b) {
				if (!a.properties.nom) return -Infinity;
				return a.properties.nom.localeCompare(b.properties.nom);
			});
			sectionsLayer = L.geoJson(data, {
					weight: 1,
					fillOpacity: 0.2,
					color: '#212f39',
					onEachFeature: onEachFeatureSection
				});
			if (parcellesLayer != null) {
				map.removeLayer(parcellesLayer);
			}
			sectionsLayer.addTo(map);
			map.fitBounds(sectionsLayer.getBounds());
			
			nom_fichier_commune = codeCommune + '.csv';
			vue.commune = {
				code: sonCode
			};
		}
	);
}

function entrerDansDepartement(sonCode) {

	// Vide l'interface
	codeDepartement = sonCode;
	viderLabelsSections();
	vue.section = null;
	vue.commune = null;
	document.getElementById('communes').innerHTML = '<option style="display:none"></option>';
	document.getElementById('sections').innerHTML = '<option style="display:none"></option>';
	document.getElementById('parcelles').innerHTML = '<option style="display:none"></option>';
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
	
	if (communesLayer != null) {
		map.removeLayer(communesLayer);
	}
	communesLayer = L.geoJson(geojson, {
		weight: 1,
		fillOpacity: 0,
		color: '#212f39',
		onEachFeature: onEachFeatureCommune
	});
	if (sectionsLayer != null) {
		map.removeLayer(sectionsLayer);
	}
	if (parcellesLayer != null) {
		map.removeLayer(parcellesLayer);
	}
	communesLayer.addTo(map);
	map.fitBounds(communesLayer.getBounds());
}


function entrerDansEvolution(sonCode){


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
	entrerDansDepartement(sonCode);
	document.getElementById("departements").value = sonCode;
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


// C'est le code qui est appelé au début (sans que personne ne clique)
(function () {
	// Mise en place du toggle
	var toggle = document.getElementById('container');
	var toggleContainer = document.getElementById('toggle-container');
	var toggleNumber;

	toggle.addEventListener('click', function() {
		toggleNumber = !toggleNumber;
		if (toggleNumber) {
			toggleContainer.style.clipPath = 'inset(0 0 0 50%)';
			toggleContainer.style.backgroundColor = '#D74046';
		} else {
			toggleContainer.style.clipPath = 'inset(0 50% 0 0)';
			toggleContainer.style.backgroundColor = 'dodgerblue';
		}
	});
	toggle.click();


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
	    '<img src="change_legend.png" alt="legend" width="134" height="147">';
	return div;
	};

	// Add this one (only) for now, as the Population layer is on by default
	populationLegend.addTo(map);

	/*map.on('overlayadd', function (eventLayer) {
	    // Switch to the Population legend...
	    if (eventLayer.name === 'Population') {
	        this.removeControl(populationChangeLegend);
	        populationLegend.addTo(this);
	    } else { // Or switch to the Population Change legend...
	        this.removeControl(populationLegend);
	        populationChangeLegend.addTo(this);
	    }
	});*/
	// Paramètres français du range picker
	$('input[name="daterange"]').daterangepicker({
		opens: 'left',
		"locale": {
			"format": "DD/MM/YYYY",
			"separator": " - ",
			"applyLabel": "Valider",
			"cancelLabel": "Annuler",
			"fromLabel": "De",
			"toLabel": "à",
			"customRangeLabel": "Custom",
			"daysOfWeek": [
				"Dim",
				"Lun",
				"Mar",
				"Mer",
				"Jeu",
				"Ven",
				"Sam"
			],
			"monthNames": [
				"Janvier",
				"Février",
				"Mars",
				"Avril",
				"Mai",
				"Juin",
				"Juillet",
				"Août",
				"Septembre",
				"Octobre",
				"Novembre",
				"Décembre"
			],
			"firstDay": 1
		}
	}, function (start, end) {
		// Fonction executée quand la personne change les dates
		dateMin = start.format('DD-MM-YYYY');
		dateMax = end.format('DD-MM-YYYY');
		if (codeSection != null) {
			entrerDansSection(codeSection);
		}
	});
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

	var departement_api = [];
		$.getJSON("donneesgeo/departement.json",
			function (data) {

				$.each(data.departement, function (i, val) {
					departement_api.push(data.departement[i]);
				});
				/*
				$.each(data, function (i, val) {
					if (codeDepartement == data[i]["Code departement"]){
						alert("yes");
							var retourner = "hsl(120, 100%, 50%)";

							alert(codeDepartement + " - " + retourner);
							return retourner;
					}
				*/
					/*if (["75", "77", "78", "91", "92", "93", "94", "95"].indexOf(data[i]["Code departement"]) !== -1){
						alert(data[i]["2014"] + ' - ' + data[i]["Departement"]);
					}*/
				//});
			}
	);

	// Chargement des contours des départements
	$.getJSON("donneesgeo/departements-100m.geojson",
		function (data) {
			departements = data;
			departements.features.forEach(function (state) {
				for (pas = 0; pas < departement_api.length; pas++) {
					if(departement_api[pas]["Code departement"] == state.properties.code){
						var augmentation = departement_api[pas]["2014 - 2015"];
						var nomber;
						if (augmentation > 6){
							nomber = 120;
						}
						else if(augmentation < -6){
							nomber = 0;
						}
						else{
							nomber = 60 + (augmentation*10);
						}
						var fillColor = "hsl(" + nomber + ", 100%, 50%)";
					}
				};
				//alert(fillColor)
				var polygon = L.geoJson(state, 
						
						/*
						{
					    style: function(feature) {
					        switch (state.properties.code) {
					            case '75': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(0, 100%, 50%)",
									color: '#212f39'
					            };
					            case '77': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(15, 100%, 50%)",
									color: '#212f39'
					            };
					            case '78': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(30, 100%, 50%)",
									color: '#212f39'
					            };
					            case '91': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(45, 100%, 50%)",
									color: '#212f39'
					            };
					            case '92': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(60, 100%, 50%)",
									color: '#212f39'
					            };
					            case '93': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(75, 100%, 50%)",
									color: '#212f39'
					            };
					            case '94': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(90, 100%, 50%)",
									color: '#212f39'
					            };
					            case '95': return {
									weight: 1,
									fillOpacity: 0.5,
									fillColor:"hsl(105, 100%, 50%)",
									color: '#212f39'
					            };
					        }

					    }
						
						}*/
					
					{
						weight: 1,
						fillOpacity: 0.5,
						fillColor:fillColor,
						color: '#212f39',
					}
					
				).addTo(map).on('click', onDepartementClick);

				//alert(fillColor)
			}

			);
		}
	);

	// On récupère la plage des mutations de la base
	$.getJSON("api/dates",
		function (data) {
			dateMin = (new Date(data.min)).toLocaleDateString('fr-FR');
			dateMax = (new Date(data.max)).toLocaleDateString('fr-FR');
			$('#daterange').data('daterangepicker').setStartDate(dateMin);
			$('#daterange').data('daterangepicker').setEndDate(dateMax);
		}
	);


	// Sur mobile, cacher la barre latérale
	if (window.innerWidth < 768) {
		vue.fold_left = true;
		invalidateMap();
	}


})();
