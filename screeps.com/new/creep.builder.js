const creepBase = require('./creep.base');
require('./config');
const role = "builder";

module.exports = {
    sayJob: function() { this.creep.say('🔨') },
    doJob: function (creep) {
        creepBase.checkHarvest(creep, RESOURCE_ENERGY);

        if (creep.memory.harvest) {
            
            if(creepBase.harvest(creep)) return;

            return;
        } 
        
        if(creepBase.goToWorkroom(creep)) return;
        if(creepBase.checkWorkroomPrioSpawn(creep)) return;

        if(this._build(creep)) return;

        creepBase.upgradeController(creep);
    },
    _getPriority: function(structureType) {
        return global.prio.build[structureType] || 99;
    },  
    _build: function(creep){
        if(!creep.memory.id)
        {
            let structuresToBuild = creep.room.find(FIND_CONSTRUCTION_SITES);
 
            if(structuresToBuild.length > 0)
            {
                var structs = structuresToBuild.map(site => ({
                    site,
                    progress: site.progress,
                    priority: this._getPriority(site.structureType)
                }))
                .sort((a, b) => {
                    if (a.priority === b.priority) {
                        return b.progress - a.progress;
                    }
                    return a.priority - b.priority;
                });

                creep.memory.id = structs[0].site.id;  
                return true;
            }
        }
        else
        {
            let target = Game.getObjectById(creep.memory.id);
                
            if (target && target.progressTotal != undefined) 
            {
                let state = creep.build(target);
                
                if (state === ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target);
                } 
                return true;   
            } 
            creep.memory.id = null;
        }
        return false;
    },
    _getProfil: function(spawn)
    {
        const totalCost = 3 * BODYPART_COST[WORK] + 2 * BODYPART_COST[CARRY] + 2 * BODYPART_COST[MOVE];
        var maxEnergy = spawn.room.energyCapacityAvailable;
        const numberOfSets = Math.min(7,Math.floor(maxEnergy / totalCost));
        if(numberOfSets == 0)
        {
            return [WORK,CARRY,CARRY,MOVE,MOVE];
        }
        return Array((numberOfSets*3)).fill(WORK).concat(Array((numberOfSets*2)).fill(CARRY).concat(Array((numberOfSets*2)).fill(MOVE)));
    },
    spawn: function(spawn,workroom)
    {
        var maxbuilder = global.room[workroom].maxbuilder
        if(!global.room[workroom].sendBuilder || maxbuilder < 1)
            return false;
           
        var count = _.filter(Game.creeps, (creep) => creep.memory.role == role && 
                                                    creep.memory.workroom == workroom && 
                                                    creep.memory.home == spawn.room.name).length;
                                  
        if ( maxbuilder <= count)
            return false;
        
        if(Math.max(Game.rooms[workroom].find(FIND_CONSTRUCTION_SITES).length / 5, 1) <= count)
            return false;

        return creepBase.spawn(spawn, this._getProfil(spawn), role + '_' + Game.time, { role: role, workroom: workroom, home: spawn.room.name});   
    },
   
};