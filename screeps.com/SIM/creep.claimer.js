const creepBase = require('./creep.base');
require('./config');
const role = "claimer";

module.exports = {
    sayJob: function() { this.creep.say('📌') },
    doJob: function (creep) {
        
        if(creepBase.goToWorkroom(creep)) return;
        
        const controller = Game.rooms[creep.memory.workroom].controller;

        if (controller) {
            var state = creep.reserveController(controller);
            if (state === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {reusePath: 5});
            }
            else if(state == ERR_INVALID_TARGET)
            {
                creep.say('🪓')
                creep.attackController(controller);
                Memory.rooms[creep.memory.workroom].claimed = false;
            }
            else if(state == OK)
            {
                Memory.rooms[creep.memory.workroom].claimed = true;
            }

            if(controller.sign.username != creep.owner)
            {
                creep.signController(controller,'⚔')
            }
        }
    },
    _getProfil: function()
    {
       return  [CLAIM, CLAIM, MOVE,MOVE];
    },
    spawn: function(spawn,workroom)
    { 
        if(!global.room[workroom].sendClaimer)
            return false;
           
        var count = _.filter(Game.creeps, (creep) => creep.memory.role == role && 
                                                    creep.memory.workroom == workroom).length;
                                  
        if ( 1 <= count)
            return false;
          
        return creepBase.spawn(spawn, this._getProfil(), role + '_' + Game.time, { role: role, workroom: workroom, home: spawn.room.name});
    },
   
};