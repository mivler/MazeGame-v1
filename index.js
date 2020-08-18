var roomArray = [];
var directionArray = ["up", "right", "down", "left"];
var currentRoom;
var mapSet = false;
var firstPlay = true;

function Room(room, roomsTo) {
    // roomsTo [0] = up; [1] = right; [2] = down; [3] = left;
    this.winningRoom = false;
    this.roomIndex = room;
    this.roomsAdjacent = roomsTo;
}


$(".restart").click( function() {
    $(".pre-game").css("display", "block");
    $(".game").css("display", "none");
    $(".restart").css("display", "none");
    mapSet = false;
    firstPlay = false;
    
});


$("#submitter").click(function() {
    let numRooms = $(".rooms")[0].value;
    if (isNaN(numRooms) || (numRooms % 1 != 0)) {
        alert("Please enter an integer")
        return
    } else {
        var validMap = false;
        while (!validMap) {
            roomArray = [];
            numRooms = parseInt(numRooms);
            var end = numRooms + 1;
            for (var i = 0; i < numRooms; i++) {
                let roomsTo = roomNumGenerator(numRooms);
                let deadEnd = Math.floor(Math.random() * 9);
                if (deadEnd == 0) {
                    roomArray.push(new Room(i, [end, end, end, end]));
                } else {
                    let up = roomsTo[0];
                    let right = roomsTo[1];
                    let down = roomsTo[2];
                    let left = roomsTo[3];
                    roomArray.push(new Room(i, [up, right, down, left]));
                }
            }
            roomArray.push(new Room(numRooms, [end, end, end, end]));
            roomArray[numRooms].winningRoom = true;
            var penultimate = Math.floor(Math.random() * numRooms);
            roomArray[penultimate].roomsAdjacent[Math.floor(Math.random() * 4)] = numRooms;
            validMap = validMapCheck();
            for (room of roomArray) {
                validMap = validMap && !badRoom(room); 
            }
            console.log(validMap);
        }
        gameStart();
    }

});

function roomNumGenerator(numRooms) {
    var directionList = [];
    for (var i = 0; i < 4; i++) {
        let empty = Math.floor(Math.random() * 4);
        if (empty === 0) {
            // Not supposed to lead to room, then index is 1 out of range
            directionList.push(numRooms + 1);
        } else {
            let roomToIndex = Math.floor(Math.random() * numRooms);
            directionList.push(roomToIndex);
        }
    }
    return directionList;
}


function validMapCheck() {
    // Depth first search to determine if there is a path from room 0 to the winningRoom
    var visited = [];
    var toVisit = [...roomArray[0].roomsAdjacent];
    while (toVisit.length > 0) {
        let v = toVisit.pop();
        if (v != roomArray.length) {
            if (!visited.includes(v)) {
                visited.push(v);
            }

            for (adjacent of roomArray[v].roomsAdjacent) {
                if (!visited.includes(adjacent)) {
                    toVisit.push(adjacent);
            }
            }
        }
    }
    for (room of roomArray) {
        if (room.roomsAdjacent.length > 4 || room.roomsAdjacent.length == 0) {
            return false;
        }
    }
    return visited.includes(roomArray.length - 1);
}


function attachArrowKeys() {
    $(document).keydown(function(event) {
        if (event.key.slice(0,5) == "Arrow") {
            var direction = event.key.slice(5).toLowerCase();
            if (direction == "up") {
                changeRoom(currentRoom.roomsAdjacent[0]);
            } else if (direction == "right") {
                changeRoom(currentRoom.roomsAdjacent[1]);
            } else if (direction == "down") {
                console.log(currentRoom.roomsAdjacent[2]);
                changeRoom(currentRoom.roomsAdjacent[2]);
            } else if (direction == "left") {
                changeRoom(currentRoom.roomsAdjacent[3]);
            }
            console.log(direction);
        }
    })
}


function gameStart() {
    mapSet = true;
    if (firstPlay) {
        attachArrowKeys();
    }

    currentRoom = roomArray[0];
    console.log(currentRoom);
    $(".room-identifier").text("Current Room: 0");
    $(".pre-game").css("display", "none");
    $(".game").css("display", "block");

    doorHider(currentRoom);

}


function changeRoom(newRoom) {
    // newRoom is a integer representing the index of the new current room

    if (newRoom != roomArray.length) {
        var roomChime = new Audio("sound_effects/room_change_game_sound.mp3");
        roomChime.play()
        currentRoom = roomArray[newRoom];

        if (currentRoom.winningRoom) {
           win();

        } else if (averageRoomNum(currentRoom) == roomArray.length) {
            deadEnd();

        } else {
            console.log(currentRoom);
            let annouceRoom = "Current Room: " + currentRoom.roomIndex;
            $(".room-identifier").text(annouceRoom);
            doorHider();
        }
        
    } else {
        var errorSound = new Audio("sound_effects/game_error_tone.mp3");
        errorSound.play();
    }

}


function win() {
    $(".room-identifier").text("YOU WIN!!!");
    doorHider(currentRoom);
    var winSound = new Audio("sound_effects/win_game_sound.mp3");
    winSound.play();
    $(".restart").css("display", "block");
}


function deadEnd() {
    let annouceRoom = "Current Room: " + currentRoom.roomIndex;
    $(".room-identifier").text(annouceRoom);
    doorHider();
    var loseSound = new Audio("sound_effects/lose_game_sound.mp3");
    loseSound.play();
    setTimeout(changeRoom, 2000, 0);
}



function doorHider() {
    for (var i = 0; i < 4; i++) {
        let className = "." + directionArray[i] + "-door";
        if ( $(className)[0].classList.contains("hidden-door") ) {
            $(className).removeClass("hidden-door");
        }
        if (currentRoom.roomsAdjacent[i] == roomArray.length) {
            $(className).addClass("hidden-door");
        }
    }
}


function getNumRooms() {
    let numRooms = $(".rooms")[0].value;
    if (!isNaN(numRooms)) {

    }

}


function averageRoomNum(someRoom) {
    let sum = 0;
    for (room of someRoom.roomsAdjacent) {
        sum = sum + room;
    }
    return sum/someRoom.roomsAdjacent.length;
}


function badRoom(someRoom) {
    let onlyToSelf = true
    if (averageRoomNum(someRoom) == roomArray.length) {
        return !onlyToSelf;
    } else {
        for (room of someRoom.roomsAdjacent) {
            if (room != someRoom.roomIndex && room != roomArray.length) {
                return !onlyToSelf;
            }
        }
        return onlyToSelf;
    }
}