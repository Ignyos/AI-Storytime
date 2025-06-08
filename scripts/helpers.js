const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

Number.mmm = (i) => { 
    if (i > 0 && i < 13){
        return months[i-1].substring(0,3)
    } else {
        return "---"
    }
}

Number.MMM = (i) => { 
    if (i > 0 && i < 13){
        return months[i-1].substring(0,3).toUpperCase()
    } else {
        return "---"
    }
}

Number.mmmm = (i) => { 
    if (i > 0 && i < 13){
        return months[i-1]
    } else {
        return "---"
    }
}