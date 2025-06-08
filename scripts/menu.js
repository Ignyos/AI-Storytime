class Menu {
    constructor(){
        this.left = -240
        this.state = {
            expandedYear: '',
            expandedYearScrollTop: 0,
            selectedPost: '',
            selectedTags: [],
            tagsExpanded: false,
            taginputScrollTop: 0
        }
        this.syncLocalStorage()

        this.menuDiv = document.getElementById("menu")
        this.menuDiv.appendChild(this.getHeader())
        this.loadItems(posts)
        
        this.menuButtonDiv = document.getElementById("menubutton")
        this.menuButtonDiv.addEventListener('click',() => {
            this.toggleMenu()
        })
    }

    syncLocalStorage(push = false){
        if (push)
        {
            localStorage.setItem('hugelhaus',JSON.stringify(this.state))
        } else {
            let ms = localStorage.getItem('hugelhaus')
            if (!ms)
            {
                localStorage.setItem('hugelhaus',JSON.stringify(this.state))
            }
            else
            {
                this.state = JSON.parse(ms)
            }
        }
    }

    loadItems(posts){
        let list = document.querySelector('.menu-list')
        if (list) list.remove()

        list = document.createElement('div')
        list.classList.add('menu-list')

        let groups = this.groupPosts(posts)
        groups.forEach((g) => {
            let menuYear = document.createElement('div')            
            menuYear.classList.add('menu-year')

            let menuYearHeader = document.createElement('div')
            menuYearHeader.classList.add('menu-year-header')
            menuYearHeader.innerText = g.year
            menuYearHeader.addEventListener('click',()=>{
                this.accordionSelect(g.year)
            })

            let menuYearItems = document.createElement('div')
            menuYearItems.classList.add('menu-year-items')
            menuYearItems.addEventListener('scroll',()=>{
                this.state.expandedYearScrollTop = menuYearItems.scrollTop
                this.syncLocalStorage(true)
            })
            if (this.state.expandedYear != g.year) menuYearItems.classList.add('hide')
            menuYearItems.id = g.year
            g.posts.forEach((p)=>{
                let li = document.createElement('div')
                li.id = p.id
                li.classList.add('menu-item')
                if (this.state.selectedPost == p.id) li.classList.add('selected')
                let m = Number.MMM(p.month)
                let d = `${p.day}`.padStart(2,'0')
                li.innerHTML = `<div class='date'>${m}-${d}</div><div class='text'>${p.menuText}</div>`
                li.addEventListener('click',() => {
                    this.state.selectedPost = p.id
                    this.syncLocalStorage(true)
                    content.route(p.id)
                })
                menuYearItems.appendChild(li)
            })

            menuYear.appendChild(menuYearHeader)
            menuYear.appendChild(menuYearItems)
            list.appendChild(menuYear)
        })
        this.menuDiv.appendChild(list)
    }

    groupPosts(posts){
        posts.sort(this.sortPosts)
        let groups = []
        let years = []
        posts.forEach((p)=>{
            if(years.indexOf(p.year) < 0) years.push(p.year)
        })
        years.sort()

        years.forEach((y) => {
            let group  = {
                year: y,
                posts: []
            }
            posts.forEach((p) => {
                if(p.year === y) group.posts.push(p)
            })
            groups.push(group)
        })

        return groups
    }

    sortPosts(a,b){
        let ay = `${a.year}`.padStart(4,'0')
        let am = `${a.month}`.padStart(2,'0')
        let ad = `${a.day}`.padStart(2,'0')
        let anum = parseInt(`${ay}${am}${ad}`)

        let by = `${b.year}`.padStart(4,'0')
        let bm = `${b.month}`.padStart(2,'0')
        let bd = `${b.day}`.padStart(2,'0')
        let bnum = parseInt(`${by}${bm}${bd}`)

        if (anum < bnum) {
            return -1
        } else if (anum === bnum) {
            return 0
        } else {
            return 1
        }
    }

    accordionSelect(year)
    {
        let years = document.querySelectorAll('.menu-year-items')
        this.state.expandedYearScrollTop = 0
        this.syncLocalStorage(true)
        years.forEach((y) => {
            if(y.id == year) 
            {
                y.classList.toggle('hide')
            } else {
                if(!y.classList.contains('hide')) y.classList.add('hide')
            }
        })
        this.state.expandedYear = year
        this.syncLocalStorage(true)
    }

    toggleMenu(){
        let x = this.left < 0 ? 0 : -240
        this.menuDiv.style.left = x
        this.left = x
        this.searchTags()
        document.getElementById('taginput').scroll(0,this.state.taginputScrollTop)
        document.getElementById(this.state.expandedYear).scroll(0,this.state.expandedYearScrollTop)
    }

    getHeader(){
        let div = document.createElement('div')
        div.classList.add('menu-header')
        div.appendChild(this.getTagButton())
        div.appendChild(this.getTagCount())
        div.appendChild(this.getTagMultiSelect())
        return div
    }

    getTagButton(){
        let div = document.createElement('div')
        div.classList.add('button')
        div.innerText = "TAGS"
        div.addEventListener('click',()=>{
            let tags = document.getElementById('taginput')
            tags.classList.toggle('hide')
            this.state.tagsExpanded = !this.state.tagsExpanded
            this.syncLocalStorage(true)
        })
        return div
    }

    getTagCount()
    {
        let div = document.createElement('div')
        div.id = 'tagCount'
        let num = this.state.selectedTags.length
        div.innerText = num === 0 ? 'viewing all' : `${num} selected`
        return div
    }

    getTagMultiSelect(){
        let div = document.createElement('div')
        div.id = 'taginput'
        Object.entries(tags).forEach((t) => {
            div.appendChild(this.getTagCheckbox(t))
        })

        if (!this.state.tagsExpanded) div.classList.add('hide')
        
        div.addEventListener('scroll',()=>{
            this.state.taginputScrollTop = div.scrollTop
            this.syncLocalStorage(true)
        })
        return div
    }

    getTagCheckbox(tag){
        let div = document.createElement('div')
        div.classList.add('tag-item')

        let input = document.createElement('input')
        input.setAttribute('type','checkbox')
        input.setAttribute('id',tag[0])
        input.setAttribute('name',tag[1])
        let i = this.state.selectedTags.indexOf(tag[1])
        if (i > -1) input.checked = true
        input.addEventListener('click',()=>{
            this.handleTagSelect()
        })

        let label = document.createElement('label')
        label.setAttribute('for',tag[0])
        let count = this.getCountOfArticlesWithTag(tag[1])
        label.innerText = `${tag[1]} (${count})`

        div.appendChild(input)
        div.appendChild(label)
        return div
    }

    updateTagCount()
    {
        let tagCount = document.getElementById('tagCount')
        let num = this.state.selectedTags.length
        tagCount.innerText = num === 0 ? 'viewing all' : `${num} selected`
    }

    getCountOfArticlesWithTag(tag)
    {
        let result = 0
        posts.forEach((p) => {
            if(p.tags.includes(tag)) result++
        })
        return result
    }

    handleTagSelect(){
        this.state.selectedTags = []
        let selectList = document.getElementById('taginput')
        selectList.childNodes.forEach((tagItem) => {
            let input = tagItem.firstChild
            if(input.checked) this.state.selectedTags.push(input.name)
        })
        this.updateTagCount()
        this.syncLocalStorage(true)
        this.searchTags()
    }

    searchTags(){
        let result = []
        if (this.state.selectedTags.length === 0) {
            result = posts
        } else {
            posts.forEach((p) => {
                let addThisPost = false
                this.state.selectedTags.forEach((t) => {
                    let ind = p.tags.indexOf(t)
                    if(ind > -1){
                        addThisPost = true
                    }
                })
                if (addThisPost) result.push(p)
            })
        }
        this.loadItems(result)
    }
}
