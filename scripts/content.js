class Content {
    constructor(data = {}){
        console.log('constructor');
        this.div = document.getElementById("content")
        window.addEventListener('resize',()=>{
            this.resize()
        })
        this.post = null
    }

    home(){
        console.log('home');
        window.location = window.location.pathname
    }

    async route(id = false){
        console.log('route');
        let post = false
        if (id) {
            window.location = `${window.location.pathname}?id=${id}`
            return;
        }

        const args = this.getUrlArgs()
        if (args.search && args.count == 0){
            window.location = window.location.pathname
            return
        } else if (!args.search) {
            const randomPost = this.getRandomPost()
            // Update the URL with the random post id without reloading
            window.history.replaceState({}, '', `${window.location.pathname}?id=${randomPost.id}`)
            this.src = randomPost.src
            this.post = randomPost
            await this.setLogoImage(randomPost.id)
            this.setTheme(randomPost.theme)
            await api.postAppLog(`Random post ${randomPost.id} - ${randomPost.menuText}`)
            return
        }

        post = this.getPost(args.id)
        if (!post){
            window.location = window.location.pathname
        } else {
            this.src = post.src
            await this.setLogoImage(post.id)
            this.setTheme(post.theme)
        }
        await api.postAppLog(`Post ${post.id} - ${post.menuText}`)
    }

    /**
     * Sets the logo image based on the post id, with fallback to default logo if not found.
     */
    async setLogoImage(postId) {
        const logoImg = document.getElementById('ai-storytime-logo')
        if (!logoImg) return
        const logoPath = `./images/logos/${postId}.png`
        // Check if the image exists by trying to load it
        return new Promise((resolve) => {
            const testImg = new window.Image()
            testImg.onload = () => {
                logoImg.src = logoPath
                resolve()
            }
            testImg.onerror = () => {
                logoImg.src = './images/AI Storytime.svg'
                resolve()
            }
            testImg.src = logoPath
        })
    }

    setTheme(theme) {
        console.log('setTheme');
        const themeLink = document.getElementById('theme-css');
        if (!themeLink) return;
        if (theme) {
            themeLink.href = `./styles/themes/${theme}.css`;
        } else {
            themeLink.href = './styles/default-theme.css';
        }
    }

    getUrlArgs(){
        console.log('getUrlArgs');
        let args = {
            search: false,
            count: 0
        }
        let props = ['id']
        const search = window.location.search.substring(1)

        if (search != ""){
            args.search = true
            search.split('&').forEach((n) => {
                let arg = n.split('=')
                if (props.includes(arg[0])){
                    args.count++
                    args[arg[0]] = arg[1]
                }
            })
        }
        
        return args
    }

    getPost(id){
        console.log('getPost');
        let post = false
        posts.forEach((p => {
            if (p.id === parseInt(id)){
                post = p
            }
        }))
        return post
    }

    getRandomPost(){
        console.log('getRandomPost');
        let index = Math.floor(Math.random() * posts.length)
        return posts[index]
    }

    set innerHTML(html){
        console.log('set innerHTML');
        let container = document.createElement('div')
        container.classList.add('container')
        container.innerHTML = html

        this.div.appendChild(container)
        this.buildSlides()
        this.resize()
        console.log(this.post)
        if(this.post)
        {
            this.addTagsSection(container)
        }
    }

    set src(src){
        console.log('set src');
        this.div.innerHTML = null
        this.removeContentScriptElement()
        this.addContentScriptElement(src)
    }

    removeContentScriptElement(){
        console.log('removeContentScriptElement');
        let old = document.getElementById('content-script')
        if (old) old.remove()
    }

    addContentScriptElement(src){
        console.log('addContentScriptElement');
        let ele = document.createElement('script')
        ele.setAttribute('type','text/javascript')
        ele.setAttribute('src',src)
        ele.setAttribute('id','content-script')
        document.querySelector('head').appendChild(ele)
    }

    addTagsSection(container){
        console.log('addTagsSection');
        let ele = document.createElement('fieldset')
        ele.classList.add('tags')

        let legend = document.createElement('legend')
        legend.classList.add('legend')
        legend.innerText = 'TAGS'
        ele.appendChild(legend)

        this.post.tags.forEach((t) => {
            let tag = document.createElement('div')
            tag.classList.add('tag')
            tag.innerText  = t
            ele.appendChild(tag)
        })
        container.appendChild(ele)
    }

    resize(){
        console.log('resize');
        let container = document.querySelector('.container')
        let w = container.clientWidth - 4
    }

    buildSlides(){
        console.log('buildSlides');
        document.querySelectorAll('.slides')
        .forEach(slide => {
            new Slide({
                ele: slide
            })
        });
    }
}

class Slide {
    constructor(data = {})
    {
        this.ele = data.ele
        this.left
        this.right
        this.img
        this.caption
        this.sources = JSON.parse(this.ele.dataset.sources)
        this.localPath = this.sources[0][0]
        this.currentIndex = 0
        this.isMaximized = false
        this.minMax
        this.buildPresentationElements()
        this.changeSource()
    }

    buildPresentationElements()
    {
        if (this.sources.length > 1)
        {
            this.buildLeftNav()
            this.buildRightNav()
        }

        this.img = document.createElement('img')
        this.ele.appendChild(this.img)
    }

    buildLeftNav()
    {
        this.left = document.createElement('div')
        this.left.classList.add('left')
        this.left.innerText = "<"
        this.left.addEventListener('click',()=>{
            this.previous()
        })
        this.ele.appendChild(this.left)
    }
    
    previous()
    {
        if (this.currentIndex > 0){
            this.currentIndex--
        } else {
            this.currentIndex = this.sources.length - 1
        }
        this.changeSource()
    }

    buildRightNav()
    {
        this.right = document.createElement('div')
        this.right.classList.add('right')
        this.right.innerText = ">"
        this.right.addEventListener('click',()=>{
            this.next()
        })
        this.ele.appendChild(this.right)
    }

    next()
    {
        if (this.currentIndex < this.sources.length - 1){
            this.currentIndex++
        } else {
            this.currentIndex = 0
        }
        this.changeSource()
    }

    changeSource()
    {
        this.img.src = `${this.Host}${this.sources[this.currentIndex]}`
    }

    /**
     * This detects if the window location is local for development
     * purposes or hosted on a server. If it's hosted the location.host
     * will be the hosted location on the server. If not, it will build
     * the local path to the repo.
     */
    get Host()
    {
        return window.location.host ? `http://${window.location.host}` : `${window.location.origin}${window.location.pathname.replace('/index.html','')}`
    }
}
