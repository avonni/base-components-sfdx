/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2021, Avonni Labs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Time zones taken from tzdb package on March, 8th 2021
// For a constant updated version, the package would need to be added
// https://github.com/vvo/tzdb

export const TIME_ZONES = [
    {
        value: 'Pacific/Niue',
        label: '-11:00 Niue Time - Alofi'
    },
    {
        value: 'Pacific/Midway',
        label: '-11:00 Samoa Time - Midway'
    },
    {
        value: 'Pacific/Pago_Pago',
        label: '-11:00 Samoa Time - Pago Pago'
    },
    {
        value: 'Pacific/Rarotonga',
        label: '-10:00 Cook Islands Time - Avarua'
    },
    {
        value: 'America/Adak',
        label: '-10:00 Hawaii-Aleutian Time - Adak'
    },
    {
        value: 'Pacific/Honolulu',
        label: '-10:00 Hawaii-Aleutian Time - Honolulu, East Honolulu, Pearl City, Hilo'
    },
    {
        value: 'Pacific/Tahiti',
        label: '-10:00 Tahiti Time - Faaa, Papeete, Punaauia'
    },
    {
        value: 'Pacific/Marquesas',
        label: '-09:30 Marquesas Time - Marquesas'
    },
    {
        value: 'America/Anchorage',
        label: '-09:00 Alaska Time - Anchorage, Juneau, Fairbanks, Eagle River'
    },
    {
        value: 'Pacific/Gambier',
        label: '-09:00 Gambier Time - Gambier'
    },
    {
        value: 'America/Los_Angeles',
        label: '-08:00 Pacific Time - Los Angeles, San Diego, San Jose, San Francisco'
    },
    {
        value: 'America/Tijuana',
        label: '-08:00 Pacific Time - Tijuana, Mexicali, Ensenada, Rosarito'
    },
    {
        value: 'America/Vancouver',
        label: '-08:00 Pacific Time - Vancouver, Surrey, Okanagan, Victoria'
    },
    {
        value: 'Pacific/Pitcairn',
        label: '-08:00 Pitcairn Time - Adamstown'
    },
    {
        value: 'America/Mazatlan',
        label: '-07:00 Mexican Pacific Time - Culiacán, Hermosillo, Mazatlán, Tepic'
    },
    {
        value: 'America/Edmonton',
        label: '-07:00 Mountain Time - Calgary, Edmonton, Red Deer, Sherwood Park'
    },
    {
        value: 'America/Denver',
        label: '-07:00 Mountain Time - Denver, El Paso, Albuquerque, Colorado Springs'
    },
    {
        value: 'America/Phoenix',
        label: '-07:00 Mountain Time - Phoenix, Tucson, Mesa, Chandler'
    },
    {
        value: 'America/Whitehorse',
        label: '-07:00 Yukon Time - Whitehorse, Fort St. John, Creston, Dawson'
    },
    {
        value: 'America/Belize',
        label: '-06:00 Central Time - Belize City, San Ignacio, San Pedro, Orange Walk'
    },
    {
        value: 'America/Chicago',
        label: '-06:00 Central Time - Chicago, Houston, San Antonio, Dallas'
    },
    {
        value: 'America/Guatemala',
        label: '-06:00 Central Time - Guatemala City, Mixco, Villa Nueva, Cobán'
    },
    {
        value: 'America/Managua',
        label: '-06:00 Central Time - Managua, León, Masaya, Chinandega'
    },
    {
        value: 'America/Mexico_City',
        label: '-06:00 Central Time - Mexico City, Iztapalapa, Puebla, Ecatepec de Morelos'
    },
    {
        value: 'America/Matamoros',
        label: '-06:00 Central Time - Reynosa, Heroica Matamoros, Nuevo Laredo, Piedras Negras'
    },
    {
        value: 'America/Costa_Rica',
        label: '-06:00 Central Time - San José, Limón, San Francisco, Alajuela'
    },
    {
        value: 'America/El_Salvador',
        label: '-06:00 Central Time - San Salvador, Soyapango, San Miguel, Santa Ana'
    },
    {
        value: 'America/Regina',
        label: '-06:00 Central Time - Saskatoon, Regina, Prince Albert, Moose Jaw'
    },
    {
        value: 'America/Tegucigalpa',
        label: '-06:00 Central Time - Tegucigalpa, San Pedro Sula, La Ceiba, Choloma'
    },
    {
        value: 'America/Winnipeg',
        label: '-06:00 Central Time - Winnipeg, Brandon, Steinbach, Kenora'
    },
    {
        value: 'Pacific/Easter',
        label: '-06:00 Easter Island Time - Easter'
    },
    {
        value: 'Pacific/Galapagos',
        label: '-06:00 Galapagos Time - Galapagos'
    },
    {
        value: 'America/Rio_Branco',
        label: '-05:00 Acre Time - Rio Branco, Cruzeiro do Sul, Sena Madureira, Eirunepé'
    },
    {
        value: 'America/Bogota',
        label: '-05:00 Colombia Time - Bogotá, Cali, Medellín, Barranquilla'
    },
    {
        value: 'America/Havana',
        label: '-05:00 Cuba Time - Havana, Santiago de Cuba, Camagüey, Holguín'
    },
    {
        value: 'America/Atikokan',
        label: '-05:00 Eastern Time - Atikokan'
    },
    {
        value: 'America/Cancun',
        label: '-05:00 Eastern Time - Cancún, Chetumal, Playa del Carmen, Cozumel'
    },
    {
        value: 'America/Grand_Turk',
        label: '-05:00 Eastern Time - Cockburn Town'
    },
    {
        value: 'America/Cayman',
        label: '-05:00 Eastern Time - George Town, West Bay'
    },
    {
        value: 'America/Jamaica',
        label: '-05:00 Eastern Time - Kingston, New Kingston, Spanish Town, Portmore'
    },
    {
        value: 'America/Nassau',
        label: '-05:00 Eastern Time - Nassau, Lucaya, Freeport'
    },
    {
        value: 'America/New_York',
        label: '-05:00 Eastern Time - New York City, Brooklyn, Queens, Philadelphia'
    },
    {
        value: 'America/Panama',
        label: '-05:00 Eastern Time - Panamá, San Miguelito, Juan Díaz, David'
    },
    {
        value: 'America/Port-au-Prince',
        label: '-05:00 Eastern Time - Port-au-Prince, Carrefour, Delmas 73, Port-de-Paix'
    },
    {
        value: 'America/Toronto',
        label: '-05:00 Eastern Time - Toronto, Montréal, Ottawa, Mississauga'
    },
    {
        value: 'America/Guayaquil',
        label: '-05:00 Ecuador Time - Quito, Guayaquil, Cuenca, Santo Domingo de los Colorados'
    },
    {
        value: 'America/Lima',
        label: '-05:00 Peru Time - Lima, Callao, Arequipa, Trujillo'
    },
    {
        value: 'America/Manaus',
        label: '-04:00 Amazon Time - Manaus, Campo Grande, Cuiabá, Porto Velho'
    },
    {
        value: 'America/St_Kitts',
        label: '-04:00 Atlantic Time - Basseterre'
    },
    {
        value: 'America/Blanc-Sablon',
        label: '-04:00 Atlantic Time - Blanc-Sablon'
    },
    {
        value: 'America/Montserrat',
        label: '-04:00 Atlantic Time - Brades, Plymouth'
    },
    {
        value: 'America/Barbados',
        label: '-04:00 Atlantic Time - Bridgetown'
    },
    {
        value: 'America/St_Lucia',
        label: '-04:00 Atlantic Time - Castries'
    },
    {
        value: 'America/Port_of_Spain',
        label: '-04:00 Atlantic Time - Chaguanas, Mon Repos, San Fernando, Port of Spain'
    },
    {
        value: 'America/Martinique',
        label: '-04:00 Atlantic Time - Fort-de-France, Le Lamentin, Le Robert, Sainte-Marie'
    },
    {
        value: 'America/St_Barthelemy',
        label: '-04:00 Atlantic Time - Gustavia'
    },
    {
        value: 'America/Halifax',
        label: '-04:00 Atlantic Time - Halifax, Moncton, Sydney, Dartmouth'
    },
    {
        value: 'Atlantic/Bermuda',
        label: '-04:00 Atlantic Time - Hamilton'
    },
    {
        value: 'America/St_Vincent',
        label: '-04:00 Atlantic Time - Kingstown, Kingstown Park'
    },
    {
        value: 'America/Kralendijk',
        label: '-04:00 Atlantic Time - Kralendijk'
    },
    {
        value: 'America/Guadeloupe',
        label: '-04:00 Atlantic Time - Les Abymes, Baie-Mahault, Le Gosier, Petit-Bourg'
    },
    {
        value: 'America/Marigot',
        label: '-04:00 Atlantic Time - Marigot'
    },
    {
        value: 'America/Aruba',
        label: '-04:00 Atlantic Time - Oranjestad, Tanki Leendert, San Nicolas'
    },
    {
        value: 'America/Lower_Princes',
        label: '-04:00 Atlantic Time - Philipsburg'
    },
    {
        value: 'America/Tortola',
        label: '-04:00 Atlantic Time - Road Town'
    },
    {
        value: 'America/Dominica',
        label: '-04:00 Atlantic Time - Roseau'
    },
    {
        value: 'America/St_Thomas',
        label: '-04:00 Atlantic Time - Saint Croix, Charlotte Amalie'
    },
    {
        value: 'America/Grenada',
        label: "-04:00 Atlantic Time - Saint George's"
    },
    {
        value: 'America/Antigua',
        label: '-04:00 Atlantic Time - Saint John’s'
    },
    {
        value: 'America/Puerto_Rico',
        label: '-04:00 Atlantic Time - San Juan, Bayamón, Carolina, Ponce'
    },
    {
        value: 'America/Santo_Domingo',
        label: '-04:00 Atlantic Time - Santo Domingo, Santiago de los Caballeros, Santo Domingo Oeste, Santo Domingo Este'
    },
    {
        value: 'America/Anguilla',
        label: '-04:00 Atlantic Time - The Valley'
    },
    {
        value: 'America/Thule',
        label: '-04:00 Atlantic Time - Thule'
    },
    {
        value: 'America/Curacao',
        label: '-04:00 Atlantic Time - Willemstad'
    },
    {
        value: 'America/La_Paz',
        label: '-04:00 Bolivia Time - La Paz, Santa Cruz de la Sierra, Cochabamba, Sucre'
    },
    {
        value: 'America/Santiago',
        label: '-04:00 Chile Time - Santiago, Puente Alto, Antofagasta, Viña del Mar'
    },
    {
        value: 'America/Guyana',
        label: '-04:00 Guyana Time - Georgetown, Linden, New Amsterdam'
    },
    {
        value: 'America/Asuncion',
        label: '-04:00 Paraguay Time - Asunción, Ciudad del Este, San Lorenzo, Capiatá'
    },
    {
        value: 'America/Caracas',
        label: '-04:00 Venezuela Time - Caracas, Maracaibo, Maracay, Valencia'
    },
    {
        value: 'America/St_Johns',
        label: "-03:30 Newfoundland Time - St. John's, Mount Pearl, Corner Brook, Conception Bay South"
    },
    {
        value: 'America/Argentina/Buenos_Aires',
        label: '-03:00 Argentina Time - Buenos Aires, Córdoba, Rosario, Mar del Plata'
    },
    {
        value: 'America/Sao_Paulo',
        label: '-03:00 Brasilia Time - São Paulo, Rio de Janeiro, Salvador, Fortaleza'
    },
    {
        value: 'Antarctica/Palmer',
        label: '-03:00 Chile Time - Palmer, Rothera'
    },
    {
        value: 'America/Punta_Arenas',
        label: '-03:00 Chile Time - Punta Arenas, Puerto Natales'
    },
    {
        value: 'Atlantic/Stanley',
        label: '-03:00 Falkland Islands Time - Stanley'
    },
    {
        value: 'America/Cayenne',
        label: '-03:00 French Guiana Time - Cayenne, Matoury, Saint-Laurent-du-Maroni, Kourou'
    },
    {
        value: 'America/Miquelon',
        label: '-03:00 St. Pierre & Miquelon Time - Saint-Pierre'
    },
    {
        value: 'America/Paramaribo',
        label: '-03:00 Suriname Time - Paramaribo, Lelydorp'
    },
    {
        value: 'America/Montevideo',
        label: '-03:00 Uruguay Time - Montevideo, Salto, Paysandú, Las Piedras'
    },
    {
        value: 'America/Nuuk',
        label: '-03:00 West Greenland Time - Nuuk'
    },
    {
        value: 'America/Noronha',
        label: '-02:00 Fernando de Noronha Time - Noronha'
    },
    {
        value: 'Atlantic/South_Georgia',
        label: '-02:00 South Georgia Time - Grytviken'
    },
    {
        value: 'Atlantic/Azores',
        label: '-01:00 Azores Time - Ponta Delgada'
    },
    {
        value: 'Atlantic/Cape_Verde',
        label: '-01:00 Cape Verde Time - Praia, Mindelo, Santa Maria, Cova Figueira'
    },
    {
        value: 'America/Scoresbysund',
        label: '-01:00 East Greenland Time - Scoresbysund'
    },
    {
        value: 'Africa/Abidjan',
        label: '+00:00 Greenwich Mean Time - Abidjan, Abobo, Bouaké, Korhogo'
    },
    {
        value: 'Africa/Accra',
        label: '+00:00 Greenwich Mean Time - Accra, Kumasi, Tamale, Takoradi'
    },
    {
        value: 'Africa/Bamako',
        label: '+00:00 Greenwich Mean Time - Bamako, Ségou, Sikasso, Mopti'
    },
    {
        value: 'Africa/Bissau',
        label: '+00:00 Greenwich Mean Time - Bissau, Bafatá'
    },
    {
        value: 'Africa/Conakry',
        label: '+00:00 Greenwich Mean Time - Camayenne, Conakry, Nzérékoré, Kindia'
    },
    {
        value: 'Africa/Dakar',
        label: '+00:00 Greenwich Mean Time - Dakar, Pikine, Touba, Thiès'
    },
    {
        value: 'America/Danmarkshavn',
        label: '+00:00 Greenwich Mean Time - Danmarkshavn'
    },
    {
        value: 'Europe/Isle_of_Man',
        label: '+00:00 Greenwich Mean Time - Douglas'
    },
    {
        value: 'Europe/Dublin',
        label: '+00:00 Greenwich Mean Time - Dublin, South Dublin, Cork, Luimneach'
    },
    {
        value: 'Africa/Freetown',
        label: '+00:00 Greenwich Mean Time - Freetown, Bo, Kenema, Koidu'
    },
    {
        value: 'Atlantic/St_Helena',
        label: '+00:00 Greenwich Mean Time - Jamestown'
    },
    {
        value: 'Africa/Lome',
        label: '+00:00 Greenwich Mean Time - Lomé, Sokodé, Kara, Atakpamé'
    },
    {
        value: 'Europe/London',
        label: '+00:00 Greenwich Mean Time - London, Birmingham, Liverpool, Sheffield'
    },
    {
        value: 'Africa/Monrovia',
        label: '+00:00 Greenwich Mean Time - Monrovia, Gbarnga, Kakata, Bensonville'
    },
    {
        value: 'Africa/Nouakchott',
        label: '+00:00 Greenwich Mean Time - Nouakchott, Nouadhibou, Néma, Kaédi'
    },
    {
        value: 'Africa/Ouagadougou',
        label: '+00:00 Greenwich Mean Time - Ouagadougou, Bobo-Dioulasso, Koudougou, Ouahigouya'
    },
    {
        value: 'Atlantic/Reykjavik',
        label: '+00:00 Greenwich Mean Time - Reykjavík, Kópavogur, Hafnarfjörður, Reykjanesbær'
    },
    {
        value: 'Europe/Jersey',
        label: '+00:00 Greenwich Mean Time - Saint Helier'
    },
    {
        value: 'Europe/Guernsey',
        label: '+00:00 Greenwich Mean Time - Saint Peter Port'
    },
    {
        value: 'Africa/Banjul',
        label: '+00:00 Greenwich Mean Time - Serekunda, Brikama, Bakau, Banjul'
    },
    {
        value: 'Africa/Sao_Tome',
        label: '+00:00 Greenwich Mean Time - São Tomé'
    },
    {
        value: 'Antarctica/Troll',
        label: '+00:00 Greenwich Mean Time - Troll'
    },
    {
        value: 'Africa/Casablanca',
        label: '+00:00 Western European Time - Casablanca, Rabat, Fès, Sale'
    },
    {
        value: 'Africa/El_Aaiun',
        label: '+00:00 Western European Time - Laayoune, Dakhla, Boujdour'
    },
    {
        value: 'Atlantic/Canary',
        label: '+00:00 Western European Time - Las Palmas de Gran Canaria, Santa Cruz de Tenerife, La Laguna, Telde'
    },
    {
        value: 'Europe/Lisbon',
        label: '+00:00 Western European Time - Lisbon, Porto, Amadora, Braga'
    },
    {
        value: 'Atlantic/Faroe',
        label: '+00:00 Western European Time - Tórshavn'
    },
    {
        value: 'Africa/Windhoek',
        label: '+01:00 Central Africa Time - Windhoek, Rundu, Walvis Bay, Oshakati'
    },
    {
        value: 'Africa/Algiers',
        label: '+01:00 Central European Time - Algiers, Boumerdas, Oran, Tébessa'
    },
    {
        value: 'Europe/Amsterdam',
        label: '+01:00 Central European Time - Amsterdam, Rotterdam, The Hague, Utrecht'
    },
    {
        value: 'Europe/Andorra',
        label: '+01:00 Central European Time - Andorra la Vella, les Escaldes'
    },
    {
        value: 'Europe/Belgrade',
        label: '+01:00 Central European Time - Belgrade, Niš, Novi Sad, Zemun'
    },
    {
        value: 'Europe/Berlin',
        label: '+01:00 Central European Time - Berlin, Hamburg, Munich, Köln'
    },
    {
        value: 'Europe/Malta',
        label: '+01:00 Central European Time - Birkirkara, Qormi, Mosta, Żabbar'
    },
    {
        value: 'Europe/Bratislava',
        label: '+01:00 Central European Time - Bratislava, Košice, Nitra, Prešov'
    },
    {
        value: 'Europe/Brussels',
        label: '+01:00 Central European Time - Brussels, Antwerpen, Gent, Charleroi'
    },
    {
        value: 'Europe/Budapest',
        label: '+01:00 Central European Time - Budapest, Debrecen, Szeged, Pécs'
    },
    {
        value: 'Europe/Copenhagen',
        label: '+01:00 Central European Time - Copenhagen, Århus, Odense, Aalborg'
    },
    {
        value: 'Europe/Gibraltar',
        label: '+01:00 Central European Time - Gibraltar'
    },
    {
        value: 'Europe/Ljubljana',
        label: '+01:00 Central European Time - Ljubljana, Maribor, Kranj, Celje'
    },
    {
        value: 'Arctic/Longyearbyen',
        label: '+01:00 Central European Time - Longyearbyen'
    },
    {
        value: 'Europe/Luxembourg',
        label: '+01:00 Central European Time - Luxembourg, Esch-sur-Alzette, Dudelange'
    },
    {
        value: 'Europe/Madrid',
        label: '+01:00 Central European Time - Madrid, Barcelona, Valencia, Sevilla'
    },
    {
        value: 'Europe/Monaco',
        label: '+01:00 Central European Time - Monaco, Monte-Carlo'
    },
    {
        value: 'Europe/Oslo',
        label: '+01:00 Central European Time - Oslo, Bergen, Trondheim, Stavanger'
    },
    {
        value: 'Europe/Paris',
        label: '+01:00 Central European Time - Paris, Marseille, Lyon, Toulouse'
    },
    {
        value: 'Europe/Podgorica',
        label: '+01:00 Central European Time - Podgorica, Nikšić, Herceg Novi, Pljevlja'
    },
    {
        value: 'Europe/Prague',
        label: '+01:00 Central European Time - Prague, Brno, Ostrava, Pilsen'
    },
    {
        value: 'Europe/Rome',
        label: '+01:00 Central European Time - Rome, Milan, Naples, Turin'
    },
    {
        value: 'Europe/San_Marino',
        label: '+01:00 Central European Time - San Marino'
    },
    {
        value: 'Europe/Sarajevo',
        label: '+01:00 Central European Time - Sarajevo, Banja Luka, Zenica, Tuzla'
    },
    {
        value: 'Europe/Skopje',
        label: '+01:00 Central European Time - Skopje, Bitola, Kumanovo, Prilep'
    },
    {
        value: 'Europe/Stockholm',
        label: '+01:00 Central European Time - Stockholm, Göteborg, Malmö, Uppsala'
    },
    {
        value: 'Europe/Tirane',
        label: '+01:00 Central European Time - Tirana, Durrës, Elbasan, Vlorë'
    },
    {
        value: 'Africa/Tunis',
        label: '+01:00 Central European Time - Tunis, Sfax, Sousse, Kairouan'
    },
    {
        value: 'Europe/Vaduz',
        label: '+01:00 Central European Time - Vaduz'
    },
    {
        value: 'Europe/Vatican',
        label: '+01:00 Central European Time - Vatican City'
    },
    {
        value: 'Europe/Vienna',
        label: '+01:00 Central European Time - Vienna, Graz, Linz, Favoriten'
    },
    {
        value: 'Europe/Warsaw',
        label: '+01:00 Central European Time - Warsaw, Łódź, Kraków, Wrocław'
    },
    {
        value: 'Europe/Zagreb',
        label: '+01:00 Central European Time - Zagreb, Split, Rijeka, Osijek'
    },
    {
        value: 'Europe/Zurich',
        label: '+01:00 Central European Time - Zürich, Genève, Basel, Lausanne'
    },
    {
        value: 'Africa/Bangui',
        label: '+01:00 West Africa Time - Bangui, Bimbo, Mbaïki, Berbérati'
    },
    {
        value: 'Africa/Malabo',
        label: '+01:00 West Africa Time - Bata, Malabo, Ebebiyin'
    },
    {
        value: 'Africa/Brazzaville',
        label: '+01:00 West Africa Time - Brazzaville, Pointe-Noire, Dolisie, Kayes'
    },
    {
        value: 'Africa/Porto-Novo',
        label: '+01:00 West Africa Time - Cotonou, Abomey-Calavi, Djougou, Porto-Novo'
    },
    {
        value: 'Africa/Douala',
        label: '+01:00 West Africa Time - Douala, Yaoundé, Garoua, Kousséri'
    },
    {
        value: 'Africa/Kinshasa',
        label: '+01:00 West Africa Time - Kinshasa, Masina, Kikwit, Mbandaka'
    },
    {
        value: 'Africa/Lagos',
        label: '+01:00 West Africa Time - Lagos, Kano, Ibadan, Port Harcourt'
    },
    {
        value: 'Africa/Libreville',
        label: '+01:00 West Africa Time - Libreville, Port-Gentil, Franceville, Oyem'
    },
    {
        value: 'Africa/Luanda',
        label: '+01:00 West Africa Time - Luanda, N’dalatando, Huambo, Lobito'
    },
    {
        value: 'Africa/Ndjamena',
        label: "+01:00 West Africa Time - N'Djamena, Moundou, Sarh, Abéché"
    },
    {
        value: 'Africa/Niamey',
        label: '+01:00 West Africa Time - Niamey, Zinder, Maradi, Agadez'
    },
    {
        value: 'Africa/Bujumbura',
        label: '+02:00 Central Africa Time - Bujumbura, Muyinga, Gitega, Ruyigi'
    },
    {
        value: 'Africa/Gaborone',
        label: '+02:00 Central Africa Time - Gaborone, Francistown, Molepolole, Selebi-Phikwe'
    },
    {
        value: 'Africa/Harare',
        label: '+02:00 Central Africa Time - Harare, Bulawayo, Chitungwiza, Mutare'
    },
    {
        value: 'Africa/Juba',
        label: '+02:00 Central Africa Time - Juba, Winejok, Yei, Malakal'
    },
    {
        value: 'Africa/Khartoum',
        label: '+02:00 Central Africa Time - Khartoum, Omdurman, Nyala, Port Sudan'
    },
    {
        value: 'Africa/Kigali',
        label: '+02:00 Central Africa Time - Kigali, Gisenyi, Butare, Gitarama'
    },
    {
        value: 'Africa/Blantyre',
        label: '+02:00 Central Africa Time - Lilongwe, Blantyre, Mzuzu, Zomba'
    },
    {
        value: 'Africa/Lubumbashi',
        label: '+02:00 Central Africa Time - Lubumbashi, Mbuji-Mayi, Kisangani, Kananga'
    },
    {
        value: 'Africa/Lusaka',
        label: '+02:00 Central Africa Time - Lusaka, Kitwe, Ndola, Kabwe'
    },
    {
        value: 'Africa/Maputo',
        label: '+02:00 Central Africa Time - Maputo, Matola, Nampula, Beira'
    },
    {
        value: 'Europe/Athens',
        label: '+02:00 Eastern European Time - Athens, Thessaloníki, Pátra, Piraeus'
    },
    {
        value: 'Asia/Beirut',
        label: '+02:00 Eastern European Time - Beirut, Ra’s Bayrūt, Tripoli, Sidon'
    },
    {
        value: 'Europe/Bucharest',
        label: '+02:00 Eastern European Time - Bucharest, Sector 3, Iaşi, Sector 6'
    },
    {
        value: 'Africa/Cairo',
        label: '+02:00 Eastern European Time - Cairo, Alexandria, Giza, Shubrā al Khaymah'
    },
    {
        value: 'Europe/Chisinau',
        label: '+02:00 Eastern European Time - Chisinau, Tiraspol, Bălţi, Bender'
    },
    {
        value: 'Asia/Hebron',
        label: '+02:00 Eastern European Time - East Jerusalem, Gaza, Khān Yūnis, Jabālyā'
    },
    {
        value: 'Europe/Helsinki',
        label: '+02:00 Eastern European Time - Helsinki, Espoo, Tampere, Oulu'
    },
    {
        value: 'Europe/Kaliningrad',
        label: '+02:00 Eastern European Time - Kaliningrad, Chernyakhovsk, Sovetsk, Baltiysk'
    },
    {
        value: 'Europe/Kyiv',
        label: '+02:00 Eastern European Time - Kyiv, Kharkiv, Odesa, Dnipro'
    },
    {
        value: 'Europe/Mariehamn',
        label: '+02:00 Eastern European Time - Mariehamn'
    },
    {
        value: 'Asia/Nicosia',
        label: '+02:00 Eastern European Time - Nicosia, Limassol, Larnaca, Stróvolos'
    },
    {
        value: 'Europe/Riga',
        label: '+02:00 Eastern European Time - Riga, Daugavpils, Liepāja, Jelgava'
    },
    {
        value: 'Europe/Sofia',
        label: '+02:00 Eastern European Time - Sofia, Plovdiv, Varna, Burgas'
    },
    {
        value: 'Europe/Tallinn',
        label: '+02:00 Eastern European Time - Tallinn, Tartu, Narva, Pärnu'
    },
    {
        value: 'Africa/Tripoli',
        label: '+02:00 Eastern European Time - Tripoli, Benghazi, Ajdabiya, Mişrātah'
    },
    {
        value: 'Europe/Vilnius',
        label: '+02:00 Eastern European Time - Vilnius, Kaunas, Klaipėda, Šiauliai'
    },
    {
        value: 'Asia/Jerusalem',
        label: '+02:00 Israel Time - Jerusalem, Tel Aviv, West Jerusalem, Haifa'
    },
    {
        value: 'Africa/Johannesburg',
        label: '+02:00 South Africa Time - Johannesburg, Cape Town, Durban, Soweto'
    },
    {
        value: 'Africa/Mbabane',
        label: '+02:00 South Africa Time - Manzini, Mbabane, Lobamba'
    },
    {
        value: 'Africa/Maseru',
        label: '+02:00 South Africa Time - Maseru, Mohale’s Hoek, Mafeteng, Leribe'
    },
    {
        value: 'Asia/Kuwait',
        label: '+03:00 Arabian Time - Al Aḩmadī, Ḩawallī, As Sālimīyah, Şabāḩ as Sālim'
    },
    {
        value: 'Asia/Baghdad',
        label: '+03:00 Arabian Time - Baghdad, Basrah, Al Mawşil al Jadīdah, Al Başrah al Qadīmah'
    },
    {
        value: 'Asia/Qatar',
        label: '+03:00 Arabian Time - Doha, Ar Rayyān, Umm Şalāl Muḩammad, Al Wakrah'
    },
    {
        value: 'Asia/Riyadh',
        label: '+03:00 Arabian Time - Jeddah, Riyadh, Mecca, Medina'
    },
    {
        value: 'Asia/Bahrain',
        label: '+03:00 Arabian Time - Manama, Al Muharraq, Ar Rifā‘, Dār Kulayb'
    },
    {
        value: 'Asia/Aden',
        label: '+03:00 Arabian Time - Sanaa, Al Ḩudaydah, Taiz, Aden'
    },
    {
        value: 'Asia/Amman',
        label: '+03:00 Asia/Amman - Amman, Zarqa, Irbid, Russeifa'
    },
    {
        value: 'Asia/Damascus',
        label: '+03:00 Asia/Damascus - Aleppo, Damascus, Homs, Ḩamāh'
    },
    {
        value: 'Africa/Addis_Ababa',
        label: '+03:00 East Africa Time - Addis Ababa, Gondar, Nazrēt, Desē'
    },
    {
        value: 'Indian/Antananarivo',
        label: '+03:00 East Africa Time - Antananarivo, Toamasina, Antsirabe, Mahajanga'
    },
    {
        value: 'Africa/Asmara',
        label: '+03:00 East Africa Time - Asmara, Keren, Massawa, Assab'
    },
    {
        value: 'Africa/Dar_es_Salaam',
        label: '+03:00 East Africa Time - Dar es Salaam, Mwanza, Zanzibar, Arusha'
    },
    {
        value: 'Africa/Djibouti',
        label: "+03:00 East Africa Time - Djibouti, 'Ali Sabieh, Tadjourah, Obock"
    },
    {
        value: 'Africa/Kampala',
        label: '+03:00 East Africa Time - Kampala, Gulu, Lira, Mbarara'
    },
    {
        value: 'Indian/Mayotte',
        label: '+03:00 East Africa Time - Mamoudzou, Koungou, Dzaoudzi'
    },
    {
        value: 'Africa/Mogadishu',
        label: '+03:00 East Africa Time - Mogadishu, Hargeysa, Berbera, Kismayo'
    },
    {
        value: 'Indian/Comoro',
        label: '+03:00 East Africa Time - Moroni, Moutsamoudou'
    },
    {
        value: 'Africa/Nairobi',
        label: '+03:00 East Africa Time - Nairobi, Kakamega, Mombasa, Ruiru'
    },
    {
        value: 'Europe/Minsk',
        label: "+03:00 Moscow Time - Minsk, Homyel', Mahilyow, Vitebsk"
    },
    {
        value: 'Europe/Moscow',
        label: '+03:00 Moscow Time - Moscow, Saint Petersburg, Nizhniy Novgorod, Kazan'
    },
    {
        value: 'Europe/Simferopol',
        label: '+03:00 Moscow Time - Sevastopol, Simferopol, Kerch, Yevpatoriya'
    },
    {
        value: 'Antarctica/Syowa',
        label: '+03:00 Syowa Time - Syowa'
    },
    {
        value: 'Europe/Istanbul',
        label: '+03:00 Turkey Time - Istanbul, Ankara, İzmir, Bursa'
    },
    {
        value: 'Asia/Tehran',
        label: '+03:30 Iran Time - Tehran, Mashhad, Isfahan, Karaj'
    },
    {
        value: 'Asia/Yerevan',
        label: '+04:00 Armenia Time - Yerevan, Gyumri, Vanadzor, Vagharshapat'
    },
    {
        value: 'Asia/Baku',
        label: '+04:00 Azerbaijan Time - Baku, Ganja, Sumqayıt, Lankaran'
    },
    {
        value: 'Asia/Tbilisi',
        label: '+04:00 Georgia Time - Tbilisi, Kutaisi, Batumi, Sokhumi'
    },
    {
        value: 'Asia/Dubai',
        label: '+04:00 Gulf Time - Dubai, Sharjah, Abu Dhabi, Ajman City'
    },
    {
        value: 'Asia/Muscat',
        label: '+04:00 Gulf Time - Muscat, Seeb, Bawshar, ‘Ibrī'
    },
    {
        value: 'Indian/Mauritius',
        label: '+04:00 Mauritius Time - Port Louis, Beau Bassin-Rose Hill, Vacoas, Curepipe'
    },
    {
        value: 'Indian/Reunion',
        label: '+04:00 Réunion Time - Saint-Denis, Saint-Paul, Le Tampon, Saint-Pierre'
    },
    {
        value: 'Europe/Samara',
        label: '+04:00 Samara Time - Samara, Saratov, Tolyatti, Izhevsk'
    },
    {
        value: 'Indian/Mahe',
        label: '+04:00 Seychelles Time - Victoria'
    },
    {
        value: 'Asia/Kabul',
        label: '+04:30 Afghanistan Time - Kabul, Herāt, Mazār-e Sharīf, Kandahār'
    },
    {
        value: 'Indian/Kerguelen',
        label: '+05:00 French Southern & Antarctic Time - Port-aux-Français'
    },
    {
        value: 'Indian/Maldives',
        label: '+05:00 Maldives Time - Male'
    },
    {
        value: 'Antarctica/Mawson',
        label: '+05:00 Mawson Time - Mawson'
    },
    {
        value: 'Asia/Karachi',
        label: '+05:00 Pakistan Time - Karachi, Lahore, Faisalabad, Rawalpindi'
    },
    {
        value: 'Asia/Dushanbe',
        label: '+05:00 Tajikistan Time - Dushanbe, Isfara, Istaravshan, Kŭlob'
    },
    {
        value: 'Asia/Ashgabat',
        label: '+05:00 Turkmenistan Time - Ashgabat, Türkmenabat, Daşoguz, Mary'
    },
    {
        value: 'Asia/Tashkent',
        label: '+05:00 Uzbekistan Time - Tashkent, Namangan, Samarkand, Andijon'
    },
    {
        value: 'Asia/Aqtobe',
        label: '+05:00 West Kazakhstan Time - Aktobe, Kyzylorda, Oral, Atyrau'
    },
    {
        value: 'Asia/Yekaterinburg',
        label: '+05:00 Yekaterinburg Time - Yekaterinburg, Chelyabinsk, Ufa, Perm'
    },
    {
        value: 'Asia/Colombo',
        label: '+05:30 India Time - Colombo, Dehiwala-Mount Lavinia, Maharagama, Jaffna'
    },
    {
        value: 'Asia/Kolkata',
        label: '+05:30 India Time - Mumbai, Delhi, Bengaluru, Hyderābād'
    },
    {
        value: 'Asia/Kathmandu',
        label: '+05:45 Nepal Time - Kathmandu, Bharatpur, Pātan, Birgañj'
    },
    {
        value: 'Asia/Dhaka',
        label: '+06:00 Bangladesh Time - Dhaka, Chattogram, Khulna, Rājshāhi'
    },
    {
        value: 'Asia/Thimphu',
        label: '+06:00 Bhutan Time - Thimphu, Tsirang, Punākha, Phuntsholing'
    },
    {
        value: 'Asia/Urumqi',
        label: '+06:00 China Time - Ürümqi, Shihezi, Korla, Aksu'
    },
    {
        value: 'Asia/Almaty',
        label: '+06:00 East Kazakhstan Time - Almaty, Shymkent, Karagandy, Taraz'
    },
    {
        value: 'Indian/Chagos',
        label: '+06:00 Indian Ocean Time - Chagos'
    },
    {
        value: 'Asia/Bishkek',
        label: '+06:00 Kyrgyzstan Time - Bishkek, Osh, Jalal-Abad, Karakol'
    },
    {
        value: 'Asia/Omsk',
        label: '+06:00 Omsk Time - Omsk, Tara, Kalachinsk'
    },
    {
        value: 'Antarctica/Vostok',
        label: '+06:00 Vostok Time - Vostok'
    },
    {
        value: 'Indian/Cocos',
        label: '+06:30 Cocos Islands Time - West Island'
    },
    {
        value: 'Asia/Yangon',
        label: '+06:30 Myanmar Time - Yangon, Mandalay, Nay Pyi Taw, Mawlamyine'
    },
    {
        value: 'Indian/Christmas',
        label: '+07:00 Christmas Island Time - Flying Fish Cove'
    },
    {
        value: 'Antarctica/Davis',
        label: '+07:00 Davis Time - Davis'
    },
    {
        value: 'Asia/Hovd',
        label: '+07:00 Hovd Time - Ulaangom, Khovd, Ölgii, Altai'
    },
    {
        value: 'Asia/Bangkok',
        label: '+07:00 Indochina Time - Bangkok, Samut Prakan, Mueang Nonthaburi, Udon Thani'
    },
    {
        value: 'Asia/Ho_Chi_Minh',
        label: '+07:00 Indochina Time - Ho Chi Minh City, Da Nang, Biên Hòa, Cần Thơ'
    },
    {
        value: 'Asia/Phnom_Penh',
        label: '+07:00 Indochina Time - Phnom Penh, Takeo, Siem Reap, Battambang'
    },
    {
        value: 'Asia/Vientiane',
        label: '+07:00 Indochina Time - Vientiane, Savannakhet, Pakse, Thakhèk'
    },
    {
        value: 'Asia/Novosibirsk',
        label: '+07:00 Novosibirsk Time - Novosibirsk, Krasnoyarsk, Barnaul, Tomsk'
    },
    {
        value: 'Asia/Jakarta',
        label: '+07:00 Western Indonesia Time - Jakarta, Surabaya, Bekasi, Bandung'
    },
    {
        value: 'Australia/Perth',
        label: '+08:00 Australian Western Time - Perth, Rockingham, Mandurah, Bunbury'
    },
    {
        value: 'Asia/Brunei',
        label: '+08:00 Brunei Darussalam Time - Bandar Seri Begawan, Kuala Belait, Seria, Tutong'
    },
    {
        value: 'Asia/Makassar',
        label: '+08:00 Central Indonesia Time - Makassar, Denpasar, Samarinda, Banjarmasin'
    },
    {
        value: 'Asia/Macau',
        label: '+08:00 China Time - Macau'
    },
    {
        value: 'Asia/Shanghai',
        label: '+08:00 China Time - Shanghai, Beijing, Shenzhen, Guangzhou'
    },
    {
        value: 'Asia/Hong_Kong',
        label: '+08:00 Hong Kong Time - Hong Kong, Kowloon, Victoria, Tuen Mun'
    },
    {
        value: 'Asia/Irkutsk',
        label: '+08:00 Irkutsk Time - Irkutsk, Ulan-Ude, Bratsk, Angarsk'
    },
    {
        value: 'Asia/Kuala_Lumpur',
        label: '+08:00 Malaysia Time - Johor Bahru, Kota Bharu, Kuala Lumpur, Petaling Jaya'
    },
    {
        value: 'Asia/Manila',
        label: '+08:00 Philippine Time - Quezon City, Davao, Manila, Caloocan City'
    },
    {
        value: 'Asia/Singapore',
        label: '+08:00 Singapore Time - Singapore, Woodlands, Geylang, Queenstown Estate'
    },
    {
        value: 'Asia/Taipei',
        label: '+08:00 Taipei Time - Taipei, Kaohsiung, Taichung, Tainan'
    },
    {
        value: 'Asia/Ulaanbaatar',
        label: '+08:00 Ulaanbaatar Time - Ulan Bator, Erdenet, Darhan, Mörön'
    },
    {
        value: 'Australia/Eucla',
        label: '+08:45 Australian Central Western Time - Eucla'
    },
    {
        value: 'Asia/Dili',
        label: '+09:00 East Timor Time - Dili, Maliana, Suai, Likisá'
    },
    {
        value: 'Asia/Jayapura',
        label: '+09:00 Eastern Indonesia Time - Jayapura, Ambon, Sorong, Ternate'
    },
    {
        value: 'Asia/Tokyo',
        label: '+09:00 Japan Time - Tokyo, Yokohama, Osaka, Nagoya'
    },
    {
        value: 'Asia/Pyongyang',
        label: '+09:00 Korean Time - Pyongyang, Hamhŭng, Namp’o, Sunch’ŏn'
    },
    {
        value: 'Asia/Seoul',
        label: '+09:00 Korean Time - Seoul, Busan, Incheon, Daegu'
    },
    {
        value: 'Pacific/Palau',
        label: '+09:00 Palau Time - Ngerulmud'
    },
    {
        value: 'Asia/Chita',
        label: '+09:00 Yakutsk Time - Chita, Yakutsk, Blagoveshchensk, Belogorsk'
    },
    {
        value: 'Australia/Adelaide',
        label: '+09:30 Australian Central Time - Adelaide, Adelaide Hills, Mount Gambier, Morphett Vale'
    },
    {
        value: 'Australia/Darwin',
        label: '+09:30 Australian Central Time - Darwin, Alice Springs, Palmerston'
    },
    {
        value: 'Australia/Brisbane',
        label: '+10:00 Australian Eastern Time - Brisbane, Gold Coast, Logan City, Townsville'
    },
    {
        value: 'Australia/Sydney',
        label: '+10:00 Australian Eastern Time - Sydney, Melbourne, Canberra, Newcastle'
    },
    {
        value: 'Pacific/Guam',
        label: '+10:00 Chamorro Time - Dededo Village, Yigo Village, Tamuning-Tumon-Harmon Village, Tamuning'
    },
    {
        value: 'Pacific/Saipan',
        label: '+10:00 Chamorro Time - Saipan'
    },
    {
        value: 'Pacific/Chuuk',
        label: '+10:00 Chuuk Time - Chuuk'
    },
    {
        value: 'Antarctica/DumontDUrville',
        label: '+10:00 Dumont-d’Urville Time - DumontDUrville'
    },
    {
        value: 'Pacific/Port_Moresby',
        label: '+10:00 Papua New Guinea Time - Port Moresby, Lae, Mount Hagen, Popondetta'
    },
    {
        value: 'Asia/Vladivostok',
        label: '+10:00 Vladivostok Time - Khabarovsk, Vladivostok, Khabarovsk Vtoroy, Komsomolsk-on-Amur'
    },
    {
        value: 'Australia/Lord_Howe',
        label: '+10:30 Lord Howe Time - Lord Howe'
    },
    {
        value: 'Pacific/Bougainville',
        label: '+11:00 Bougainville Time - Arawa'
    },
    {
        value: 'Antarctica/Casey',
        label: '+11:00 Casey Time - Casey'
    },
    {
        value: 'Pacific/Kosrae',
        label: '+11:00 Kosrae Time - Kosrae, Palikir - National Government Center'
    },
    {
        value: 'Pacific/Noumea',
        label: '+11:00 New Caledonia Time - Nouméa, Mont-Dore, Dumbéa'
    },
    {
        value: 'Pacific/Norfolk',
        label: '+11:00 Norfolk Island Time - Kingston'
    },
    {
        value: 'Asia/Sakhalin',
        label: '+11:00 Sakhalin Time - Yuzhno-Sakhalinsk, Magadan, Korsakov, Kholmsk'
    },
    {
        value: 'Pacific/Guadalcanal',
        label: '+11:00 Solomon Islands Time - Honiara'
    },
    {
        value: 'Pacific/Efate',
        label: '+11:00 Vanuatu Time - Port-Vila'
    },
    {
        value: 'Pacific/Fiji',
        label: '+12:00 Fiji Time - Suva, Lautoka, Nadi, Labasa'
    },
    {
        value: 'Pacific/Tarawa',
        label: '+12:00 Gilbert Islands Time - Tarawa'
    },
    {
        value: 'Pacific/Majuro',
        label: '+12:00 Marshall Islands Time - Majuro, Kwajalein, RMI Capitol'
    },
    {
        value: 'Pacific/Nauru',
        label: '+12:00 Nauru Time - Yaren'
    },
    {
        value: 'Pacific/Auckland',
        label: '+12:00 New Zealand Time - Auckland, Wellington, Christchurch, Manukau City'
    },
    {
        value: 'Antarctica/McMurdo',
        label: '+12:00 New Zealand Time - McMurdo'
    },
    {
        value: 'Asia/Kamchatka',
        label: '+12:00 Petropavlovsk-Kamchatski Time - Petropavlovsk-Kamchatsky, Yelizovo, Vilyuchinsk, Anadyr'
    },
    {
        value: 'Pacific/Funafuti',
        label: '+12:00 Tuvalu Time - Funafuti'
    },
    {
        value: 'Pacific/Wake',
        label: '+12:00 Wake Island Time - Wake'
    },
    {
        value: 'Pacific/Wallis',
        label: '+12:00 Wallis & Futuna Time - Mata-Utu'
    },
    {
        value: 'Pacific/Chatham',
        label: '+12:45 Chatham Time - Chatham'
    },
    {
        value: 'Pacific/Apia',
        label: '+13:00 Apia Time - Apia'
    },
    {
        value: 'Pacific/Kanton',
        label: '+13:00 Phoenix Islands Time - Kanton'
    },
    {
        value: 'Pacific/Fakaofo',
        label: '+13:00 Tokelau Time - Fakaofo'
    },
    {
        value: 'Pacific/Tongatapu',
        label: '+13:00 Tonga Time - Nuku‘alofa'
    },
    {
        value: 'Pacific/Kiritimati',
        label: '+14:00 Line Islands Time - Kiritimati'
    }
];
