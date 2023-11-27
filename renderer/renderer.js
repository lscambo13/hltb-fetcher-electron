
const openButton = document.querySelector('#openButton')
const clearButton = document.querySelector('#clearButton')

const textArea = document.querySelector('#logArea')
const select = document.querySelector('#select')

clearButton.addEventListener('click', () => {
    textArea.textContent = ''
})

openButton.addEventListener('click', async (args) => {
    res = await bridgeApi.invoke('openRequest', 'selectDrive')
    // textArea.textContent = textArea.textContent + res + '\n'
})

bridgeApi.on('LOG', (...args) => {
    textArea.textContent = textArea.textContent + args + '\n'
    textArea.scrollTop = textArea.scrollHeight
    // console.log(args)
})