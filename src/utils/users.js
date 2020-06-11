const users = []

// addUser, getUser, getUser, getUsersInRoom

const addUser = ({id,username,room}) =>{ // every connection to server has unique id associated w/ it, we can access it from socket obj
   
    // Clean data provided by client
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate data 
    if(!username || !room ){
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // Validate username
    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user) // add user to users array
    return { user }

}

const removeUser = (id) =>{

    // find index returns position of array item, -1 if it doesnt exist, 0 or above if it does
    const index = users.findIndex((user)=> user.id === id )

    if(index != -1){
        // .splice allows us to remove items of array by index, it returns array or all items removed
        return users.splice(index, 1)[0] // extract individual item from array
    }
}

const getUser = (id) =>{
    return users.find((user)=> user.id === id) // returns match
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room) // returns array w/ all matches
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}