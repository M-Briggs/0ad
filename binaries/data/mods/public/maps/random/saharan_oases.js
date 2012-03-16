RMS.LoadLibrary("rmgen");

var tCity = "desert_city_tile";
var tCityPlaza = "desert_city_tile_plaza";
var tSand = ["desert_dirt_rough", "desert_dirt_rough_2", "desert_sand_dunes_50", "desert_sand_smooth"];
var tDunes = "desert_sand_dunes_100";
var tFineSand = "desert_sand_smooth";
var tCliff = ["desert_cliff_badlands", "desert_cliff_badlands_2"];
var tForestFloor = "desert_forestfloor_palms";
var tGrass = "desert_dirt_rough_2";
var tGrassSand50 = "desert_sand_dunes_50";
var tGrassSand25 = "desert_dirt_rough";
var tDirt = "desert_dirt_rough";
var tDirtCracks = "desert_dirt_cracks";
var tShore = "desert_shore_stones";
var tWaterDeep = "desert_shore_stones_wet";
var tLush = "desert_grass_a";
var tSLush = "desert_grass_a_sand";
var tSDry = "desert_plants_b";
// gaia entities
var oBerryBush = "gaia/flora_bush_berry";
var oChicken = "gaia/fauna_chicken";
var oCamel = "gaia/fauna_camel";
var oFish = "gaia/fauna_fish";
var oGazelle = "gaia/fauna_gazelle";
var oGiraffe = "gaia/fauna_giraffe";
var oGoat = "gaia/fauna_goat";
var oWildebeest = "gaia/fauna_wildebeest";
var oStoneLarge = "gaia/geology_stonemine_desert_badlands_quarry";
var oStoneSmall = "gaia/geology_stone_desert_small";
var oMetalLarge = "gaia/geology_metal_desert_slabs";
var oDatePalm = "gaia/flora_tree_date_palm";
var oSDatePalm = "gaia/flora_tree_cretan_date_palm_short";
var eObelisk = "other/obelisk";
var ePyramid = "other/pyramid_minor";
var oWood = "gaia/special_treasure_wood";
var oFood = "gaia/special_treasure_food_bin";

// decorative props
var aBush1 = "actor|props/flora/bush_desert_a.xml";
var aBush2 = "actor|props/flora/bush_desert_dry_a.xml";
var aBush3 = "actor|props/flora/bush_medit_sm_dry.xml";
var aBush4 = "actor|props/flora/plant_desert_a.xml";
var aBushes = [aBush1, aBush2, aBush3, aBush4];
var aDecorativeRock = "actor|geology/stone_desert_med.xml";
var aReeds = "actor|props/flora/reeds_pond_lush_a.xml";
var aLillies = "actor|props/flora/water_lillies.xml";

// terrain + entity (for painting)
var pForest = [tLush + TERRAIN_SEPARATOR + oDatePalm, tLush + TERRAIN_SEPARATOR + oSDatePalm, tLush];
var pForestOasis = [tLush + TERRAIN_SEPARATOR + oDatePalm, tLush + TERRAIN_SEPARATOR + oSDatePalm, tLush];

var BUILDING_ANGlE = 0.75*PI;

log("Initializing map...");

InitMap();

var numPlayers = getNumPlayers();
var mapSize = getMapSize();
var mapArea = mapSize*mapSize;

// create tile classes

var clPlayer = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();
var clGrass = createTileClass();
var clDesert = createTileClass();
var clPond = createTileClass();
var clShore = createTileClass();
var clTreasure = createTileClass();

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = sortPlayers(playerIDs);

var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; i++)
{
	playerAngle[i] = startAngle + i*TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.35*cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.35*sin(playerAngle[i]);
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");
	
	// some constants
	var radius = scaleByMapSize(15,25);
	var cliffRadius = 2;
	var elevation = 20;
	
	// get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = floor(fx);
	var iz = floor(fz);
	addToClass(ix, iz, clPlayer);
	
	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tCityPlaza, tCity], [1]);
	createArea(placer, painter, null);
	
	// get civ specific starting entities
	var civEntities = getStartingEntities(id-1);
	
	// create starting units
	createStartingPlayerEntities(fx, fz, id, civEntities, BUILDING_ANGlE)
	
	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oChicken, 5,5, 0,3)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}
	
	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oBerryBush, 5,5, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);
	
	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = radius - 4;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);
	
	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1,1, 0,2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);
	var hillSize = PI * radius * radius;
	// create starting straggler trees
	var num = hillSize / 100;
	for (var j = 0; j < num; j++)
	{
		var tAngle = randFloat(0, TWO_PI);
		var tDist = randFloat(6, radius - 2);
		var tX = round(fx + tDist * cos(tAngle));
		var tZ = round(fz + tDist * sin(tAngle));
		group = new SimpleGroup(
			[new SimpleObject(oSDatePalm, 1,3, 0,2)],
			false, clBaseResource, tX, tZ
		);
		createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
	}
	
	// create grass tufts
	var num = hillSize / 250;
	for (var j = 0; j < num; j++)
	{
		var gAngle = randFloat(0, TWO_PI);
		var gDist = radius - (5 + randInt(7));
		var gX = round(fx + gDist * cos(gAngle));
		var gZ = round(fz + gDist * sin(gAngle));
		group = new SimpleGroup(
			[new SimpleObject(aBush1, 2,5, 0,1, -PI/8,PI/8)],
			false, clBaseResource, gX, gZ
		);
		createObjectGroup(group, 0);
	}
}

