const express = require('express')

// create router
const router = new express.Router()

// main page render, router handler
router.get('', (req,res) => {
        res.send('index')
})

// help page render router handler
router.get('/help', (req,res) => {
        res.sendFile('../../public/help.html')
})

// help page render router handler
router.get('/*', (req,res) => {
        res.send('404')
})

module.exports = router