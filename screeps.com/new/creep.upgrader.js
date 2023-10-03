const creepBase = require('./creep.base');
require('./config');
const role = "upgrader";

module.exports = {
    sayJob: function() { this.creep.say('🔑') },
    doJob: function (creep) {
        creepBase.checkHarvest(creep, RESOURCE_ENERGY);

        if (creep.memory.harvest) {
            if(creepBase.harvest(creep)) return;

            return;
        } 

        if(creepBase.goToWorkroom(creep)) return;
        if(creepBase.checkWorkroomPrioSpawn(creep)) return;

        creepBase.upgradeController(creep);
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
        var uppis = global.room[workroom].upgrader
        if(!uppis || uppis < 1)
            return false;
           
        var count = _.filter(Game.creeps, (creep) => creep.memory.role == role && 
                                                    creep.memory.workroom == workroom && 
                                                    creep.memory.home == spawn.room.name).length;
                                           
        if ( uppis <= count)
            return false;

        return creepBase.spawn(spawn, this._getProfil(spawn), role + '_' + Game.time,{ role: role, workroom: workroom, home: spawn.room.name, repairs:0});
    },
   
};