RMS.SetProgress(30);

for (var i = 0; i < numPlayers; i++)
{
	// create the oases
	log("Creating oases...");
	var oRadius = scaleByMapSize(15, 60);
	placer = new ClumpPlacer(PI*oRadius*oRadius*0.185, 0.6, 0.15, 0, mapSize*(0.5 + 0.18*cos(playerAngle[i]) + scaleByMapSize(1, 4)*cos(playerAngle[i])/100), mapSize*(0.5 + 0.18*sin(playerAngle[i]) + scaleByMapSize(1, 4)*sin(playerAngle[i])/100));
	painter = new LayeredPainter([tSLush ,[tLush, pForest], [tLush, pForestOasis], tShore, tShore, tWaterDeep], [2, 2, 1, 3, 1]);
	var elevationPainter = new SmoothElevationPainter(ELEVATION_MODIFY, -3, 8);
	createArea(placer, [painter, elevationPainter, paintClass(clWater)], null);
}

// create grass patches
log("Creating grass patches...");
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter(
		[[tGrass,tGrassSand50],[tGrassSand50,tGrassSand25], [tGrassSand25,tGrass]], 		// terrains
		[1,1]															// widths
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clForest, 0, clGrass, 5, clPlayer, 0, clWater, 1, clDirt, 5, clShore, 1),
		scaleByMapSize(15, 45)
	);
}

RMS.SetProgress(55);

// create dirt patches
log("Creating dirt patches...");
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
{
	placer = new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5);
	painter = new LayeredPainter(
		[[tDirt,tDirtCracks],[tDirt,tFineSand], [tDirtCracks,tFineSand]], 		// terrains
		[1,1]															// widths
	);
	createAreas(
		placer,
		[painter, paintClass(clDirt)],
		avoidClasses(clForest, 0, clDirt, 5, clPlayer, 0, clWater, 1, clGrass, 5, clShore, 1),
		scaleByMapSize(15, 45)
	);
}

RMS.SetProgress(60);

log("Creating stone mines...");
// create large stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock);
createObjectGroups(group, 0,
	avoidClasses(clForest, 1, clPlayer, 12, clRock, 10, clWater, 1),
	2*scaleByMapSize(4,16), 100
);

// create small stone quarries
group = new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock);
createObjectGroups(group, 0,
	avoidClasses(clForest, 1, clPlayer, 12, clRock, 10, clWater, 1),
	2*scaleByMapSize(4,16), 100
);

log("Creating metal mines...");
// create large metal quarries
group = new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal);
createObjectGroups(group, 0,
	avoidClasses(clForest, 1, clPlayer, 12, clMetal, 10, clRock, 5, clWater, 1),
	2*scaleByMapSize(4,16), 100
);

// create small decorative rocks
log("Creating small decorative rocks...");
group = new SimpleGroup(
	[new SimpleObject(aDecorativeRock, 1,3, 0,1)],
	true
);
createObjectGroups(
	group, 0,
	avoidClasses(clWater, 1, clForest, 0, clPlayer, 0, clPond, 1),
	scaleByMapSize(16, 262), 50
);

// create gazelles
log("Creating gazelles...");
group = new SimpleGroup([new SimpleObject(oGazelle, 5,7, 0,4)], true, clFood);
createObjectGroups(group, 0,
	borderClasses(clWater, 8, 5),
	3*scaleByMapSize(5,20), 50
);

// create goats
log("Creating goats...");
group = new SimpleGroup([new SimpleObject(oGoat, 2,4, 0,3)], true, clFood);
createObjectGroups(group, 0,
	borderClasses(clWater, 8, 5),
	3*scaleByMapSize(5,20), 50
);

// create treasures
log("Creating treasures...");
group = new SimpleGroup([new SimpleObject(oFood, 1,1, 0,2)], true, clTreasure);
createObjectGroups(group, 0,
	borderClasses(clWater, 8, 5),
	3*scaleByMapSize(5,20), 50
);

group = new SimpleGroup([new SimpleObject(oWood, 1,1, 0,2)], true, clTreasure);
createObjectGroups(group, 0,
	borderClasses(clWater, 8, 5),
	3*scaleByMapSize(5,20), 50
);

// create camels
log("Creating camels...");
group = new SimpleGroup([new SimpleObject(oCamel, 2,4, 0,2)], true, clFood);
createObjectGroups(group, 0,
	borderClasses(clWater, 8, 5),
	3*scaleByMapSize(5,20), 50
);

// Set environment
setSkySet("sunny");
setSunColour(0.711, 0.746, 0.574);	
setWaterColour(0.292, 0.347, 0.691);		
setWaterTint(0.550, 0.543, 0.437);				
setWaterReflectionTint(0.562, 0.511, 0.425);	
setWaterMurkiness(0.83);
setWaterReflectionTintStrength(0.377);

// Export map data
ExportMap();