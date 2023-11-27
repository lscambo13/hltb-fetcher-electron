
const button = document.querySelector('#openButton')
const select = document.querySelector('#select')

button.addEventListener('click', (args) => {
    bridgeApi.send('chann', { 'key': 'data' })
    // window.postMessage({
    //     type: 'channelType'
    // })

})

bridgeApi.on('received', (...args) => {
    console.log(...args)
})