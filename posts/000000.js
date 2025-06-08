let post = 
    {   id: 240000, year: 2024, month: 0, day: 0,
        menuText: "",
        tags: [
            
        ],
        src: './posts/2024/240000.js'
    }

let slides_000000 = JSON.stringify([
    ['/images/2024/01/.jpg','caption']
])

content.innerHTML = `\
    <h1>Title</h1>\
    <h5>dddd mmm dd yyyy</h5>\
    <br>\
    <p>Intro</p>\
    <br>\
    <p>Content</p>\
    <br>\
    <div class='slides' data-sources='${slides_000000}'></div>
`