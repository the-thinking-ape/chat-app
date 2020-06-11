const socket = io() // connect to our backend server

// Elements, dollar sign is a convention to let us know it's a variable from the DOM
const $messageForm = document.querySelector('#send_message') 
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) //uses Qs library, the options object property ingnoreQueryPrefix, ignores the '?' at the beginning of a QS

/* autoscroll */

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

/* Socket listeners */

socket.on('message', (msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (msg)=>{
    console.log(msg)
    const html = Mustache.render(locationMessageTemplate, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData', ({room, users})=> {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    // .setAttribute sets attribtues of elements
    $messageFormButton.disabled = true
    //disable

    const messageElement = e.target.elements.msg.value // alternative way to get input, get form elements by name

    socket.emit('sendMessage',messageElement,(error)=>{
        $messageFormButton.disabled = false
        $messageFormInput.value = '' // empty value of input
        $messageFormInput.focus() // puts cursor on input after clicking
        //enable
        if(error){
            return console.log(error)
        }

        console.log('Delivered! ')
    })
})

// Send geolocation using browser api
$sendLocationButton.addEventListener('click',(e)=>{
    e.preventDefault()

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.') // or a modal
    }

    $sendLocationButton.disabled = true
    // disable

    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)

        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }

        socket.emit('sendLocation',coords, ()=>{
            $sendLocationButton.disabled = false
            //enable
            console.log('Location shared!')
        })
    })

})

socket.emit('join', {username, room}, (error)=>{
    if (error){
        alert(error) // or modal if using a diff UI framework
        // use location global to redirect client to other page (or main page w/ href method)
        location.href = '/' // '/' is root page, or main, or index.html
    }
})