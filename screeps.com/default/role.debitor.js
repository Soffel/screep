const role  = 'debitor';
var roleDebitor = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if(creep.memory.carry && creep.store[RESOURCE_ENERGY] == 0) 
        {  
            if(creep.hits < 200)
            {
               creep.role = '';
            }
          
            creep.memory.carry = false;
            return;
        }
        
        if(!creep.memory.carry && creep.store.getFreeCapacity() == 0) 
        {
            creep.memory.carry = true;
        }
        
        if(!creep.memory.carry)
        {
             if(creep.memory.workroom != creep.room.name)
             {
                 var room = new RoomPosition(25, 25, creep.memory.workroom); 
                 creep.moveTo(room, {visualizePathStyle: {stroke: '#ffffff'}});
             }
             else  if(creep.memory.workroom == creep.room.name)
             {
                var container = Game.getObjectById(creep.memory.container);
                
                if(!container)
                {
                    creep.memory.role = '';
                    return;
                }
                
                if(container.store[RESOURCE_ENERGY] < 50)
                {
                    if(creep.store.getUsedCapacity() > creep.store.getFreeCapacity())
                    {
                          creep.memory.carry = true;
                    }
                    
                    const flags = Game.rooms[creep.room.name].find(FIND_FLAGS);
                    if (flags.length > 0)
                    {
                        creep.moveTo(flags[0],{ visualizePathStyle: { stroke: '#ffffff' } });
                        return;
                    }
                }
                
                var state = creep.withdraw(container, RESOURCE_ENERGY);
                if (state === ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
               
             }
        }
        
        //zurück zum spawn
        if(creep.memory.carry) 
        {
            if(creep.memory.home != creep.room.name)
             {
                 var room = new RoomPosition(25, 25, creep.memory.home); 
                 creep.moveTo(room,{visualizePathStyle: {stroke: '#ffffff'}});
             }
             else  if(creep.memory.home == creep.room.name && creep.room.energyAvailable == creep.room.energyCapacityAvailable)
             {
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, 
                {
                    filter: (structure) => 
                    {
                        return (
                            structure.structureType === STRUCTURE_SPAWN     || 
                            structure.structureType === STRUCTURE_EXTENSION || 
                            structure.structureType === STRUCTURE_STORAGE   ||
                            (structure.structureType === STRUCTURE_CONTAINER && structure.id != creep.memory.container )||
                            (structure.structureType === STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 50))
                            && structure.store.getFreeCapacity([RESOURCE_ENERGY]) > 0 ;
                    }
                });

                if(target) 
                {
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    return;
                }
                else
                {
                    let uppi = creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: (otherCreep) => otherCreep.memory.role === 'uppi' && otherCreep.store.getFreeCapacity() > 50});
                    creep.say('🎁')
                    if (uppi) 
                    { 
                        if (creep.transfer(uppi, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) 
                        {
                            creep.moveTo(uppi, { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    }
                }
             }
              else  if(creep.memory.home == creep.room.name)
             {
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, 
                {
                    filter: (structure) => 
                    {
                        return (
                            structure.structureType === STRUCTURE_SPAWN   ||
                            structure.structureType === STRUCTURE_EXTENSION  
                            )
                            && structure.store.getFreeCapacity([RESOURCE_ENERGY]) > 0 ;
                    }
                });

                if(target) 
                {
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    return;
                }
                else
                {
                    let uppi = creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: (otherCreep) => otherCreep.memory.role === 'uppi' && otherCreep.store.getFreeCapacity() > 50});
                    creep.say('🎁')
                    if (uppi) 
                    { 
                        if (creep.transfer(uppi, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) 
                        {
                            creep.moveTo(uppi, { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    }
                }
             }
        }
    },
    spawn:function(spawn,room)
    {
       
        if(Memory.rooms[room].sendDebitor && Memory.rooms[room].mainSpawn == spawn.room.name)
        {
            
            for(var source in Memory.rooms[room].sources)
            {
              
               for(var container in Memory.rooms[room].sources[source].containers)
               {
                  
                   if( Memory.rooms[room].sources[source].containers[container].aktiv)
                   {
                      
                        var c = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.workroom == room && creep.memory.container == container).length;
                        if(c < Memory.rooms[room].mulDebitor) 
                        {
                           
                            var newName = role + '_' + Game.time;
                            var max = parseInt(spawn.room.energyCapacityAvailable/100);
                            var profil = Array(max).fill(CARRY).concat(Array(max).fill(MOVE));
                            console.log(room);
                            if(c == 0 && room == spawn.room.name && spawn.room.energyAvailable < 301)
                            {
                                profil = [CARRY,CARRY,MOVE];
                                console.log("Notfallprofil für Debitor!!!");
                            }
                        
                            if( spawn.spawnCreep(profil, newName,{dryRun: true}) === 0)
                            {
                                spawn.spawnCreep(profil, newName, {memory: {role: role, workroom: room, home:spawn.room.name  ,container: container, carry: false}});
                                console.log('spawn '+newName+' für Raum '+room+' cost: '+calcProfil(profil))
                                return true;
                            }
                            if(room == spawn.room.name )
                            {
                                console.log("Prioblock debitor SpawnRaum!")
                                Memory.prioEnergie = true;
                                return true;
                            }
                        }
                   }
               }
            } 
        }
        return false;
    }
};
function calcProfil(creepProfile) {
    let energyCost = 0;

    for (const bodyPart of creepProfile) {
        energyCost += BODYPART_COST[bodyPart];
    }

    return energyCost;
}
module.exports = roleDebitor;